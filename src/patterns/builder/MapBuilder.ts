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
    const perlin = new PerlinNoise2D(42);
    const biomeNoise = new PerlinNoise2D(1337);
    const fields: GameField[][] = [];

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const field: GameField = {
          width: this.fieldWidth,
          height: this.fieldHeight,
          position: { x, y },
          tiles: this.generateTiles(x, y, perlin, biomeNoise)
        };
        
        if (!fields[y]) {
          fields[y] = [];
        }
        fields[y][x] = field;
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
  private generateTiles(fieldX: number, fieldY: number, perlin: PerlinNoise2D, biomeNoise: PerlinNoise2D): Tile[][] {
    const tiles: Tile[][] = [];
    const scaleNoise = 0.2; // более плавный ландшафт
    const effectiveWidth = this.fieldWidth - 2;
    const effectiveHeight = this.fieldHeight - 2;

    const generateTileType = (effectiveX: number, effectiveY: number, fX: number, fY: number): TileType => { 
      const globalX = effectiveX + fX * effectiveWidth;
      const globalY = effectiveY + fY * effectiveHeight;

      const heightVal = perlin.octaveNoise(globalX * scaleNoise, globalY * scaleNoise, 10, 0.2);
      const biomeVal = biomeNoise.noise(globalX * scaleNoise, globalY * scaleNoise);

      let noise = heightVal * 0.5 + 0.5;
      let noiseBiome = biomeVal * 0.5 + 0.5;
      noise = Math.pow(noise, 1.4); // делает высокие области редкими

      if (noiseBiome < 0.33) {
          // Водный биом
          if (noise < 0.1) return TileType.RIVER;
          else if (noise < 0.25) return TileType.BEACH;
          else if (noise < 0.5) return TileType.FIELD;
          else return TileType.FOREST;
      } else if (noiseBiome < 0.66) {
          // Лесной
          if (noise < 0.25) return TileType.FIELD;
          else if (noise < 0.6) return TileType.FOREST;
          else return TileType.MOUNTAIN;
      } else {
          // Горный
          if (noise < 0.25) return TileType.FIELD;
          else if (noise < 0.5) return TileType.FOREST;
          else return TileType.MOUNTAIN;
      }
    };

    for (let y = 0; y < this.fieldHeight; y++) {
        const row: Tile[] = [];
        for (let x = 0; x < this.fieldWidth; x++) {
            const position = { x, y };
            let tileType: TileType = TileType.FIELD;

            // Обработка граничных клеток
            if (x === 0 || x === this.fieldWidth - 1 || y === 0 || y === this.fieldHeight - 1) {
                // Обработка углов (всегда WALL)
                if (
                  (x === 0 && y === 0) ||
                  (x === 0 && y === this.fieldHeight - 1) ||
                  (x === this.fieldWidth - 1 && y === 0) ||
                  (x === this.fieldWidth - 1 && y === this.fieldHeight - 1)
                ) {
                    tileType = TileType.WALL;
                } else {
                    // Для остальных граничных клеток проверяем кандидата по непрерывной генерации,
                    // учитывая, что внутренний диапазон имеет индексы 0 ... effectiveDimension-1.
                    if (x === 0) {  // Левая граница (уже не угол, значит y от 1 до fieldHeight-2)
                        // candidate: максимальный effectiveX = effectiveWidth - 1, effectiveY = y - 1
                        const candidateTileType = generateTileType(effectiveWidth - 1, y - 1, fieldX - 1, fieldY);
                        tileType = (candidateTileType === TileType.RIVER || candidateTileType === TileType.MOUNTAIN)
                                   ? TileType.NO_WAY
                                   : TileType.EXIT_LEFT;
                    } else if (x === this.fieldWidth - 1) {  // Правая граница
                        // candidate: effectiveX = 0, effectiveY = y - 1
                        const candidateTileType = generateTileType(0, y - 1, fieldX + 1, fieldY);
                        tileType = (candidateTileType === TileType.RIVER || candidateTileType === TileType.MOUNTAIN)
                                   ? TileType.NO_WAY
                                   : TileType.EXIT_RIGHT;
                    } else if (y === 0) { // Верхняя граница (не угол, x от 1 до fieldWidth-2)
                        // candidate: effectiveX = x - 1, effectiveY = effectiveHeight - 1
                        const candidateTileType = generateTileType(x - 1, effectiveHeight - 1, fieldX, fieldY - 1);
                        tileType = (candidateTileType === TileType.RIVER || candidateTileType === TileType.MOUNTAIN)
                                   ? TileType.NO_WAY
                                   : TileType.EXIT_UP;
                    } else if (y === this.fieldHeight - 1) { // Нижняя граница
                        // candidate: effectiveX = x - 1, effectiveY = 0
                        const candidateTileType = generateTileType(x - 1, 0, fieldX, fieldY + 1);
                        tileType = (candidateTileType === TileType.RIVER || candidateTileType === TileType.MOUNTAIN)
                                   ? TileType.NO_WAY
                                   : TileType.EXIT_DOWN;
                    }
                }
            } else {
                // Внутренняя клетка – используем координаты, сдвинутые на 1 (граница пропущена)
                tileType = generateTileType(x - 1, y - 1, fieldX, fieldY);
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


}
