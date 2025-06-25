import { Item, ItemType } from '../../types/inventory';
import { v4 as uuidv4 } from 'uuid';

export class ItemFactory {
  static createRandomItem(): Item {
    const itemTypes = Object.values(ItemType);
    const randomType = itemTypes[Math.floor(Math.random() * itemTypes.length)];

    switch (randomType) {
      case ItemType.Sword:
        return {
          id: uuidv4(),
          name: 'KATANA ZERO',
          type: ItemType.Sword,
          modifier: 100,
          description: 'Он ничего не помнит',
        };
      case ItemType.Sword:
        return {
          id: uuidv4(),
          name: 'BURIZA',
          type: ItemType.Sword,
          modifier: 52,
          description: 'DE CAYON',
        };
      case ItemType.Armor:
        return {
          id: uuidv4(),
          name: 'GUCCI PALTO',
          type: ItemType.Armor,
          modifier: 23,
          description: '12',
        };
      case ItemType.Ring:
        return {
          id: uuidv4(),
          name: 'Ring of SAMARA',
          type: ItemType.Ring,
          modifier: 14,
          description: 'Ring from SAMARA',
        };
    }
  }
} 