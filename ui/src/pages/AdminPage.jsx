import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from '../components/admin/Dashboard';
import Inventory from '../components/admin/Inventory';
import OrderList from '../components/admin/OrderList';
import './AdminPage.css';

function AdminPage() {
  const [stats, setStats] = useState({ totalOrders: 0, pending: 0, inProgress: 0, completed: 0 });
  const [inventory, setInventory] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAdminData = useCallback(async () => {
    try {
      const [statsRes, inventoryRes, ordersRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/inventory'),
        fetch('/api/admin/orders'),
      ]);

      if (!statsRes.ok || !inventoryRes.ok || !ordersRes.ok) {
        throw new Error('Failed to fetch admin data');
      }

      const statsData = await statsRes.json();
      const inventoryData = await inventoryRes.json();
      const ordersData = await ordersRes.json();

      setStats(statsData);
      setInventory(inventoryData);
      setOrders(ordersData);
    } catch (err) {
      setError(err.message);
    }
  }, []);

  useEffect(() => {
    const initialFetch = async () => {
      setLoading(true);
      await fetchAdminData();
      setLoading(false);
    };

    initialFetch(); // Initial load with loading indicator

    const intervalId = setInterval(fetchAdminData, 5000); // Background polling

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [fetchAdminData]);

  const handleStockChange = async (itemId, newQuantity) => {
    if (newQuantity < 0) return;
    try {
      const response = await fetch(`/api/admin/inventory/${itemId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ quantity: newQuantity }),
        }
      );
      if (!response.ok) throw new Error('Failed to update stock');
      // Refresh data to show the change
      fetchAdminData();
    } catch (err) {
      console.error('Stock update error:', err);
      alert('재고 업데이트에 실패했습니다.');
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update order status');
      }
      // Refresh data to show the change
      fetchAdminData();
    } catch (err) {
      console.error('Order status update error:', err);
      alert(`주문 상태 업데이트 실패: ${err.message}`);
    }
  };

  if (loading) return <p>관리자 데이터를 불러오는 중...</p>;
  if (error) return <p>오류가 발생했습니다: {error}</p>;

  return (
    <div className="admin-page">
      <Dashboard stats={stats} />
      <Inventory items={inventory} onStockChange={handleStockChange} />
      <OrderList orders={orders} onUpdateStatus={handleUpdateStatus} />
    </div>
  );
}

export default AdminPage;