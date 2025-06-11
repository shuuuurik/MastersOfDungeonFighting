import { Entity, GameField, Position, TileType } from '../../types/game';
import { EnemyState } from './EnemyState';
import { PanicState } from './PanicState';
import { NormalState } from './NormalState';
import { BehaviorStrategy } from '../strategy/BehaviorStrategy';


export class PatrolState implements EnemyState {
  private centerPosition: Position;
  private patrolRadius: number;
  private patrolPoints: Position[] = [];
  private currentPointIndex: number = 0;
  private stepsAtCurrentPoint: number = 0;
  private maxStepsAtPoint: number = 3;
  private patrolDuration: number;
  private currentPatrolTime: number = 0;
  
  constructor(centerPosition: Position, patrolRadius: number = 5, patrolDuration: number = 15) {
    this.centerPosition = centerPosition;
    this.patrolRadius = patrolRadius;
    this.patrolDuration = patrolDuration;
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
    // Increment patrol time
    this.currentPatrolTime++;
    
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
    return tile.type !== TileType.WALL && tile.entity === null;
  }
  
  shouldTransition(entity: Entity): EnemyState | null {
    // Check if health drops below threshold, switch to panic
    const healthRatio = entity.stats.health / entity.stats.maxHealth;
    if (healthRatio <= 0.3) {
      return new PanicState();
    }
    
    // Check if patrol duration is over, go back to normal state
    if (this.currentPatrolTime >= this.patrolDuration) {
      console.log(`${entity.name} finished patrolling and returned to normal state`);
      return new NormalState();
    }
    
    return null;
  }
  
  getName(): string {
    return 'Patrol';
  }
}
