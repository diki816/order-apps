import React, { useState } from 'react';
import Menu from '../components/Menu';
import Cart from '../components/Cart';

function OrderPage() {
  const [cartItems, setCartItems] = useState([]);

  const handleAddToCart = (item, selectedOptions) => {
    const optionsId = selectedOptions.map(o => o.id).sort().join('-');
    const cartItemId = `${item.id}-${optionsId}`;

    setCartItems(prevCartItems => {
      const existingItem = prevCartItems.find(i => i.id === cartItemId);

      if (existingItem) {
        return prevCartItems.map(i =>
          i.id === cartItemId ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
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
    
    console.log(`${item.name}을(를) 장바구니에 담았습니다.`);
  };

  return (
    <>
      <main>
        <Menu onAddToCart={handleAddToCart} />
      </main>
      <Cart cartItems={cartItems} />
    </>
  );
}

export default OrderPage;
