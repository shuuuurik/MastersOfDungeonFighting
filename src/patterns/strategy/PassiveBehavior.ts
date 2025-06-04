import { Entity, GameField, Position } from '../../types/game';
import { BehaviorStrategy } from './BehaviorStrategy';

export class PassiveBehavior extends BehaviorStrategy {
  execute(entity: Entity, _: Entity, __: GameField): Position {
    // Don't move, stay in place
    return { ...entity.position };
  }
}