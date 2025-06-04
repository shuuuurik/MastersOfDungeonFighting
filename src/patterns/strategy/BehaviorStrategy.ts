import { Entity, GameField, Position, TileType } from '../../types/game';

export abstract class BehaviorStrategy {
  abstract execute(entity: Entity, player: Entity, gameField: GameField): Position;

  public static isValidMove(x: number, y: number, gameField: GameField): boolean {
    // Check map boundaries
    if (x < 0 || y < 0 || x >= gameField.width || y >= gameField.height) {
      return false;
    }
    
    // Check if tile is walkable (not a wall) and has no entity
    const tile = gameField.tiles[y][x];
    return tile.type !== TileType.MOUNTAIN 
          && tile.type !== TileType.RIVER 
          && tile.type !== TileType.WALL
          && tile.type !== TileType.EXIT_UP
          && tile.type !== TileType.EXIT_RIGHT
          && tile.type !== TileType.EXIT_DOWN
          && tile.type !== TileType.EXIT_LEFT
          && tile.type !== TileType.NO_WAY
          && tile.entity === null;
  }
}
