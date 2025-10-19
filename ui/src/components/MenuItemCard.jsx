import React, { useState } from 'react';
import './MenuItemCard.css';

function MenuItemCard({ item, onAddToCart }) {
  const [selectedOptions, setSelectedOptions] = useState([]);

  const handleOptionChange = (option) => {
    setSelectedOptions((prev) =>
      prev.some(o => o.id === option.id)
        ? prev.filter((o) => o.id !== option.id)
        : [...prev, option]
    );
  };

  const handleAddToCart = () => {
    onAddToCart(item, selectedOptions);
    // Reset options after adding to cart if desired
    // setSelectedOptions([]); 
  };

  return (
    <div className="menu-item-card">
      <img src={item.imageUrl} alt={item.name} className="menu-item-image" />
      <h3>{item.name}</h3>
      <p className="menu-item-price">{item.price.toLocaleString()}원</p>
      <p className="menu-item-description">{item.description}</p>
      <div className="menu-item-options">
        {item.options.map((option) => (
          <div key={option.id}>
            <input
              type="checkbox"
              id={`option-${item.id}-${option.id}`}
              onChange={() => handleOptionChange(option)}
            />
            <label htmlFor={`option-${item.id}-${option.id}`}>
              {option.name} (+{option.priceDelta.toLocaleString()}원)
            </label>
          </div>
        ))}
      </div>
      <button className="add-to-cart-btn" onClick={handleAddToCart}>
        담기
      </button>
    </div>
  );
}

export default MenuItemCard;
