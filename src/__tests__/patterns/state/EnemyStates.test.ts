import { NormalState } from '../../../patterns/state/NormalState';
import { PanicState } from '../../../patterns/state/PanicState';
import { PatrolState } from '../../../patterns/state/PatrolState';
import { TrackingState } from '../../../patterns/state/TrackingState';
import { BehaviorStrategy } from '../../../patterns/strategy/BehaviorStrategy';
import { AggressiveBehavior } from '../../../patterns/strategy/AggressiveBehavior';
import { FearfulBehavior } from '../../../patterns/strategy/FearfulBehavior';
import { Entity, GameField, Position, EntityType, TileType } from '../../../types/game';

describe('Enemy States (State Pattern)', () => {
    let mockEntity: Entity;
    let mockPlayer: Entity;
    let mockGameField: GameField;
    let mockOriginalStrategy: BehaviorStrategy;

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(Math, 'random').mockReturnValue(0.5); // дефолтный Math.random для предсказуемости

        mockEntity = {
            id: 'enemy-1',
            type: EntityType.ENEMY,
            name: 'Test Enemy',
            position: { x: 5, y: 5 },
            stats: {
                health: 100,
                maxHealth: 100,
                attack: 10,
                defense: 5,
                experience: 0,
                level: 1,
                experienceToNextLevel: 0,
            },
            symbol: 'E',
        };

        mockPlayer = {
            id: 'player',
            type: EntityType.PLAYER,
            name: 'Player',
            position: { x: 0, y: 0 },
            stats: {
                health: 100,
                maxHealth: 100,
                attack: 10,
                defense: 5,
                experience: 0,
                level: 1,
                experienceToNextLevel: 0,
            },
            symbol: '🤡',
        };

        mockGameField = {
            width: 10,
            height: 10,
            position: { x: 0, y: 0 },
            tiles: Array(10).fill(null).map((_, y) =>
                Array(10).fill(null).map((__, x) => ({
                    type: TileType.FIELD,
                    position: { x, y },
                    entity: null,
                }))
            ),
        };
        // на поле есть мок-сущности для корректности
        mockGameField.tiles[mockEntity.position.y][mockEntity.position.x].entity = mockEntity;
        mockGameField.tiles[mockPlayer.position.y][mockPlayer.position.x].entity = mockPlayer;

        // мок оригинальной стратегии
        mockOriginalStrategy = {
            execute: jest.fn((entity: Entity, _: Entity, __: GameField) => {
                // возвращаем просто текущую позицию, если не указано иное
                return { ...entity.position };
            }),
        };
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // --- NormalState Tests ---
    describe('NormalState', () => {
        let normalState: NormalState;

        beforeEach(() => {
            normalState = new NormalState();
        });

        it('should use the original strategy for getNextPosition', () => {
            const expectedPosition = { x: 6, y: 5 };
            (mockOriginalStrategy.execute as jest.Mock).mockReturnValue(expectedPosition);

            const nextPosition = normalState.getNextPosition(mockEntity, mockPlayer, mockGameField, mockOriginalStrategy);

            expect(mockOriginalStrategy.execute).toHaveBeenCalledWith(mockEntity, mockPlayer, mockGameField);
            expect(nextPosition).toEqual(expectedPosition);
            expect(normalState.getName()).toBe('Normal');
        });

        it('should transition to PanicState if health drops below threshold', () => {
            mockEntity.stats.health = mockEntity.stats.maxHealth * 0.2; // 20% здоровья

            const nextState = normalState.shouldTransition(mockEntity);

            expect(nextState).toBeInstanceOf(PanicState);
        });

        it('should not transition if health is above threshold', () => {
            mockEntity.stats.health = mockEntity.stats.maxHealth * 0.4; // 40% здоровья

            const nextState = normalState.shouldTransition(mockEntity);

            expect(nextState).toBeNull();
        });

        it('should return "Normal" for getName', () => {
            expect(normalState.getName()).toBe('Normal');
        });
    });

    // --- PanicState Tests ---
    describe('PanicState', () => {
        let panicState: PanicState;
        let mockFearfulStrategyExecute: jest.Mock;

        beforeEach(() => {
            // мокаем FearfulBehavior.execute, чтобы контролировать его поведение
            mockFearfulStrategyExecute = jest.fn((entity: Entity, _: Entity, __: GameField) => {
                // скажем, что fearfulStrategy всегда отступает на 1 по X
                return { x: entity.position.x - 1, y: entity.position.y };
            });
            // перехватываем конструктор FearfulBehavior, чтобы подменить его execute
            jest.spyOn(FearfulBehavior.prototype, 'execute').mockImplementation(mockFearfulStrategyExecute);

            panicState = new PanicState();
        });

        it('should use FearfulBehavior for getNextPosition, ignoring original strategy', () => {
            const nextPosition = panicState.getNextPosition(mockEntity, mockPlayer, mockGameField, mockOriginalStrategy);

            // FearfulBehavior.execute должен быть вызван, а не mockOriginalStrategy
            expect(FearfulBehavior.prototype.execute).toHaveBeenCalledWith(mockEntity, mockPlayer, mockGameField);
            expect(mockOriginalStrategy.execute).not.toHaveBeenCalled();
            expect(nextPosition).toEqual({ x: mockEntity.position.x - 1, y: mockEntity.position.y });
            expect(panicState.getName()).toBe('Panic');
        });

        it('should transition to NormalState if health recovers above threshold', () => {
            mockEntity.stats.health = mockEntity.stats.maxHealth * 0.6; // 60% здоровья

            const nextState = panicState.shouldTransition(mockEntity);

            expect(nextState).toBeInstanceOf(NormalState);
        });

        it('should not transition if health is still below recovery threshold', () => {
            mockEntity.stats.health = mockEntity.stats.maxHealth * 0.4; // 40% здоровья

            const nextState = panicState.shouldTransition(mockEntity);

            expect(nextState).toBeNull();
        });

        it('should return "Panic" for getName', () => {
            expect(panicState.getName()).toBe('Panic');
        });
    });

    // --- PatrolState Tests ---
    describe('PatrolState', () => {
        let patrolState: PatrolState;
        const patrolCenter: Position = { x: 5, y: 5 };
        const patrolRadius: number = 2; // уменьшаем радиус для более простых тестов

        beforeEach(() => {
            // мокаем Math.random для generatePatrolPoints
            jest.spyOn(Math, 'random').mockReturnValueOnce(0); // всегда выбираем первый patrolPoint (x + radius)

            patrolState = new PatrolState(patrolCenter, patrolRadius);
            // сбросим Math.random, чтобы он не влиял на движение внутри getNextPosition
            jest.spyOn(Math, 'random').mockReturnValue(0.5); // возвращаем дефолт для следующих вызовов
        });

        it('should transition to PanicState if health drops below threshold', () => {
            mockEntity.stats.health = mockEntity.stats.maxHealth * 0.2; // 20% здоровья

            const nextState = patrolState.shouldTransition(mockEntity);

            expect(nextState).toBeInstanceOf(PanicState);
        });

        it('should not transition if health is above threshold', () => {
            mockEntity.stats.health = mockEntity.stats.maxHealth * 0.4; // 40% здоровья

            const nextState = patrolState.shouldTransition(mockEntity);

            expect(nextState).toBeNull();
        });

        it('should return "Patrol" for getName', () => {
            expect(patrolState.getName()).toBe('Patrol');
        });
    });

    // --- TrackingState Tests ---
    describe('TrackingState', () => {
        let trackingState: TrackingState;
        const targetPosition: Position = { x: 8, y: 8 };
        const giveUpDistance: number = 3; // уменьшим дистанцию для простоты тестов
        let mockAggressiveStrategyExecute: jest.Mock;

        beforeEach(() => {
            // мокаем AggressiveBehavior.execute
            mockAggressiveStrategyExecute = jest.fn((entity: Entity, target: Entity, _: GameField) => {
                // для теста, пусть агрессивное поведение всегда двигается к цели по x, потом по y
                if (entity.position.x < target.position.x) return { x: entity.position.x + 1, y: entity.position.y };
                if (entity.position.x > target.position.x) return { x: entity.position.x - 1, y: entity.position.y };
                if (entity.position.y < target.position.y) return { x: entity.position.x, y: entity.position.y + 1 };
                if (entity.position.y > target.position.y) return { x: entity.position.x, y: entity.position.y - 1 };
                return { ...entity.position }; // если уже на цели
            });
            jest.spyOn(AggressiveBehavior.prototype, 'execute').mockImplementation(mockAggressiveStrategyExecute);

            trackingState = new TrackingState(targetPosition, giveUpDistance);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should use AggressiveBehavior to move towards target position', () => {
            mockEntity.position = { x: 5, y: 5 };
            const nextPosition = trackingState.getNextPosition(mockEntity, mockPlayer, mockGameField, mockOriginalStrategy);

            expect(AggressiveBehavior.prototype.execute).toHaveBeenCalled();
            expect(nextPosition).toEqual({ x: 6, y: 5 }); // переместились на 1 вправо к {8,8}
            expect(trackingState.getName()).toBe('Tracking');
        });

        it('should transition to NormalState if distance to target exceeds giveUpDistance', () => {
            mockEntity.position = { x: 0, y: 0 }; // очень далеко от targetPosition (8,8)

            const nextState = trackingState.shouldTransition(mockEntity);

            expect(nextState).toBeInstanceOf(NormalState);
        });

        it('should transition to PatrolState if entity reaches target position', () => {
            mockEntity.position = { x: targetPosition.x, y: targetPosition.y };

            const nextState = trackingState.shouldTransition(mockEntity);

            expect(nextState).toBeInstanceOf(PatrolState);
        });

        it('should not transition if within tracking range and not at target', () => {
            mockEntity.position = { x: 7, y: 7 }; // в пределах 3 от (8,8)
            
            const nextState = trackingState.shouldTransition(mockEntity);

            expect(nextState).toBeNull();
        });

        it('should return "Tracking" for getName', () => {
            expect(trackingState.getName()).toBe('Tracking');
        });
    });
});