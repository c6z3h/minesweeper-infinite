import { useState, useRef } from "react";
import "./App.css";

/**
 * Date: 28 February 2026
 * Setup project: 1030 - 1115 (45 minutes, with 20 minutes distraction on AGM / EGM stuff)
 * System design: 1145 - 1230 (45 minutes)
 * Coding / Test: 1230 - 1500 (2h 30 minutes)
 * Polish:
 *
 * Requirements:
 * 1. Functional
 * - left click (bomb=lose [B], win, number [-, 1, 2, ...])
 * - right click (flag)
 *
 * 2. Non functional
 * - infinite expanding / difficulty-based (Easy/Medium/Hard, # Bombs)
 * - scoreboard with friends
 * - mobile responsive
 *
 * Architecture
 * 1. Upon user's first click. Precalculate all cells values, store it in a GRID.
 *  - generate an array equal to matrix default LENGTH x WIDTH.
 *  - Fill 1/3 with bombs.
 *  - [ADDING HINT TIPS]
 *    - [REMOVED]
 *      - Create another matrix with { value: Math.random(), index: i } and then sort.
 *    - [ADDED]
 *      - Iterate from i = 99 to i = 0. For each, pick random index between 0 and i, and swap their values
 *    - Fill the GRID with the bombs / not.
 *    - Iterate over entire GRID to find all cells with "B", and +1 to all surroundings.
 * 2. Render <Cell /> based on GRID (double for-loop)
 *  - Pass in the value of the cell based on the GRID matrix.
 *  - key={`grid_r{row}_c{col}`}
 *  - memoize cell
 * 3. Update <Cell />
 *  - [ADDING HINT TIPS]
 *    - [REMOVED]
 *      - update <Cell /> internal state { display: boolean } upon click
 *    - [ADDED]
 *      - update in parent sparse matrix the clicked (r,c) set
 *  - maintain in the parent if # of non-bombs revealed = max.
 *    - [V1.0] If yes, show win condition! Allow click restart
 *    - [V2.0] If yes, expand grid
 *  - if clicked empty cell ('-'), initiate parent function (executeDFS(i, j)). This will DFS and expose all neighbours
 *    - reveal() run on valid cells
 * 4.
 */

const INIT_GRID_LENGTH = 7; // Square matrix
const EMPTY_GRID_CELL = 0;
const BOMB_CELL = "B";
const BOMB_PERCENT = 0.327;

type IGrid = Array<Array<{ display: boolean; value: string | number }>>;

const generateEmptyMatrix = () => {
  const grid: IGrid = [];
  for (let r = 0; r < INIT_GRID_LENGTH; r++) {
    grid[r] = [];
    for (let c = 0; c < INIT_GRID_LENGTH; c++) {
      grid[r].push({ display: false, value: EMPTY_GRID_CELL });
    }
  }
  return grid;
};
const generateInitialCell = (r: number, c: number) => {
  const griddy: IGrid = [[]];

  const totalCells = INIT_GRID_LENGTH * INIT_GRID_LENGTH;
  const sortArr = Array(totalCells).fill(EMPTY_GRID_CELL);
  const bombFreeIndex = INIT_GRID_LENGTH * r + c;

  for (let i = 0; i < BOMB_PERCENT * totalCells; i++) {
    if (i === bombFreeIndex) {
      continue; // technically, this is easy way. If want exact, need to add the bomb to last index of `sortArr`
    }
    sortArr[i] = BOMB_CELL;
  }

  for (let i = totalCells - 1; i >= 0; i--) {
    const j = Math.floor(Math.random() * i);
    if ([i, j].includes(bombFreeIndex)) {
      continue;
    }
    const temp = sortArr[j];
    sortArr[j] = sortArr[i];
    sortArr[i] = temp;
  }

  for (let r = 0; r < INIT_GRID_LENGTH; r++) {
    griddy[r] = [];
    for (let c = 0; c < INIT_GRID_LENGTH; c++) {
      griddy[r].push({
        display: false,
        value: sortArr[INIT_GRID_LENGTH * r + c],
      });
    }
  }

  // const display = griddy
  //   .map((row) => row.map((col) => col.value).join(""))
  //   .join("\n");
  // console.log("[bomb without the numbers]");
  // console.log(display);

  for (let r = 0; r < INIT_GRID_LENGTH; r++) {
    for (let c = 0; c < INIT_GRID_LENGTH; c++) {
      const MIN_R = Math.max(0, r - 1);
      const MIN_C = Math.max(0, c - 1);
      const MAX_R = Math.min(INIT_GRID_LENGTH - 1, r + 1);
      const MAX_C = Math.min(INIT_GRID_LENGTH - 1, c + 1);
      if (griddy[r][c].value === BOMB_CELL) {
        // console.log("[bomb here: r,c]", r, c);
        // console.log("[bomb here: R]", MIN_R, MAX_R);
        // console.log("[bomb here: C]", MIN_C, MAX_C);
        for (let R = MIN_R; R <= MAX_R; R++) {
          for (let C = MIN_C; C <= MAX_C; C++) {
            if (typeof griddy[R][C].value === "number") {
              (griddy[R][C].value as number) += 1;
            }
          }
        }
        // const display = griddy
        //   .map((row) => row.map((col) => col.value).join(""))
        //   .join("\n");
        // console.log("[bomb with the numbers]\n", display);
      }
    }
  }

  let safeCells = totalCells - Math.floor(BOMB_PERCENT * totalCells);
  return { grid: griddy, safeCells };
};

