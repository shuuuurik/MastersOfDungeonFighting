import React from 'react';
import { GameState } from '../types/game';
import '../styles/StatusPanel.css';

interface StatusPanelProps {
  gameState: GameState;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ gameState }) => {
  const { player, gameOver, victory, turn } = gameState;
  const { stats } = player;
  
  const healthPercentage = (stats.health / stats.maxHealth) * 100;
  const experiencePercentage = (stats.experience / stats.experienceToNextLevel) * 100;
  
  return (
    <div className="status-panel">
      <div className="game-status">
        {gameOver ? (
          <h2>{victory ? 'Victory!' : 'Game Over!'}</h2>
        ) : (
          <h2>Turn: {turn}</h2>
        )}
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
    </div>
  );
};

export default StatusPanel;
