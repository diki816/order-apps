import React from 'react';
import { NavLink } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="logo">COZY</div>
      <nav>
        <NavLink to="/" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>
          주문하기
        </NavLink>
        <NavLink to="/admin" className={({ isActive }) => "nav-item" + (isActive ? " active" : "")}>
          관리자
        </NavLink>
      </nav>
    </header>
  );
}

export default Header;