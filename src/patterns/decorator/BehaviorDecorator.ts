import { BehaviorStrategy } from '../strategy/BehaviorStrategy';
import { Entity, GameField, Position } from '../../types/game';

/**
 * Base class for decorating behaviors with additional functionality
 */
export abstract class BehaviorDecorator extends BehaviorStrategy {
  protected wrappedBehavior: BehaviorStrategy;
  
  constructor(behavior: BehaviorStrategy) {
    super();
    this.wrappedBehavior = behavior;
  }
  
  execute(entity: Entity, player: Entity, gameField: GameField): Position {
    return this.wrappedBehavior.execute(entity, player, gameField);
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
  
  execute(entity: Entity, player: Entity, gameField: GameField): Position {
    // If confusion has worn off, revert to original behavior
    if (this.turnsRemaining <= 0) {
      return this.wrappedBehavior.execute(entity, player, gameField);
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
    const validMoves = possibleMoves.filter(pos => BehaviorStrategy.isValidMove(pos.x, pos.y, gameField));
    
    // If no valid moves, stay in place
    if (validMoves.length === 0) {
      return { ...entity.position };
    }
    
    // Pick a random valid move
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    return validMoves[randomIndex];
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
