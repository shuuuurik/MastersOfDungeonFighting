import { Entity, GameField, Position } from '../../types/game';
import { BehaviorStrategy } from '../strategy/BehaviorStrategy';
import { FearfulBehavior } from '../strategy/FearfulBehavior';
import { EnemyState } from './EnemyState';
import { TrackingState } from './TrackingState';

export class PanicState implements EnemyState {
  private fearfulStrategy: FearfulBehavior;
  private recoveryThreshold: number;
  
  constructor(recoveryThreshold: number = 0.5) {
    this.fearfulStrategy = new FearfulBehavior();
    this.recoveryThreshold = recoveryThreshold;
  }
  
  getNextPosition(entity: Entity, player: Entity, gameField: GameField, _: BehaviorStrategy): Position {
    return this.fearfulStrategy.execute(entity, player, gameField);
  }
  
  shouldTransition(entity: Entity): EnemyState | null {
    const healthPercentage = entity.stats.health / entity.stats.maxHealth;
    
    if (healthPercentage >= this.recoveryThreshold) {
      // The GameEngine will fill in the right target position
      return new TrackingState({x: 0, y: 0});
    }
    
    return null;
  }
  
  getName(): string {
    return 'Panic';
  }
}
