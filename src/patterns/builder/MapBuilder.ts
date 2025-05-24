import { GameField, GameMap, Position, Tile, TileType } from '../../types/game';
import { EntityFactory } from '../factory/EntityFactory';
import { MapLoader } from '../../services/MapLoader';
import PerlinNoise2D from '../../services/PerlinNoise';

/**
 * Builder for creating game maps with various configurations
 */
export class MapBuilder {
  private fieldWidth: number = 20;
  private fieldHeight: number = 15;
  private width: number = 3;
  private height: number = 3;
  // private wallDensity: number = 0.25;
  private mapFile: string | null = null;
  private entityFactory: EntityFactory | null = null;
  // private roomCount: number = 5;
  // private corridorDensity: number = 0.7;
  private randomSeed: number = 42;
  private mapLoader: MapLoader;
  
  constructor() {
    this.mapLoader = new MapLoader();
  }


  /**
   * Set the width of one field in the map
   */
  setFieldWidth(fieldWidth: number): MapBuilder {
    this.fieldWidth = fieldWidth;
    return this;
  }
  
  /**
   * Set the height of one field in the map
   */
  setFieldHeight(fieldHeight: number): MapBuilder {
    this.fieldHeight = fieldHeight;
    return this;
  }
  
  /**
   * Set the width of the map
   */
  setWidth(width: number): MapBuilder {
    this.width = width;
    return this;
  }
  
  /**
   * Set the height of the map
   */
  setHeight(height: number): MapBuilder {
    this.height = height;
    return this;
  }
  
  /**
   * Set the map file to load from
   */
  setMapFile(filepath: string): MapBuilder {
    this.mapFile = filepath;
    return this;
  }
  
  /**
   * Set the entity factory for populating the map
   */
  setEntityFactory(factory: EntityFactory): MapBuilder {
    this.entityFactory = factory;
    return this;
  }
  
  /**
   * Set a random seed for deterministic generation
   */
  setRandomSeed(seed: number): MapBuilder {
    this.randomSeed = seed;
    return this;
  }
  
  /**
   * Build the map according to the configured parameters
   */
  build(): GameMap {
    // If a map file is specified, try to load it
    // if (this.mapFile) {
    //   try {
    //     return this.mapLoader.loadMapFromFile(this.mapFile);
    //   } catch (error) {
    //     console.error("Failed to load map from file:", error);
    //     // Fall back to generated map
    //   }
    // }
    
    // Otherwise, generate a map
    return this.generateMap();
  }
  
  /**
   * Generate a procedural map with the current settings
   */
  private generateMap(): GameMap {
    const fields: GameField[][] = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const field: GameField = {
          width: this.fieldWidth,
          height: this.fieldHeight,
          tiles: this.generateTiles(x, y)
        };

        if (x === Math.floor(this.width / 2) && y === Math.floor(this.height / 2)) {
          // Center field is the main field, can be used for special purposes
          this.placeExit(field.tiles);
        }
        
        if (!fields[y]) {
          fields[y] = [];
        }
        fields[y][x] = field;
        console.log(`Generated field at (${x}, ${y}) with size ${this.fieldWidth}x${this.fieldHeight}`);
      }
    }
    
    const map: GameMap = {
      width: this.width,
      height: this.height,
      fields: fields,
    };
    
    return map;
  }


  /**
   * Generate tiles for a specific field position
   */
  private generateTiles(fieldX: number, fieldY: number): Tile[][] {
    const tiles: Tile[][] = [];
    
    // Initialize with floor tiles
    const perlin = new PerlinNoise2D(42);
    const scaleNoise = 0.25;
    for (let y = 0; y < this.fieldHeight; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < this.fieldWidth; x++) {
        const position: Position = { x, y };
        let tileType: TileType;
        
        const noise = perlin.noise(
          x * scaleNoise + (fieldX * this.fieldWidth), 
          y * scaleNoise + (fieldY * this.fieldHeight)
        ) * 0.5 + 0.5; 

        if (noise < 0.25) {
          tileType = TileType.RIVER;
        } else if (noise < 0.4) {
          tileType = TileType.BEACH;
        } else if (noise < 0.6) {
          tileType = TileType.FIELD;
        } else if (noise < 0.8) {
          tileType = TileType.FOREST;
        } else {
          tileType = TileType.MOUNTAIN;
        }

        // Add walls around the map border
        if (x === 0) {
          tileType = TileType.EXIT_LEFT;
        }
        if (x === this.fieldWidth - 1) {
          tileType = TileType.EXIT_RIGHT;
        }
        
        if (y === 0) {
          tileType = TileType.EXIT_UP;
          if (x === 0) {
            tileType = TileType.WALL; // Top-left corner
          }
          if (x === this.fieldWidth - 1) {
            tileType = TileType.WALL; // Top-right corner
          }
        }
        
        if (y === this.fieldHeight - 1) {
          tileType = TileType.EXIT_DOWN;
          if (x === 0) {
            tileType = TileType.WALL; // Bottom-left corner
          }
          if (x === this.fieldWidth - 1) {
            tileType = TileType.WALL; // Bottom-right corner
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

    return tiles;
  }
  
  /**
   * Place an exit in the map
   */
  private placeExit(tiles: Tile[][]): void {
    // Try to place the exit in the last room or in a random walkable location
    let exitPlaced = false;
    let attempts = 0;
    
    while (!exitPlaced && attempts < 100) {
      const x = Math.floor(Math.random() * (this.width - 2)) + 1;
      const y = Math.floor(Math.random() * (this.height - 2)) + 1;
      
      if (tiles[y][x].type === TileType.FIELD) {
        tiles[y][x].type = TileType.EXIT;
        exitPlaced = true;
      }
      
      attempts++;
    }
    
    // Fallback if no exit was placed
    if (!exitPlaced) {
      const centerX = Math.floor(this.width / 2);
      const centerY = Math.floor(this.height / 2);
      tiles[centerY][centerX].type = TileType.EXIT;
    }
  }
}
