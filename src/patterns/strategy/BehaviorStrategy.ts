import { Entity, GameField, Position, TileType } from '../../types/game';

export abstract class BehaviorStrategy {
  abstract execute(entity: Entity, player: Entity, gameField: GameField): Position;

  public static isValidMove(x: number, y: number, gameField: GameField): boolean {
    // Check map boundaries
    if (x < 0 || y < 0 || x >= gameField.width || y >= gameField.height) {
      return false;
    }
    
    // Check if tile is walkable (not a wall) and has no entity
    const tile = gameField.tiles[y][x];
    return tile.type !== TileType.MOUNTAIN 
          && tile.type !== TileType.RIVER 
          && tile.type !== TileType.WALL
          && tile.type !== TileType.EXIT_UP
          && tile.type !== TileType.EXIT_RIGHT
          && tile.type !== TileType.EXIT_DOWN
          && tile.type !== TileType.EXIT_LEFT
          && tile.type !== TileType.NO_WAY
          && tile.entity === null;
  }
}

export class AggressiveBehavior extends BehaviorStrategy {
  execute(entity: Entity, player: Entity, gameField: GameField): Position {
    // Move towards the player
    const { x: entityX, y: entityY } = entity.position;
    const { x: playerX, y: playerY } = player.position;
    
    // Simple pathfinding - move one step towards the player
    const dx = Math.sign(playerX - entityX);
    const dy = Math.sign(playerY - entityY);
    
    // Try to move in x or y direction, prioritizing the larger distance
    if (Math.abs(playerX - entityX) > Math.abs(playerY - entityY)) {
      const newX = entityX + dx;
      if (BehaviorStrategy.isValidMove(newX, entityY, gameField)) {
        return { x: newX, y: entityY };
      }
    } else {
      const newY = entityY + dy;
      if (BehaviorStrategy.isValidMove(entityX, newY, gameField)) {
        return { x: entityX, y: newY };
      }
    }
    
    // Try the other direction if first failed
    if (dx !== 0) {
      const newX = entityX + dx;
      if (BehaviorStrategy.isValidMove(newX, entityY, gameField)) {
        return { x: newX, y: entityY };
      }
    }
    
    if (dy !== 0) {
      const newY = entityY + dy;
      if (BehaviorStrategy.isValidMove(entityX, newY, gameField)) {
        return { x: entityX, y: newY };
      }
    }
    
    // Stay in place if no valid move
    return { ...entity.position };
  }

}

export class PassiveBehavior extends BehaviorStrategy {
  execute(entity: Entity, player: Entity, gameField: GameField): Position {
    // Don't move, stay in place
    return { ...entity.position };
  }
}

export class FearfulBehavior extends BehaviorStrategy {
  execute(entity: Entity, player: Entity, gameField: GameField): Position {
    // Move away from the player
    const { x: entityX, y: entityY } = entity.position;
    const { x: playerX, y: playerY } = player.position;
    
    // If player is within certain distance, run away
    const distanceToPlayer = Math.sqrt(
      Math.pow(playerX - entityX, 2) + Math.pow(playerY - entityY, 2)
    );
    
    if (distanceToPlayer <= 5) {
      // Move in the opposite direction from player
      const dx = Math.sign(entityX - playerX);
      const dy = Math.sign(entityY - playerY);
      
      // Try to move in x or y direction, prioritizing the larger distance
      if (Math.abs(playerX - entityX) > Math.abs(playerY - entityY)) {
        const newX = entityX + dx;
        if (BehaviorStrategy.isValidMove(newX, entityY, gameField)) {
          return { x: newX, y: entityY };
        }
      } else {
        const newY = entityY + dy;
        if (BehaviorStrategy.isValidMove(entityX, newY, gameField)) {
          return { x: entityX, y: newY };
        }
      }
      
      // Try the other direction if first failed
      if (dx !== 0) {
        const newX = entityX + dx;
        if (BehaviorStrategy.isValidMove(newX, entityY, gameField)) {
          return { x: newX, y: entityY };
        }
      }
      
      if (dy !== 0) {
        const newY = entityY + dy;
        if (BehaviorStrategy.isValidMove(entityX, newY, gameField)) {
          return { x: entityX, y: newY };
        }
      }
    }
    
    // Stay in place if no valid move or player is too far
    return { ...entity.position };
  }
}
