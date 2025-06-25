import React, { useState } from 'react';

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
          maxLength={20}
          required
        />
        <button type="submit">Join Game</button>
      </form>
    </div>
  );
};

export default PlayerInput;
