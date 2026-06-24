'use client';

export default function Topbar() {
  return (
    <header className="top-header">
      <div className="header-search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input type="text" className="input-glass" placeholder="Search properties, queries..." />
      </div>
      
      <div className="header-actions">
        <button className="icon-btn">
          <div className="notification-dot"></div>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
        </button>
        
        <div className="user-profile">
          <div className="user-info">
            <span className="user-name">Ahmed Asif</span>
            <span className="user-role">Administrator</span>
          </div>
          <div className="avatar">A</div>
        </div>
      </div>
    </header>
  );
}
