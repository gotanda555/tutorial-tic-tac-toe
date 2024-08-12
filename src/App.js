import { useState } from 'react';

function Square({ isWinSquare, value, onSquareClick }) {
  return (
    <button
      className={`square ${isWinSquare ? 'winning-square' : ''}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i) {
    if (squares[i] || calculateWinner(squares)) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = "X";
    } else {
      nextSquares[i] = "O";
    }
    onPlay(nextSquares);
  }

  const result = calculateWinner(squares);
  let status;
  if (result?.isDraw) {
    status = "This game is a draw";
  } else if (result) {
    status = "Winner: " + result.winner;
  } else {
    status = "Next player: " + (xIsNext ? "X" : "O");
  }

  const boardSize = 3;

  const rows = Array(boardSize).fill(null).map((_, rowIndex) => {
    const cols = Array(boardSize).fill(null).map((_, colIndex) => {
      const squareIndex = rowIndex * boardSize + colIndex;
      const isWinSquare = result?.winningLine?.includes(squareIndex)
      return (
        <Square
          key={squareIndex}
          isWinSquare={isWinSquare}
          value={squares[squareIndex]}
          onSquareClick={() => handleClick(squareIndex)}
        />
      );
    });
    return (
      <div key={rowIndex} className="board-row">
        {cols}
      </div>
    );
  });

  return (
    <>
      <div className="status">{status}</div>
      {rows}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([Array(9).fill(null)]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove];

  function handlePlay(nextSquares) {
    const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function toggleSortOrder() {
    setIsAscending(!isAscending);
  }

  const moves = history.map((squares, move) => {
    const prevSquares = history[move - 1] || [];
    const changedIndex = squares.findIndex((square, index) => square !== prevSquares[index]);
    const row = Math.floor(changedIndex / 3);
    const col = changedIndex % 3;
    const rowCol = `(Row: ${row + 1}, Col: ${col + 1})`

    if (move === currentMove) {
      return (
        <li key={move}>
          <b>{"You are at move #" + move + ' ' + (move === 0 ? '' : rowCol)}</b>
        </li>
      );
    }

    let description;
    if (move > 0) {
      description = `Go to move #${move} ${rowCol}`;
    } else {
      description = 'Go to game start';
    }
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  const sortedMoves = isAscending ? moves : [...moves].reverse();

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <button onClick={toggleSortOrder}>
          {isAscending ? 'Sort Descending' : 'Sort Ascending'}
        </button>
        <ol reversed={!isAscending}>
          {sortedMoves}
        </ol>
      </div>
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        winningLine: lines[i]
      };
    }
  }

  if (!squares.includes(null)) {
    return {
      isDraw: true
    }
  }
  return null;
}
