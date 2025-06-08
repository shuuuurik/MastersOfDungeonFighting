import { ReplicatingEntity } from '../../../patterns/prototype/ReplicatingEntity';
import { Entity, Position, EntityType, GameField, TileType } from '../../../types/game';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
    v4: jest.fn(),
}));

describe('ReplicatingEntity (Prototype Pattern)', () => {
    let originalEntity: Entity;
    let replicatingWrapper: ReplicatingEntity;
    let mockGameField: GameField;
    const initialPosition: Position = { x: 5, y: 5 };

    beforeEach(() => {
        (uuidv4 as jest.Mock).mockReset();

        // предсказуемые UUID
        (uuidv4 as jest.Mock)
            .mockReturnValueOnce('mock-uuid-original') // для originalEntity
            .mockReturnValueOnce('mock-uuid-clone-1')   // для первого клона
            .mockReturnValueOnce('mock-uuid-clone-2')   // для второго клона и т.д.
            .mockReturnValue('mock-uuid-fallback'); // для последующих, если вдруг понадобятся

        originalEntity = {
            id: (uuidv4 as jest.Mock)(),
            type: EntityType.ENEMY,
            name: 'Poisonous Fungus',
            position: { ...initialPosition },
            stats: {
                health: 100,
                maxHealth: 100,
                attack: 10,
                defense: 5,
                experience: 0,
                level: 1,
                experienceToNextLevel: 0,
            },
            symbol: '🍄',
        };

        // обертка для репликации; дефолтные значения: replicationChance = 0.2, replicationCount = 10
        replicatingWrapper = new ReplicatingEntity(originalEntity);

        // мок игрового поля
        mockGameField = {
            width: 10,
            height: 10,
            position: { x: 0, y: 0 },
            tiles: Array(10).fill(null).map((_, y) =>
                Array(10).fill(null).map((__, x) => ({
                    type: TileType.FIELD, // все поля FIELD
                    position: { x, y },
                    entity: null, // нет сущностей
                }))
            ),
        };

        // задаем центральному тайлу сущность для теста
        mockGameField.tiles[initialPosition.y][initialPosition.x].entity = originalEntity;
    });

    // --- тесты для clone() ---
    describe('clone()', () => {
        it('should return a new Entity with a different ID', () => {
            const clone = replicatingWrapper.clone();
            expect(clone).not.toBe(originalEntity); // новый объект
            expect(clone.id).not.toBe(originalEntity.id);
            expect(clone.id).toBe('mock-uuid-clone-1'); // мок uuidv4 работает
        });

        it('should return a clone with the same data but independent position object', () => {
            const clone = replicatingWrapper.clone();

            // проверяем, что данные скопированы
            expect(clone.name).toBe(originalEntity.name);
            expect(clone.symbol).toBe(originalEntity.symbol);
            expect(clone.type).toBe(originalEntity.type);
            expect(clone.stats).toEqual(originalEntity.stats); // stats должны быть глубокой копией или эквивалентны

            // объект позиции клонирован (не является той же ссылкой)
            expect(clone.position).toEqual(originalEntity.position); // значения одинаковы
            expect(clone.position).not.toBe(originalEntity.position); // но это разные объекты
        });
    });

    // --- Тесты для tryReplicate() ---
    describe('tryReplicate()', () => {
        beforeEach(() => {
            // Spy on Math.random for replication chance
            jest.spyOn(Math, 'random');
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should return null if replication chance is not met', () => {
            (Math.random as jest.Mock).mockReturnValue(0.21); // Больше чем дефолтный 0.2 шанс

            const clone = replicatingWrapper.tryReplicate(mockGameField);
            expect(clone).toBeNull();
        });

        it('should return a cloned entity if replication chance is met and valid position found', () => {
            (Math.random as jest.Mock)
                .mockReturnValueOnce(0.1)
                .mockReturnValueOnce(0); // выбираем первую валидную позицию из списка getAdjacentPositions (x+1, y)

            const clone = replicatingWrapper.tryReplicate(mockGameField);

            expect(clone).not.toBeNull();
            expect(clone?.id).toBe('mock-uuid-clone-1');
            expect(clone?.position).toEqual({ x: initialPosition.x + 1, y: initialPosition.y });
            expect(clone?.stats.health).toBe(Math.floor(originalEntity.stats.health * 0.8)); // статы ослаблены
            expect(clone?.stats.attack).toBe(Math.floor(originalEntity.stats.attack * 0.9));
            expect(clone?.stats.defense).toBe(Math.floor(originalEntity.stats.defense * 0.9));
        });

        it('should return null if replicationCount is 0', () => {
            const wrapperWithZeroCount = new ReplicatingEntity(originalEntity, 1.0, 0); // шанс 100%, но 0 репликаций

            (Math.random as jest.Mock).mockReturnValue(0.1); // шанс репликации

            const clone = wrapperWithZeroCount.tryReplicate(mockGameField);
            expect(clone).toBeNull();
        });

        it('should return null if no valid adjacent positions are available', () => {
            // заполняем все соседние тайлы стенами
            const { x, y } = initialPosition;
            mockGameField.tiles[y][x + 1].type = TileType.WALL;
            mockGameField.tiles[y][x - 1].type = TileType.WALL;
            mockGameField.tiles[y + 1][x].type = TileType.WALL;
            mockGameField.tiles[y - 1][x].type = TileType.WALL;

            (Math.random as jest.Mock).mockReturnValue(0.1); // шанс репликации

            const clone = replicatingWrapper.tryReplicate(mockGameField);
            expect(clone).toBeNull();
        });

        it('should not replicate into tiles with existing entities', () => {
            // занятая соседняя позиция
            mockGameField.tiles[initialPosition.y][initialPosition.x + 1].entity = {
                id: 'other-entity',
                type: EntityType.ENEMY,
                name: 'Other Enemy',
                position: { x: initialPosition.x + 1, y: initialPosition.y },
                stats: { health: 1, maxHealth: 1, attack: 1, defense: 1, experience: 0, level: 1, experienceToNextLevel: 0 },
                symbol: 'X',
            };
            // мокаем Math.random так, чтобы он всегда выбирал эту занятую позицию первой,
            // но т.к. isValidPosition отфильтрует, он должен будет выбрать следующую (если есть) или null.

            // все остальные позиции невалидны
            const { x, y } = initialPosition;
            mockGameField.tiles[y][x - 1].type = TileType.WALL;
            mockGameField.tiles[y + 1][x].type = TileType.WALL;
            mockGameField.tiles[y - 1][x].type = TileType.WALL;

            // Math.random будет выбирать между оставшимися валидными.
            // Если только одна соседняя позиция, и она занята, то клонирования не будет.
            (Math.random as jest.Mock)
                .mockReturnValueOnce(0.1) // шанс репликации
                .mockReturnValueOnce(0); // всегда выбирает первую позицию из getAdjacentPositions (x+1,y), которая теперь занята

            const clone = replicatingWrapper.tryReplicate(mockGameField);
            expect(clone).toBeNull(); // должен быть null, так как единственная доступная позиция занята
        });

        it('should correctly reduce clone stats', () => {
            (Math.random as jest.Mock)
                .mockReturnValueOnce(0.1) // шанс репликации
                .mockReturnValueOnce(0); // выбираем первую валидную позицию

            const clone = replicatingWrapper.tryReplicate(mockGameField);

            expect(clone).not.toBeNull();
            if (clone) {
                // проверяем, что статы уменьшились
                expect(clone.stats.health).toBe(Math.floor(originalEntity.stats.health * 0.8));
                expect(clone.stats.maxHealth).toBe(Math.floor(originalEntity.stats.maxHealth * 0.8));
                expect(clone.stats.attack).toBe(Math.floor(originalEntity.stats.attack * 0.9));
                expect(clone.stats.defense).toBe(Math.floor(originalEntity.stats.defense * 0.9));

                // проверяем, что округление вниз работает, и статы не стали отрицательными
                expect(clone.stats.health).toBeGreaterThanOrEqual(0);
                expect(clone.stats.attack).toBeGreaterThanOrEqual(0);
                expect(clone.stats.defense).toBeGreaterThanOrEqual(0);
            }
        });
    });

    // --- Тесты для вспомогательных методов и сеттеров/геттеров  ---
    describe('Getter/Setter and internal logic', () => {
        it('should get and set replication chance correctly', () => {
            expect(replicatingWrapper.getReplicationChance()).toBe(0.2); // дефолтное
            replicatingWrapper.setReplicationChance(0.5);
            expect(replicatingWrapper.getReplicationChance()).toBe(0.5);
            replicatingWrapper.setReplicationChance(1.5); // должно быть обрезано до 1.0
            expect(replicatingWrapper.getReplicationChance()).toBe(1.0);
            replicatingWrapper.setReplicationChance(-0.1); // должно быть обрезано до 0
            expect(replicatingWrapper.getReplicationChance()).toBe(0);
        });

        it('should return the original entity', () => {
            expect(replicatingWrapper.getEntity()).toBe(originalEntity);
        });

        it('should correctly determine valid positions for replication', () => {
            const { x, y } = initialPosition;
            
            // Сценарий 1: все соседние клетки свободны и проходимы
            // в mockGameField все FIELD, так что все 4 позиции должны быть валидны
            const adjacentPositions = [
                { x: x + 1, y },
                { x: x - 1, y },
                { x, y: y + 1 },
                { x, y: y - 1 }
            ];

            // временная обертка, чтобы получить доступ к приватному isValidPosition
            // @ts-ignore
            const isValid = (pos: Position) => replicatingWrapper.isValidPosition(pos, mockGameField);

            adjacentPositions.forEach(pos => {
                expect(isValid(pos)).toBe(true);
            });

            // Сценарий 2: некоторые клетки невалидны
            mockGameField.tiles[y][x + 1].type = TileType.WALL; // Wall
            mockGameField.tiles[y - 1][x].entity = { // занятая клетка
                id: 'temp-id', type: EntityType.ENEMY, name: 'Occupied', position: { x: x, y: y - 1 },
                stats: { health: 1, maxHealth: 1, attack: 1, defense: 1, experience: 0, level: 1, experienceToNextLevel: 0 }, symbol: ''
            };

            expect(isValid({ x: x + 1, y })).toBe(false); // стена
            expect(isValid({ x: x - 1, y })).toBe(true); // все еще валидно
            expect(isValid({ x, y: y + 1 })).toBe(true); // все еще валидно
            expect(isValid({ x, y: y - 1 })).toBe(false); // занято

            // Сценарий 3: позиция за пределами поля
            expect(isValid({ x: -1, y })).toBe(false);
            expect(isValid({ x: mockGameField.width, y })).toBe(false);
            expect(isValid({ x, y: -1 })).toBe(false);
            expect(isValid({ x, y: mockGameField.height })).toBe(false);

            // Сценарий 4: недоступные типы тайлов
            mockGameField.tiles[y][x - 1].type = TileType.RIVER;
            expect(isValid({ x: x - 1, y })).toBe(false);

            mockGameField.tiles[y][x - 1].type = TileType.MOUNTAIN;
            expect(isValid({ x: x - 1, y })).toBe(false);

            mockGameField.tiles[y][x - 1].type = TileType.EXIT_UP;
            expect(isValid({ x: x - 1, y })).toBe(false);
        });
    });
});