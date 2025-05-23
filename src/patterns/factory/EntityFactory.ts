import { v4 as uuidv4 } from 'uuid';
import { Entity, EntityType, GameStats, Position } from '../../types/game';

/**
 * Abstract Factory interface for creating entities
 */
export interface EntityFactory {
  createMelee(position: Position, level?: number): Entity;
  createRanged(position: Position, level?: number): Entity;
  createElite(position: Position, level?: number): Entity;
  createReplicating(position: Position, level?: number): Entity;
}

/**
 * Factory for creating fantasy-themed entities
 */
export class FantasyEntityFactory implements EntityFactory {
  createMelee(position: Position, level: number = 1): Entity {
    // Choose a random fantasy melee entity
    const types = [
      { name: 'Goblin Warrior', symbol: 'g', baseHealth: 25, baseAttack: 6, baseDefense: 2 },
      { name: 'Orc Brute', symbol: 'o', baseHealth: 35, baseAttack: 8, baseDefense: 3 },
      { name: 'Skeleton Warrior', symbol: 's', baseHealth: 20, baseAttack: 7, baseDefense: 1 }
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
    // Choose a random fantasy ranged entity
    const types = [
      { name: 'Goblin Archer', symbol: 'a', baseHealth: 15, baseAttack: 8, baseDefense: 1 },
      { name: 'Elf Scout', symbol: 'e', baseHealth: 20, baseAttack: 9, baseDefense: 2 },
      { name: 'Skeleton Archer', symbol: 'b', baseHealth: 18, baseAttack: 7, baseDefense: 1 }
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
    // Choose a random fantasy elite entity
    const types = [
      { name: 'Dragon', symbol: 'D', baseHealth: 100, baseAttack: 15, baseDefense: 8 },
      { name: 'Lich', symbol: 'L', baseHealth: 80, baseAttack: 18, baseDefense: 5 },
      { name: 'Ogre King', symbol: 'K', baseHealth: 120, baseAttack: 12, baseDefense: 6 }
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
    // Fantasy replicating entity - slimes or fungi
    const types = [
      { name: 'Slime', symbol: 'm', baseHealth: 15, baseAttack: 3, baseDefense: 1 },
      { name: 'Fungal Growth', symbol: 'f', baseHealth: 12, baseAttack: 2, baseDefense: 0 }
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

/**
 * Factory for creating sci-fi themed entities
 */
export class SciFiEntityFactory implements EntityFactory {
  createMelee(position: Position, level: number = 1): Entity {
    // Choose a random sci-fi melee entity
    const types = [
      { name: 'Security Bot', symbol: 'b', baseHealth: 30, baseAttack: 7, baseDefense: 3 },
      { name: 'Cyborg Soldier', symbol: 'c', baseHealth: 35, baseAttack: 9, baseDefense: 4 },
      { name: 'Mutant', symbol: 'm', baseHealth: 28, baseAttack: 10, baseDefense: 2 }
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
      { name: 'Sniper Droid', symbol: 's', baseHealth: 18, baseAttack: 10, baseDefense: 1 },
      { name: 'Laser Turret', symbol: 't', baseHealth: 25, baseAttack: 12, baseDefense: 3 },
      { name: 'Combat Drone', symbol: 'd', baseHealth: 15, baseAttack: 8, baseDefense: 1 }
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
      { name: 'Mech Commander', symbol: 'M', baseHealth: 110, baseAttack: 16, baseDefense: 9 },
      { name: 'AI Core', symbol: 'A', baseHealth: 80, baseAttack: 20, baseDefense: 5 },
      { name: 'Cybernetic Beast', symbol: 'C', baseHealth: 130, baseAttack: 13, baseDefense: 7 }
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
      { name: 'Nanite Swarm', symbol: 'n', baseHealth: 14, baseAttack: 4, baseDefense: 1 },
      { name: 'Bio-Virus', symbol: 'v', baseHealth: 10, baseAttack: 3, baseDefense: 0 }
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
