export enum TileType {
  WALL = 'WALL',
  RIVER = 'RIVER',
  MOUNTAIN = 'MOUNTAIN',
  FOREST = 'FOREST',
  FIELD = 'FIELD',
  BEACH = 'BEACH',
  EXIT_UP = 'EXIT_UP',
  EXIT_DOWN = 'EXIT_DOWN',
  EXIT_RIGHT = 'EXIT_RIGHT',
  EXIT_LEFT = 'EXIT_LEFT',
}

export interface Position {
  x: number;
  y: number;
}

export interface GameStats {
  health: number;
  maxHealth: number;
  attack: number;
  defense: number;
  experience: number;
  level: number;
  experienceToNextLevel: number;
}

export enum EntityType {
  PLAYER = 'PLAYER',
  ENEMY = 'ENEMY',
  ITEM = 'ITEM',
}

export enum EnemyCategory {
  MELEE = 'MELEE',
  RANGED = 'RANGED',
  ELITE = 'ELITE',
  REPLICATING = 'REPLICATING'
}

export interface Entity {
  id: string;
  type: EntityType;
  position: Position;
  stats: GameStats;
  symbol: string;
  name: string;
  category?: EnemyCategory; // Optional category for enemies
  confused?: boolean; // Flag to indicate confused state
  confusionTurns?: number; // Number of turns confusion remains
  canReplicate?: boolean; // Flag for replicating entities
  replicationChance?: number; // Chance of replication per turn
}

export interface Tile {
  type: TileType;
  position: Position;
  entity: Entity | null;
}

export interface GameField {
  width: number;
  height: number;
  position: Position; // Position of the field in the overall map
  tiles: Tile[][];
}

export interface GameMap {
  width: number;
  height: number;
  fields: GameField[][];
}

export enum GameTheme {
  FANTASY = 'FANTASY',
  SCIFI = 'SCIFI',
}

export interface GameState {
  map: GameMap;
  currentField: GameField;
  player: Entity;
  enemies: Entity[];
  gameOver: boolean;
  victory: boolean;
  turn: number;
  theme: GameTheme;
  replicatingEntities: string[]; // IDs of entities that can replicate
}
