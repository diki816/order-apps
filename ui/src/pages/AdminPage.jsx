import React, { useState, useEffect } from 'react';
import Dashboard from '../components/admin/Dashboard';
import Inventory from '../components/admin/Inventory';
import OrderList from '../components/admin/OrderList';
import { adminStats as initialStats, inventoryItems as initialInventory, orders as initialOrders } from '../mockData';
import './AdminPage.css';

function AdminPage() {
  const [stats, setStats] = useState(initialStats);
  const [inventory, setInventory] = useState(initialInventory);
  const [orders, setOrders] = useState(initialOrders);

  // This effect recalculates stats when orders change.
  useEffect(() => {
    const pendingCount = orders.filter(o => o.status === 'pending').length;
    const inProgressCount = orders.filter(o => o.status === 'inProgress').length;
    const completedCount = orders.filter(o => o.status === 'completed').length;
    
    setStats({
      totalOrders: orders.length,
      accepted: pendingCount,
      inProgress: inProgressCount,
      completed: completedCount,
    });
  }, [orders]);


  const handleStockChange = (itemId, newQuantity) => {
    if (newQuantity < 0) return; // Prevent negative stock
    setInventory(prevInventory =>
      prevInventory.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const handleUpdateStatus = (orderId, newStatus) => {
    setOrders(prevOrders =>
      prevOrders.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  return (
    <div className="admin-page">
      <Dashboard stats={stats} />
      <Inventory items={inventory} onStockChange={handleStockChange} />
      <OrderList orders={orders} onUpdateStatus={handleUpdateStatus} />
    </div>
  );
}

export default AdminPage;