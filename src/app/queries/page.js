'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { getProperties, getQueries, saveQueries } from '@/utils/db';

export default function Queries() {
  const [mounted, setMounted] = useState(false);
  const [queries, setQueries] = useState([]);
  const [properties, setProperties] = useState([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuery, setEditingQuery] = useState(null);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form State
  const [formData, setFormData] = useState({
    serialNo: '',
    entryDate: '',
    propertyId: '',
    propertyName: '',
    statementNo: '',
    description: '',
    solveLocation: '',
    action: '',
    status: 'Pending'
  });

  useEffect(() => {
    setMounted(true);
    setQueries(getQueries());
    setProperties(getProperties());
  }, []);

  const updateQueriesState = (newQueries) => {
    setQueries(newQueries);
    saveQueries(newQueries);
  };

  const handleToggleStatus = (serialNo) => {
    const updated = queries.map(q => {
      if (q.serialNo === serialNo) {
        return { ...q, status: q.status === 'Solved' ? 'Pending' : 'Solved' };
      }
      return q;
    });
    updateQueriesState(updated);
  };

  const handleDelete = (serialNo) => {
    if (confirm("Are you sure you want to delete this query?")) {
      updateQueriesState(queries.filter(q => q.serialNo !== serialNo));
    }
  };

  const openAddModal = () => {
    setEditingQuery(null);
    // Auto-generate serial number e.g. Q-1043
    const nextNum = queries.length > 0 
      ? Math.max(...queries.map(q => parseInt(q.serialNo.replace('Q-', ''), 10) || 1000)) + 1
      : 1043;
    
    // Get current date formatted like Jun 23, 2026
    const today = new Date();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedDate = `${months[today.getMonth()]} ${today.getDate()}, ${today.getFullYear()}`;

    setFormData({
      serialNo: `Q-${nextNum}`,
      entryDate: formattedDate,
      propertyId: properties[0]?.id || '',
      propertyName: properties[0]?.title || '',
      statementNo: '',
      description: '',
      solveLocation: '',
      action: '',
      status: 'Pending'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (query) => {
    setEditingQuery(query);
    setFormData({ ...query });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingQuery) {
      updateQueriesState(queries.map(q => q.serialNo === editingQuery.serialNo ? { ...formData } : q));
    } else {
      updateQueriesState([formData, ...queries]);
    }
    setIsModalOpen(false);
  };

  // Filter logic
  const filteredQueries = queries.filter(q => {
    const matchesSearch = 
      q.serialNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.statementNo.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!mounted) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div className="logo-icon" style={{ width: '60px', height: '60px', borderRadius: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}>P</div>
        <p style={{ color: 'var(--text-muted)' }}>Loading Tenant Queries...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-between mb-8">
        <div>
          <h1>Tenant Queries</h1>
          <p>Track and manage maintenance requests and tenant communications.</p>
        </div>
        <button className="btn animate-pulse" onClick={openAddModal}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          New Query
        </button>
      </div>

      {/* Filters and Controls */}
      <div className="flex-between mb-6" style={{ gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '280px' }}>
          <input 
            type="text" 
            placeholder="Search queries, statement no..." 
            className="input-glass"
            style={{ width: '100%' }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {['All', 'Pending', 'Solved'].map(tab => (
            <button 
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`tab-button ${statusFilter === tab ? 'active' : ''}`}
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Queries Table */}
      <div className="glass-card query-table-container">
        {filteredQueries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: 0.5 }}>
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
            <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px' }}>No Queries Found</p>
            <p>Try refining your search queries or adding a new query ticket.</p>
          </div>
        ) : (
          <table className="query-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Status</th>
                <th>S/N</th>
                <th>Entry Date</th>
                <th>Property</th>
                <th>Statement No</th>
                <th>Description</th>
                <th>Solve Location</th>
                <th>Action Taken</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredQueries.map((query) => (
                <tr key={query.serialNo}>
                  <td>
                    <button 
                      onClick={() => handleToggleStatus(query.serialNo)}
                      style={{ 
                        background: query.status === 'Solved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)', 
                        border: query.status === 'Solved' ? '1px solid #10b981' : '1px solid var(--surface-border)',
                        color: query.status === 'Solved' ? '#10b981' : 'var(--text-muted)',
                        borderRadius: '6px',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      title={query.status === 'Solved' ? "Mark Pending" : "Mark Solved"}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </button>
                  </td>
                  <td style={{ fontWeight: 600, color: 'var(--text-main)' }}>{query.serialNo}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{query.entryDate}</td>
                  <td style={{ color: 'var(--primary-color)', fontWeight: 500 }}>{query.propertyName}</td>
                  <td style={{ fontFamily: 'monospace', color: 'var(--text-muted)' }}>{query.statementNo || '-'}</td>
                  <td>{query.description}</td>
                  <td style={{ color: 'var(--secondary-color)' }}>{query.solveLocation || '-'}</td>
                  <td>{query.action || '-'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn-icon-small edit" 
                        onClick={() => openEditModal(query)}
                        title="Edit Query"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button 
                        className="btn-icon-small delete" 
                        onClick={() => handleDelete(query.serialNo)}
                        title="Delete Query"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Query Detail/Add/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingQuery ? "Edit Query Ticket" : "Create New Query Ticket"}>
        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Serial Number</label>
              <input 
                type="text" 
                placeholder="e.g. Q-1043" 
                className="input-glass" 
                required 
                value={formData.serialNo} 
                onChange={e => setFormData({...formData, serialNo: e.target.value})} 
              />
            </div>
            
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Entry Date</label>
              <input 
                type="text" 
                placeholder="e.g. Jun 23, 2026" 
                className="input-glass" 
                required 
                value={formData.entryDate} 
                onChange={e => setFormData({...formData, entryDate: e.target.value})} 
              />
            </div>

            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Select Property</label>
              <select 
                className="input-glass" 
                required
                value={formData.propertyId}
                onChange={e => {
                  const pId = Number(e.target.value);
                  const prop = properties.find(p => p.id === pId);
                  setFormData({
                    ...formData,
                    propertyId: pId,
                    propertyName: prop ? prop.title : ''
                  });
                }}
              >
                <option value="">Select Property...</option>
                {properties.map(p => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>

            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Statement No</label>
              <input 
                type="text" 
                placeholder="e.g. ST-8902" 
                className="input-glass" 
                value={formData.statementNo} 
                onChange={e => setFormData({...formData, statementNo: e.target.value})} 
              />
            </div>

            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Description</label>
              <textarea 
                placeholder="Describe the complaint or request..." 
                className="input-glass" 
                style={{ width: '100%', height: '80px', padding: '12px', resize: 'none' }}
                required 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
              />
            </div>

            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Solve Location</label>
              <input 
                type="text" 
                className="input-glass" 
                value={formData.solveLocation} 
                onChange={e => setFormData({...formData, solveLocation: e.target.value})} 
              />
            </div>

            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Action Taken</label>
              <input 
                type="text" 
                placeholder="e.g. Dispatched technician" 
                className="input-glass" 
                value={formData.action} 
                onChange={e => setFormData({...formData, action: e.target.value})} 
              />
            </div>

            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Status</label>
              <select 
                className="input-glass" 
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="Pending">Pending</option>
                <option value="Solved">Solved</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--surface-border)' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn">Save Query</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
