import { 
  GameField, 
  GameMap, 
  TileType 
} from '../types/game';
import { MapBuilder } from '../patterns/builder/MapBuilder';

export class MapService {
  private map: GameMap;
  private currentField: GameField;

  constructor(builder: MapBuilder) {
    // initialize map using builder
    this.map = builder.build();

    // set current field to the center of the map
    const centerY = Math.floor(this.map.height / 2);
    const centerX = Math.floor(this.map.width / 2);
    this.currentField = this.map.fields[centerY][centerX];
  }

  public getCurrentField(): GameField {
    return this.currentField;
  }

  public getMap(): GameMap {
    return this.map;
  }

  public isValidMoveOnField(x: number, y: number): boolean {
    const field = this.currentField;
    if (x < 0 || y < 0 || x >= field.width || y >= field.height) {
      return false;
    }
    const tile = field.tiles[y][x];
    return (
      tile.type !== TileType.WALL &&
      tile.type !== TileType.RIVER &&
      tile.type !== TileType.MOUNTAIN &&
      tile.type !== TileType.NO_WAY
    );
  }

  public isExitTile(x: number, y: number): boolean {
    const field = this.currentField;
    if (x < 0 || y < 0 || x >= field.width || y >= field.height) {
      return false;
    }
    const t = field.tiles[y][x].type;
    return (
      t === TileType.EXIT_UP ||
      t === TileType.EXIT_DOWN ||
      t === TileType.EXIT_LEFT ||
      t === TileType.EXIT_RIGHT
    );
  }

  public moveToAdjacentField(direction: 'up' | 'down' | 'left' | 'right'): void {
    const pos = this.currentField.position;
    let newY = pos.y;
    let newX = pos.x;

    switch (direction) {
      case 'up':
        newY = Math.max(0, pos.y - 1);
        break;
      case 'down':
        newY = Math.min(this.map.height - 1, pos.y + 1);
        break;
      case 'left':
        newX = Math.max(0, pos.x - 1);
        break;
      case 'right':
        newX = Math.min(this.map.width - 1, pos.x + 1);
        break;
    }

    this.currentField = this.map.fields[newY][newX];
  }

  public clearEntitiesOnCurrentField(): void {
    for (const row of this.currentField.tiles) {
      for (const tile of row) {
        tile.entity = null;
      }
    }
  }
}