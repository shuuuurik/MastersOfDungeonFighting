import { GameField, GameMap, Tile, TileType } from '../../types/game';
import mapJson from '../../assets/map.json';

/**
 * Service for loading maps from files
 */
export class MapLoader {
  // Map cache to store pre-loaded maps
  private mapCache: Record<string, any> = {
    'src/assets/map.json': mapJson,
  };

  /**
   * Load a map from a file
   * @param filepath The path to the map file
   */
  loadMapFromFile(filepath: string): GameMap {
    console.log(`Loading map from ${filepath}`);
    
    try {
      let mapData;
      
      if (this.mapCache[filepath]) {
        mapData = this.mapCache[filepath];
      } else {
        mapData = mapJson;
        console.warn(`Using default map for path: ${filepath}`);
      }
      
      if (!mapData || !mapData.width || !mapData.height || !Array.isArray(mapData.fields)) {
        throw new Error(`Invalid map file format: ${filepath}`);
      }
      
      const gameMap: GameMap = {
        width: mapData.width,
        height: mapData.height,
        fields: []
      };
      
      const tileTypeValues = Object.values(TileType);
      
      gameMap.fields = mapData.fields.map((row: any[], rowIndex: number) => {
        return row.map((fieldData: any, colIndex: number) => {
          const field: GameField = {
            width: fieldData.width,
            height: fieldData.height,
            position: { x: colIndex, y: rowIndex },
            tiles: []
          };
          
          field.tiles = fieldData.tiles.map((tileRow: number[], yIndex: number) => {
            return tileRow.map((tileTypeIndex: number, xIndex: number) => {
              if (tileTypeIndex < 0 || tileTypeIndex >= tileTypeValues.length) {
                console.warn(`Invalid tile type index: ${tileTypeIndex} at [${xIndex},${yIndex}], defaulting to WALL`);
                tileTypeIndex = 1;
              }
              
              const tileType = tileTypeValues[tileTypeIndex - 1];
              
              const tile: Tile = {
                type: tileType as TileType,
                position: { x: xIndex, y: yIndex },
                entity: null
              };
              
              return tile;
            });
          });
          
          return field;
        });
      });
      
      return gameMap;
    } catch (error) {
      console.error(`Error loading map from ${filepath}:`, error);
      throw new Error(`Failed to load map from ${filepath}: ${error}`);
    }
  }
}
