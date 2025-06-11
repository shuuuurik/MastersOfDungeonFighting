import { Entity, GameField, Tile, TileType, EntityType, GameTheme } from '../../types/game';
import { GameEngine } from '../../services/GameEngine';
import { NormalState } from '../../patterns/state/NormalState';
import { AggressiveBehavior } from '../../patterns/strategy/AggressiveBehavior';


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

describe('GameEngine Combat, Experience and Levels', () => {
    let gameEngine: GameEngine;
    let player: Entity;
    let enemy: Entity;

    beforeEach(() => {
        gameEngine = new GameEngine(GameTheme.FANTASY);

        // моковые сущности для тестов
        player = {
            id: 'player-combat',
            type: EntityType.PLAYER,
            name: 'Player',
            position: { x: 0, y: 0 },
            stats: { health: 100, maxHealth: 100, attack: 20, defense: 5, experience: 0, level: 1, experienceToNextLevel: 100 },
            symbol: '🤡',
        };
        enemy = {
            id: 'enemy-combat',
            type: EntityType.ENEMY,
            name: 'Weak Enemy',
            position: { x: 0, y: 1 },
            stats: { health: 30, maxHealth: 30, attack: 5, defense: 0, experience: 25, level: 1, experienceToNextLevel: 0 },
            symbol: 'E',
            experience: 10
        };

        const mockField = createMockGameField(10, 10);
        mockField.tiles[player.position.y][player.position.x].entity = player;
        mockField.tiles[enemy.position.y][enemy.position.x].entity = enemy;

        // переопределяем внутреннее состояние GameEngine,
        (gameEngine as any).state = {
            player: player,
            enemies: [enemy],
            currentField: mockField,
            turn: 1,
            gameOver: false,
            victory: false,
            theme: GameTheme.FANTASY,
            replicatingEntities: [],
            map: { width: 1, height: 1, fields: [[mockField]] }
        };

        // инициализируем Map'ы для врагов, состояний и оригинальных поведений
        (gameEngine as any).enemyBehaviors = new Map();
        (gameEngine as any).enemyStates = new Map();
        (gameEngine as any).originalBehaviors = new Map();

        // добавляем тестового врага в эти Map'ы, используя NormalState и AggressiveBehavior как пример
        (gameEngine as any).enemyBehaviors.set(enemy.id, new AggressiveBehavior());
        (gameEngine as any).enemyStates.set(enemy.id, new NormalState());
        (gameEngine as any).originalBehaviors.set(enemy.id, new AggressiveBehavior());
    });

    // боевая система
    it('should calculate damage correctly and reduce target health', () => {
        const initialEnemyHealth = enemy.stats.health; // 30
        gameEngine.performAttack(player, enemy);
        const expectedDamage = Math.max(0, player.stats.attack - enemy.stats.defense); // 20 - 0 = 20
        
        // здоровье после урона: 30 - 20 = 10
        // здоровье после регенерации (1% от 30 maxHealth -> 1 HP): 10 + 1 = 11
        expect(enemy.stats.health).toBe(initialEnemyHealth - expectedDamage + 1); // 11
    });

    it('should remove enemy from game when health drops to 0 or below', () => {
        enemy.stats.health = 10;
        player.stats.attack = 20;

        gameEngine.performAttack(player, enemy);
        expect(enemy.stats.health).toBeLessThanOrEqual(0);
        // враг был удален из массива врагов в GameEngine
        expect(gameEngine.getState().enemies).not.toContain(enemy);
    });

    // экспа и уровни
    it('player should gain experience when defeating an enemy', () => {
        // начальное состояние игрока и врага
        player.stats.experience = 0;
        player.stats.level = 1;
        enemy.stats.health = 1; // делаем врага ваншотным
        player.stats.attack = 1; // solo mid enjoyer

        // враг 1-го уровня дает 10 опыта (1 * 10)
        gameEngine.performAttack(player, enemy);
        const updatedPlayer = gameEngine.getState().player;
        expect(updatedPlayer.stats.experience).toBe(10);
    });

    it('player should level up when experience reaches threshold', () => {
        player.stats.experience = 90;
        player.stats.experienceToNextLevel = 100;
        player.stats.level = 1;
        const initialAttack = player.stats.attack;
        const initialDefense = player.stats.defense;
        const initialMaxHealth = player.stats.maxHealth;

        enemy.stats.health = 1;
        enemy.stats.attack = 1;
        // enemy.stats.experience = 25; не влияет на количество получаемого опыта,
        // потому что GameEngine использует enemy.stats.level * 10
        enemy.stats.level = 2; // враг дает 20 опыта (2 * 10)

        gameEngine.performAttack(player, enemy);

        const updatedPlayer = gameEngine.getState().player;

        expect(updatedPlayer.stats.level).toBe(2);
        expect(updatedPlayer.stats.attack).toBeGreaterThan(initialAttack);
        expect(updatedPlayer.stats.defense).toBeGreaterThan(initialDefense);
        expect(updatedPlayer.stats.maxHealth).toBeGreaterThan(initialMaxHealth);
        expect(updatedPlayer.stats.health).toBe(updatedPlayer.stats.maxHealth);
        // если остаток есть (90 + 20 = 110, то 100 на уровень, 10 остаток)
        expect(updatedPlayer.stats.experience).toBe(10);
        expect(updatedPlayer.stats.experienceToNextLevel).toBeGreaterThan(100); // 100 * 1.5 = 150
    });
});