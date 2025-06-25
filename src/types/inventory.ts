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