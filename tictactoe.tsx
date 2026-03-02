/**
 * versus AI or versus person?
 */
import React, { useState, useRef, useEffect, useCallback } from "react";
const gridSize = 3;
const player1 = "X";
const player2 = "O";
type IPlayers = typeof player1 | typeof player2;
type IGrid = Array<Array<null | IPlayers>>;

const initGrid = () => {
  return Array(gridSize).fill(Array(gridSize).fill(null));
};

const Cell: React.FC<any> = React.memo(({ r, c, handleClick, col }) => (
  <button onClick={() => handleClick(r, c)} style={{ width: 40, height: 40 }}>
    {col ?? "\u00A0"}
  </button>
));

const App: React.FC = () => {
  // optimisations, win condition
  const [grid, setGrid] = useState<IGrid>(initGrid);
  const currentPlayer = useRef<IPlayers>(player1);

  const handleClick = useCallback((r: number, c: number) => {
    if (grid[r][c]) return;
    setGrid((prev) => {
      //   console.log("prev", JSON.stringify(prev));
      const newGrid = [...prev];
      newGrid[r] = [...prev[r]];
      newGrid[r][c] = currentPlayer.current;
      currentPlayer.current =
        currentPlayer.current === player1 ? player2 : player1;
      return newGrid;
    });
  }, []);

  useEffect(() => {
    const horizontalWin =
      grid[0][0] === grid[0][1] &&
      grid[0][1] === grid[0][2] &&
      grid[0][0] !== null;
    if (horizontalWin) alert(grid[0][0] + " wins!");
    const horizontal2Win =
      grid[1][0] === grid[1][1] &&
      grid[1][1] === grid[1][2] &&
      grid[1][0] !== null;
    if (horizontal2Win) alert(grid[1][0] + " wins!");
    const horizontal3Win =
      grid[2][0] === grid[2][1] &&
      grid[2][1] === grid[2][2] &&
      grid[2][0] !== null;
    if (horizontal3Win) alert(grid[2][0] + " wins!");
    const verticalWin =
      grid[0][0] === grid[1][0] &&
      grid[1][0] === grid[2][0] &&
      grid[0][0] !== null;
    if (verticalWin) alert(grid[0][0] + " wins!");
    const vertical2Win =
      grid[0][1] === grid[1][1] &&
      grid[1][1] === grid[2][1] &&
      grid[0][1] !== null;
    if (vertical2Win) alert(grid[0][1] + " wins!");
    const vertical3Win =
      grid[0][2] === grid[1][2] &&
      grid[1][2] === grid[2][2] &&
      grid[0][2] !== null;
    if (vertical3Win) alert(grid[0][2] + " wins!");
    const diagonalWin =
      grid[0][0] === grid[1][1] &&
      grid[1][1] === grid[2][2] &&
      grid[0][0] !== null;
    if (diagonalWin) alert(grid[0][0] + " wins!");
    const digonal2Win =
      grid[2][0] === grid[1][1] &&
      grid[1][1] === grid[0][2] &&
      grid[2][0] !== null;
    if (digonal2Win) alert(grid[2][0] + " wins!");
  }, [grid]);

  return (
    <div>
      {grid.map((row, r) => (
        <div>
          {row.map((col, c) => (
            <Cell
              key={`${r}_${c}`}
              r={r}
              c={c}
              handleClick={handleClick}
              col={col}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default App;
