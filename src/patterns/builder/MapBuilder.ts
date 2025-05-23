import { GameMap, Position, Tile, TileType } from '../../types/game';
import { EntityFactory } from '../factory/EntityFactory';
import { MapLoader } from '../../services/MapLoader';

/**
 * Builder for creating game maps with various configurations
 */
export class MapBuilder {
  private width: number = 20;
  private height: number = 15;
  private wallDensity: number = 0.25;
  private mapFile: string | null = null;
  private entityFactory: EntityFactory | null = null;
  private roomCount: number = 5;
  private corridorDensity: number = 0.7;
  private randomSeed: number | null = null;
  private mapLoader: MapLoader;
  
  constructor() {
    this.mapLoader = new MapLoader();
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
   * Set the density of walls in the map (0.0 to 1.0)
   */
  setWallDensity(density: number): MapBuilder {
    this.wallDensity = Math.max(0, Math.min(1, density));
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
   * Set the number of rooms to generate
   */
  setRoomCount(count: number): MapBuilder {
    this.roomCount = count;
    return this;
  }
  
  /**
   * Set the density of corridors between rooms
   */
  setCorridorDensity(density: number): MapBuilder {
    this.corridorDensity = Math.max(0, Math.min(1, density));
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
    if (this.mapFile) {
      try {
        return this.mapLoader.loadMapFromFile(this.mapFile);
      } catch (error) {
        console.error("Failed to load map from file:", error);
        // Fall back to generated map
      }
    }
    
    // Otherwise, generate a map
    return this.generateMap();
  }
  
  /**
   * Generate a procedural map with the current settings
   */
  private generateMap(): GameMap {
    const tiles: Tile[][] = [];
    
    // Initialize with floor tiles
    for (let y = 0; y < this.height; y++) {
      const row: Tile[] = [];
      for (let x = 0; x < this.width; x++) {
        const position: Position = { x, y };
        let tileType: TileType = TileType.FLOOR;
        
        // Add walls around the map border
        if (x === 0 || y === 0 || x === this.width - 1 || y === this.height - 1) {
          tileType = TileType.WALL;
        }
        
        // Add some random walls based on density
        if (x !== 0 && y !== 0 && x !== this.width - 1 && y !== this.height - 1) {
          if (Math.random() < this.wallDensity) {
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
    
    // Add rooms if room count is greater than 0
    if (this.roomCount > 0) {
      this.generateRooms(tiles);
    }
    
    // Add an exit
    this.placeExit(tiles);
    
    const map: GameMap = {
      width: this.width,
      height: this.height,
      tiles
    };
    
    return map;
  }
  
  /**
   * Generate rooms in the map
   */
  private generateRooms(tiles: Tile[][]): void {
    const rooms: { x: number, y: number, width: number, height: number }[] = [];
    
    // Generate rooms
    for (let i = 0; i < this.roomCount; i++) {
      const roomWidth = Math.floor(Math.random() * 5) + 4; // 4-8
      const roomHeight = Math.floor(Math.random() * 5) + 4; // 4-8
      
      // Find a valid position for the room (not overlapping with other rooms)
      let validPosition = false;
      let roomX = 0;
      let roomY = 0;
      let attempts = 0;
      
      while (!validPosition && attempts < 100) {
        roomX = Math.floor(Math.random() * (this.width - roomWidth - 2)) + 1;
        roomY = Math.floor(Math.random() * (this.height - roomHeight - 2)) + 1;
        
        validPosition = true;
        for (const room of rooms) {
          // Check if rooms would overlap including a 1-tile buffer
          if (
            roomX - 1 <= room.x + room.width && 
            roomX + roomWidth + 1 >= room.x && 
            roomY - 1 <= room.y + room.height && 
            roomY + roomHeight + 1 >= room.y
          ) {
            validPosition = false;
            break;
          }
        }
        
        attempts++;
      }
      
      if (validPosition) {
        // Create the room
        rooms.push({ x: roomX, y: roomY, width: roomWidth, height: roomHeight });
        
        // Carve out the room
        for (let y = roomY; y < roomY + roomHeight; y++) {
          for (let x = roomX; x < roomX + roomWidth; x++) {
            tiles[y][x].type = TileType.FLOOR;
          }
        }
      }
    }
    
    // Connect rooms with corridors
    for (let i = 0; i < rooms.length - 1; i++) {
      if (Math.random() < this.corridorDensity || i === 0) {
        const roomA = rooms[i];
        const roomB = rooms[i + 1];
        
        // Get center points of rooms
        const ax = Math.floor(roomA.x + roomA.width / 2);
        const ay = Math.floor(roomA.y + roomA.height / 2);
        const bx = Math.floor(roomB.x + roomB.width / 2);
        const by = Math.floor(roomB.y + roomB.height / 2);
        
        // Create L-shaped corridor between rooms
        // Horizontal corridor
        const horizontalFirst = Math.random() < 0.5;
        
        if (horizontalFirst) {
          // Horizontal then vertical
          for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {
            tiles[ay][x].type = TileType.FLOOR;
          }
          
          for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) {
            tiles[y][bx].type = TileType.FLOOR;
          }
        } else {
          // Vertical then horizontal
          for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) {
            tiles[y][ax].type = TileType.FLOOR;
          }
          
          for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) {
            tiles[by][x].type = TileType.FLOOR;
          }
        }
      }
    }
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
      
      if (tiles[y][x].type === TileType.FLOOR) {
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
