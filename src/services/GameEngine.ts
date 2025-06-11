import { EnemyCategory, Entity, EntityType, GameField, GameState, GameTheme, 
  Position, TileType} from '../types/game';
import { MapBuilder } from '../patterns/builder/MapBuilder';
import { EntityManager } from './EntityManager';
import { BehaviorStrategy } from '../patterns/strategy/BehaviorStrategy';
import { ConfusedBehavior } from '../patterns/strategy/ConfusedBehavior';
import { ReplicatingEntity } from '../patterns/prototype/ReplicatingEntity';
import { EnemyState } from '../patterns/state/EnemyState';
import { NormalState } from '../patterns/state/NormalState';
import { MapService } from './MapService';

export class GameEngine {
  private mapService: MapService;

  private entityManager: EntityManager;
  private state: GameState;

  private enemyBehaviors: Map<string, BehaviorStrategy> = new Map();
  private enemyStates: Map<string, EnemyState> = new Map();
  private originalBehaviors: Map<string, BehaviorStrategy> = new Map();
  private replicatingEntities: Map<string, ReplicatingEntity> = new Map();
  
  constructor(theme: GameTheme = GameTheme.FANTASY) {
    this.entityManager = new EntityManager(theme);
    
    const builder = new MapBuilder()
      .setFieldWidth(30)
      .setFieldHeight(30)
      .setWidth(11)
      .setHeight(11)
      .setEntityFactory(this.entityManager.getEntityFactory());
    this.mapService = new MapService(builder);

    const currentField: GameField = this.mapService.getCurrentField();
    
    const playerPosition = this.entityManager.findRandomEmptyPosition(currentField) || { x: 1, y: 1 };
    const player = this.entityManager.createPlayer(playerPosition);
    currentField.tiles[playerPosition.y][playerPosition.x].entity = player;
    
    const enemies: Entity[] = this.spawnEnemies(currentField);
    
    this.state = {
      map: this.mapService.getMap(),
      currentField,
      player,
      enemies,
      gameOver: false,
      victory: false,
      turn: 0,
      theme,
      replicatingEntities: this.getReplicatingEntities(enemies)
    };
  }
  
  getState(): GameState {
    return this.state;
  }

  /**
   * Spawns enemies of different categories in the current field.
   */
  private spawnEnemies(field: GameField): Entity[] {
    const enemies = [
      ...this.entityManager.spawnEnemiesOfType(field, EnemyCategory.MELEE, 3),
      ...this.entityManager.spawnEnemiesOfType(field, EnemyCategory.RANGED, 2),
      ...this.entityManager.spawnEnemiesOfType(field, EnemyCategory.ELITE, 1),
      ...this.entityManager.spawnEnemiesOfType(field, EnemyCategory.REPLICATING, 1)
    ];

    // Assign behaviors and initial states to enemies
    enemies.forEach(enemy => {
      const behavior = this.entityManager.getBehaviorForEnemy();
      this.enemyBehaviors.set(enemy.id, behavior);
      this.originalBehaviors.set(enemy.id, behavior);  // Store original behavior
      this.enemyStates.set(enemy.id, new NormalState());
    });
    return enemies;
  }

  /**
   * Returns a list of replicating entities from the current enemies.
   */
  private getReplicatingEntities(enemies: Entity[]): string[] {
    const replicatingEnemies = enemies.filter(e => e.canReplicate);
    for (const enemy of replicatingEnemies) {
      const replicator = new ReplicatingEntity(enemy, enemy.replicationChance || 0.2, enemy.replicationCount || 20);
      this.replicatingEntities.set(enemy.id, replicator);
    }
    return replicatingEnemies.map(e => e.id);
  }

  
  movePlayer(direction: 'up' | 'down' | 'left' | 'right'): void {
    if (this.state.gameOver) return;
    
    const currentField = this.mapService.getCurrentField();
    const { x, y } = this.state.player.position;
    let newX = x;
    let newY = y;
    
    switch (direction) {
      case 'up':
        newY = y - 1;
        break;
      case 'down':
        newY = y + 1;
        break;
      case 'left':
        newX = x - 1;
        break;
      case 'right':
        newX = x + 1;
        break;
    }

    const validMove = this.mapService.isValidMoveOnField(newX, newY);
    const isExit = this.mapService.isExitTile(newX, newY);
    if (!validMove && !isExit) {
      return;
    }

    const targetTile = currentField.tiles[newY][newX];
    if (targetTile.entity && targetTile.entity.type === EntityType.ENEMY) {
      this.performAttack(this.state.player, targetTile.entity);
    } else {
      // Move player to the new position
      currentField.tiles[y][x].entity = null;
      if (isExit) {
        this.mapService.clearEntitiesOnCurrentField();
        this.mapService.moveToAdjacentField(direction);
        const newField = this.mapService.getCurrentField();

        this.state.enemies = this.spawnEnemies(newField);
        this.state.replicatingEntities = this.getReplicatingEntities(this.state.enemies);

        // Reset player position to the new field's entry point
        switch (targetTile.type) {
            case TileType.EXIT_UP:
              this.state.currentField = this.state.map.fields[Math.max(0, Math.floor(this.state.currentField.position.y - 1))][this.state.currentField.position.x];
              newX = this.state.player.position.x;
              newY = this.state.currentField.height - 2;
              break;
            case TileType.EXIT_DOWN:
              this.state.currentField = this.state.map.fields[Math.min(this.state.map.height - 1, Math.floor(this.state.currentField.position.y + 1))][this.state.currentField.position.x];
              newX = this.state.player.position.x;
              newY = 1;
              break;
            case TileType.EXIT_LEFT:
              this.state.currentField = this.state.map.fields[this.state.currentField.position.y][Math.max(0, Math.floor(this.state.currentField.position.x - 1))];
              newX = this.state.currentField.width - 2;
              newY = this.state.player.position.y;
              break;
            case TileType.EXIT_RIGHT:
              this.state.currentField = this.state.map.fields[this.state.currentField.position.y][Math.min(this.state.map.width - 1, Math.floor(this.state.currentField.position.x + 1))];
              newX = 1;
              newY = this.state.player.position.y;
              break;
          }

          this.state.player.position = { x: newX, y: newY };
          this.state.currentField.tiles[newY][newX].entity = this.state.player;

          this.processTurn();
          return;
      }

      this.state.player.position = { x: newX, y: newY };
      currentField.tiles[newY][newX].entity = this.state.player;
      this.processTurn();
    }
  }
  
