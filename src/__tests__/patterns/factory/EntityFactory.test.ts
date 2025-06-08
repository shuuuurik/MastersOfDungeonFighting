import { EntityFactory } from '../../../patterns/factory/EntityFactory';
import { FantasyEntityFactory } from '../../../patterns/factory/FantasyEntityFactory';
import { ForestEntityFactory } from '../../../patterns/factory/ForestEntityFactory';
import { Position, EntityType, } from '../../../types/game';

describe('EntityFactory (Abstract Factory Pattern)', () => {
    let fantasyFactory: EntityFactory;
    let forestFactory: EntityFactory;
    const testPosition: Position = { x: 5, y: 5 };
    const testLevel: number = 5;

    beforeEach(() => {
        // мокаем Math.random, чтобы сделать генерацию случайных типов детерминированной
        // что приведет к выбору первого элемента из каждого массива 'types'.
        jest.spyOn(Math, 'random').mockReturnValue(0);
        
        fantasyFactory = new FantasyEntityFactory();
        forestFactory = new ForestEntityFactory();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    // --- Тесты для FantasyEntityFactory ---
    describe('FantasyEntityFactory', () => {
        it('should create a melee entity with correct basic properties', () => {
            const entity = fantasyFactory.createMelee(testPosition, testLevel);

            expect(entity).toBeDefined();
            expect(entity.id).toBeDefined(); // UUID должен быть сгенерирован
            expect(typeof entity.id).toBe('string');
            expect(entity.type).toBe(EntityType.ENEMY);
            expect(entity.position).toEqual(testPosition);
            expect(entity.name).toBe('Goblin Warrior');
            expect(entity.symbol).toBe('👺');
            expect(entity.stats).toBeDefined();
            expect(entity.stats.level).toBe(testLevel);
        });

        it('should create a ranged entity with correct basic properties', () => {
            const entity = fantasyFactory.createRanged(testPosition, testLevel);
            expect(entity).toBeDefined();
            expect(entity.id).toBeDefined();
            expect(entity.type).toBe(EntityType.ENEMY);
            expect(entity.position).toEqual(testPosition);
            expect(entity.name).toBe('Goblin Archer');
            expect(entity.symbol).toBe('🏹');
            expect(entity.stats.level).toBe(testLevel);
        });

        it('should create an elite entity with correct basic properties', () => {
            const entity = fantasyFactory.createElite(testPosition, testLevel);
            expect(entity).toBeDefined();
            expect(entity.id).toBeDefined();
            expect(entity.type).toBe(EntityType.ENEMY);
            expect(entity.position).toEqual(testPosition);
            expect(entity.name).toBe('Dragon');
            expect(entity.symbol).toBe('🐉');
            expect(entity.stats.level).toBe(testLevel);
        });

        it('should create a replicating entity with correct basic properties', () => {
            const entity = fantasyFactory.createReplicating(testPosition, testLevel);
            expect(entity).toBeDefined();
            expect(entity.id).toBeDefined();
            expect(entity.type).toBe(EntityType.ENEMY);
            expect(entity.position).toEqual(testPosition);
            expect(entity.name).toBe('Slime');
            expect(entity.symbol).toBe('🟢');
            expect(entity.stats.level).toBe(testLevel);
        });
    });

    // --- Тесты для ForestEntityFactory ---
    describe('ForestEntityFactory', () => {
        it('should create a melee entity with correct basic properties and different theme', () => {
            const entity = forestFactory.createMelee(testPosition, testLevel);

            expect(entity).toBeDefined();
            expect(entity.id).toBeDefined();
            expect(entity.type).toBe(EntityType.ENEMY);
            expect(entity.position).toEqual(testPosition);
            expect(entity.name).toBe('Boar');
            expect(entity.symbol).toBe('🐗');
            expect(entity.stats).toBeDefined();
            expect(entity.stats.level).toBe(testLevel);
        });

        it('should create a ranged entity with correct basic properties and different theme', () => {
            const entity = forestFactory.createRanged(testPosition, testLevel);
            expect(entity).toBeDefined();
            expect(entity.name).toBe('Archer');
            expect(entity.symbol).toBe('🏹');
        });

        it('should create an elite entity with correct basic properties and different theme', () => {
            const entity = forestFactory.createElite(testPosition, testLevel);
            expect(entity).toBeDefined();
            expect(entity.name).toBe('Polar Bear');
            expect(entity.symbol).toBe('🐻‍❄️');
        });

        it('should create a replicating entity with correct basic properties and different theme', () => {
            const entity = forestFactory.createReplicating(testPosition, testLevel);
            expect(entity).toBeDefined();
            expect(entity.name).toBe('Rat');
            expect(entity.symbol).toBe('🐀');
        });
    });

    // --- Тесты для сравнения фабрик ---
    it('should create different entities from different factories for the same type', () => {
        const fantasyMelee = fantasyFactory.createMelee(testPosition);
        const forestMelee = forestFactory.createMelee(testPosition);

        // ID разные
        expect(fantasyMelee.id).not.toBe(forestMelee.id);

        // имена/символы разные
        expect(fantasyMelee.name).not.toBe(forestMelee.name);
        expect(fantasyMelee.symbol).not.toBe(forestMelee.symbol);
    });
});