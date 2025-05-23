import { GameMap, Position, Tile, TileType } from '../types/game';

export class MapGenerator {
  generateMap(width: number, height: number): GameMap {
    const tiles: Tile[][] = [];
    
    // Initialize with floor tiles and walls at the borders
    for (let y = 0; y < height; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < width; x++) {
        const position: Position = { x, y };
        let tileType: TileType = TileType.FLOOR;
        
        // Add walls around the map border
        if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
          tileType = TileType.WALL;
        }
        
        // Add some random walls (25% chance)
        if (x !== 0 && y !== 0 && x !== width - 1 && y !== height - 1) {
          if (Math.random() < 0.25) {
            tileType = TileType.WALL;
          }
        }
        
        row.push({
          type: tileType,
          position,
          entity: null
        });
      }
      tiles.push(row);
    }
    
    // Add an exit
    const exitX = Math.floor(width / 2);
    const exitY = Math.floor(height / 2);
    tiles[exitY][exitX].type = TileType.EXIT;
    
    return {
      width,
      height,
      tiles
    };
  }

  findRandomEmptyPosition(map: GameMap): Position | null {
    const candidates: Position[] = [];
    
    for (let y = 0; y < map.height; y++) {
      for (let x = 0; x < map.width; x++) {
        const tile = map.tiles[y][x];
        if (tile.type === TileType.FLOOR && tile.entity === null) {
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
}
