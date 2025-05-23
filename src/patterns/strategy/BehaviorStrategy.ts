import { Entity, GameMap, Position } from '../../types/game';

export interface BehaviorStrategy {
  execute(entity: Entity, player: Entity, gameMap: GameMap): Position;
}

export class AggressiveBehavior implements BehaviorStrategy {
  execute(entity: Entity, player: Entity, gameMap: GameMap): Position {
    // Move towards the player
    const { x: entityX, y: entityY } = entity.position;
    const { x: playerX, y: playerY } = player.position;
    
    // Simple pathfinding - move one step towards the player
    const dx = Math.sign(playerX - entityX);
    const dy = Math.sign(playerY - entityY);
    
    // Try to move in x or y direction, prioritizing the larger distance
    if (Math.abs(playerX - entityX) > Math.abs(playerY - entityY)) {
      const newX = entityX + dx;
      if (this.isValidMove(newX, entityY, gameMap)) {
        return { x: newX, y: entityY };
      }
    } else {
      const newY = entityY + dy;
      if (this.isValidMove(entityX, newY, gameMap)) {
        return { x: entityX, y: newY };
      }
    }
    
    // Try the other direction if first failed
    if (dx !== 0) {
      const newX = entityX + dx;
      if (this.isValidMove(newX, entityY, gameMap)) {
        return { x: newX, y: entityY };
      }
    }
    
    if (dy !== 0) {
      const newY = entityY + dy;
      if (this.isValidMove(entityX, newY, gameMap)) {
        return { x: entityX, y: newY };
      }
    }
    
    // Stay in place if no valid move
    return { ...entity.position };
  }
  
  private isValidMove(x: number, y: number, gameMap: GameMap): boolean {
    // Check map boundaries
    if (x < 0 || y < 0 || x >= gameMap.width || y >= gameMap.height) {
      return false;
    }
    
    // Check if tile is walkable (not a wall) and has no entity
    const tile = gameMap.tiles[y][x];
    return tile.type !== 'WALL' && tile.entity === null;
  }
}

export class PassiveBehavior implements BehaviorStrategy {
  execute(entity: Entity, player: Entity, gameMap: GameMap): Position {
    // Don't move, stay in place
    return { ...entity.position };
  }
}

export class FearfulBehavior implements BehaviorStrategy {
  execute(entity: Entity, player: Entity, gameMap: GameMap): Position {
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
        if (this.isValidMove(newX, entityY, gameMap)) {
          return { x: newX, y: entityY };
        }
      } else {
        const newY = entityY + dy;
        if (this.isValidMove(entityX, newY, gameMap)) {
          return { x: entityX, y: newY };
        }
      }
      
      // Try the other direction if first failed
      if (dx !== 0) {
        const newX = entityX + dx;
        if (this.isValidMove(newX, entityY, gameMap)) {
          return { x: newX, y: entityY };
        }
      }
      
      if (dy !== 0) {
        const newY = entityY + dy;
        if (this.isValidMove(entityX, newY, gameMap)) {
          return { x: entityX, y: newY };
        }
      }
    }
    
    // Stay in place if no valid move or player is too far
    return { ...entity.position };
  }
  
  private isValidMove(x: number, y: number, gameMap: GameMap): boolean {
    // Check map boundaries
    if (x < 0 || y < 0 || x >= gameMap.width || y >= gameMap.height) {
      return false;
    }
    
    // Check if tile is walkable (not a wall) and has no entity
    const tile = gameMap.tiles[y][x];
    return tile.type !== 'WALL' && tile.entity === null;
  }
}