  performAttack(attacker: Entity, defender: Entity): void {
    this.combat(attacker, defender);
    
    // Only process turn if the attacking entity is the player
    if (attacker.type === EntityType.PLAYER) {
      this.processTurn();
    }
  }
  
  confuseEnemyAt(position: Position, duration: number = 5): void {
    if (this.state.gameOver) return;
    
    const { x, y } = position;
    
    // Check map boundaries
    if (x < 0 || y < 0 || x >= this.state.currentField.width || y >= this.state.currentField.height) {
      return;
    }
    
    const tile = this.state.currentField.tiles[y][x];
    if (!tile.entity || tile.entity.type !== EntityType.ENEMY) {
      return; // No enemy at this position
    }
    
    const enemy = tile.entity;
    const originalBehavior = this.originalBehaviors.get(enemy.id);
    
    if (originalBehavior) {
      // Apply the confused behavior decorator
      const confusedBehavior = new ConfusedBehavior(originalBehavior, duration);
      this.enemyBehaviors.set(enemy.id, confusedBehavior);
      
      // Mark entity as confused for UI
      enemy.confused = true;
      enemy.confusionTurns = duration;
    }
    
    // Process turn after player's action
    this.processTurn();
  }
  
  processTurn(): void {
    if (this.state.gameOver) return;
    
    this.processEnemyTurns();
    this.processReplication();
    this.processConfusionEffects();
    this.regenerateEnemiesHealth();
    this.updateEnemyStates();
    this.state.turn++;
  }
  
  private processEnemyTurns(): void {
    this.state.enemies.forEach((enemy) => {
      // Skip dead enemies
      if (enemy.stats.health <= 0) return;
      
      // Get the behavior for this enemy
      const behavior = this.enemyBehaviors.get(enemy.id);
      const state = this.enemyStates.get(enemy.id);
      if (!behavior || !state) return;
      
      // Check if enemy is adjacent to player first (can attack)
      if (this.isAdjacentToPlayer(enemy.position)) {
        // Attack the player instead of moving
        this.combat(enemy, this.state.player);
        return; // Skip movement for this enemy
      }

      const originalBehavior = this.originalBehaviors.get(enemy.id);
      if (!originalBehavior) return;
      
      const newPosition = state.getNextPosition(enemy, this.state.player, this.state.currentField, originalBehavior);
      
      // If position changed, update the entity on the map
      if (newPosition.x !== enemy.position.x || newPosition.y !== enemy.position.y) {
        // Check if new position has the player
        if (newPosition.x === this.state.player.position.x && 
            newPosition.y === this.state.player.position.y) {
          this.combat(enemy, this.state.player);
        } else {
          // Update enemy position on the map
          this.state.currentField.tiles[enemy.position.y][enemy.position.x].entity = null;
          this.state.currentField.tiles[newPosition.y][newPosition.x].entity = enemy;
          enemy.position = newPosition;
        }
      }
    });
    
    // Filter out dead enemies
    this.state.enemies = this.state.enemies.filter(enemy => enemy.stats.health > 0);
  }
  
  /**
   * Check if a position is adjacent to the player
   */
  private isAdjacentToPlayer(position: Position): boolean {
    const { x, y } = position;
    const player = this.state.player;
    
    // Check if the position is orthogonally adjacent to the player
    return (
      (Math.abs(x - player.position.x) === 1 && y === player.position.y) ||
      (Math.abs(y - player.position.y) === 1 && x === player.position.x)
    );
  }
  
