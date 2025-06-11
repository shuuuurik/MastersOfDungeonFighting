import { Entity, GameField, Position } from '../../types/game';
import { BehaviorStrategy } from './BehaviorStrategy';
import { BehaviorDecorator } from '../decorator/BehaviorDecorator';
import Random from '../../services/Random';

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
    
    const possibleMoves: Position[] = this.getRandomAdjacentPositions(entity.position);
    const validMoves = possibleMoves.filter(pos => BehaviorStrategy.isValidMove(pos.x, pos.y, gameField));
    
    if (validMoves.length === 0) {
      return { ...entity.position };
    }
    
    const randomIndex = Math.floor(Random.uniform(0, validMoves.length));
    const newPosition = validMoves[randomIndex];
    
    return newPosition;
  }
  
  private getRandomAdjacentPositions(position: Position): Position[] {
    const { x, y } = position;
    const positions: Position[] = [];
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        positions.push({ x: x + dx, y: y + dy });
      }
    }
    
    return this.shuffleArray(positions);
  }
  
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Random.uniform(0, i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  isConfused(): boolean {
    return this.turnsRemaining > 0;
  }
  
  getTurnsRemaining(): number {
    return this.turnsRemaining;
  }
}
