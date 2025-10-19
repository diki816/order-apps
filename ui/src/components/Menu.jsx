import React, { useState, useEffect } from 'react';
import MenuItemCard from './MenuItemCard';
import './Menu.css';

function Menu({ onAddToCart }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch('https://cozy-backend-ksq3.onrender.com/api/menu');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setMenuItems(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  if (loading) return <p>메뉴를 불러오는 중...</p>;
  if (error) return <p>오류가 발생했습니다: {error}</p>;

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
