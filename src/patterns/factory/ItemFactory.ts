import { Item, ItemType } from '../../types/inventory';
import { v4 as uuidv4 } from 'uuid';

const a = 1 / 25;

const allItems: Item[] = [
  // Swords
  {
    id: uuidv4(),
    name: 'Short Sword',
    type: ItemType.Sword,
    modifier: 5,
    description: 'A basic short sword.',
    dropChance: a,
    durability: 10,
  },
  {
    id: uuidv4(),
    name: 'KATANA ZERO',
    type: ItemType.Sword,
    modifier: 100,
    description: 'Он ничего не помнит',
    dropChance: a / 5,
    durability: 1,
  },
  {
    id: uuidv4(),
    name: 'BURIZA',
    type: ItemType.Sword,
    modifier: 52,
    description: 'DE CAYON',
    dropChance: a / 2,
    durability: 2,
  },
  // Armors
  {
    id: uuidv4(),
    name: 'Dungeon Master Suite',
    type: ItemType.Armor,
    modifier: 5,
    description: 'Simple leather armor.',
    dropChance: a,
    durability: 15,
  },
  {
    id: uuidv4(),
    name: 'GUCCI PALTO',
    type: ItemType.Armor,
    modifier: 23,
    description: '12',
    dropChance: a / 3,
    durability: 8,
  },
  // Rings
  {
    id: uuidv4(),
    name: 'Ring of Strength',
    type: ItemType.Ring,
    modifier: 3,
    description: 'A ring that grants minor strength.',
    dropChance: a,
    durability: 20,
  },
  {
    id: uuidv4(),
    name: 'Ring of SAMARA',
    type: ItemType.Ring,
    modifier: 54,
    description: 'Ring from SAMARA',
    dropChance: a / 4,
    durability: 12,
  },
];

export class ItemFactory {
  static createRandomItem(): Item {
    const randomIndex = Math.floor(Math.random() * allItems.length);
    const itemToClone = allItems[randomIndex];

    return { ...itemToClone, id: uuidv4() };
  }

  static getItemsByType(type: ItemType): Item[] {
    return allItems.filter(item => item.type === type);
  }
} 