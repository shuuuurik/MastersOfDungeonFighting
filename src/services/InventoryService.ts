import { Entity } from '../types/game';
import { Inventory, Item, ItemType } from '../types/inventory';

export class InventoryService {
  static initializeInventory(): Inventory {
    return {
      items: [],
      equipped: {},
    };
  }

  static addItem(inventory: Inventory, item: Item): Inventory {
    return {
      ...inventory,
      items: [...inventory.items, item],
    };
  }

  static equipItem(player: Entity, item: Item): Entity {
    if (!player.inventory) {
      return player;
    }

    let newPlayer = { ...player, inventory: { ...player.inventory! } };

    // Unequip any existing item in the same slot
    const currentItem = newPlayer.inventory.equipped[item.type];
    if (currentItem) {
      newPlayer = this.unequipItem(newPlayer, currentItem) as any;
    }
    
    const inventory = newPlayer.inventory!;

    // Remove item from inventory and place in equipped slot
    const itemIndex = inventory.items.findIndex(i => i.id === item.id);
    if (itemIndex > -1) {
      const newItems = inventory.items.filter(i => i.id !== item.id);
      
      const newEquipped = { ...inventory.equipped, [item.type]: item };

      newPlayer.inventory = {
        ...inventory,
        items: newItems,
        equipped: newEquipped,
      };

      // Apply stat modifiers
      newPlayer.stats = { ...newPlayer.stats };
      if (item.type === ItemType.Sword) {
        newPlayer.stats.attack += item.modifier;
      } else if (item.type === ItemType.Armor) {
        newPlayer.stats.defense += item.modifier;
      } else if (item.type === ItemType.Ring) {
        newPlayer.stats.maxHealth += item.modifier;
        newPlayer.stats.health += item.modifier;
      }
    }
    
    return newPlayer;
  }

  static unequipItem(player: Entity, item: Item): Entity {
    if (!player.inventory || !player.inventory.equipped[item.type]) {
        return player;
    }

    const newPlayer = { ...player, inventory: { ...player.inventory! } };
    const inventory = newPlayer.inventory!;
    
    // Remove from equipped and add back to items
    const equipped = { ...inventory.equipped };
    delete equipped[item.type];

    newPlayer.inventory = {
      ...inventory,
      items: [...inventory.items, item],
      equipped,
    };

    // Revert stat modifiers
    newPlayer.stats = { ...newPlayer.stats };
    if (item.type === ItemType.Sword) {
      newPlayer.stats.attack -= item.modifier;
    } else if (item.type === ItemType.Armor) {
      newPlayer.stats.defense -= item.modifier;
    } else if (item.type === ItemType.Ring) {
      newPlayer.stats.maxHealth -= item.modifier;
      newPlayer.stats.health = Math.min(newPlayer.stats.health, newPlayer.stats.maxHealth);
    }

    return newPlayer;
  }

  static destroyEquippedItem(player: Entity, itemType: ItemType): Entity {
    if (!player.inventory || !player.inventory.equipped[itemType]) {
      return player;
    }

    const newPlayer = { ...player, inventory: { ...player.inventory! } };
    const inventory = newPlayer.inventory!;
    const item = inventory.equipped[itemType]!;

    // Remove from equipped
    const equipped = { ...inventory.equipped };
    delete equipped[itemType];

    newPlayer.inventory = {
      ...inventory,
      equipped,
    };

    // Revert stat modifiers
    newPlayer.stats = { ...newPlayer.stats };
    if (item.type === ItemType.Sword) {
      newPlayer.stats.attack -= item.modifier;
    } else if (item.type === ItemType.Armor) {
      newPlayer.stats.defense -= item.modifier;
    } else if (item.type === ItemType.Ring) {
      newPlayer.stats.maxHealth -= item.modifier;
      newPlayer.stats.health = Math.min(newPlayer.stats.health, newPlayer.stats.maxHealth);
    }

    return newPlayer;
  }
} 