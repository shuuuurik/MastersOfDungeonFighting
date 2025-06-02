import { useEffect, useState } from 'react';
import './App.css';
import GameBoard from './components/GameBoard';
import StatusPanel from './components/StatusPanel';
import { GameEngine } from './services/GameEngine';
import { GameState, GameTheme } from './types/game';
import { CommandInvoker, MoveCommand, WaitCommand } from './patterns/command/Command';

function App() {
  const [gameEngine, setGameEngine] = useState(() => new GameEngine(GameTheme.FANTASY));
  const [gameState, setGameState] = useState<GameState>(gameEngine.getState());
  const [isGameRunning, setIsGameRunning] = useState(true);
  const [commandInvoker] = useState(() => new CommandInvoker());
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isGameRunning) return;
      
      // Create the appropriate command based on key pressed
      switch (event.key) {
        case 'ArrowUp':
        case 'w':
          commandInvoker.addCommand(new MoveCommand(gameEngine, 'up'));
          break;
        case 'ArrowDown':
        case 's':
          commandInvoker.addCommand(new MoveCommand(gameEngine, 'down'));
          break;
        case 'ArrowLeft':
        case 'a':
          commandInvoker.addCommand(new MoveCommand(gameEngine, 'left'));
          break;
        case 'ArrowRight':
        case 'd':
          commandInvoker.addCommand(new MoveCommand(gameEngine, 'right'));
          break;
        case ' ':
          // Space bar to wait (skip turn)
          commandInvoker.addCommand(new WaitCommand(gameEngine));
          break;
        default:
          return; // Don't execute commands for other keys
      }
      
      // Execute the commands
      commandInvoker.executeCommands();
      
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
  }, [gameEngine, isGameRunning, commandInvoker]);
  
  const startNewGame = () => {
    const newGameEngine = new GameEngine(gameState.theme);
    setGameEngine(newGameEngine);
    setGameState(newGameEngine.getState());
    setIsGameRunning(true);
  };
  
  const switchTheme = () => {
    const newTheme = gameState.theme === GameTheme.FANTASY ? GameTheme.FOREST : GameTheme.FANTASY;
    const newGameEngine = new GameEngine(newTheme);
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
      
      <div className="game-controls">
        {!isGameRunning && (
          <button onClick={startNewGame} className="new-game-button">
            Start New Game
          </button>
        )}
        
        <button onClick={switchTheme} className="theme-button">
          Switch to {gameState.theme === GameTheme.FANTASY ? 'Forest' : 'Fantasy'} Theme
        </button>
      </div>
      
      <div className="controls-help">
        <p>Use arrow keys or WASD to move. Attack enemies by moving into them. Space to wait.</p>
      </div>
    </div>
  );
}

export default App;
