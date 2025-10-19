import React from 'react';
import './Inventory.css';

function Inventory({ items, onStockChange }) {
  const getStatus = (quantity) => {
    if (quantity === 0) {
      return <span className="status sold-out">품절</span>;
    }
    if (quantity < 5) {
      return <span className="status warning">주의</span>;
    }
    return <span className="status normal">정상</span>;
  };

  return (
    <div className="inventory-container">
      <h2>재고 현황</h2>
      <div className="inventory-grid">
        {items.map((item) => (
          <div key={item.id} className="inventory-card">
            <h4>{item.name}</h4>
            <p className="quantity">{item.quantity}개</p>
            <div className="status-badge">{getStatus(item.quantity)}</div>
            <div className="stock-controls">
              <button onClick={() => onStockChange(item.id, item.quantity - 1)} disabled={item.quantity <= 0}>-</button>
              <button onClick={() => onStockChange(item.id, item.quantity + 1)}>+</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Inventory;