  private combat(attacker: Entity, defender: Entity): void {
    // Calculate damage
    const damage = Math.max(1, attacker.stats.attack - defender.stats.defense);
    // Apply damage
    defender.stats.health -= damage;
    
    // Check if defender is dead
    if (defender.stats.health <= 0) {
      defender.stats.health = 0;
      
      // Handle enemy death
      if (defender.type === EntityType.ENEMY) {
        // Remove enemy from the map
        this.state.currentField.tiles[defender.position.y][defender.position.x].entity = null;
        
        // Remove from replicating entities if applicable
        if (this.replicatingEntities.has(defender.id)) {
          this.replicatingEntities.delete(defender.id);
          this.state.replicatingEntities = this.state.replicatingEntities.filter(id => id !== defender.id);
        }
        
        // Grant experience to player if player was the attacker
        if (attacker.type === EntityType.PLAYER) {
          this.giveExperienceToPlayer(defender.stats.level * defender.experience);
        }
      }
      
      // Handle player death
      if (defender.type === EntityType.PLAYER) {
        this.state.gameOver = true;
      }
    }
  }
  
  private processReplication(): void {
    // Process replication for all replicating entities
    const newEntities: Entity[] = [];
    
    for (const [entityId, replicator] of this.replicatingEntities.entries()) {
      // Find the entity in the state
      const entity = this.state.enemies.find(e => e.id === entityId);
      if (!entity) continue;
      
      // Try to replicate
      const newEntity = replicator.tryReplicate(this.state.currentField);
      if (newEntity) {
        // Add to game state and map
        newEntities.push(newEntity);
        this.state.currentField.tiles[newEntity.position.y][newEntity.position.x].entity = newEntity;
        
        // Create a replicator for the new entity
        const newReplicator = new ReplicatingEntity(
          newEntity, 
          entity.replicationChance ? entity.replicationChance * 0.8 : 0.15,
          entity.replicationCount ? entity.replicationCount - 1 : 0,
        );
        this.replicatingEntities.set(newEntity.id, newReplicator);
        
        // Add to the state's replicating entities list
        this.state.replicatingEntities.push(newEntity.id);
        
        // Assign behavior and state
        const behavior = this.entityManager.getBehaviorForEnemy();
        this.enemyBehaviors.set(newEntity.id, behavior);
        this.originalBehaviors.set(newEntity.id, behavior);
        this.enemyStates.set(newEntity.id, new NormalState());
      }
    }
    
    // Add new entities to the game state
    if (newEntities.length > 0) {
      this.state.enemies = [...this.state.enemies, ...newEntities];
    }
  }
  
  private processConfusionEffects(): void {
    // Process confusion effects
    for (const enemy of this.state.enemies) {
      if (enemy.confused && enemy.confusionTurns !== undefined) {
        enemy.confusionTurns--;
        
        // If confusion has worn off, revert to original behavior
        if (enemy.confusionTurns <= 0) {
          const originalBehavior = this.originalBehaviors.get(enemy.id);
          if (originalBehavior) {
            this.enemyBehaviors.set(enemy.id, originalBehavior);
            enemy.confused = false;
            enemy.confusionTurns = 0;
          }
        }
      }
    }
  }
  
  private updateEnemyStates(): void {
    // Update enemy states based on current conditions
    for (const enemy of this.state.enemies) {
      const currentState = this.enemyStates.get(enemy.id);
      if (!currentState) continue;
      
      // Check for state transitions
      const newState = currentState.shouldTransition(enemy);
      if (newState) {
        this.enemyStates.set(enemy.id, newState);
      }
    }
  }
  
  private regenerateEnemiesHealth(): void {
    for (const enemy of this.state.enemies) {
      // Skip dead enemies
      if (enemy.stats.health <= 0) continue;
      
      // Regenerate a small amount of health each turn (1% of max health)
      const regenAmount = Math.max(1, Math.floor(enemy.stats.maxHealth * 0.01));
      enemy.stats.health = Math.min(enemy.stats.health + regenAmount, enemy.stats.maxHealth);
    }
  }
  
  private giveExperienceToPlayer(amount: number): void {
    this.state.player.stats.experience += amount;
    
    // Check if player leveled up
    if (this.state.player.stats.experience >= this.state.player.stats.experienceToNextLevel) {
      this.levelUpPlayer();
    }
  }
  
  private levelUpPlayer(): void {
    const player = this.state.player;
    player.stats.level += 1;
    
    // Reset experience and increase next level threshold
    player.stats.experience = player.stats.experience - player.stats.experienceToNextLevel;
    player.stats.experienceToNextLevel = Math.floor(player.stats.experienceToNextLevel * 1.5);
    
    // Improve stats
    player.stats.maxHealth += 10;
    player.stats.health = player.stats.maxHealth;
    player.stats.attack += 2;
    player.stats.defense += 1;
  }
}
