import { v4 as uuidv4 } from 'uuid';
import { Entity, EntityType, GameStats, Position } from '../../types/game';
import { EntityFactory } from './EntityFactory';

/**
 * Factory for creating fantasy-themed entities
 */
export class FantasyEntityFactory implements EntityFactory {
  createMelee(position: Position, level: number = 1): Entity {
    // Choose a random fantasy melee entity
    const types = [
      { name: 'Goblin Warrior', symbol: '👺', baseHealth: 25, baseAttack: 6, baseDefense: 2, experience: 10 },
      { name: 'Skeleton Warrior', symbol: '💀', baseHealth: 20, baseAttack: 7, baseDefense: 1, experience: 10 },
      { name: 'Orc Brute', symbol: '👹', baseHealth: 30, baseAttack: 8, baseDefense: 3, experience: 10 },
      { name: 'Troll', symbol: '🧌', baseHealth: 40, baseAttack: 10, baseDefense: 4, experience: 10 }
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
      name: randomType.name,
      experience: randomType.experience
    };
  }
  
  createRanged(position: Position, level: number = 1): Entity {
    // Choose a random fantasy ranged entity
    const types = [
      { name: 'Goblin Archer', symbol: '🏹', baseHealth: 15, baseAttack: 8, baseDefense: 1, experience: 15 },
      { name: 'Elf Scout', symbol: '🧝', baseHealth: 20, baseAttack: 9, baseDefense: 2, experience: 15 },
      { name: 'Dark Mage', symbol: '🧙', baseHealth: 18, baseAttack: 10, baseDefense: 1, experience: 15 },
      { name: 'Orc Shaman', symbol: '🧙‍♂️', baseHealth: 22, baseAttack: 11, baseDefense: 2, experience: 15 }
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
      name: randomType.name,
      experience: randomType.experience,
    };
  }
  
  createElite(position: Position, level: number = 1): Entity {
    // Choose a random fantasy elite entity
    const types = [
      { name: 'Dragon', symbol: '🐉', baseHealth: 100, baseAttack: 15, baseDefense: 8, experience: 20 },
      { name: 'Ogre King', symbol: '👑', baseHealth: 120, baseAttack: 12, baseDefense: 6, experience: 20 },
      { name: 'Giant Spider', symbol: '🕷️', baseHealth: 80, baseAttack: 10, baseDefense: 5, experience: 20 },
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
      name: randomType.name,
      experience: randomType.experience,
    };
  }
  
  createReplicating(position: Position, level: number = 1): Entity {
    // Fantasy replicating entity - slimes or fungi
    const types = [
      { name: 'Slime', symbol: '🟢', baseHealth: 15, baseAttack: 3, baseDefense: 1, experience: 5 },
      { name: 'Fungal Spore', symbol: '🍄', baseHealth: 10, baseAttack: 2, baseDefense: 0, experience: 5 },
      { name: 'Rat', symbol: '🐀', baseHealth: 5, baseAttack: 1, baseDefense: 0, experience: 5 }
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
      name: randomType.name,
      experience: randomType.experience
    };
  }
}
