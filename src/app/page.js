'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Modal from '@/components/Modal';
import { getProperties, saveProperties } from '@/utils/db';

export default function PropertiesSummary() {
  const [mounted, setMounted] = useState(false);
  const [properties, setProperties] = useState([]);
  
  // Date selection states
  const [selectedMonth, setSelectedMonth] = useState(5); // 0-indexed, so 5 = June
  const [selectedYear, setSelectedYear] = useState(2026);

  const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };
  
  // Expanded split cheque rows
  const [expandedChequeIds, setExpandedChequeIds] = useState(new Set());
  const toggleChequeExpand = (chequeId) => {
    setExpandedChequeIds(prev => {
      const next = new Set(prev);
      next.has(chequeId) ? next.delete(chequeId) : next.add(chequeId);
      return next;
    });
  };

  // Modal states for editing cheques
  const [isChequeModalOpen, setIsChequeModalOpen] = useState(false);
  const [editingCheque, setEditingCheque] = useState(null);
  const [editingChequeRef, setEditingChequeRef] = useState(null); // { propertyId, contractId }
  const [chequeFormData, setChequeFormData] = useState({ date: '', amount: '', number: '', depositDate: '', type: '', reference: '', status: 'Non-clear', note: '' });

  useEffect(() => {
    setMounted(true);
    setProperties(getProperties());
  }, []);

  const updatePropertiesState = (newProps) => {
    setProperties(newProps);
    saveProperties(newProps);
  };

  // Helper: check if a date is in the selected month & year
  const matchChequeMonthYear = (dateStr, monthIndex, year) => {
    if (!dateStr) return false;
    const lower = dateStr.toLowerCase();
    const shortMonth = MONTH_NAMES[monthIndex].substring(0, 3).toLowerCase();
    const fullMonth = MONTH_NAMES[monthIndex].toLowerCase();
    
    const hasMonth = lower.includes(shortMonth) || lower.includes(fullMonth);
    const hasYear = lower.includes(String(year)) || lower.includes(String(year).substring(2));
    
    // Support numeric slash/hyphen/dot formats
    const isNumericDate = dateStr.includes('/') || dateStr.includes('-') || dateStr.includes('.');
    if (isNumericDate) {
      const segments = dateStr.split(/[\/\-\.]/);
      if (segments.length >= 2) {
        const hasNumMonth = segments.some(seg => parseInt(seg, 10) === monthIndex + 1);
        const hasNumYear = segments.some(seg => {
          const val = parseInt(seg, 10);
          return val === year || val === (year % 100);
        });
        return hasNumMonth && hasNumYear;
      }
    }
    
    return hasMonth && hasYear;
  };

  // Helper: parse amount to numeric value
  const parseAmount = (amtStr) => {
    if (!amtStr) return 0;
    const cleaned = amtStr.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned) || 0;
  };

  // Helper: format number as AED
  const formatAED = (num) => {
    return 'AED ' + num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  // Gather all cheques for the selected month/year from active contracts across all properties
  const getMonthlyCheques = () => {
    const list = [];
    properties.forEach(property => {
      if (property.contracts) {
        property.contracts.forEach(contract => {
          if (contract.status === 'Active' && contract.cheques) {
            contract.cheques.forEach(cheque => {
              if (matchChequeMonthYear(cheque.date, selectedMonth, selectedYear)) {
                list.push({
                  propertyId: property.id,
                  propertyTitle: property.title,
                  contractId: contract.id,
                  tenantName: contract.tenantName,
                  cheque: cheque
                });
              }
            });
          }
        });
      }
    });
    return list;
  };

  const monthlyCheques = getMonthlyCheques();

  // Calculate totals
  const totalExpected = monthlyCheques.reduce((sum, item) => sum + parseAmount(item.cheque.amount), 0);
  const totalCleared = monthlyCheques.reduce((sum, item) => {
    return item.cheque.status === 'Cleared' ? sum + parseAmount(item.cheque.amount) : sum;
  }, 0);
  const totalPending = totalExpected - totalCleared;

  // Active contracts count
  const activeContractsCount = properties.reduce((count, prop) => {
    const active = prop.contracts ? prop.contracts.filter(c => c.status === 'Active').length : 0;
    return count + active;
  }, 0);

  // Operations
  const handleToggleChequeStatus = (propertyId, contractId, chequeId, currentStatus) => {
    const nextStatus = currentStatus === 'Cleared' ? 'Non-clear' : 'Cleared';
    const updatedProps = properties.map(p => {
      if (p.id === propertyId) {
        return {
          ...p,
          contracts: p.contracts.map(c => {
            if (c.id === contractId) {
              return {
                ...c,
                cheques: c.cheques.map(ch => ch.id === chequeId ? { ...ch, status: nextStatus } : ch)
              };
            }
            return c;
          })
        };
      }
      return p;
    });
    updatePropertiesState(updatedProps);
  };

  const openEditModal = (propertyId, contractId, cheque) => {
    setEditingChequeRef({ propertyId, contractId });
    setEditingCheque(cheque);
    setChequeFormData({ ...cheque });
    setIsChequeModalOpen(true);
  };

  const handleSaveCheque = (e) => {
    e.preventDefault();
    if (!editingChequeRef) return;
    const { propertyId, contractId } = editingChequeRef;
    
    const updatedProps = properties.map(p => {
      if (p.id === propertyId) {
        return {
          ...p,
          contracts: p.contracts.map(c => {
            if (c.id === contractId) {
              return {
                ...c,
                cheques: c.cheques.map(ch => ch.id === editingCheque.id ? { ...chequeFormData, id: ch.id } : ch)
              };
            }
            return c;
          })
        };
      }
      return p;
    });
    updatePropertiesState(updatedProps);
    setIsChequeModalOpen(false);
  };

  if (!mounted) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div className="logo-icon" style={{ width: '60px', height: '60px', borderRadius: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}>P</div>
        <p style={{ color: 'var(--text-muted)' }}>Loading Properties Summary...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-between mb-8" style={{ flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1>Properties Summary</h1>
          <p>Portfolio overview and cheque collections due for {MONTH_NAMES[selectedMonth]} {selectedYear}.</p>
        </div>
        
        {/* Month Selector Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--card-bg)', border: '1px solid var(--surface-border)', padding: '6px 12px', borderRadius: '12px', backdropFilter: 'blur(10px)' }}>
          <button 
            type="button"
            className="btn-icon-small" 
            onClick={handlePrevMonth}
            style={{ width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}
            title="Previous Month"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          
          <select 
            value={selectedMonth} 
            onChange={e => setSelectedMonth(Number(e.target.value))}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', outline: 'none', padding: '0 4px' }}
          >
            {MONTH_NAMES.map((name, idx) => (
              <option key={name} value={idx} style={{ background: '#0e131f', color: '#fff' }}>{name}</option>
            ))}
          </select>
          
          <select 
            value={selectedYear} 
            onChange={e => setSelectedYear(Number(e.target.value))}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', outline: 'none', padding: '0 4px' }}
          >
            {[2024, 2025, 2026, 2027, 2028].map(year => (
              <option key={year} value={year} style={{ background: '#0e131f', color: '#fff' }}>{year}</option>
            ))}
          </select>

          <button 
            type="button"
            className="btn-icon-small" 
            onClick={handleNextMonth}
            style={{ width: '32px', height: '32px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'transparent', border: 'none', color: 'var(--text-main)', cursor: 'pointer' }}
            title="Next Month"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>

        <Link href="/properties" className="btn">
          View Properties
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-grid mb-8">
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary-color)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-label">Expected Revenue ({MONTH_NAMES[selectedMonth].substring(0, 3)})</span>
            <span className="stat-value" style={{ color: 'var(--text-main)' }}>{formatAED(totalExpected)}</span>
            <span className="stat-trend" style={{ color: 'var(--text-muted)' }}>
              All active contracts
            </span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-label">Revenue Received</span>
            <span className="stat-value" style={{ color: '#10b981' }}>{formatAED(totalCleared)}</span>
            <span className="stat-trend" style={{ color: '#10b981' }}>
              {totalExpected > 0 ? Math.round((totalCleared / totalExpected) * 100) : 0}% Cleared
            </span>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <div className="stat-details">
            <span className="stat-label">Outstanding Balance</span>
            <span className="stat-value" style={{ color: '#f59e0b' }}>{formatAED(totalPending)}</span>
            <span className="stat-trend" style={{ color: '#f59e0b' }}>
              Pending clearance
            </span>
          </div>
        </div>
      </div>

      {/* Cheques due this month section */}
      <h3 className="mb-4">Cheques Schedule ({MONTH_NAMES[selectedMonth]} {selectedYear})</h3>
      <div className="glass-card query-table-container">
        {monthlyCheques.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '16px', opacity: 0.5 }}>
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <p style={{ fontSize: '1.1rem', fontWeight: 500, color: 'var(--text-main)', marginBottom: '8px' }}>No Cheques Due This Month</p>
            <p>There are no cheques scheduled for payment in {MONTH_NAMES[selectedMonth]} {selectedYear} across active contracts.</p>
          </div>
        ) : (
          <table className="query-table" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th>Property</th>
                <th>Tenant</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Cheque #</th>
                <th>Deposit Date</th>
                <th>Type</th>
                <th>Reference</th>
                <th>Status</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {monthlyCheques.map(({ propertyId, propertyTitle, contractId, tenantName, cheque }) => {
                const hasParts = cheque.parts && cheque.parts.length > 0;
                const isChqExpanded = expandedChequeIds.has(cheque.id);
                return (
                  <>
                    {/* Main cheque row */}
                    <tr key={cheque.id}>
                      <td>
                        <Link href={`/properties/${propertyId}`} style={{ color: 'var(--primary-color)', fontWeight: 500, textDecoration: 'none' }}>
                          {propertyTitle}
                        </Link>
                      </td>
                      <td>{tenantName}</td>
                      <td>{cheque.date}</td>
                      <td style={{ fontWeight: 600 }}>{cheque.amount}</td>
                      <td style={{ color: 'var(--secondary-color)' }}>{cheque.number || '-'}</td>
                      <td>
                        {hasParts ? (
                          <button
                            onClick={() => toggleChequeExpand(cheque.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', color: '#3b82f6', fontWeight: 600, fontSize: '0.8rem', padding: 0 }}
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isChqExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease', flexShrink: 0 }}>
                              <polyline points="9 18 15 12 9 6"></polyline>
                            </svg>
                            {cheque.parts.length} parts
                          </button>
                        ) : (cheque.depositDate || '-')}
                      </td>
                      <td>{hasParts ? '-' : (cheque.type || '-')}</td>
                      <td style={{ color: 'var(--secondary-color)' }}>{hasParts ? '-' : (cheque.reference || '-')}</td>
                      <td>
                        <span
                          onClick={() => handleToggleChequeStatus(propertyId, contractId, cheque.id, cheque.status)}
                          style={{
                            color: cheque.status === 'Cleared' || cheque.status === 'Clear' ? '#4cd137' :
                                   cheque.status === 'Non-clear' || cheque.status === 'Bounced' ? '#ef4444' : '#ffab00',
                            fontWeight: 600,
                            cursor: 'pointer',
                            userSelect: 'none'
                          }}
                          title="Click to toggle status"
                        >
                          {cheque.status}
                        </span>
                      </td>
                      <td title={cheque.note || ''} style={{ color: 'var(--text-muted)', fontSize: '0.82rem', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: cheque.note ? 'help' : 'default' }}>
                        {cheque.note || '-'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            className="btn-icon-small edit"
                            onClick={() => openEditModal(propertyId, contractId, cheque)}
                            title="Edit Cheque"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expandable parts sub-row */}
                    {hasParts && isChqExpanded && (
                      <tr key={`${cheque.id}-parts`}>
                        <td colSpan={11} style={{ padding: '0 12px 12px 12px', background: 'rgba(59,130,246,0.03)', borderLeft: '3px solid rgba(59,130,246,0.35)' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: '8px', paddingTop: '8px' }}>
                            {cheque.parts.map((part, idx) => (
                              <div key={part.id} style={{
                                background: 'rgba(15,20,35,0.7)',
                                border: '1px solid rgba(59,130,246,0.18)',
                                borderLeft: '3px solid #3b82f6',
                                borderRadius: '8px',
                                padding: '10px 12px'
                              }}>
                                <div style={{ fontSize: '0.68rem', color: '#3b82f6', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '8px' }}>PART {idx + 1}</div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '3px 10px', fontSize: '0.8rem' }}>
                                  <span style={{ color: 'var(--text-muted)' }}>Date</span>
                                  <span>{part.depositDate || '-'}</span>
                                  <span style={{ color: 'var(--text-muted)' }}>Amount</span>
                                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{part.amountReceived || '-'}</span>
                                  <span style={{ color: 'var(--text-muted)' }}>Type</span>
                                  <span>{part.type || '-'}</span>
                                  <span style={{ color: 'var(--text-muted)' }}>Ref</span>
                                  <span style={{ color: 'var(--secondary-color)' }}>{part.reference || '-'}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Cheque Modal */}
      <Modal isOpen={isChequeModalOpen} onClose={() => setIsChequeModalOpen(false)} title="Edit Cheque Details">
        <form onSubmit={handleSaveCheque}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Expected Date</label>
              <input type="text" placeholder="e.g. Jun 15, 2026" className="input-glass" required value={chequeFormData.date} onChange={e => setChequeFormData({...chequeFormData, date: e.target.value})} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Amount</label>
              <input type="text" placeholder="e.g. AED 30,000" className="input-glass" required value={chequeFormData.amount} onChange={e => setChequeFormData({...chequeFormData, amount: e.target.value})} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Cheque Number</label>
              <input type="text" placeholder="e.g. CHQ-882194" className="input-glass" value={chequeFormData.number} onChange={e => setChequeFormData({...chequeFormData, number: e.target.value})} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Deposit Date</label>
              <input type="text" placeholder="e.g. Jun 16, 2026" className="input-glass" value={chequeFormData.depositDate} onChange={e => setChequeFormData({...chequeFormData, depositDate: e.target.value})} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Type</label>
              <input type="text" placeholder="e.g. PDC, Current" className="input-glass" value={chequeFormData.type} onChange={e => setChequeFormData({...chequeFormData, type: e.target.value})} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Reference Number</label>
              <input type="text" placeholder="e.g. REF-1002" className="input-glass" value={chequeFormData.reference} onChange={e => setChequeFormData({...chequeFormData, reference: e.target.value})} />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Status</label>
              <select className="input-glass" value={chequeFormData.status} onChange={e => setChequeFormData({...chequeFormData, status: e.target.value})}>
                <option value="Non-clear">Non-clear</option>
                <option value="Cleared">Cleared</option>
              </select>
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Note (Optional)</label>
              <textarea
                className="input-glass"
                style={{ width: '100%', height: '70px', padding: '12px', resize: 'none' }}
                value={chequeFormData.note || ''}
                onChange={e => setChequeFormData({...chequeFormData, note: e.target.value})}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--surface-border)' }} onClick={() => setIsChequeModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn">Save Cheque</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
