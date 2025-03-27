import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const isValidPlacement = (grid, row, col, num) => {
  for (let i = 0; i < 9; i++) {
    if (grid[row][i] === num || grid[i][col] === num) return false;
  }
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[startRow + i][startCol + j] === num) return false;
    }
  }
  return true;
};

const solveSudokuHelper = (grid) => {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === "") {
        for (let num = 1; num <= 9; num++) {
          if (isValidPlacement(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudokuHelper(grid)) return true;
            grid[row][col] = "";
          }
        }
        return false;
      }
    }
  }
  return true;
};

const solveSudoku = (grid) => {
  const solvedGrid = grid.map(row => [...row]);
  solveSudokuHelper(solvedGrid);
  return solvedGrid;
};

const generateRandomGrid = () => {
  const grid = Array(9).fill(null).map(() => Array(9).fill(""));
  for (let i = 0; i < 20; i++) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    let num;
    do {
      num = Math.floor(Math.random() * 9) + 1;
    } while (!isValidPlacement(grid, row, col, num));
    grid[row][col] = num;
  }
  return grid;
};

const initialGrid = generateRandomGrid();
const initialSolution = solveSudoku(initialGrid);

const SudokuGrid = () => {
  const [grid, setGrid] = useState(initialGrid.map(row => [...row]));
  const [solution, setSolution] = useState(initialSolution);
  const [hint, setHint] = useState(null);
  const [isWon, setIsWon] = useState(false);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (isRunning) {
      const timer = setInterval(() => setTime((t) => t + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [isRunning]);

  useEffect(() => {
    if (JSON.stringify(grid) === JSON.stringify(solution)) {
      setIsWon(true);
      setScore(100 - time); // Deduct time from score
      setIsRunning(false);
    }
  }, [grid]);

  const handleChange = (row, col, value) => {
    if (/^[1-9]?$/.test(value)) {
      const newGrid = grid.map(r => [...r]);
      newGrid[row][col] = value;
      setGrid(newGrid);
    }
  };

  const handleSolve = () => {
    setGrid(solution);
    setHint(null);
    setIsWon(true);
    setIsRunning(false);
  };

  const resetGrid = () => {
    setGrid(initialGrid.map(row => [...row]));
    setHint(null);
    setIsWon(false);
    setScore(0);
    setTime(0);
    setIsRunning(true);
  };

  const giveHint = () => {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === "") {
          setHint({ row: r, col: c, value: solution[r][c] });
          const newGrid = grid.map(row => [...row]);
          newGrid[r][c] = solution[r][c];
          setGrid(newGrid);
          return;
        }
      }
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-gray-200 min-h-screen">
      <motion.div
        className="grid grid-cols-9 gap-1 border-4 border-gray-800 p-2 bg-white rounded-lg shadow-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {grid.map((row, rIdx) =>
          row.map((cell, cIdx) => (
            <input
              key={`${rIdx}-${cIdx}`}
              type="text"
              value={cell}
              maxLength="1"
              onChange={(e) => handleChange(rIdx, cIdx, e.target.value)}
              className={`w-12 h-12 text-center border text-lg font-bold rounded-md shadow-sm transition-all ${
                initialGrid[rIdx][cIdx] !== "" ? "bg-gray-300 text-black" : "bg-white text-gray-900"
              } ${hint && hint.row === rIdx && hint.col === cIdx ? "bg-yellow-200" : ""} focus:ring-2 focus:ring-blue-500`}
              disabled={initialGrid[rIdx][cIdx] !== ""}
            />
          ))
        )}
      </motion.div>
      <div className="mt-4 flex gap-2">
        <Button onClick={handleSolve} className="bg-green-600 hover:bg-green-700 text-white shadow-md">Solve</Button>
        <Button onClick={resetGrid} className="bg-red-600 hover:bg-red-700 text-white shadow-md">Reset</Button>
        <Button onClick={giveHint} className="bg-blue-600 hover:bg-blue-700 text-white shadow-md">Hint</Button>
      </div>
      <p className="mt-2 text-lg font-semibold">Time: {time}s</p>
      {isWon && (
        <motion.div className="mt-6 p-4 bg-green-500 text-white rounded-lg shadow-lg text-center" initial={{ scale: 0 }} animate={{ scale: 1 }}>
          <h2 className="text-2xl font-bold">🎉 You Won! 🎉</h2>
          <p className="text-lg">Score: {score} points</p>
          <p className="text-lg">Time taken: {time} seconds</p>
        </motion.div>
      )}
    </div>
  );
};

export default SudokuGrid;
