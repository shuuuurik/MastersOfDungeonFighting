import { Entity, GameField, Tile, TileType, EntityType } from '../../../types/game';
import { AggressiveBehavior } from '../../../patterns/strategy/AggressiveBehavior';
import { PassiveBehavior } from '../../../patterns/strategy/PassiveBehavior';
import { FearfulBehavior } from '../../../patterns/strategy/FearfulBehavior';
import { ConfusedBehavior } from '../../../patterns/strategy/ConfusedBehavior';

// моковые данные для GameField
const createMockGameField = (width: number, height: number): GameField => {
    const tiles: Tile[][] = Array(height).fill(null).map((_, y) =>
        Array(width).fill(null).map((__, x) => ({
            position: { x, y },
            type: TileType.FIELD,
            entity: null,
        }))
    );
    return {
        width,
        height,
        tiles,
        position: { x: 0, y: 0 },
    };
};

describe('Behavior Strategies', () => {
    let mockPlayer: Entity;
    let mockEnemy: Entity;
    let mockGameField: GameField;

    beforeEach(() => {
        mockPlayer = {
            id: 'player',
            type: EntityType.PLAYER,
            name: 'Player',
            position: { x: 5, y: 5 },
            stats: { health: 100, maxHealth: 100, attack: 10, defense: 5, experience: 0, level: 1, experienceToNextLevel: 100 },
            symbol: '🤡',
        };
        mockEnemy = {
            id: 'enemy-1',
            type: EntityType.ENEMY,
            name: 'Test Enemy',
            position: { x: 0, y: 0 },
            stats: { health: 50, maxHealth: 50, attack: 5, defense: 2, experience: 0, level: 1, experienceToNextLevel: 0 },
            symbol: 'E',
        };
        mockGameField = createMockGameField(10, 10);

        mockGameField.tiles[mockPlayer.position.y][mockPlayer.position.x].entity = mockPlayer;
        mockGameField.tiles[mockEnemy.position.y][mockEnemy.position.x].entity = mockEnemy;

        // мок Math.random для детерминированного тестирования ConfusedBehavior (предсказуемый результат для случайного выбора)
        jest.spyOn(Math, 'random').mockReturnValue(0.5);
    });

    afterEach(() => {
        jest.restoreAllMocks(); // восстановление Math.random после каждого теста
    });

    // агрессивные мобы
    it('AggressiveBehavior should move enemy towards the player', () => {
        const aggressiveBehavior = new AggressiveBehavior();
        mockEnemy.position = { x: 1, y: 1 };
        mockPlayer.position = { x: 3, y: 1 }; // игрок справа

        const nextPosition = aggressiveBehavior.execute(mockEnemy, mockPlayer, mockGameField);
        // враг переместится на 1 единицу по X в сторону игрока
        expect(nextPosition).toEqual({ x: 2, y: 1 });
    });

    // пассивные мобы
    it('PassiveBehavior should keep enemy in place if not adjacent to player', () => {
        const passiveBehavior = new PassiveBehavior();
        mockEnemy.position = { x: 1, y: 1 };
        mockPlayer.position = { x: 5, y: 5 }; // игрок далеко

        const nextPosition = passiveBehavior.execute(mockEnemy, mockPlayer, mockGameField);
        // враг не будет двигаться
        expect(nextPosition).toEqual({ x: 1, y: 1 });
    });

    it('PassiveBehavior should move away from player if adjacent or stay if no valid retreat', () => {
        const passiveBehavior = new PassiveBehavior();
        mockEnemy.position = { x: 1, y: 1 };
        mockPlayer.position = { x: 1, y: 2 }; // игрок снизу

        const nextPosition = passiveBehavior.execute(mockEnemy, mockPlayer, mockGameField);
        // враг останется на месте
        expect(nextPosition).toEqual({ x: 1, y: 1 });
    });

    // трусливые мобы
    it('FearfulBehavior should move enemy away from the player', () => {
        const fearfulBehavior = new FearfulBehavior();
        mockEnemy.position = { x: 5, y: 5 };
        mockPlayer.position = { x: 5, y: 6 }; // Игрок снизу

        const nextPosition = fearfulBehavior.execute(mockEnemy, mockPlayer, mockGameField);
        // враг переместится вверх, подальше от игрока
        expect(nextPosition).toEqual({ x: 5, y: 4 });
    });
});