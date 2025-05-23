export enum TileType {
  FLOOR = 'FLOOR',
  WALL = 'WALL',
  EXIT = 'EXIT',
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

export interface Entity {
  id: string;
  type: EntityType;
  position: Position;
  stats: GameStats;
  symbol: string;
  name: string;
}

export interface Tile {
  type: TileType;
  position: Position;
  entity: Entity | null;
}

export interface GameMap {
  width: number;
  height: number;
  tiles: Tile[][];
}

export interface GameState {
  map: GameMap;
  player: Entity;
  enemies: Entity[];
  gameOver: boolean;
  victory: boolean;
  turn: number;
}
