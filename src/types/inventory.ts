export enum ItemType {
  Sword = 'Sword',
  Armor = 'Armor',
  Ring = 'Ring',
}

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  modifier: number; // Represents attack for Sword, defense for Armor, etc.
  description: string;
  dropChance: number; // Base chance of the item dropping
  durability: number; // How many battles the item can withstand
}

export interface EquipmentSlot {
  [ItemType.Sword]?: Item;
  [ItemType.Armor]?: Item;  
  [ItemType.Ring]?: Item;
}

export interface Inventory {
  items: Item[];
  equipped: EquipmentSlot;
} 