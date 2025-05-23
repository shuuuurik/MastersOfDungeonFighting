import { useEffect, useState } from 'react';
import './App.css';
import GameBoard from './components/GameBoard';
import StatusPanel from './components/StatusPanel';
import { GameEngine } from './services/GameEngine';
import { GameState } from './types/game';

function App() {
  const [gameEngine, setGameEngine] = useState(() => new GameEngine());
  const [gameState, setGameState] = useState<GameState>(gameEngine.getState());
  const [isGameRunning, setIsGameRunning] = useState(true);
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isGameRunning) return;
      
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
          gameEngine.movePlayer('up');
          break;
        case 'ArrowDown':
        case 's':
          gameEngine.movePlayer('down');
          break;
        case 'ArrowLeft':
        case 'a':
          gameEngine.movePlayer('left');
          break;
        case 'ArrowRight':
        case 'd':
          gameEngine.movePlayer('right');
          break;
      }
      
      // Update the game state
      setGameState({...gameEngine.getState()});
      
      // Check if game is over
      if (gameEngine.getState().gameOver) {
        setIsGameRunning(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameEngine, isGameRunning]);
  
  const startNewGame = () => {
    const newGameEngine = new GameEngine();
    setGameEngine(newGameEngine);
    setGameState(newGameEngine.getState());
    setIsGameRunning(true);
  };
  
  return (
    <div className="game-container">
      <h1>Roguelike Dungeon Fighter</h1>
      
      <div className="game-layout">
        <GameBoard gameState={gameState} />
        <StatusPanel gameState={gameState} />
      </div>
      
      {!isGameRunning && (
        <div className="game-controls">
          <button onClick={startNewGame} className="new-game-button">
            Start New Game
          </button>
        </div>
      )}
      
      <div className="controls-help">
        <p>Use arrow keys or WASD to move. Attack enemies by moving into them.</p>
      </div>
    </div>
  );
}

export default App;
