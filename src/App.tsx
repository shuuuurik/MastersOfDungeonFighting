import { useEffect, useState } from 'react';
import './App.css';
import GameBoard from './components/GameBoard';
import StatusPanel from './components/StatusPanel';
import { GameEngine } from './services/GameEngine';
import { GameState, GameTheme } from './types/game';
import { CommandInvoker, MoveCommand, WaitCommand, ConfuseCommand } from './patterns/command/Command';

function App() {
  const [gameEngine, setGameEngine] = useState(() => new GameEngine(GameTheme.FANTASY));
  const [gameState, setGameState] = useState<GameState>(gameEngine.getState());
  const [isGameRunning, setIsGameRunning] = useState(!gameEngine.getState().gameOver);
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
        case 'c': // Add 'c' key for confusion ability
          commandInvoker.addCommand(new ConfuseCommand(gameEngine));
          break;
        default:
          return; // Don't execute commands for other keys
      }
      
      commandInvoker.executeCommands();
      const updatedGameState = gameEngine.getState();
      // Update the game state
      setGameState({...updatedGameState});
      
      // Check if game is over
      if (updatedGameState.gameOver) {
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
      <div className="game-layout">
        <GameBoard gameState={gameState} />
        <StatusPanel gameState={gameState} switchTheme={switchTheme} isGameRunning={isGameRunning} startNewGame={startNewGame}  />
      </div>
    </div>
  );
}

export default App;
