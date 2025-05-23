import { v4 as uuidv4 } from 'uuid';
import { 
  Entity, EntityType, EnemyCategory, GameMap, GameStats, GameTheme, Position 
} from '../types/game';
import { 
  AggressiveBehavior, BehaviorStrategy, FearfulBehavior, PassiveBehavior 
} from '../patterns/strategy/BehaviorStrategy';
import { EntityFactory, FantasyEntityFactory, SciFiEntityFactory } from '../patterns/factory/EntityFactory';

export class EntityManager {
  private entityFactory: EntityFactory;
  
  constructor(theme: GameTheme = GameTheme.FANTASY) {
    // Create the appropriate factory based on theme
    this.entityFactory = theme === GameTheme.FANTASY 
      ? new FantasyEntityFactory() 
      : new SciFiEntityFactory();
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
      symbol: '@',
      name: 'Player'
    };
  }
  
  spawnEnemiesOfType(map: GameMap, category: EnemyCategory, count: number): Entity[] {
    const enemies: Entity[] = [];
    
    for (let i = 0; i < count; i++) {
      const position = this.findRandomEmptyPosition(map);
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
        map.tiles[position.y][position.x].entity = enemy;
        enemies.push(enemy);
      }
    }
    
    return enemies;
  }
  
  findRandomEmptyPosition(map: GameMap): Position | null {
    const candidates: Position[] = [];
    
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = map.tiles[y][x];
        if (tile.type === 'FLOOR' && tile.entity === null) {
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
