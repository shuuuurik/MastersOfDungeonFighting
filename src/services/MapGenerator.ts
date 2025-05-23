import { GameMap, Position, Tile, TileType } from '../types/game';
import PerlinNoise2D from './PerlinNoise';

export class MapGenerator {
  generateMap(width: number, height: number): GameMap {
    const tiles: Tile[][] = [];
    const perlin = new PerlinNoise2D(42);
    const noiseScale = 0.25; // Adjust this value to change the noise scale
    // Initialize with floor tiles and walls at the borders
    for (let y = 0; y < height; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < width; x++) {
        const position: Position = { x, y };

        const noiseValue = perlin.noise(x * noiseScale, y * noiseScale)*0.5 + 0.5;


        let tileType: TileType;
        
        // Use noise to determine tile type
        if (noiseValue < 0.25) {
          tileType = TileType.RIVER;
        } else if (noiseValue < 0.4) {
          tileType = TileType.BEACH;
        } else if (noiseValue < 0.6) {
          tileType = TileType.FIELD;
        } else if (noiseValue < 0.75) {
          tileType = TileType.FOREST;
        } else {
          tileType = TileType.MOUNTAIN;
        }

        // Add walls around the map border
        if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
          tileType = TileType.WALL;
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
        if ((tile.type === TileType.FIELD 
            || tile.type === TileType.FOREST 
            || tile.type === TileType.BEACH) 
            && tile.entity === null) {
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
