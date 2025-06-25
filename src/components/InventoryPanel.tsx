import React from 'react';
import { Inventory, Item } from '../types/inventory';
import '../styles/InventoryPanel.css';

interface InventoryPanelProps {
  inventory: Inventory;
  equipItem: (item: Item) => void;
}

const InventoryPanel: React.FC<InventoryPanelProps> = ({ inventory, equipItem }) => {
  return (
    <div className="inventory-panel">
      <div className="equipped-items">
        <h3>Equipped</h3>
        <div className="stat-row">
          <span>Sword: {inventory.equipped.Sword?.name || 'None'}</span>
          <span>
            (+{inventory.equipped.Sword?.modifier || 0})
            {inventory.equipped.Sword && ` [${inventory.equipped.Sword.durability}]`}
          </span>
        </div>
        <div className="stat-row">
          <span>Armor: {inventory.equipped.Armor?.name || 'None'}</span>
          <span>
            (+A{inventory.equipped.Armor?.modifier || 0})
            {inventory.equipped.Armor && ` [${inventory.equipped.Armor.durability}]`}
          </span>
        </div>
        <div className="stat-row">
          <span>Ring: {inventory.equipped.Ring?.name || 'None'}</span>
          <span>
            (+{inventory.equipped.Ring?.modifier || 0})
            {inventory.equipped.Ring && ` [${inventory.equipped.Ring.durability}]`}
          </span>
        </div>
      </div>
      <h3>Inventory</h3>
      <div className="inventory-list">
        <ul>
          {inventory.items.map(item => (
            <li key={item.id}>
              <span className="item-name">{item.name}</span>
              <button onClick={() => equipItem(item)}>Equip</button>
            </li>
          ))}
          {inventory.items.length === 0 && <li className="empty-inventory">Empty</li>}
        </ul>
      </div>
    </div>
  );
};

export default InventoryPanel; 