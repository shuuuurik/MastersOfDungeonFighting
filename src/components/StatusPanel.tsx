import React from 'react';
import { GameState, GameTheme } from '../types/game';
import '../styles/StatusPanel.css';

interface StatusPanelProps {
  gameState: GameState;
  switchTheme: () => void;
  isGameRunning: boolean;
  startNewGame: () => void;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ gameState, switchTheme, isGameRunning, startNewGame }) => {
  const { player, gameOver, victory, turn, theme, enemies } = gameState;
  const { stats } = player;
  
  const healthPercentage = (stats.health / stats.maxHealth) * 100;
  const experiencePercentage = (stats.experience / stats.experienceToNextLevel) * 100;
  
  // Count enemies by type
  const enemyCounts = enemies.reduce((acc, enemy) => {
    const category = enemy.category || 'unknown';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return <>
    <div className="status-panel">
      <h2>Roguelike Dungeon Fighter</h2>

      <div className="game-status">
        {gameOver ? (
          <h2>{victory ? 'Victory!' : 'Game Over!'}</h2>
        ) : (
          <h2>Turn: {turn}</h2>
        )}
        <div className="theme-indicator">Theme: {theme}</div>
      </div>
      
      <div className="player-stats">
        <h3>{player.name}</h3>
        
        <div className="stat-row">
          <span>Health:</span>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill health" 
              style={{ width: `${healthPercentage}%` }}
            />
          </div>
          <span>{stats.health}/{stats.maxHealth}</span>
        </div>
        
        <div className="stat-row">
          <span>Level: {stats.level}</span>
        </div>
        
        <div className="stat-row">
          <span>Experience:</span>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill exp" 
              style={{ width: `${experiencePercentage}%` }}
            />
          </div>
          <span>{stats.experience}/{stats.experienceToNextLevel}</span>
        </div>
        
        <div className="stat-row">
          <span>Attack: {stats.attack}</span>
        </div>
        
        <div className="stat-row">
          <span>Defense: {stats.defense}</span>
        </div>
      </div>
      
      <div className="enemy-summary">
        <h3>Enemies</h3>
        <ul>
          {Object.entries(enemyCounts).map(([type, count]) => (
            <li key={type}>
              {type}: {count}
            </li>
          ))}
        </ul>
        <div className="total-enemies">Total: {enemies.length}</div>
      </div>
      
      <div className="game-help">
        <h3>Help</h3>
        <ul>
          <li>WASD or Arrow keys: Move</li>
          <li>Move into enemies to attack</li>
          <li>Space: Skip turn</li>
        </ul>
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
    </div>
  </>;
};

export default StatusPanel;
