import { Entity, GameField, Position } from '../../types/game';
import { BehaviorStrategy } from '../strategy/BehaviorStrategy';

/**
 * State interface for enemy behavior states
 */
export interface EnemyState {
  /**
   * Determine the next position based on the current state
   */
  getNextPosition(entity: Entity, player: Entity, gameField: GameField, originalStrategy: BehaviorStrategy): Position;
  
  /**
   * Check if state should transition to another state
   */
  shouldTransition(entity: Entity): EnemyState | null;
  
  /**
   * Get the name of this state
   */
  getName(): string;
}

/**
 * Normal state - enemy uses its assigned strategy
 */
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
      return new PanicState(this.panicHealthThreshold);
    }
    
    return null;
  }
  
  getName(): string {
    return 'Normal';
  }
}

/**
 * Panic state - enemy always uses fearful behavior
 */
export class PanicState implements EnemyState {
  private fearfulStrategy: BehaviorStrategy;
  private recoveryThreshold: number;
  
  constructor(recoveryThreshold: number = 0.5) {
    // Lazily create the fearful strategy only when needed
    this.fearfulStrategy = new (require('../strategy/BehaviorStrategy').FearfulBehavior)();
    this.recoveryThreshold = recoveryThreshold;
  }
  
  getNextPosition(entity: Entity, player: Entity, gameField: GameField, _: BehaviorStrategy): Position {
    // In panic state, always use fearful behavior
    return this.fearfulStrategy.execute(entity, player, gameField);
  }
  
  shouldTransition(entity: Entity): EnemyState | null {
    // If health rises above threshold, transition back to normal state
    const healthRatio = entity.stats.health / entity.stats.maxHealth;
    
    if (healthRatio > this.recoveryThreshold) {
      return new NormalState(this.recoveryThreshold);
    }
    
    return null;
  }
  
  getName(): string {
    return 'Panic';
  }
}

/**
 * Tracking state - enemy moves to the player's last known position
 */
export class TrackingState implements EnemyState {
  private targetPosition: Position;
  private giveUpDistance: number;
  private aggressiveStrategy: BehaviorStrategy;
  
  constructor(targetPosition: Position, giveUpDistance: number = 10) {
    this.targetPosition = targetPosition;
    this.giveUpDistance = giveUpDistance;
    // Lazily create the aggressive strategy only when needed
    this.aggressiveStrategy = new (require('../strategy/BehaviorStrategy').AggressiveBehavior)();
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

/**
 * Patrol state - enemy patrols around a specific area
 */
export class PatrolState implements EnemyState {
  private centerPosition: Position;
  private patrolRadius: number;
  private patrolPoints: Position[] = [];
  private currentPointIndex: number = 0;
  private stepsAtCurrentPoint: number = 0;
  private maxStepsAtPoint: number = 3;
  
  constructor(centerPosition: Position, patrolRadius: number = 5) {
    this.centerPosition = centerPosition;
    this.patrolRadius = patrolRadius;
    this.generatePatrolPoints();
  }
  
  private generatePatrolPoints(): void {
    // Generate some patrol points around the center position
    const { x, y } = this.centerPosition;
    this.patrolPoints = [
      { x: x + this.patrolRadius, y },
      { x, y: y + this.patrolRadius },
      { x: x - this.patrolRadius, y },
      { x, y: y - this.patrolRadius }
    ];
    
    // Randomize the starting point
    this.currentPointIndex = Math.floor(Math.random() * this.patrolPoints.length);
  }
  
  getNextPosition(entity: Entity, _: Entity, gameField: GameField, __: BehaviorStrategy): Position {
    // Check if we need to move to the next patrol point
    this.stepsAtCurrentPoint++;
    if (this.stepsAtCurrentPoint >= this.maxStepsAtPoint) {
      this.currentPointIndex = (this.currentPointIndex + 1) % this.patrolPoints.length;
      this.stepsAtCurrentPoint = 0;
    }
    
    // Get the current patrol target
    const targetPosition = this.patrolPoints[this.currentPointIndex];
    
    // If the entity is at the target, stay there for a few turns
    if (entity.position.x === targetPosition.x && entity.position.y === targetPosition.y) {
      return { ...entity.position };
    }
    
    // Move towards the current patrol point
    const dx = Math.sign(targetPosition.x - entity.position.x);
    const dy = Math.sign(targetPosition.y - entity.position.y);
    
    // Try to move in x or y direction
    if (dx !== 0) {
      const newX = entity.position.x + dx;
      if (this.isValidMove(newX, entity.position.y, gameField)) {
        return { x: newX, y: entity.position.y };
      }
    }
    
    if (dy !== 0) {
      const newY = entity.position.y + dy;
      if (this.isValidMove(entity.position.x, newY, gameField)) {
        return { x: entity.position.x, y: newY };
      }
    }
    
    // If we can't move towards the target, stay in place
    return { ...entity.position };
  }
  
  private isValidMove(x: number, y: number, gameField: GameField): boolean {
    // Check map boundaries
    if (x < 0 || y < 0 || x >= gameField.width || y >= gameField.height) {
      return false;
    }
    
    // Check if tile is walkable and has no entity
    const tile = gameField.tiles[y][x];
    return tile.type !== 'WALL' && tile.entity === null;
  }
  
  shouldTransition(entity: Entity): EnemyState | null {
    // Check if health drops below threshold, switch to panic
    const healthRatio = entity.stats.health / entity.stats.maxHealth;
    if (healthRatio <= 0.3) {
      return new PanicState();
    }
    
    return null;
  }
  
  getName(): string {
    return 'Patrol';
  }
}
