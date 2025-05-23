import { v4 as uuidv4 } from 'uuid';
import { Entity, EntityType, GameMap, GameStats, Position } from '../types/game';
import { AggressiveBehavior, BehaviorStrategy, FearfulBehavior, PassiveBehavior } from '../patterns/strategy/BehaviorStrategy';
import { MapGenerator } from './MapGenerator';

export class EntityManager {
  private mapGenerator: MapGenerator;
  
  constructor() {
    this.mapGenerator = new MapGenerator();
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
  
  createEnemy(position: Position, level: number = 1): Entity {
    // Scale enemy stats based on level
    const enemyStats: GameStats = {
      health: 30 + level * 5,
      maxHealth: 30 + level * 5,
      attack: 5 + level,
      defense: 2 + Math.floor(level / 2),
      experience: 0,
      level,
      experienceToNextLevel: 0
    };
    
    const enemyTypes = [
      { name: 'Goblin', symbol: 'g' },
      { name: 'Orc', symbol: 'o' },
      { name: 'Skeleton', symbol: 's' },
      { name: 'Zombie', symbol: 'z' },
      { name: 'Troll', symbol: 'T' }
    ];
    
    const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    
    return {
      id: uuidv4(),
      type: EntityType.ENEMY,
      position,
      stats: enemyStats,
      symbol: randomType.symbol,
      name: randomType.name
    };
  }
  
  spawnEnemies(map: GameMap, count: number): Entity[] {
    const enemies: Entity[] = [];
    
    for (let i = 0; i < count; i++) {
      const position = this.mapGenerator.findRandomEmptyPosition(map);
      if (position) {
        const enemy = this.createEnemy(position);
        map.tiles[position.y][position.x].entity = enemy;
        enemies.push(enemy);
      }
    }
    
    return enemies;
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
}
