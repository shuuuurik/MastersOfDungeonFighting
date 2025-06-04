import { v4 as uuidv4 } from 'uuid';
import { 
  Entity, EntityType, EnemyCategory, GameStats, GameTheme, Position, 
  GameField,
  TileType,
  Tile
} from '../types/game';
import { BehaviorStrategy } from '../patterns/strategy/BehaviorStrategy';
import { AggressiveBehavior } from '../patterns/strategy/AggressiveBehavior';
import { PassiveBehavior } from '../patterns/strategy/PassiveBehavior';
import { FearfulBehavior } from '../patterns/strategy/FearfulBehavior';
import { EntityFactory } from '../patterns/factory/EntityFactory';
import { FantasyEntityFactory } from '../patterns/factory/FantasyEntityFactory';
import { ForestEntityFactory } from '../patterns/factory/ForestEntityFactory';

export class EntityManager {
  private entityFactory: EntityFactory;
  
  constructor(theme: GameTheme = GameTheme.FANTASY) {
    // Create the appropriate factory based on theme
    this.entityFactory = theme === GameTheme.FANTASY 
      ? new FantasyEntityFactory() 
      : new ForestEntityFactory();
  }
  
  createPlayer(position: Position): Entity {
    const playerStats: GameStats = {
      health: 100,
      maxHealth: 100,
      attack: 10,
      defense: 5,
      experience: 0,
      level: 1,
      experienceToNextLevel: 20
    };
    
    return {
      id: uuidv4(),
      type: EntityType.PLAYER,
      position,
      stats: playerStats,
      symbol: '🤡',
      name: 'Player'
    };
  }
  
  spawnEnemiesOfType(field: GameField, category: EnemyCategory, count: number): Entity[] {
    const enemies: Entity[] = [];
    
    for (let i = 0; i < count; i++) {
      const position = this.findRandomEmptyPosition(field);
      if (position) {
        // Create enemy using factory based on category
        let enemy: Entity;
        switch (category) {
          case EnemyCategory.MELEE:
            enemy = this.entityFactory.createMelee(position);
            break;
          case EnemyCategory.RANGED:
            enemy = this.entityFactory.createRanged(position);
            break;
          case EnemyCategory.ELITE:
            enemy = this.entityFactory.createElite(position);
            break;
          case EnemyCategory.REPLICATING:
            enemy = this.entityFactory.createReplicating(position);
            // Add replication properties
            enemy.canReplicate = true;
            enemy.replicationChance = 0.2;
            break;
        }
        
        // Add category to the entity
        enemy.category = category;
        
        // Place on map and add to array
        field.tiles[position.y][position.x].entity = enemy;
        enemies.push(enemy);
      }
    }
    
    return enemies;
  }
  
  findRandomEmptyPosition(field: GameField): Position | null {
    const candidates: Position[] = [];
    
    for (let y = 0; y < field.height; y++) {
      for (let x = 0; x < field.width; x++) {
        const tile: Tile | undefined = field.tiles[y] ? field.tiles[y][x] : undefined;
        if (tile && ( (tile.type === TileType.FOREST || tile.type === TileType.FIELD || tile.type === TileType.BEACH) && tile.entity === null)) {
          candidates.push({ x, y });
        }
      }
    }
    
    if (candidates.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }
  
  getBehaviorForEnemy(): BehaviorStrategy {
    const behaviors = [
      new AggressiveBehavior(),
      new PassiveBehavior(),
      new FearfulBehavior()
    ];
    
    const randomIndex = Math.floor(Math.random() * behaviors.length);
    return behaviors[randomIndex];
  }
  
  getEntityFactory(): EntityFactory {
    return this.entityFactory;
  }
}
