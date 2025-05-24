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
        break;
      case TileType.MOUNTAIN:
        tileClass += ' mountain';
        break;
      case TileType.EXIT_UP:
        tileClass += ' exit-up';
        content = '^';
        break;
      case TileType.EXIT_DOWN:
        tileClass += ' exit-down';
        content = 'v';
        break;
      case TileType.EXIT_LEFT:
        tileClass += ' exit-left';
        content = '<';
        break;
      case TileType.EXIT_RIGHT:
        tileClass += ' exit-right';
        content = '>';
        break;
      case TileType.FLOOR:
        tileClass += ' floor';
        break;
      case TileType.WALL:
        tileClass += ' wall';
        break;
      case TileType.EXIT:
        tileClass += ' exit';
        content = '>';
        break;
    }
    
    if (tile.entity) {
      tileClass += ` entity ${tile.entity.type.toLowerCase()}`;
      content = tile.entity.symbol;
    }
    return (
      <div 
        key={`${tile.position.x}-${tile.position.y}`}
        className={tileClass}
        title={tile.entity ? tile.entity.name : tile.type}
      >
        {content}
      </div>
    );
  };
  
  return (
    <div 
      className="game-board"
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
