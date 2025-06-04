import { Entity, GameField, Position } from '../../types/game';
import { BehaviorStrategy } from '../strategy/BehaviorStrategy';
import { FearfulBehavior } from '../strategy/FearfulBehavior';
import { EnemyState } from './EnemyState';
import { NormalState } from './NormalState';

export class PanicState implements EnemyState {
  private fearfulStrategy: FearfulBehavior;
  private recoveryThreshold: number;
  
  constructor(recoveryThreshold: number = 0.5) {
    this.fearfulStrategy = new FearfulBehavior();
    this.recoveryThreshold = recoveryThreshold;
  }
  
  getNextPosition(entity: Entity, player: Entity, gameField: GameField, _: BehaviorStrategy): Position {
    // Always use fearful behavior regardless of original strategy
    return this.fearfulStrategy.execute(entity, player, gameField);
  }
  
  shouldTransition(entity: Entity): EnemyState | null {
    // Check if health is above recovery threshold
    const healthPercentage = entity.stats.health / entity.stats.maxHealth;
    
    if (healthPercentage >= this.recoveryThreshold) {
      // Transition back to normal state
      return new NormalState();
    }
    
    return null;
  }
  
  getName(): string {
    return 'Panic';
  }
}
