import { v4 as uuidv4 } from 'uuid';
import { Entity, GameField, Position, TileType } from '../../types/game';
import { EntityPrototype } from './EntityPrototype';


export class ReplicatingEntity implements EntityPrototype {
  private entity: Entity;
  private replicationChance: number;
  private replicationCount: number;
  
  constructor(entity: Entity, replicationChance: number = 0.2, replicationCount: number = 10) {
    this.entity = entity;
    this.replicationChance = replicationChance;
    this.replicationCount = replicationCount;
  }
  
  clone(): Entity {
    return {
      ...this.entity,
      id: uuidv4(),
      position: { ...this.entity.position }
    };
  }
  
  tryReplicate(gameField: GameField): Entity | null {
    // Check if replication should occur
    if (Math.random() > this.replicationChance || this.replicationCount <= 0) {
      return null;
    }
    
    // Find a valid adjacent cell for replication
    const adjacentPositions = this.getAdjacentPositions(this.entity.position);
    const validPositions = adjacentPositions.filter(pos => this.isValidPosition(pos, gameField));
    
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
  
  private getAdjacentPositions(position: Position): Position[] {
    const { x, y } = position;
    return [
      { x: x+1, y },
      { x: x-1, y },
      { x, y: y+1 },
      { x, y: y-1 }
    ];
  }
  
  private isValidPosition(position: Position, gameField: GameField): boolean {
    const { x, y } = position;
    
    // Check if position is within map bounds
    if (x < 0 || y < 0 || x >= gameField.width || y >= gameField.height) {
      return false;
    }
    
    const tile = gameField.tiles[y][x];
    return tile.type !== TileType.MOUNTAIN 
      && tile.type !== TileType.RIVER 
      && tile.type !== TileType.WALL
      && tile.type !== TileType.EXIT_UP
      && tile.type !== TileType.EXIT_RIGHT
      && tile.type !== TileType.EXIT_DOWN
      && tile.type !== TileType.EXIT_LEFT
      && tile.entity === null;
  }
  
  getEntity(): Entity {
    return this.entity;
  }
 
  getReplicationChance(): number {
    return this.replicationChance;
  }
  
  getReplicationCount(): number {
    return this.replicationCount;
  }

  setReplicationChance(chance: number): void {
    this.replicationChance = Math.max(0, Math.min(1, chance));
  }
}
