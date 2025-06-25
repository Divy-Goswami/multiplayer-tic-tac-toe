import React, { useState } from 'react';
import audioManager from '../utils/audioManager';

const PlayerInput = ({ onJoinQueue }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onJoinQueue(name.trim());
    }
  };

  return (
    <div className="player-input">
      <h2>Enter Your Name</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your name..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          onFocus={() => audioManager.play('hover')}
          maxLength={20}
          required
        />
        <button 
          type="submit"
          onClick={() => audioManager.play('click')}
          onMouseEnter={() => audioManager.play('hover')}
        >
          Join Game
        </button>
      </form>
    </div>
  );
};

export default PlayerInput;
