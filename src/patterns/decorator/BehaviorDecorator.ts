import { BehaviorStrategy } from '../strategy/BehaviorStrategy';
import { Entity, GameField, Position } from '../../types/game';


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
