import { MapBuilder } from '../../../patterns/builder/MapBuilder';
import { TileType, GameField, GameMap } from '../../../types/game';
import { FantasyEntityFactory } from '../../../patterns/factory/FantasyEntityFactory';

describe('MapBuilder Advanced Functionality', () => {
    let mapBuilder: MapBuilder;
    let mockEntityFactory: FantasyEntityFactory; // используем конкретную фабрику для теста

    beforeEach(() => {
        jest.clearAllMocks();
        mapBuilder = new MapBuilder();
        mockEntityFactory = new FantasyEntityFactory();
    });

    // it('should generate identical maps for the same random seed', () => {
    //     const seed = 12345;
    //     const fieldWidth = 5;
    //     const fieldHeight = 5;
    //     const mapWidth = 2;
    //     const mapHeight = 2;

    //     // строим первую карту с заданным сидом и параметрами
    //     mapBuilder
    //         .setRandomSeed(seed)
    //         .setFieldWidth(fieldWidth)
    //         .setFieldHeight(fieldHeight)
    //         .setWidth(mapWidth)
    //         .setHeight(mapHeight);
    //     const gameMap1: GameMap = mapBuilder.build();

    //     // сбрасываем builder (создаем новый)
    //     mapBuilder = new MapBuilder();
    //     // строим вторую карту с тем же сидом и параметрами
    //     mapBuilder
    //         .setRandomSeed(seed)
    //         .setFieldWidth(fieldWidth)
    //         .setFieldHeight(fieldHeight)
    //         .setWidth(mapWidth)
    //         .setHeight(mapHeight);
    //     const gameMap2: GameMap = mapBuilder.build();

    //     // проверяем, что карты идентичны (глубокое сравнение)
    //     expect(gameMap1).toEqual(gameMap2);
    // });

    it('should generate different maps for different random seeds', () => {
        const seed1 = 12345;
        const seed2 = 67890; // другой сид
        const fieldWidth = 5;
        const fieldHeight = 5;
        const mapWidth = 1;
        const mapHeight = 1;

        // строим первую карту
        mapBuilder
            .setRandomSeed(seed1)
            .setFieldWidth(fieldWidth)
            .setFieldHeight(fieldHeight)
            .setWidth(mapWidth)
            .setHeight(mapHeight);
        const gameMap1: GameMap = mapBuilder.build();

        // сбрасываем builder
        mapBuilder = new MapBuilder();
        // строим вторую карту с другим сидом
        mapBuilder
            .setRandomSeed(seed2)
            .setFieldWidth(fieldWidth)
            .setFieldHeight(fieldHeight)
            .setWidth(mapWidth)
            .setHeight(mapHeight);
        const gameMap2: GameMap = mapBuilder.build();

        // проверяем, что карты различаются (по крайней мере, один тайл)
        let areDifferent = false;
        for (let y = 0; y < gameMap1.height; y++) {
            for (let x = 0; x < gameMap1.width; x++) {
                const field1 = gameMap1.fields[y][x];
                const field2 = gameMap2.fields[y][x];
                for (let fy = 0; fy < field1.height; fy++) {
                    for (let fx = 0; fx < field1.width; fx++) {
                        if (field1.tiles[fy][fx].type !== field2.tiles[fy][fx].type) {
                            areDifferent = true;
                            break;
                        }
                    }
                    if (areDifferent) break;
                }
                if (areDifferent) break;
            }
            if (areDifferent) break;
        }
        expect(areDifferent).toBe(true);
    });

    it('should generate diverse internal tiles within a field (not just walls/exits)', () => {
        const fieldWidth = 10;
        const fieldHeight = 10;
        mapBuilder
            .setFieldWidth(fieldWidth)
            .setFieldHeight(fieldHeight)
            .setWidth(1)
            .setHeight(1)
            .setRandomSeed(42); // детерминированный сид для предсказуемости

        const gameMap: GameMap = mapBuilder.build();
        const gameField: GameField = gameMap.fields[0][0];

        // собираем все типы тайлов, которые не являются стенами или выходами
        const internalTileTypes: Set<TileType> = new Set();
        for (let y = 1; y < fieldHeight - 1; y++) { // итерируем только по внутренним тайлам
            for (let x = 1; x < fieldWidth - 1; x++) {
                const type = gameField.tiles[y][x].type;
                if (
                    type !== TileType.WALL &&
                    type !== TileType.EXIT_UP &&
                    type !== TileType.EXIT_DOWN &&
                    type !== TileType.EXIT_LEFT &&
                    type !== TileType.EXIT_RIGHT &&
                    type !== TileType.NO_WAY
                ) {
                    internalTileTypes.add(type);
                }
            }
        }
        // ожидаем, что будут сгенерированы различные типы для данного Perlin Noise и настроек
        expect(internalTileTypes).toContain(TileType.FOREST);
        expect(internalTileTypes).toContain(TileType.FIELD);
        expect(internalTileTypes).toContain(TileType.BEACH);
    });

    it('should generate EXIT or NO_WAY tiles on the non-corner borders of GameFields', () => {
        const fieldWidth = 5;
        const fieldHeight = 5;
        mapBuilder.setFieldWidth(fieldWidth).setFieldHeight(fieldHeight);
        mapBuilder.setWidth(3).setHeight(3); // создаем 3x3 карту, чтобы были внутренние границы
        const gameMap: GameMap = mapBuilder.build();

        // проверяем верхнюю границу центрального поля (0,1)
        const centralField = gameMap.fields[1][1];
        // верхняя граница (y=0), кроме углов
        for (let x = 1; x < fieldWidth - 1; x++) {
            const tileType = centralField.tiles[0][x].type;
            expect([TileType.EXIT_UP, TileType.NO_WAY]).toContain(tileType);
        }

        // проверяем нижнюю границу центрального поля (0,1)
        // нижняя граница (y=fieldHeight-1), кроме углов
        for (let x = 1; x < fieldWidth - 1; x++) {
            const tileType = centralField.tiles[fieldHeight - 1][x].type;
            expect([TileType.EXIT_DOWN, TileType.NO_WAY]).toContain(tileType);
        }

        // проверяем левую границу центрального поля (0,1)
        // левая граница (x=0), кроме углов
        for (let y = 1; y < fieldHeight - 1; y++) {
            const tileType = centralField.tiles[y][0].type;
            expect([TileType.EXIT_LEFT, TileType.NO_WAY]).toContain(tileType);
        }

        // проверяем правую границу центрального поля (0,1)
        // правая граница (x=fieldWidth-1), кроме углов
        for (let y = 1; y < fieldHeight - 1; y++) {
            const tileType = centralField.tiles[y][fieldWidth - 1].type;
            expect([TileType.EXIT_RIGHT, TileType.NO_WAY]).toContain(tileType);
        }
    });

    it('should correctly handle setEntityFactory without affecting map structure generation', () => {
        mapBuilder.setEntityFactory(mockEntityFactory);
        mapBuilder.setWidth(1).setHeight(1);
        const gameMap: GameMap = mapBuilder.build();

        // проверяем, что карта все равно генерируется корректно
        expect(gameMap).toBeDefined();
        expect(gameMap.width).toBe(1);
        expect(gameMap.height).toBe(1);
        expect(gameMap.fields[0][0].tiles[0][0].type).toBe(TileType.WALL); // просто проверка на наличие тайлов
    });
});