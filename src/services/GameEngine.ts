import { 
    EnemyCategory,
  Entity, EntityType, GameField, GameMap, GameState, GameTheme, Position 
} from '../types/game';
import { MapBuilder } from '../patterns/builder/MapBuilder';
import { EntityManager } from './EntityManager';
import { BehaviorStrategy } from '../patterns/strategy/BehaviorStrategy';
import { ConfusedBehavior } from '../patterns/decorator/BehaviorDecorator';
import { ReplicatingEntity } from '../patterns/prototype/EntityPrototype';
import { EnemyState, NormalState } from '../patterns/state/EnemyState';

export class GameEngine {
  private mapBuilder: MapBuilder;
  private entityManager: EntityManager;
  private state: GameState;
  private enemyBehaviors: Map<string, BehaviorStrategy> = new Map();
  private enemyStates: Map<string, EnemyState> = new Map();
  private originalBehaviors: Map<string, BehaviorStrategy> = new Map();
  private replicatingEntities: Map<string, ReplicatingEntity> = new Map();
  
  constructor(theme: GameTheme = GameTheme.FANTASY) {
    this.mapBuilder = new MapBuilder();
    this.entityManager = new EntityManager(theme);
    
    // Initialize with default state
    const map : GameMap = this.mapBuilder
      .setFieldWidth(30)
      .setFieldHeight(30)
      .setWidth(11)
      .setHeight(11)
      .setEntityFactory(this.entityManager.getEntityFactory())
      .build();

    const currentField : GameField = map.fields[Math.floor(map.height / 2)][Math.floor(map.width / 2)];
    
    const playerPosition = this.entityManager.findRandomEmptyPosition(currentField) || { x: 1, y: 1 };
    const player = this.entityManager.createPlayer(playerPosition);
    currentField.tiles[playerPosition.y][playerPosition.x].entity = player;
    
    // Spawn different kinds of enemies
    const enemies = [
      ...this.entityManager.spawnEnemiesOfType(currentField, EnemyCategory.MELEE, 3),
      ...this.entityManager.spawnEnemiesOfType(currentField, EnemyCategory.RANGED, 2),
      ...this.entityManager.spawnEnemiesOfType(currentField, EnemyCategory.ELITE, 1),
      ...this.entityManager.spawnEnemiesOfType(currentField, EnemyCategory.REPLICATING, 1)
    ];
    
    // Setup replicating entities
    const replicatingEnemies = enemies.filter(e => e.canReplicate);
    for (const enemy of replicatingEnemies) {
      const replicator = new ReplicatingEntity(enemy, enemy.replicationChance || 0.2);
      this.replicatingEntities.set(enemy.id, replicator);
    }
    
    // Assign behaviors and initial states to enemies
    enemies.forEach(enemy => {
      const behavior = this.entityManager.getBehaviorForEnemy();
      this.enemyBehaviors.set(enemy.id, behavior);
      this.originalBehaviors.set(enemy.id, behavior);  // Store original behavior
      this.enemyStates.set(enemy.id, new NormalState());
    });
    
    this.state = {
      map,
      currentField,
      player,
      enemies,
      gameOver: false,
      victory: false,
      turn: 0,
      theme,
      replicatingEntities: replicatingEnemies.map(e => e.id)
    };
  }
  
  getState(): GameState {
    return this.state;
  }
  
  movePlayer(direction: 'up' | 'down' | 'left' | 'right'): void {
    if (this.state.gameOver) return;
    
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
    
    // Check if move is valid
    if (this.isValidMove(newX, newY)) {
      const targetTile = this.state.currentField.tiles[newY][newX];
      
      // Check if there's an enemy at the target position
      if (targetTile.entity && targetTile.entity.type === EntityType.ENEMY) {
        this.performAttack(this.state.player, targetTile.entity);
      } else {
        // Move player to new position
        this.state.currentField.tiles[y][x].entity = null;
        this.state.player.position = { x: newX, y: newY };
        this.state.currentField.tiles[newY][newX].entity = this.state.player;
        
        // Check if player reached the exit
        if (targetTile.type === 'EXIT') {
          this.state.victory = true;
          this.state.gameOver = true;
        }
      }
      
      // Process turn after player's move
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
    
    // Process enemy turns
    this.processEnemyTurns();
    
    // Handle replicating entities
    this.processReplication();
    
    // Decrement confusion durations
    this.processConfusionEffects();
    
    // Update enemy states
    this.updateEnemyStates();
    
    // Increment turn counter
    this.state.turn++;
  }
  
  private isValidMove(x: number, y: number): boolean {
    // Check map boundaries
    if (x < 0 || y < 0 || x >= this.state.currentField.width || y >= this.state.currentField.height) {
      return false;
    }
    
    // Check if tile is walkable (not a wall)
    const tile = this.state.currentField.tiles[y][x];
    return tile.type !== 'WALL' && tile.type !== 'RIVER' && tile.type !== 'MOUNTAIN';
  }
  
  private processEnemyTurns(): void {
    this.state.enemies.forEach((enemy) => {
      // Skip dead enemies
      if (enemy.stats.health <= 0) return;
      
      // Get the behavior for this enemy
      const behavior = this.enemyBehaviors.get(enemy.id);
      if (!behavior) return;
      
      // Check if enemy is adjacent to player first (can attack)
      if (this.isAdjacentToPlayer(enemy.position)) {
        // Attack the player instead of moving
        this.combat(enemy, this.state.player);
        return; // Skip movement for this enemy
      }
      
      // Calculate new position based on behavior
      const newPosition = behavior.execute(enemy, this.state.player, this.state.map);
      
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
          this.giveExperienceToPlayer(defender.stats.level * 10);
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
      const newEntity = replicator.tryReplicate(this.state.map);
      if (newEntity) {
        // Add to game state and map
        newEntities.push(newEntity);
        this.state.currentField.tiles[newEntity.position.y][newEntity.position.x].entity = newEntity;
        
        // Create a replicator for the new entity
        const newReplicator = new ReplicatingEntity(
          newEntity, 
          entity.replicationChance ? entity.replicationChance * 0.8 : 0.15
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
  
  private giveExperienceToPlayer(amount: number): void {
    this.state.player.stats.experience += amount;
    
    // Check if player leveled up
    if (this.state.player.stats.experience >= this.state.player.stats.experienceToNextLevel) {
      this.levelUpPlayer();
    }
  }
  
  private levelUpPlayer(): void {
    const player = this.state.player;
    
    // Increase level
    player.stats.level += 1;
    
    // Reset experience and increase next level threshold
    player.stats.experience = 0;
    player.stats.experienceToNextLevel = Math.floor(player.stats.experienceToNextLevel * 1.5);
    
    // Improve stats
    player.stats.maxHealth += 10;
    player.stats.health = player.stats.maxHealth;
    player.stats.attack += 2;
    player.stats.defense += 1;
  }
}
