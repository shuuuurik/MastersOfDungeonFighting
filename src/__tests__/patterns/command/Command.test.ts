import {
  MoveCommand,
  AttackCommand,
  ConfuseCommand,
  WaitCommand,
  CommandInvoker
} from '../../../patterns/command/Command';
import { GameEngine } from '../../../services/GameEngine';
import { Entity, EntityType, Position } from '../../../types/game';

// моковый GameEngine
const mockGameEngine = {
  movePlayer: jest.fn(),
  performAttack: jest.fn(),
  confuseEnemyAt: jest.fn(),
  processTurn: jest.fn(),
  getState: jest.fn(),
};

describe('Command Pattern', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('MoveCommand', () => {
    it('should call gameEngine.movePlayer with the correct direction', () => {
      const command = new MoveCommand(mockGameEngine as unknown as GameEngine, 'up');
      command.execute();
      expect(mockGameEngine.movePlayer).toHaveBeenCalledTimes(1);
      expect(mockGameEngine.movePlayer).toHaveBeenCalledWith('up');
    });

    it('should call gameEngine.movePlayer for another direction', () => {
      const command = new MoveCommand(mockGameEngine as unknown as GameEngine, 'left');
      command.execute();
      expect(mockGameEngine.movePlayer).toHaveBeenCalledTimes(1);
      expect(mockGameEngine.movePlayer).toHaveBeenCalledWith('left');
    });
  });

  describe('AttackCommand', () => {
    const mockAttacker: Entity = {
      id: 'player',
      name: 'Player',
      type: EntityType.PLAYER,
      position: { x: 0, y: 0 },
      stats: { health: 100, maxHealth: 100, attack: 10, defense: 5, experience: 0, level: 1, experienceToNextLevel: 100 },
      symbol: '🤡',
    };
    const mockTarget: Entity = {
      id: 'e1', name: 'Enemy', type: EntityType.ENEMY, position: { x: 1, y: 0 },
      stats: { health: 20, maxHealth: 20, attack: 5, defense: 1, experience: 0, level: 1, experienceToNextLevel: 0 },
      symbol: 'E',
      experience: 10
    };

    it('should call gameEngine.performAttack with the correct attacker and target', () => {
      const command = new AttackCommand(mockGameEngine as unknown as GameEngine, mockAttacker, mockTarget);
      command.execute();
      expect(mockGameEngine.performAttack).toHaveBeenCalledTimes(1);
      expect(mockGameEngine.performAttack).toHaveBeenCalledWith(mockAttacker, mockTarget);
    });
  });

  describe('ConfuseCommand', () => {
    const mockTargetPosition: Position = { x: 5, y: 5 };
    const mockDuration: number = 3;

    it('should call gameEngine.confuseEnemyAt with the target position and duration', () => {
      const command = new ConfuseCommand(mockGameEngine as unknown as GameEngine, mockTargetPosition, mockDuration);
      command.execute();
      expect(mockGameEngine.confuseEnemyAt).toHaveBeenCalledTimes(1);
      expect(mockGameEngine.confuseEnemyAt).toHaveBeenCalledWith(mockTargetPosition, mockDuration);
    });

    it('should use default duration if not provided', () => {
      const command = new ConfuseCommand(mockGameEngine as unknown as GameEngine, mockTargetPosition);
      command.execute();
      expect(mockGameEngine.confuseEnemyAt).toHaveBeenCalledTimes(1);
      expect(mockGameEngine.confuseEnemyAt).toHaveBeenCalledWith(mockTargetPosition, 5); // Default duration is 5
    });
  });

  describe('WaitCommand', () => {
    it('should call gameEngine.processTurn', () => {
      const command = new WaitCommand(mockGameEngine as unknown as GameEngine);
      command.execute();
      expect(mockGameEngine.processTurn).toHaveBeenCalledTimes(1);
    });
  });

  describe('CommandInvoker', () => {
    // моковая команда
    const mockCommand = {
      execute: jest.fn(),
    };

    it('should add commands to its internal list', () => {
      const invoker = new CommandInvoker();
      invoker.addCommand(mockCommand);
      invoker.executeCommands();
      expect(mockCommand.execute).toHaveBeenCalledTimes(1);
    });

    it('should execute all added commands and clear the list', () => {
      const invoker = new CommandInvoker();
      const command1 = { execute: jest.fn() };
      const command2 = { execute: jest.fn() };

      invoker.addCommand(command1);
      invoker.addCommand(command2);
      expect(command1.execute).not.toHaveBeenCalled();
      expect(command2.execute).not.toHaveBeenCalled();

      invoker.executeCommands();
      expect(command1.execute).toHaveBeenCalledTimes(1);
      expect(command2.execute).toHaveBeenCalledTimes(1);

      // проверка что список команд был очищен
      invoker.executeCommands(); // повторный вызов не должен ничего делать
      expect(command1.execute).toHaveBeenCalledTimes(1); // не должен быть вызван снова
      expect(command2.execute).toHaveBeenCalledTimes(1); // не должен быть вызван снова
    });
  });
});