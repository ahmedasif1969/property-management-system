'use client';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 1000,
      padding: '24px'
    }}>
      <div className="glass-card" style={{
        width: '100%', maxWidth: '600px',
        maxHeight: '90vh', overflowY: 'auto',
        background: '#111827',
        position: 'relative',
        borderTop: '2px solid #3b82f6',
        boxShadow: '0 0 40px rgba(59, 130, 246, 0.1), 0 24px 48px rgba(0,0,0,0.5)',
        animation: 'modalIn 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) both'
      }}>
        <div className="flex-between mb-6">
          <h2 style={{ marginBottom: 0 }}>{title}</h2>
          <button className="icon-btn" onClick={onClose} style={{ width: '32px', height: '32px', border: 'none' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
