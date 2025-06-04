import { Entity, GameField, Position } from '../../types/game';
import { BehaviorStrategy } from './BehaviorStrategy';
import { BehaviorDecorator } from '../decorator/BehaviorDecorator';

/**
 * Confused behavior decorator makes entities move randomly
 */
export class ConfusedBehavior extends BehaviorDecorator {
  private turnsRemaining: number;
  
  constructor(behavior: BehaviorStrategy, duration: number = 5) {
    super(behavior);
    this.turnsRemaining = duration;
  }
  
  execute(entity: Entity, player: Entity, gameField: GameField): Position {
    if (this.turnsRemaining <= 0) {
      return this.wrappedBehavior.execute(entity, player, gameField);
    }
    
    this.turnsRemaining--;
    
    // Get all possible adjacent positions
    const { x, y } = entity.position;
    const possibleMoves: Position[] = [
      { x: x+1, y },
      { x: x-1, y },
      { x, y: y+1 },
      { x, y: y-1 },
      { x: x+1, y: y+1 },
      { x: x-1, y: y-1 },
      { x: x+1, y: y-1 },
      { x: x-1, y: y+1 },
    ];
    
    const validMoves = possibleMoves.filter(pos => BehaviorStrategy.isValidMove(pos.x, pos.y, gameField));
    
    if (validMoves.length === 0) {
      return { ...entity.position };
    }
    
    const randomIndex = Math.floor(Math.random() * validMoves.length);
    return validMoves[randomIndex];
  }
  
  isConfused(): boolean {
    return this.turnsRemaining > 0;
  }
  
  getTurnsRemaining(): number {
    return this.turnsRemaining;
  }
}
