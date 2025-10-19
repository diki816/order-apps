import React from 'react';
import './Cart.css';

function Cart({ cartItems, onPlaceOrder }) {
  const calculateLinePrice = (item) => {
    const optionsPrice = item.selectedOptions.reduce((sum, option) => sum + option.priceDelta, 0);
    return (item.basePrice + optionsPrice) * item.quantity;
  };

  const subtotal = cartItems.reduce((sum, item) => sum + calculateLinePrice(item), 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const getOptionsString = (options) => {
    if (!options || options.length === 0) return '';
    return `(${options.map(o => o.name).join(', ')})`;
  };

  return (
    <div className="cart-container">
      <h2>장바구니</h2>
      {cartItems.length === 0 ? (
        <p>장바구니가 비어있습니다.</p>
      ) : (
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <span className="item-name">
                {item.name} {getOptionsString(item.selectedOptions)} x {item.quantity}
              </span>
              <span className="item-price">{calculateLinePrice(item).toLocaleString()}원</span>
            </div>
          ))}
        </div>
      )}
      {cartItems.length > 0 && (
        <div className="cart-summary">
          <div className="summary-row">
            <span>총 금액</span>
            <span>{subtotal.toLocaleString()}원</span>
          </div>
          <div className="summary-row">
            <span>세금 (10%)</span>
            <span>{tax.toLocaleString()}원</span>
          </div>
          <div className="summary-row total">
            <span>최종 결제 금액</span>
            <span>{total.toLocaleString()}원</span>
          </div>
          <button className="order-btn" onClick={onPlaceOrder}>주문하기</button>
        </div>
      )}
    </div>
  );
}

export default Cart;
