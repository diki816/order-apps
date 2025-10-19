import React from 'react';
import './Dashboard.css';

function Dashboard({ stats }) {
  return (
    <div className="dashboard-container">
      <h2>관리자 대시보드</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h4>총 주문</h4>
          <p>{stats.totalOrders}</p>
        </div>
        <div className="stat-card">
          <h4>주문 접수</h4>
          <p>{stats.pending}</p>
        </div>
        <div className="stat-card">
          <h4>제조 중</h4>
          <p>{stats.inProgress}</p>
        </div>
        <div className="stat-card">
          <h4>제조 완료</h4>
          <p>{stats.completed}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
