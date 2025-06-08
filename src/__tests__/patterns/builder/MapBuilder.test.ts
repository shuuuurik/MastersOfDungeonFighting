import { MapBuilder } from '../../../patterns/builder/MapBuilder';
import { TileType, GameField, GameMap } from '../../../types/game';

describe('MapBuilder', () => {
  let mapBuilder: MapBuilder;

  beforeEach(() => {
    jest.clearAllMocks();

    mapBuilder = new MapBuilder();
  });

  it('should build a GameMap with specified width and height of fields', () => {
    const mapWidth = 3;
    const mapHeight = 2;
    mapBuilder.setWidth(mapWidth).setHeight(mapHeight);
    const gameMap: GameMap = mapBuilder.build();

    expect(gameMap).toBeDefined();
    expect(gameMap.width).toBe(mapWidth);
    expect(gameMap.height).toBe(mapHeight);
    expect(gameMap.fields).toBeDefined();
    expect(gameMap.fields.length).toBe(mapHeight);
    expect(gameMap.fields[0].length).toBe(mapWidth);

    const defaultFieldWidth = 20;
    const defaultFieldHeight = 15;
    expect(gameMap.fields[0][0].width).toBe(defaultFieldWidth);
    expect(gameMap.fields[0][0].height).toBe(defaultFieldHeight);
    expect(gameMap.fields[0][0].tiles.length).toBe(defaultFieldHeight);
    expect(gameMap.fields[0][0].tiles[0].length).toBe(defaultFieldWidth);
  });

  it('should generate WALL tiles at corners of each GameField', () => {
    const fieldWidth = 5;
    const fieldHeight = 5;
    mapBuilder.setFieldWidth(fieldWidth).setFieldHeight(fieldHeight);
    mapBuilder.setWidth(1).setHeight(1);
    const gameMap: GameMap = mapBuilder.build();
    const gameField: GameField = gameMap.fields[0][0];

    expect(gameField.tiles[0][0].type).toBe(TileType.WALL);
    expect(gameField.tiles[0][fieldWidth - 1].type).toBe(TileType.WALL);
    expect(gameField.tiles[fieldHeight - 1][0].type).toBe(TileType.WALL);
    expect(gameField.tiles[fieldHeight - 1][fieldWidth - 1].type).toBe(TileType.WALL);
  });

  it('should correctly set field width and reflect it in the built GameField', () => {
    const testFieldWidth = 15;
    mapBuilder.setFieldWidth(testFieldWidth);
    mapBuilder.setWidth(1).setHeight(1);
    const gameMap: GameMap = mapBuilder.build();
    const gameField: GameField = gameMap.fields[0][0];

    expect(gameField.width).toBe(testFieldWidth);
    expect(gameField.tiles[0].length).toBe(testFieldWidth);
  });

  it('should correctly set field height and reflect it in the built GameField', () => {
    const testFieldHeight = 12;
    mapBuilder.setFieldHeight(testFieldHeight);
    mapBuilder.setWidth(1).setHeight(1);
    const gameMap: GameMap = mapBuilder.build();
    const gameField: GameField = gameMap.fields[0][0];

    expect(gameField.height).toBe(testFieldHeight);
    expect(gameField.tiles.length).toBe(testFieldHeight);
  });

  it('should correctly set map width and height', () => {
    const mapWidth = 5;
    const mapHeight = 4;
    mapBuilder.setWidth(mapWidth).setHeight(mapHeight);
    const gameMap: GameMap = mapBuilder.build();

    expect(gameMap.width).toBe(mapWidth);
    expect(gameMap.height).toBe(mapHeight);
    expect(gameMap.fields.length).toBe(mapHeight);
    expect(gameMap.fields[0].length).toBe(mapWidth);
  });

  it('should correctly set field positions within the map', () => {
    const mapWidth = 2;
    const mapHeight = 2;
    mapBuilder.setWidth(mapWidth).setHeight(mapHeight);
    mapBuilder.setFieldWidth(10).setFieldHeight(10);
    const gameMap: GameMap = mapBuilder.build();

    expect(gameMap.fields[0][0].position).toEqual({ x: 0, y: 0 });
    expect(gameMap.fields[0][1].position).toEqual({ x: 1, y: 0 });
    expect(gameMap.fields[1][0].position).toEqual({ x: 0, y: 1 });
    expect(gameMap.fields[1][1].position).toEqual({ x: 1, y: 1 });
  });
});