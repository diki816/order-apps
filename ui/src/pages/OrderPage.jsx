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

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert('장바구니가 비어있습니다.');
      return;
    }

    const calculateLinePrice = (item) => {
        const optionsPrice = item.selectedOptions.reduce((sum, option) => sum + option.priceDelta, 0);
        return (item.basePrice + optionsPrice) * item.quantity;
    };
    const subtotal = cartItems.reduce((sum, item) => sum + calculateLinePrice(item), 0);
    const total = subtotal * 1.1; // Assuming 10% tax

    const orderData = {
      items: cartItems.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        options: item.selectedOptions.map(o => o.id),
      })),
      totalPrice: total,
    };

    try {
      const response = await fetch('https://cozy-backend-ksq3.onrender.com/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Order submission failed');
      }

      const result = await response.json();
      alert(`주문이 성공적으로 완료되었습니다. 주문 번호: ${result.orderId}`);
      setCartItems([]); // Clear the cart
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('주문 처리 중 오류가 발생했습니다.');
    }
  };


  return (
    <>
      <main>
        <Menu onAddToCart={handleAddToCart} />
      </main>
      <Cart cartItems={cartItems} onPlaceOrder={handlePlaceOrder} />
    </>
  );
}

export default OrderPage;
