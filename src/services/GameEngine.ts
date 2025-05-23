import { Entity, EntityType, GameMap, GameState, Position } from '../types/game';
import { MapGenerator } from './MapGenerator';
import { EntityManager } from './EntityManager';
import { BehaviorStrategy } from '../patterns/strategy/BehaviorStrategy';

export class GameEngine {
  private mapGenerator: MapGenerator;
  private entityManager: EntityManager;
  private state: GameState;
  private enemyBehaviors: Map<string, BehaviorStrategy> = new Map();
  
  constructor() {
    this.mapGenerator = new MapGenerator();
    this.entityManager = new EntityManager();
    
    // Initialize with default state
    const map = this.mapGenerator.generateMap(20, 15);
    const playerPosition = this.mapGenerator.findRandomEmptyPosition(map) || { x: 1, y: 1 };
    const player = this.entityManager.createPlayer(playerPosition);
    map.tiles[playerPosition.y][playerPosition.x].entity = player;
    
    const enemies = this.entityManager.spawnEnemies(map, 5);
    
    // Assign random behaviors to enemies
    enemies.forEach(enemy => {
      this.enemyBehaviors.set(enemy.id, this.entityManager.getBehaviorForEnemy());
    });
    
    this.state = {
      map,
      player,
      enemies,
      gameOver: false,
      victory: false,
      turn: 0
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
      const targetTile = this.state.map.tiles[newY][newX];
      
      // Check if there's an enemy at the target position
      if (targetTile.entity && targetTile.entity.type === EntityType.ENEMY) {
        this.combat(this.state.player, targetTile.entity);
      } else {
        // Move player to new position
        this.state.map.tiles[y][x].entity = null;
        this.state.player.position = { x: newX, y: newY };
        this.state.map.tiles[newY][newX].entity = this.state.player;
        
        // Check if player reached the exit
        if (targetTile.type === 'EXIT') {
          this.state.victory = true;
          this.state.gameOver = true;
        }
      }
      
      // Process enemy turns after player's move
      this.processEnemyTurns();
      
      // Increment turn counter
      this.state.turn++;
    }
  }
  
  private isValidMove(x: number, y: number): boolean {
    // Check map boundaries
    if (x < 0 || y < 0 || x >= this.state.map.width || y >= this.state.map.height) {
      return false;
    }
    
    // Check if tile is walkable (not a wall)
    const tile = this.state.map.tiles[y][x];
    return tile.type !== 'WALL';
  }
  
  private processEnemyTurns(): void {
    this.state.enemies.forEach((enemy) => {
      // Skip dead enemies
      if (enemy.stats.health <= 0) return;
      
      // Get the behavior for this enemy
      const behavior = this.enemyBehaviors.get(enemy.id);
      if (!behavior) return;
      
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
          this.state.map.tiles[enemy.position.y][enemy.position.x].entity = null;
          this.state.map.tiles[newPosition.y][newPosition.x].entity = enemy;
          enemy.position = newPosition;
        }
      }
    });
    
    // Filter out dead enemies
    this.state.enemies = this.state.enemies.filter(enemy => enemy.stats.health > 0);
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
        this.state.map.tiles[defender.position.y][defender.position.x].entity = null;
        
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
