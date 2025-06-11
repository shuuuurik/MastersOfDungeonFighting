import { Entity, GameField, Position } from '../../types/game';
import { BehaviorStrategy } from '../strategy/BehaviorStrategy';
import { AggressiveBehavior } from '../strategy/AggressiveBehavior';
import { EnemyState } from './EnemyState';
import { NormalState } from './NormalState';
import { PatrolState } from './PatrolState';
import { PanicState } from './PanicState';

export class TrackingState implements EnemyState {
  private targetPosition: Position;
  private giveUpDistance: number;
  private aggressiveStrategy: BehaviorStrategy;
  
  constructor(targetPosition: Position, giveUpDistance: number = 10) {
    this.targetPosition = targetPosition;
    this.giveUpDistance = giveUpDistance;
    // Lazily create the aggressive strategy only when needed
    this.aggressiveStrategy = new AggressiveBehavior();
  }
  
  getNextPosition(entity: Entity, player: Entity, gameField: GameField, originalStrategy: BehaviorStrategy): Position {
    // Check if we're at the target position
    if (entity.position.x === this.targetPosition.x && entity.position.y === this.targetPosition.y) {
      // We've reached the target, transition to patrolling
      return originalStrategy.execute(entity, player, gameField);
    }
    
    // Create a temporary player entity at the target position for pathfinding
    const targetEntity: Entity = {
      ...player,
      position: this.targetPosition
    };
    
    // Use aggressive behavior to move towards the target
    return this.aggressiveStrategy.execute(entity, targetEntity, gameField);
  }
  
  shouldTransition(entity: Entity): EnemyState | null {
    // First check health - panic has priority
    const healthRatio = entity.stats.health / entity.stats.maxHealth;
    if (healthRatio <= 0.3) {
      return new PanicState();
    }
    
    // Calculate distance to target
    const dx = entity.position.x - this.targetPosition.x;
    const dy = entity.position.y - this.targetPosition.y;
    const distanceSquared = dx * dx + dy * dy;
    
    // If we're too far from the target, give up and go back to normal state
    if (distanceSquared > this.giveUpDistance * this.giveUpDistance) {
      return new NormalState();
    }
    
    // If we've reached the target, switch to patrolling
    if (entity.position.x === this.targetPosition.x && entity.position.y === this.targetPosition.y) {
      return new PatrolState(this.targetPosition, 5);
    }
    
    return null;
  }
  
  getName(): string {
    return 'Tracking';
  }
}
