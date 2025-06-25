# Multiplayer Tic-Tac-Toe Game

A real-time multiplayer Tic-Tac-Toe game built with React frontend and Node.js backend using Socket.IO for real-time communication.

## Features

- 🎮 **Real-time Multiplayer**: Play with friends in real-time
- 🎨 **Beautiful UI**: Modern, responsive design with smooth animations
- 🔄 **Automatic Matchmaking**: Get matched with available players automatically
- 🏆 **Win Detection**: Automatic winner detection with visual highlights
- 🔁 **Play Again**: Restart games with the same opponent
- 📱 **Mobile Responsive**: Works perfectly on desktop and mobile devices
- ⚡ **Fast & Lightweight**: Built with performance in mind

## Tech Stack

### Frontend
- React 18
- Socket.IO Client
- CSS3 with advanced animations
- Responsive design

### Backend
- Node.js
- Express.js
- Socket.IO
- UUID for unique game sessions

## Project Structure

```
multiplayer-tic-tac-toe/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameBoard.js
│   │   │   ├── GameStatus.js
│   │   │   └── PlayerInput.js
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   └── package.json
├── server/                 # Node.js backend
│   ├── index.js
│   └── package.json
├── package.json           # Root package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Quick Start

1. **Clone or navigate to the project directory**
   ```bash
   cd "C:\Users\divy\OneDrive\Desktop\Tic-Tec-toe"
   ```

2. **Install all dependencies**
   ```bash
   npm run install-all
   ```

3. **Start both server and client in development mode**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:5000`
   - React frontend on `http://localhost:3000`

### Manual Setup

If you prefer to start them separately:

1. **Start the backend server**
   ```bash
   cd server
   npm install
   npm run dev
   ```

2. **Start the frontend (in a new terminal)**
   ```bash
   cd client
   npm install
   npm start
   ```

## How to Play

1. **Enter Your Name**: When you first visit the game, enter your name
2. **Join Queue**: Click "Join Game" to enter the matchmaking queue
3. **Wait for Opponent**: The system will automatically match you with another player
4. **Play**: Take turns clicking on the grid to place your X or O
5. **Win or Draw**: The game automatically detects wins and draws
6. **Play Again**: After a game ends, both players can choose to play again

## Game Rules

- Standard Tic-Tac-Toe rules apply
- Players take turns placing X or O on a 3x3 grid
- First player to get three in a row (horizontally, vertically, or diagonally) wins
- If all 9 squares are filled without a winner, it's a draw
- Player who goes first alternates between games

## Features in Detail

### Real-time Communication
- Uses WebSocket connections via Socket.IO
- Instant move updates
- Real-time game state synchronization
- Automatic disconnection handling

### Matchmaking System
- Automatic player pairing
- Queue management
- Game session creation with unique IDs

### Game State Management
- Turn-based gameplay
- Win condition checking
- Game restart functionality
- Player disconnection handling

### UI/UX Features
- Smooth animations and transitions
- Visual feedback for player turns
- Winning line highlighting
- Responsive design for all screen sizes
- Loading states and user feedback

## Available Scripts

### Root Directory
- `npm run dev` - Start both server and client in development mode
- `npm run install-all` - Install dependencies for all packages
- `npm run build` - Build the client for production
- `npm start` - Start the server in production mode

### Server Directory
- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with nodemon

### Client Directory
- `npm start` - Start the React development server
- `npm run build` - Build the app for production
- `npm test` - Run the test suite

## Development

### Server API Events

**Client to Server:**
- `join-queue` - Join the matchmaking queue
- `make-move` - Make a move in the game
- `play-again` - Request to play another game
- `leave-game` - Leave the current game

**Server to Client:**
- `waiting-for-opponent` - Waiting for another player
- `game-start` - Game has started with opponent
- `game-update` - Game state has been updated
- `game-restart` - Game has been restarted
- `opponent-left` - Opponent left the game
- `opponent-disconnected` - Opponent disconnected
- `error` - Error message

### Customization

You can easily customize the game by:
- Modifying the CSS in `client/src/App.css` for styling
- Adjusting game logic in `server/index.js`
- Adding new features to the React components

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Performance

- Lightweight design with minimal dependencies
- Efficient real-time communication
- Optimized for low latency gameplay
- Memory-efficient game state management

## Troubleshooting

### Common Issues

1. **Connection Issues**
   - Make sure both server (port 5000) and client (port 3000) are running
   - Check that no firewall is blocking the connections

2. **Installation Problems**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and reinstall: `rm -rf node_modules && npm install`

3. **Port Already in Use**
   - Kill processes on ports 3000 and 5000
   - Or change the ports in the configuration

### Support

For issues or questions, check the console for error messages and ensure all dependencies are properly installed.

## Contributing

Feel free to fork the project and submit pull requests for any improvements!

## License

MIT License - feel free to use this project for learning or commercial purposes.
