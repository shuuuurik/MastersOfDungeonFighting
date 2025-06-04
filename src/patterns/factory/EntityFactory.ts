import { Entity, Position } from '../../types/game';

/**
 * Abstract Factory interface for creating entities
 */
export interface EntityFactory {
  createMelee(position: Position, level?: number): Entity;
  createRanged(position: Position, level?: number): Entity;
  createElite(position: Position, level?: number): Entity;
  createReplicating(position: Position, level?: number): Entity;
}
