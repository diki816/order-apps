import React from 'react';
import './OrderList.css';

function OrderList({ orders, onUpdateStatus }) {
  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return '주문 접수';
      case 'inProgress':
        return '제조 중';
      case 'completed':
        return '제조 완료';
      default:
        return status;
    }
  };

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getItemSummary = (items) => {
    const firstItem = items[0];
    let summary = `${firstItem.name} x ${firstItem.quantity}`;
    if (items.length > 1) {
      summary += ` 외 ${items.length - 1}건`;
    }
    return summary;
  };

  return (
    <div className="order-list-container">
      <h2>주문 현황</h2>
      <div className="order-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-info">
              <span className="order-time">{formatDateTime(order.createdAt)}</span>
              <span className="order-items">{getItemSummary(order.items)}</span>
              <span className="order-price">{order.totalPrice.toLocaleString()}원</span>
              <span className="order-status">{getStatusText(order.status)}</span>
            </div>
            <div className="order-actions">
              {order.status === 'pending' && (
                <button className="action-btn" onClick={() => onUpdateStatus(order.id, 'inProgress')}>
                  제조 시작
                </button>
              )}
               {order.status === 'inProgress' && (
                <button className="action-btn" onClick={() => onUpdateStatus(order.id, 'completed')}>
                  제조 완료
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrderList;
