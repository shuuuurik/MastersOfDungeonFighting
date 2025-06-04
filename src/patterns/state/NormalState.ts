import { Entity, GameField, Position } from '../../types/game';
import { BehaviorStrategy } from '../strategy/BehaviorStrategy';
import { EnemyState } from './EnemyState';
import { PanicState } from './PanicState';


export class NormalState implements EnemyState {
  private panicHealthThreshold: number;
  
  constructor(panicHealthThreshold: number = 0.3) {
    this.panicHealthThreshold = panicHealthThreshold;
  }
  
  getNextPosition(entity: Entity, player: Entity, gameField: GameField, originalStrategy: BehaviorStrategy): Position {
    // Use the original strategy in normal state
    return originalStrategy.execute(entity, player, gameField);
  }
  
  shouldTransition(entity: Entity): EnemyState | null {
    // If health drops below threshold, transition to panic state
    const healthRatio = entity.stats.health / entity.stats.maxHealth;
    
    if (healthRatio <= this.panicHealthThreshold) {
      return new PanicState();
    }
    
    return null;
  }
  
  getName(): string {
    return 'Normal';
  }
}
