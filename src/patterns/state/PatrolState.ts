import { Entity, GameField, Position } from '../../types/game';
import { EnemyState } from './EnemyState';
import { PanicState } from './PanicState';
import { NormalState } from './NormalState';
import { BehaviorStrategy } from '../strategy/BehaviorStrategy';


export class PatrolState implements EnemyState {
  private centerPosition: Position;
  private patrolRadius: number;
  private patrolPoints: Position[] = [];
  private validPatrolPoints: Position[] = [];
  private currentPointIndex: number = 0;
  private stepsAtCurrentPoint: number = 0;
  private maxStepsAtPoint: number = 3;
  private patrolDuration: number;
  private currentPatrolTime: number = 0;
  
  private lastKnownHealth: number;
  
  constructor(centerPosition: Position, patrolRadius: number = 5, patrolDuration: number = 15) {
    this.centerPosition = centerPosition;
    this.patrolRadius = patrolRadius;
    this.patrolDuration = patrolDuration;
    this.lastKnownHealth = 0;
  }
  
  getNextPosition(entity: Entity, _: Entity, gameField: GameField, originalStrategy: BehaviorStrategy): Position {
    if (this.lastKnownHealth === 0) {
      this.lastKnownHealth = entity.stats.health;
    }
    
    // Increment patrol time
    this.currentPatrolTime++;
    
    // Generate patrol points if we haven't done it yet
    // This allows us to access the gameField when generating points
    if (this.patrolPoints.length === 0) {
      this.generatePatrolPoints(gameField);
      
      // If still no valid patrol points, just use the original strategy
      if (this.validPatrolPoints.length === 0) {
        return originalStrategy.execute(entity, _, gameField);
      }
      
      // Start with a random patrol point
      this.currentPointIndex = Math.floor(Math.random() * this.validPatrolPoints.length);
    }
    
    // Get the current patrol target
    const targetPosition = this.validPatrolPoints[this.currentPointIndex];
    
    // If the entity is at the target, move to the next point
    if (entity.position.x === targetPosition.x && entity.position.y === targetPosition.y) {
      this.stepsAtCurrentPoint++;
      if (this.stepsAtCurrentPoint >= this.maxStepsAtPoint) {
        // Move to the next patrol point
        this.currentPointIndex = (this.currentPointIndex + 1) % this.validPatrolPoints.length;
        this.stepsAtCurrentPoint = 0;
      }
      return { ...entity.position };
    }
    
    // Move towards the current patrol point
    const dx = Math.sign(targetPosition.x - entity.position.x);
    const dy = Math.sign(targetPosition.y - entity.position.y);
    
    // Try to move in the direction with the larger distance
    if (Math.abs(targetPosition.x - entity.position.x) > Math.abs(targetPosition.y - entity.position.y)) {
      // Try X first, then Y
      if (dx !== 0) {
        const newX = entity.position.x + dx;
        if (BehaviorStrategy.isValidMove(newX, entity.position.y, gameField)) {
          return { x: newX, y: entity.position.y };
        }
      }
      
      if (dy !== 0) {
        const newY = entity.position.y + dy;
        if (BehaviorStrategy.isValidMove(entity.position.x, newY, gameField)) {
          return { x: entity.position.x, y: newY };
        }
      }
    } else {
      // Try Y first, then X
      if (dy !== 0) {
        const newY = entity.position.y + dy;
        if (BehaviorStrategy.isValidMove(entity.position.x, newY, gameField)) {
          return { x: entity.position.x, y: newY };
        }
      }
      
      if (dx !== 0) {
        const newX = entity.position.x + dx;
        if (BehaviorStrategy.isValidMove(newX, entity.position.y, gameField)) {
          return { x: newX, y: entity.position.y };
        }
      }
    }
    
    // If we can't move, try a different patrol point
    this.currentPointIndex = (this.currentPointIndex + 1) % this.validPatrolPoints.length;
    return { ...entity.position };
  }
  
  private generatePatrolPoints(gameField: GameField): void {
    this.patrolPoints = [];
    
    // Add points in a grid pattern around the center
    for (let y = -this.patrolRadius; y <= this.patrolRadius; y++) {
      for (let x = -this.patrolRadius; x <= this.patrolRadius; x++) {
        // Only include points within the circular radius
        if (x*x + y*y <= this.patrolRadius*this.patrolRadius) {
          const point = {
            x: this.centerPosition.x + x,
            y: this.centerPosition.y + y
          };
          this.patrolPoints.push(point);
        }
      }
    }
    
    // Filter only valid points
    this.validPatrolPoints = this.patrolPoints.filter(point => 
      point.x >= 0 && point.y >= 0 && 
      point.x < gameField.width && point.y < gameField.height &&
      BehaviorStrategy.isValidMove(point.x, point.y, gameField)
    );
    
    // If we have the center position as a valid point, make sure it's first
    const centerIndex = this.validPatrolPoints.findIndex(p => 
      p.x === this.centerPosition.x && p.y === this.centerPosition.y
    );
    
    if (centerIndex !== -1) {
      const centerPoint = this.validPatrolPoints[centerIndex];
      this.validPatrolPoints.splice(centerIndex, 1);
      this.validPatrolPoints.unshift(centerPoint);
    }
  }
  
  shouldTransition(entity: Entity): EnemyState | null {
    // Check if enemy has been damaged - transition to normal state for combat response
    if (this.lastKnownHealth > 0 && entity.stats.health < this.lastKnownHealth) {
      return new NormalState();
    }
    
    // Update the last known health
    this.lastKnownHealth = entity.stats.health;
    
    // Check if health drops below threshold, switch to panic
    const healthRatio = entity.stats.health / entity.stats.maxHealth;
    if (healthRatio <= 0.3) {
      return new PanicState();
    }
    
    // Check if patrol duration is over, go back to normal state
    if (this.currentPatrolTime >= this.patrolDuration) {
      return new NormalState();
    }
    
    return null;
  }
  
  getName(): string {
    return 'Patrol';
  }
}
