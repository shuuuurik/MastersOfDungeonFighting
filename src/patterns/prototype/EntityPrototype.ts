import { v4 as uuidv4 } from 'uuid';
import { Entity, GameMap, Position } from '../../types/game';

/**
 * Interface for objects that can clone themselves
 */
export interface EntityPrototype {
  clone(): Entity;
  tryReplicate(gameMap: GameMap): Entity | null;
}

/**
 * Extension of Entity to support cloning (self-replication)
 */
export class ReplicatingEntity implements EntityPrototype {
  private entity: Entity;
  private replicationChance: number;
  
  constructor(entity: Entity, replicationChance: number = 0.2) {
    this.entity = entity;
    this.replicationChance = replicationChance;
  }
  
  /**
   * Create a clone of this entity
   */
  clone(): Entity {
    return {
      ...this.entity,
      id: uuidv4(), // Generate a new ID for the clone
      position: { ...this.entity.position } // Deep copy the position
    };
  }
  
  /**
   * Attempt to replicate in a random adjacent cell
   * @returns A new entity if replication was successful, null otherwise
   */
  tryReplicate(gameMap: GameMap): Entity | null {
    // Check if replication should occur
    if (Math.random() > this.replicationChance) {
      return null;
    }
    
    // Find a valid adjacent cell for replication
    const adjacentPositions = this.getAdjacentPositions(this.entity.position);
    const validPositions = adjacentPositions.filter(pos => this.isValidPosition(pos, gameMap));
    
    if (validPositions.length === 0) {
      return null; // No valid positions to replicate to
    }
    
    // Choose a random valid position
    const randomIndex = Math.floor(Math.random() * validPositions.length);
    const newPosition = validPositions[randomIndex];
    
    // Create a clone and update its position
    const clone = this.clone();
    clone.position = newPosition;
    
    // Clone has slightly weaker stats
    clone.stats = {
      ...clone.stats,
      health: Math.floor(clone.stats.health * 0.8),
      maxHealth: Math.floor(clone.stats.maxHealth * 0.8),
      attack: Math.floor(clone.stats.attack * 0.9),
      defense: Math.floor(clone.stats.defense * 0.9)
    };
    
    return clone;
  }
  
  /**
   * Get all adjacent positions
   */
  private getAdjacentPositions(position: Position): Position[] {
    const { x, y } = position;
    return [
      { x: x+1, y },
      { x: x-1, y },
      { x, y: y+1 },
      { x, y: y-1 }
    ];
  }
  
  /**
   * Check if a position is valid for replication
   */
  private isValidPosition(position: Position, gameMap: GameMap): boolean {
    const { x, y } = position;
    
    // Check if position is within map bounds
    if (x < 0 || y < 0 || x >= gameMap.width || y >= gameMap.height) {
      return false;
    }
    
    // Check if position is walkable and empty
    const tile = gameMap.tiles[y][x];
    return tile.type !== 'WALL' && tile.entity === null;
  }
  
  /**
   * Get the underlying entity
   */
  getEntity(): Entity {
    return this.entity;
  }
  
  /**
   * Get the replication chance
   */
  getReplicationChance(): number {
    return this.replicationChance;
  }
  
  /**
   * Set the replication chance
   */
  setReplicationChance(chance: number): void {
    this.replicationChance = Math.max(0, Math.min(1, chance));
  }
}
