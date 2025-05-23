import { BehaviorStrategy } from '../strategy/BehaviorStrategy';
import { Entity, GameMap, Position } from '../../types/game';

/**
 * Base class for decorating behaviors with additional functionality
 */
export abstract class BehaviorDecorator implements BehaviorStrategy {
  protected wrappedBehavior: BehaviorStrategy;
  
  constructor(behavior: BehaviorStrategy) {
    this.wrappedBehavior = behavior;
  }
  
  execute(entity: Entity, player: Entity, gameMap: GameMap): Position {
    return this.wrappedBehavior.execute(entity, player, gameMap);
  }
}

/**
 * Decorator that causes mobs to move randomly (confused state)
 * Temporarily overrides the mob's normal behavior
 */
export class ConfusedBehavior extends BehaviorDecorator {
  private turnsRemaining: number;
  
  constructor(behavior: BehaviorStrategy, duration: number = 5) {
    super(behavior);
    this.turnsRemaining = duration;
  }
  
  execute(entity: Entity, player: Entity, gameMap: GameMap): Position {
    // If confusion has worn off, revert to original behavior
    if (this.turnsRemaining <= 0) {
      return this.wrappedBehavior.execute(entity, player, gameMap);
    }
    
    // Decrement the remaining turns
    this.turnsRemaining--;
    
    // Get all possible adjacent positions
    const { x, y } = entity.position;
    const possibleMoves: Position[] = [
      { x: x+1, y },
      { x: x-1, y },
      { x, y: y+1 },
      { x, y: y-1 },
      // Include diagonals for more randomness
      { x: x+1, y: y+1 },
      { x: x-1, y: y-1 },
      { x: x+1, y: y-1 },
      { x: x-1, y: y+1 },
    ];
    
    // Filter out invalid moves
    const validMoves = possibleMoves.filter(pos => this.isValidMove(pos.x, pos.y, gameMap));
    
    // If no valid moves, stay in place
    if (validMoves.length === 0) {
      return { ...entity.position };
    }
    
    // Pick a random valid move
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    return validMoves[randomIndex];
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
  
  /**
   * Check if the confusion effect is still active
   */
  isConfused(): boolean {
    return this.turnsRemaining > 0;
  }
  
  /**
   * Get the number of turns remaining for the confusion effect
   */
  getTurnsRemaining(): number {
    return this.turnsRemaining;
  }
}
