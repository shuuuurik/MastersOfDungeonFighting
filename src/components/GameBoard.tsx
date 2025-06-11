import React from 'react';
import { GameState, Tile, TileType } from '../types/game';
import '../styles/GameBoard.css';

interface GameBoardProps {
  gameState: GameState;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState }) => {
  const { currentField } = gameState;
  
  const renderTile = (tile: Tile) => {
    let tileClass = 'tile';
    let content = '';
    
    switch (tile.type) {
      case TileType.FIELD:
        tileClass += ' field';
        break;
      case TileType.FOREST:
        tileClass += ' forest';
        break;
      case TileType.BEACH:
        tileClass += ' beach';
        break;
      case TileType.RIVER:
        tileClass += ' river';
        content = '🌊';
        break;
      case TileType.MOUNTAIN:
        tileClass += ' mountain';
        content = '⛰️';
        break;
      case TileType.EXIT_UP:
        tileClass += ' exit-up';
        content = '🔼'; // Up arrow
        break;
      case TileType.EXIT_DOWN:
        tileClass += ' exit-down';
        content = '🔽'; // Down arrow
        break;
      case TileType.EXIT_LEFT:
        tileClass += ' exit-left';
        content = '◀️'; // Left arrow
        break;
      case TileType.EXIT_RIGHT:
        tileClass += ' exit-right';
        content = '▶️'; // Right arrow
        break;
      case TileType.NO_WAY:
        tileClass += ' no-way';
        content = '❌'; // Cross mark
        break;
      case TileType.WALL:
        tileClass += ' wall';
        break;
    }
    
    if (tile.entity) {
      tileClass += ` entity ${tile.entity.type.toLowerCase()}`;
      
      if (tile.entity.confused) {
        tileClass += ' confused';
      }
      
      content = tile.entity.symbol;
    }
    
    return (
      <div 
        key={`${tile.position.x}-${tile.position.y}`}
        className={tileClass}
        title={tile.entity ? `${tile.entity.name}${tile.entity.confused ? ' (Confused)' : ''}` : tile.type}
      >
        {content}
      </div>
    );
  };
  
  return (
    <div 
      className="game-board"
      role="grid"
      style={{ 
        gridTemplateColumns: `repeat(${currentField.width}, 1fr)`,
        gridTemplateRows: `repeat(${currentField.height}, 1fr)`
      }}
    >
      {currentField.tiles.flat().map(renderTile)}
    </div>
  );
};

export default GameBoard;
