import React, { useState } from 'react';
import Header from './components/Header';
import Menu from './components/Menu';
import Cart from './components/Cart';
import './App.css';

function App() {
  const [cartItems, setCartItems] = useState([]);

  const handleAddToCart = (item, selectedOptions) => {
    // A unique ID for a cart item is a combination of the item's ID and the selected options' IDs
    const optionsId = selectedOptions.map(o => o.id).sort().join('-');
    const cartItemId = `${item.id}-${optionsId}`;

    setCartItems(prevCartItems => {
      const existingItem = prevCartItems.find(i => i.id === cartItemId);

      if (existingItem) {
        // If item with same options exists, increase quantity
        return prevCartItems.map(i =>
          i.id === cartItemId ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        // Otherwise, add new item to cart
        const newItem = {
          id: cartItemId,
          menuItemId: item.id,
          name: item.name,
          basePrice: item.price,
          selectedOptions: selectedOptions,
          quantity: 1,
        };
        return [...prevCartItems, newItem];
      }
    });
    
    // Optional: Show a toast or confirmation message
    console.log(`${item.name}을(를) 장바구니에 담았습니다.`);
  };

  return (
    <div className="app">
      <Header />
      <main>
        <Menu onAddToCart={handleAddToCart} />
      </main>
      <Cart cartItems={cartItems} />
    </div>
  );
}

export default App;