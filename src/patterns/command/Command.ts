import { GameEngine } from '../../services/GameEngine';
import { Entity } from '../../types/game';

/**
 * Command interface for player actions
 */
export interface Command {
  execute(): void;
}

/**
 * Move command for player movement
 */
export class MoveCommand implements Command {
  private gameEngine: GameEngine;
  private direction: 'up' | 'down' | 'left' | 'right';
  
  constructor(gameEngine: GameEngine, direction: 'up' | 'down' | 'left' | 'right') {
    this.gameEngine = gameEngine;
    this.direction = direction;
  }
  
  execute(): void {
    this.gameEngine.movePlayer(this.direction);
  }
}

export class ConfuseCommand implements Command {
  private gameEngine: GameEngine;
  
  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }
  
  execute(): void {
    this.gameEngine.useConfusionAbility();
  }
}

/**
 * Command for attacking a specific entity
 */
export class AttackCommand implements Command {
  private gameEngine: GameEngine;
  private attacker: Entity;
  private target: Entity;
  
  constructor(gameEngine: GameEngine, attacker: Entity, target: Entity) {
    this.gameEngine = gameEngine;
    this.attacker = attacker;
    this.target = target;
  }
  
  execute(): void {
    this.gameEngine.performAttack(this.attacker, this.target);
  }
}

/**
 * Command for waiting (skipping a turn)
 */
export class WaitCommand implements Command {
  private gameEngine: GameEngine;
  
  constructor(gameEngine: GameEngine) {
    this.gameEngine = gameEngine;
  }
  
  execute(): void {
    this.gameEngine.processTurn();
  }
}

/**
 * Command invoker that stores and executes commands
 */
export class CommandInvoker {
  private commands: Command[] = [];
  
  addCommand(command: Command): void {
    this.commands.push(command);
  }
  
  executeCommands(): void {
    for (const command of this.commands) {
      command.execute();
    }
    this.commands = [];
  }
}
