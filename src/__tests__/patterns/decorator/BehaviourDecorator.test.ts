import { Entity, GameField, Tile, TileType, EntityType } from '../../../types/game';
import { AggressiveBehavior } from '../../../patterns/strategy/AggressiveBehavior';
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
            experience: 10
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

    // конфузия через паттерн "Декоратор" (ConfusedBehavior как стратегия)
    it('ConfusedBehavior should return a random adjacent valid position when confused', () => {
        const baseBehavior = new AggressiveBehavior();
        const confusedBehavior = new ConfusedBehavior(baseBehavior, 3); // на 3 хода

        mockEnemy.position = { x: 5, y: 5 };
        mockPlayer.position = { x: 5, y: 6 }; // игрок снизу

        // изменяем мок Math.random, чтобы он выбирал нужный индекс (индекс 2 для { x, y: y+1 })
        jest.spyOn(Math, 'random').mockReturnValue(0.25); // 0.25 * 8 = 2

        const nextPosition = confusedBehavior.execute(mockEnemy, mockPlayer, mockGameField);
        // ожидаем, что будет выбрана позиция { x: 5, y: 6 }
        expect(nextPosition).toEqual({ x: 4, y: 4 });
        // количество оставшихся ходов уменьшилось
        expect(confusedBehavior.getTurnsRemaining()).toBe(2);
    });

    it('ConfusedBehavior should revert to wrapped behavior after confusion ends', () => {
        const baseBehavior = new AggressiveBehavior();
        const confusedBehavior = new ConfusedBehavior(baseBehavior, 1); // на 1 ход

        mockEnemy.position = { x: 1, y: 1 };
        mockPlayer.position = { x: 3, y: 1 }; // игрок справа

        // первый вызов: враг запутается (случайное движение)
        confusedBehavior.execute(mockEnemy, mockPlayer, mockGameField);
        expect(confusedBehavior.getTurnsRemaining()).toBe(0); // количество ходов уменьшилось до 0

        // второй вызов: теперь confusedBehavior должен использовать wrappedBehavior (AggressiveBehavior)
        const nextPositionAfterConfusion = confusedBehavior.execute(mockEnemy, mockPlayer, mockGameField);
        // агрессивное поведение должно двигаться к игроку
        expect(nextPositionAfterConfusion).toEqual({ x: 2, y: 1 }); // движение к игроку
    });
});