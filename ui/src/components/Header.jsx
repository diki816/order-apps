import React from 'react';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="logo">COZY</div>
      <nav>
        <a href="#" className="nav-item active">주문하기</a>
        <a href="#" className="nav-item">관리자</a>
      </nav>
    </header>
  );
}

export default Header;
