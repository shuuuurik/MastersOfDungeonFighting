import React from 'react';
import { GameState, Tile, TileType } from '../types/game';
import '../styles/GameBoard.css';

interface GameBoardProps {
  gameState: GameState;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState }) => {
  const { map } = gameState;
  
  const renderTile = (tile: Tile) => {
    let tileClass = 'tile';
    let content = '';
    
    switch (tile.type) {
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
        gridTemplateColumns: `repeat(${map.width}, 1fr)`,
        gridTemplateRows: `repeat(${map.height}, 1fr)`
      }}
    >
      {map.tiles.flat().map(renderTile)}
    </div>
  );
};

export default GameBoard;
