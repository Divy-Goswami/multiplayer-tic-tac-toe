import React from 'react';

const GameBoard = ({ board, onMove, isYourTurn, gameFinished, winningLine }) => {
  const handleCellClick = (index) => {
    if (!board[index] && isYourTurn && !gameFinished) {
      onMove(index);
    }
  };

  const getCellClass = (index) => {
    let className = 'cell';
    
    if (board[index]) {
      className += ` filled ${board[index].toLowerCase()}`;
    }
    
    if (!board[index] && isYourTurn && !gameFinished) {
      className += ' clickable';
    }
    
    if (winningLine && winningLine.includes(index)) {
      className += ' winning';
    }
    
    return className;
  };

  return (
    <div className="game-board">
      <div className="board">
        {board.map((cell, index) => (
          <div
            key={index}
            className={getCellClass(index)}
            onClick={() => handleCellClick(index)}
          >
            {cell}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
