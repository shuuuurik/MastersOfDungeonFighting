import { Entity, GameField } from '../../types/game';

/**
 * Interface for objects that can clone themselves
 */
export interface EntityPrototype {
  clone(): Entity;
  tryReplicate(gameField: GameField): Entity | null;
}