function App() {
  const firstClicked = useRef(false);
  const [disabled, setDisabled] = useState(false);
  const [grid, setGrid] = useState(generateEmptyMatrix);
  const [unopenedCells, setUnopenedCells] = useState(-1);

  const handleLeftClick = (r: number, c: number) => {
    let closureGrid = firstClicked.current ? grid : [];
    if (!firstClicked.current) {
      firstClicked.current = true;
      const { grid, safeCells } = generateInitialCell(r, c);
      closureGrid = grid;
      /**
       * Console log the grid to validate.
       */
      // const display = grid
      //   .map((row) => row.map((col) => col.value).join(""))
      //   .join("\n");
      // console.log(display);
      //
      setGrid(grid);
      setUnopenedCells(safeCells);
    }
    if (closureGrid[r][c].value === BOMB_CELL) {
      alert("You lose!");
      setDisabled(true);
      return;
    }
    // console.log("woo", closureGrid[r][c].value);
    if (closureGrid[r][c].value === EMPTY_GRID_CELL) {
      const cellsToUpdate = executeDFS(r, c, closureGrid);
      // console.log("cellsToUpdate", cellsToUpdate);
      setUnopenedCells((prev) => prev - cellsToUpdate.length);
      setGrid((prev) => {
        const newGrid = [...prev];
        for (const cells of cellsToUpdate) {
          const row = cells.row;
          const col = cells.col;
          newGrid[row][col].display = true;
        }
        return newGrid;
      });
      return;
    }

    setGrid((prev) => {
      const newGrid = [...prev];
      newGrid[r][c].display = true;
      return newGrid;
    });
    setUnopenedCells((prev) => prev - 1);
  };

  if (unopenedCells === 0) {
    alert("You win!");
    setUnopenedCells(-1);
    setDisabled(true);
    return;
  }
  const handleRestart = () => {
    // console.log("restarted");
    firstClicked.current = false;
    setGrid(generateEmptyMatrix);
    setDisabled(false);
  };

  const executeDFS = (
    r: number,
    c: number,
    closureGrid: IGrid,
    cellsToUpdate: Array<{ row: number; col: number }> = [],
    visited: Set<string> = new Set(), // string in `${r}_${c}` format
  ) => {
    if (
      typeof closureGrid[r][c].value === "number" &&
      closureGrid[r][c].value > EMPTY_GRID_CELL
    ) {
      cellsToUpdate.push({ row: r, col: c });
      visited.add(`${r}_${c}`);
      return cellsToUpdate;
    }
    console.log("--------------------");
    console.log("DFS", r, c, cellsToUpdate.length);
    const MIN_R = Math.max(0, r - 1);
    const MIN_C = Math.max(0, c - 1);
    const MAX_R = Math.min(INIT_GRID_LENGTH - 1, r + 1);
    const MAX_C = Math.min(INIT_GRID_LENGTH - 1, c + 1);
    console.log(
      "DFS min/max, R:",
      `[${MIN_R}, ${MIN_C}]`,
      `[${MAX_R}, ${MAX_C}]`,
    );

    // const validCells = [[r, c]];
    // if (r - 1 >= 0) validCells.push([r - 1, c]);
    // if (r + 1 < INIT_GRID_LENGTH) validCells.push([r + 1, c]);
    // if (c - 1 >= 0) validCells.push([r, c - 1]);
    // if (c + 1 < INIT_GRID_LENGTH) validCells.push([r, c + 1]);

    // for (const cell of validCells) {
    for (let R = MIN_R; R <= MAX_R; R++) {
      for (let C = MIN_C; C <= MAX_C; C++) {
        console.log("DFS inner", visited.size, R, C);
        // const [R, C] = cell;
        if (closureGrid[R][C].value === BOMB_CELL || visited.has(`${R}_${C}`)) {
          continue;
        }
        cellsToUpdate.push({ row: R, col: C });
        visited.add(`${R}_${C}`);
        // console.log("DFS inner", visited.size, R, C);
        if ((closureGrid[R][C].value as number) === EMPTY_GRID_CELL) {
          console.log(
            "DFS inner go more DFS",
            visited.size,
            R,
            C,
            closureGrid[R][C].value,
          );
          cellsToUpdate = executeDFS(R, C, closureGrid, cellsToUpdate, visited);
        }
      }
    }
    return cellsToUpdate;
  };

  return (
    <div>
      <h1>Minesweeper!</h1>
      <button style={{ marginBottom: 30 }} onClick={handleRestart}>
        Restart
      </button>
      {grid.map((row, r) => (
        <div>
          {row.map(({ display, value }, c) => {
            // TODO memo
            return (
              <button
                key={`${r}_${c}_${display}`}
                style={{
                  width: 40,
                  height: 40,
                  textAlign: "center",
                }}
                onClick={() => handleLeftClick(r, c)} // TODO handle right click
                disabled={disabled}
              >
                <span>{display ? value : "\u00A0"}</span>
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default App;
