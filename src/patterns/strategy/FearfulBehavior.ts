import { Entity, GameField, Position } from '../../types/game';
import { BehaviorStrategy } from './BehaviorStrategy';

export class FearfulBehavior extends BehaviorStrategy {
  execute(entity: Entity, player: Entity, gameField: GameField): Position {
    // Move away from the player
    const { x: entityX, y: entityY } = entity.position;
    const { x: playerX, y: playerY } = player.position;
    
    // If player is within certain distance, run away
    const distanceToPlayer = Math.sqrt(
      Math.pow(playerX - entityX, 2) + Math.pow(playerY - entityY, 2)
    );
    
    if (distanceToPlayer <= 5) {
      // Move in the opposite direction from player
      const dx = Math.sign(entityX - playerX);
      const dy = Math.sign(entityY - playerY);
      
      // Try to move in x or y direction, prioritizing the larger distance
      if (Math.abs(playerX - entityX) > Math.abs(playerY - entityY)) {
        const newX = entityX + dx;
        if (BehaviorStrategy.isValidMove(newX, entityY, gameField)) {
          return { x: newX, y: entityY };
        }
      } else {
        const newY = entityY + dy;
        if (BehaviorStrategy.isValidMove(entityX, newY, gameField)) {
          return { x: entityX, y: newY };
        }
      }
      
      // Try the other direction if first failed
      if (dx !== 0) {
        const newX = entityX + dx;
        if (BehaviorStrategy.isValidMove(newX, entityY, gameField)) {
          return { x: newX, y: entityY };
        }
      }
      
      if (dy !== 0) {
        const newY = entityY + dy;
        if (BehaviorStrategy.isValidMove(entityX, newY, gameField)) {
          return { x: entityX, y: newY };
        }
      }
    }
    
    // Stay in place if no valid move or player is too far
    return { ...entity.position };
  }
}
