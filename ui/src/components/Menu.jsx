import React from 'react';
import MenuItemCard from './MenuItemCard';
import { menuItems } from '../mockData';
import './Menu.css';

function Menu({ onAddToCart }) {
  return (
    <div className="menu-container">
      <h2>메뉴</h2>
      <div className="menu-grid">
        {menuItems.map((item) => (
          <MenuItemCard key={item.id} item={item} onAddToCart={onAddToCart} />
        ))}
      </div>
    </div>
  );
}

export default Menu;
