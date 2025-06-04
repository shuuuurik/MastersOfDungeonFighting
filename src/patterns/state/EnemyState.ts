import { Entity, GameField, Position } from '../../types/game';
import { BehaviorStrategy } from '../strategy/BehaviorStrategy';


export interface EnemyState {
  getNextPosition(entity: Entity, player: Entity, gameField: GameField, originalStrategy: BehaviorStrategy): Position;
  
  shouldTransition(entity: Entity): EnemyState | null;
  
  getName(): string;
}
