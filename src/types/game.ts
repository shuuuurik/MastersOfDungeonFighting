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
  NO_WAY = 'NO_WAY',
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

export interface BaseEntity {
  id: string;
  position: Position;
  stats: GameStats;
  symbol: string;
  name: string;
  category?: EnemyCategory;
  confused?: boolean;
  confusionTurns?: number;
  canReplicate?: boolean;
  replicationChance?: number;
  replicationCount?: number;
}

export interface EnemyEntity extends BaseEntity {
  type: EntityType.ENEMY;
  category?: EnemyCategory;
  experience: number; // Обязательное поле для врагов
}

export interface OtherEntity extends BaseEntity {
  type: Exclude<EntityType, EntityType.ENEMY>;
}

export type Entity = EnemyEntity | OtherEntity;

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
  FOREST = 'FOREST',
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
