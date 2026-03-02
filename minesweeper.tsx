/**
 * Left click
 *  - "B" | 0 | number
 *      - B = lose
 *      - 0 = recursion / iterative
 *          - 8-directions
 *      - number = display
 *  - win condition / lose condition
 * Right click
 *  - onContextMenu
 *
 * Optimise
 */
import React, { useEffect, useRef, useState } from "react";

type IValue = "B" | number;
interface ICell {
  value: IValue;
  flagged: boolean;
  isShown: boolean;
}

const gridSize = 5;
const bombDensity = 0.19;

const init = (withBombs = false, r = 0, c = 0) => {
  console.log(withBombs, r, c);
  if (withBombs) {
    const grid: Array<Array<ICell>> = [[]];
    const totalcells = gridSize * gridSize - 1; // exclude first-click cell
    const shuffleArray = Array(totalcells).fill(0);
    for (let i = 0; i < Math.floor(bombDensity * totalcells); i++) {
      shuffleArray[i] = "B";
    }
    console.log(shuffleArray);
    for (let i = totalcells - 1; i >= 0; i--) {
      const j = Math.floor(Math.random() * i);
      const temp = shuffleArray[i];
      shuffleArray[i] = shuffleArray[j];
      shuffleArray[j] = temp;
    }
    console.log(shuffleArray);
    console.log(shuffleArray.slice(0, gridSize * r + c));
    console.log(shuffleArray.slice(gridSize * r + c, totalcells));
    const finalArray = [
      ...shuffleArray.slice(0, gridSize * r + c),
      0,
      ...shuffleArray.slice(gridSize * r + c, totalcells),
    ];
    for (let r = 0; r < gridSize; r++) {
      grid[r] = [];
      for (let c = 0; c < gridSize; c++) {
        grid[r][c] = {
          value: finalArray[gridSize * r + c],
          flagged: false,
          isShown: false,
        };
      }
    }
    console.log(
      "in",
      finalArray,
      grid.map((row) => row.map((col) => col.value)).join("\n"),
    );
    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        if (grid[r][c].value === "B") {
          //   console.log(
          //     "init",
          //     grid.map((row) => row.map((col) => col.value)).join("\n"),
          //   );
          const MIN_R = Math.max(0, r - 1);
          const MIN_C = Math.max(0, c - 1);
          const MAX_R = Math.min(gridSize - 1, r + 1);
          const MAX_C = Math.min(gridSize - 1, c + 1);
          for (let RR = MIN_R; RR <= MAX_R; RR++) {
            for (let CC = MIN_C; CC <= MAX_C; CC++) {
              if (typeof grid[RR][CC].value === "number") {
                (grid[RR][CC].value as number) += 1;
              }
            }
          }
        }
      }
    }
    console.log(
      "fin",
      grid.map((row) => row.map((col) => col.value)).join("\n"),
    );
    return {
      grid,
      safeCells: totalcells + 1 - Math.floor(bombDensity * totalcells),
    };
  }
  return { grid: Array(gridSize).fill(Array(gridSize).fill(0)) };
};
// const Cell: React.FC<any> = React.memo(({row, col, value, flagged, isShown, }))
const App: React.FC = () => {
  const [grid, setGrid] = useState<Array<Array<ICell>>>(() => {
    const { grid } = init();
    return grid;
  });
  const gridRef = useRef<Array<Array<ICell>>>([[]]);
  const remaining = useRef<number>(0);
  gridRef.current = grid;
  const firstClick = useRef<boolean>(false);

  const executeDFS = (
    r: number,
    c: number,
    closureGrid: Array<Array<ICell>>,
    cellsToUpdate: Array<{ row: number; col: number }> = [],
    visited: Set<any> = new Set(),
  ) => {
    if (visited.has(`${r}_${c}`)) return cellsToUpdate;
    visited.add(`${r}_${c}`);
    // console.log(
    //   gridRef.current.map((row) => row.map((col) => col.value)).join("\n"),
    // );
    console.log("r,c", r, c);
    console.log(
      "execeuteDFS",
      closureGrid[r][c].value,
      cellsToUpdate.map((item) => `${item.row}_${item.col}`),
      visited,
    );
    if (closureGrid[r][c].value === "B") {
      return cellsToUpdate;
    }
    console.log(">0", closureGrid[r][c].value > 0);
    if (closureGrid[r][c].value > 0) {
      cellsToUpdate.push({ row: r, col: c });
      return cellsToUpdate;
    }
    // if value === 0
    cellsToUpdate.push({ row: r, col: c });
    const MIN_R = Math.max(0, r - 1);
    const MIN_C = Math.max(0, c - 1);
    const MAX_R = Math.min(gridSize - 1, r + 1);
    const MAX_C = Math.min(gridSize - 1, c + 1);
    console.log("minmax", MIN_R, MIN_C, MAX_R, MAX_C);
    for (let RR = MIN_R; RR <= MAX_R; RR++) {
      for (let CC = MIN_C; CC <= MAX_C; CC++) {
        if (visited.has(`${RR}_${CC}`)) {
          continue;
        }
        executeDFS(RR, CC, closureGrid, cellsToUpdate, visited);
      }
    }
    return cellsToUpdate;
  };

  const handleLeftClick = (r: number, c: number) => {
    // todo usecallback
    // let closureGrid = gridRef.current;
    if (!firstClick.current) {
      firstClick.current = true;
      const { grid, safeCells } = init(true, r, c);
      remaining.current = safeCells as number;
      gridRef.current = grid;
      console.log(grid.map((row) => row.map((col) => col.value)).join("\n"));
      setGrid(() => {
        return grid;
      });
    }
    if (gridRef.current[r][c].value === "B") {
      alert("you lose");
      return;
    }
    const cellsToUpdate = executeDFS(r, c, gridRef.current);
    console.log("ctu", cellsToUpdate.length);
    setGrid((prev) => {
      console.log(prev.map((row) => row.map((col) => col.value)).join("\n"));
      const newGrid = [...prev];
      for (const cells of cellsToUpdate) {
        const { row, col } = cells;
        newGrid[row][col] = { ...newGrid[row][col], isShown: true };
      }
      return newGrid;
    });
  };

  const handleRightClick = () => {
    // todo usecallback
  };

  useEffect(() => {
    if ((remaining.current = 0)) {
      alert("you win!");
    }
  }, [grid]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignContent: "center",
      }}
    >
      {/* todo memoise */}
      {grid.map((row, r) => (
        <div>
          {row.map(({ flagged, value, isShown }, c) => (
            <button
              key={`${r}_${c}`}
              onClick={() => handleLeftClick(r, c)}
              onContextMenu={handleRightClick}
              style={{ textAlign: "center" }}
            >
              <span>{isShown ? value : "\u00A0"}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
};

export default App;
