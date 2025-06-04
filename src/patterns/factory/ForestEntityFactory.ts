import { v4 as uuidv4 } from 'uuid';
import { Entity, EntityType, GameStats, Position } from '../../types/game';
import { EntityFactory } from './EntityFactory';


export class ForestEntityFactory implements EntityFactory {
  createMelee(position: Position, level: number = 1): Entity {
    // Choose a random sci-fi melee entity
    const types = [
      { name: 'Boar', symbol: '🐗', baseHealth: 30, baseAttack: 7, baseDefense: 3 },
      { name: 'Bear', symbol: '🐻', baseHealth: 35, baseAttack: 9, baseDefense: 4 },
      { name: 'Wolf', symbol: '🐺', baseHealth: 25, baseAttack: 6, baseDefense: 2 }
    ];
    
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    const stats: GameStats = {
      health: randomType.baseHealth + level * 5,
      maxHealth: randomType.baseHealth + level * 5,
      attack: randomType.baseAttack + level,
      defense: randomType.baseDefense + Math.floor(level / 2),
      experience: 0,
      level,
      experienceToNextLevel: 0
    };
    
    return {
      id: uuidv4(),
      type: EntityType.ENEMY,
      position: { ...position },
      stats,
      symbol: randomType.symbol,
      name: randomType.name
    };
  }
  
  createRanged(position: Position, level: number = 1): Entity {
    // Choose a random sci-fi ranged entity
    const types = [
      { name: 'Archer', symbol: '🏹', baseHealth: 18, baseAttack: 10, baseDefense: 1 },
      { name: 'Combat Drone', symbol: '💢', baseHealth: 15, baseAttack: 8, baseDefense: 1 },
      { name: 'Sniper Bot', symbol: '🔭', baseHealth: 20, baseAttack: 12, baseDefense: 2 }
    ];
    
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    const stats: GameStats = {
      health: randomType.baseHealth + level * 4,
      maxHealth: randomType.baseHealth + level * 4,
      attack: randomType.baseAttack + level * 1.5,
      defense: randomType.baseDefense + Math.floor(level / 3),
      experience: 0,
      level,
      experienceToNextLevel: 0
    };
    
    return {
      id: uuidv4(),
      type: EntityType.ENEMY,
      position: { ...position },
      stats,
      symbol: randomType.symbol,
      name: randomType.name
    };
  }
  
  createElite(position: Position, level: number = 1): Entity {
    // Choose a random sci-fi elite entity
    const types = [
      { name: 'Polar Bear', symbol: '🐻‍❄️', baseHealth: 110, baseAttack: 16, baseDefense: 9 },
      { name: 'Giant Spider', symbol: '🕷️', baseHealth: 120, baseAttack: 14, baseDefense: 7 },
      { name: 'Giant Snake', symbol: '🐍', baseHealth: 130, baseAttack: 15, baseDefense: 8 },
    ];
    
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    const stats: GameStats = {
      health: randomType.baseHealth + level * 10,
      maxHealth: randomType.baseHealth + level * 10,
      attack: randomType.baseAttack + level * 2,
      defense: randomType.baseDefense + level,
      experience: 0,
      level,
      experienceToNextLevel: 0
    };
    
    return {
      id: uuidv4(),
      type: EntityType.ENEMY,
      position: { ...position },
      stats,
      symbol: randomType.symbol,
      name: randomType.name
    };
  }
  
  createReplicating(position: Position, level: number = 1): Entity {
    // Sci-fi replicating entity - nanobots or virus
    const types = [
      { name: 'Rat', symbol: '🐀', baseHealth: 1, baseAttack: 1, baseDefense: 0 },
      { name: 'Rabbit', symbol: '🐇', baseHealth: 5, baseAttack: 0, baseDefense: 0 },
      { name: 'Virus', symbol: '🦠', baseHealth: 3, baseAttack: 0.5, baseDefense: 0 },
    ];
    
    const randomType = types[Math.floor(Math.random() * types.length)];
    
    const stats: GameStats = {
      health: randomType.baseHealth + level * 3,
      maxHealth: randomType.baseHealth + level * 3,
      attack: randomType.baseAttack + level * 0.5,
      defense: randomType.baseDefense,
      experience: 0,
      level,
      experienceToNextLevel: 0
    };
    
    return {
      id: uuidv4(),
      type: EntityType.ENEMY,
      position: { ...position },
      stats,
      symbol: randomType.symbol,
      name: randomType.name
    };
  }
}
