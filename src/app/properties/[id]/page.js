'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Modal from '@/components/Modal';
import { getProperties, saveProperties } from '@/utils/db';

export default function PropertyDetail() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('contracts');
  const [expandedContractId, setExpandedContractId] = useState(null);

  // Modals state
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);

  const [properties, setProperties] = useState([]);
  const [property, setProperty] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  const [contracts, setContracts] = useState([]);
  const [serviceCharges, setServiceCharges] = useState([]);
  const [maintenanceCharges, setMaintenanceCharges] = useState([]);

  useEffect(() => {
    setMounted(true);
    const allProps = getProperties();
    setProperties(allProps);
    const found = allProps.find(p => p.id === Number(params.id));
    if (found) {
      setProperty(found);
      setContracts(found.contracts || []);
      setServiceCharges(found.serviceCharges || []);
      setMaintenanceCharges(found.maintenanceCharges || []);
      if (found.contracts && found.contracts.length > 0 && !expandedContractId) {
        setExpandedContractId(found.contracts[0].id);
      }
    }
  }, [params.id]);

  const updateContracts = (newContracts) => {
    setContracts(newContracts);
    if (!property) return;
    const updated = properties.map(p => p.id === property.id ? { ...p, contracts: newContracts } : p);
    setProperties(updated);
    saveProperties(updated);
  };

  const updateServiceCharges = (newService) => {
    setServiceCharges(newService);
    if (!property) return;
    const updated = properties.map(p => p.id === property.id ? { ...p, serviceCharges: newService } : p);
    setProperties(updated);
    saveProperties(updated);
  };

  const updateMaintenanceCharges = (newMaint) => {
    setMaintenanceCharges(newMaint);
    if (!property) return;
    const updated = properties.map(p => p.id === property.id ? { ...p, maintenanceCharges: newMaint } : p);
    setProperties(updated);
    saveProperties(updated);
  };

  // Cheques & Fees Modals State
  const [isChequeModalOpen, setIsChequeModalOpen] = useState(false);
  const [editingCheque, setEditingCheque] = useState(null);
  const [activeContractIdForCheque, setActiveContractIdForCheque] = useState(null);
  const [chequeFormData, setChequeFormData] = useState({ date: '', amount: '', number: '', depositDate: '', type: '', reference: '', status: 'Non-clear' });

  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState(null);
  const [activeContractIdForFee, setActiveContractIdForFee] = useState(null);
  const [feeFormData, setFeeFormData] = useState({ name: '', date: '', amount: '', reference: '' });

  // Form states
  const [editingServiceCharge, setEditingServiceCharge] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({ paidOn: '', reference: '', periodFrom: '', periodTo: '', amount: '', details: '' });

  const [editingMaintenance, setEditingMaintenance] = useState(null);
  const [maintenanceFormData, setMaintenanceFormData] = useState({ date: '', amount: '', reference: '', details: '' });

  const [editingContract, setEditingContract] = useState(null);
  const [contractFormData, setContractFormData] = useState({
    tenantName: '', tenantType: 'New', startDate: '', endDate: '', totalRent: '', securityDeposit: '', chequeCount: 0, documents: '', status: 'Active'
  });

  const handleDeleteContract = (id) => {
    if (confirm("Are you sure you want to delete this contract?")) {
      updateContracts(contracts.filter(c => c.id !== id));
      if (expandedContractId === id) setExpandedContractId(null);
    }
  };

  const handleToggleContractStatus = (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    updateContracts(contracts.map(c => c.id === id ? { ...c, status: nextStatus } : c));
  };

  // Cheque actions
  const handleDeleteCheque = (contractId, chequeId) => {
    if (confirm("Are you sure you want to delete this cheque?")) {
      updateContracts(contracts.map(c => {
        if (c.id === contractId) {
          const updatedCheques = c.cheques.filter(ch => ch.id !== chequeId);
          return { ...c, cheques: updatedCheques };
        }
        return c;
      }));
    }
  };

  const openAddChequeModal = (contractId) => {
    setActiveContractIdForCheque(contractId);
    setEditingCheque(null);
    setChequeFormData({ date: '', amount: '', number: '', depositDate: '', type: '', reference: '', status: 'Non-clear' });
    setIsChequeModalOpen(true);
  };

  const openEditChequeModal = (contractId, cheque) => {
    setActiveContractIdForCheque(contractId);
    setEditingCheque(cheque);
    setChequeFormData({ ...cheque });
    setIsChequeModalOpen(true);
  };

  const handleSaveCheque = (e) => {
    e.preventDefault();
    updateContracts(contracts.map(c => {
      if (c.id === activeContractIdForCheque) {
        let updatedCheques;
        if (editingCheque) {
          updatedCheques = c.cheques.map(ch => ch.id === editingCheque.id ? { ...chequeFormData, id: ch.id } : ch);
        } else {
          updatedCheques = [...(c.cheques || []), { ...chequeFormData, id: Date.now() }];
        }
        return { ...c, cheques: updatedCheques };
      }
      return c;
    }));
    setIsChequeModalOpen(false);
  };

  // Fee actions
  const handleDeleteFee = (contractId, feeId) => {
    if (confirm("Are you sure you want to delete this fee?")) {
      updateContracts(contracts.map(c => {
        if (c.id === contractId) {
          return { ...c, fees: c.fees.filter(f => f.id !== feeId) };
        }
        return c;
      }));
    }
  };

  const openAddFeeModal = (contractId) => {
    setActiveContractIdForFee(contractId);
    setEditingFee(null);
    setFeeFormData({ name: '', date: '', amount: '', reference: '' });
    setIsFeeModalOpen(true);
  };

  const openEditFeeModal = (contractId, fee) => {
    setActiveContractIdForFee(contractId);
    setEditingFee(fee);
    setFeeFormData({ ...fee });
    setIsFeeModalOpen(true);
  };

  const handleSaveFee = (e) => {
    e.preventDefault();
    updateContracts(contracts.map(c => {
      if (c.id === activeContractIdForFee) {
        let updatedFees;
        if (editingFee) {
          updatedFees = c.fees.map(f => f.id === editingFee.id ? { ...feeFormData, id: f.id } : f);
        } else {
          updatedFees = [...(c.fees || []), { ...feeFormData, id: Date.now() }];
        }
        return { ...c, fees: updatedFees };
      }
      return c;
    }));
    setIsFeeModalOpen(false);
  };

  const renderTabContent = () => {
    switch(activeTab) {
      case 'contracts':
        return (
          <div className="tab-content">
            <div className="flex-between mb-4">
              <h3>Contracts History</h3>
              <button className="btn" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => {
                setEditingContract(null);
                setContractFormData({
                  tenantName: '', tenantType: 'New', startDate: '', endDate: '', totalRent: '', securityDeposit: '', chequeCount: 0, documents: '', status: 'Active'
                });
                setIsContractModalOpen(true);
              }}>Create Contract</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {contracts.map((contract) => {
                const isExpanded = expandedContractId === contract.id;
                
                return (
                  <div key={contract.id} className="glass-card" style={{ padding: isExpanded ? '24px' : '16px 24px' }}>
                    {/* Header: Always visible */}
                    <div 
                      className="flex-between clickable" 
                      onClick={() => setExpandedContractId(isExpanded ? null : contract.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>ID</span>
                          <p style={{ fontWeight: 600 }}>{contract.id}</p>
                        </div>
                        <div>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tenant</span>
                          <p>{contract.tenantName}</p>
                        </div>
                        <div style={{ display: 'none' }} className="hidden-mobile">
                           <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Period</span>
                           <p>{contract.startDate} - {contract.endDate}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {/* Quick Toggle Status */}
                        <span 
                          className={`status-badge ${contract.status === 'Active' ? 'status-resolved' : 'status-pending'}`}
                          title="Click to toggle status"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleContractStatus(contract.id, contract.status);
                          }}
                          style={{ cursor: 'pointer', userSelect: 'none' }}
                        >
                          {contract.status}
                        </span>

                        {/* Edit Contract */}
                        <button className="btn-icon-small edit" title="Edit Contract" onClick={(e) => { 
                          e.stopPropagation(); 
                          setEditingContract(contract);
                          setContractFormData({
                            tenantName: contract.tenantName, tenantType: contract.tenantType, startDate: contract.startDate, endDate: contract.endDate, 
                            totalRent: contract.totalRent, securityDeposit: contract.securityDeposit, chequeCount: contract.chequeCount || 0, documents: contract.documents || '',
                            status: contract.status
                          });
                          setIsContractModalOpen(true);
                        }}>
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                          </svg>
                        </button>

                        {/* Delete Contract */}
                        <button className="btn-icon-small delete" title="Delete Contract" onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteContract(contract.id);
                        }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>

                        <svg 
                          width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', color: 'var(--text-muted)' }}
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', animation: 'fadeIn 0.3s ease-out' }}>
                        {/* Core Details */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', marginBottom: '24px' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Tenant Type</span>
                            <p style={{ fontWeight: 500, color: 'var(--primary-color)' }}>{contract.tenantType} Tenant</p>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Start - End Date</span>
                            <p>{contract.startDate} to {contract.endDate}</p>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Rent</span>
                            <p style={{ fontWeight: 600 }}>{contract.totalRent}</p>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Security Deposit</span>
                            <p>{contract.securityDeposit}</p>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Cheque Count</span>
                            <p style={{ fontWeight: 600 }}>{contract.chequeCount || 0}</p>
                          </div>
                        </div>

                        {/* Documents */}
                        <div style={{ marginBottom: '24px' }}>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '4px', display: 'block' }}>Documents Provided</span>
                          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '12px', borderRadius: '8px', border: '1px solid var(--surface-border)' }}>
                            {contract.documents || 'None listed'}
                          </div>
                        </div>

                        {/* Cheques Section */}
                        <div style={{ marginBottom: '24px' }}>
                          <div className="flex-between mb-3">
                            <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: 0 }}>
                              Cheques ({contract.cheques ? contract.cheques.length : 0})
                            </h4>
                            <button className="btn" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => openAddChequeModal(contract.id)}>
                              + Add Cheque
                            </button>
                          </div>
                          <div className="query-table-container" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--surface-border)' }}>
                            <table className="query-table" style={{ fontSize: '0.85rem' }}>
                              <thead>
                                <tr>
                                  <th>Date</th>
                                  <th>Amount</th>
                                  <th>Cheque #</th>
                                  <th>Deposit Date</th>
                                  <th>Type</th>
                                  <th>Ref Number</th>
                                  <th>Status</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {contract.cheques && contract.cheques.length > 0 ? (
                                  contract.cheques.map((cheque) => (
                                    <tr key={cheque.id}>
                                      <td>{cheque.date}</td>
                                      <td style={{ fontWeight: 600 }}>{cheque.amount}</td>
                                      <td style={{ color: 'var(--secondary-color)' }}>{cheque.number || '-'}</td>
                                      <td>{cheque.depositDate || '-'}</td>
                                      <td>{cheque.type || '-'}</td>
                                      <td style={{ color: 'var(--secondary-color)' }}>{cheque.reference || '-'}</td>
                                      <td>
                                        <span style={{ 
                                          color: cheque.status === 'Cleared' || cheque.status === 'Clear' ? '#4cd137' : 
                                                 cheque.status === 'Non-clear' || cheque.status === 'Bounced' ? '#ef4444' : '#ffab00',
                                          fontWeight: 600 
                                        }}>
                                          {cheque.status}
                                        </span>
                                      </td>
                                      <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                          <button className="btn-icon-small edit" title="Edit Cheque" onClick={() => openEditChequeModal(contract.id, cheque)}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                          </button>
                                          <button className="btn-icon-small delete" title="Delete Cheque" onClick={() => handleDeleteCheque(contract.id, cheque.id)}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <polyline points="3 6 5 6 21 6"></polyline>
                                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No cheques registered</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Other Fees & Charges Section */}
                        <div style={{ marginTop: '24px' }}>
                          <div className="flex-between mb-3">
                            <h4 style={{ color: 'var(--text-main)', fontSize: '1rem', marginBottom: 0 }}>
                              Fees & Charges
                            </h4>
                            <button className="btn" style={{ padding: '6px 12px', fontSize: '0.8rem' }} onClick={() => openAddFeeModal(contract.id)}>
                              + Add Fee
                            </button>
                          </div>
                          <div className="query-table-container" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid var(--surface-border)' }}>
                            <table className="query-table" style={{ fontSize: '0.85rem' }}>
                              <thead>
                                <tr>
                                  <th>Fee Name</th>
                                  <th>Date</th>
                                  <th>Amount</th>
                                  <th>Reference</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {contract.fees && contract.fees.length > 0 ? (
                                  contract.fees.map((fee) => (
                                    <tr key={fee.id}>
                                      <td style={{ fontWeight: 500 }}>{fee.name}</td>
                                      <td>{fee.date}</td>
                                      <td style={{ fontWeight: 600 }}>{fee.amount}</td>
                                      <td style={{ color: 'var(--secondary-color)' }}>{fee.reference || '-'}</td>
                                      <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                          <button className="btn-icon-small edit" title="Edit Fee" onClick={() => openEditFeeModal(contract.id, fee)}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                            </svg>
                                          </button>
                                          <button className="btn-icon-small delete" title="Delete Fee" onClick={() => handleDeleteFee(contract.id, fee.id)}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                              <polyline points="3 6 5 6 21 6"></polyline>
                                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                          </button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No extra fees registered</td>
                                  </tr>
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>

                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'service-charges':
        return (
          <div className="tab-content">
            <div className="flex-between mb-4">
              <h3>Service Charges</h3>
              <button className="btn" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => {
                setEditingServiceCharge(null);
                setServiceFormData({ paidOn: '', reference: '', periodFrom: '', periodTo: '', amount: '', details: '' });
                setIsServiceModalOpen(true);
              }}>Add Service Charge</button>
            </div>
            <div className="glass-card query-table-container">
              <table className="query-table">
                <thead>
                  <tr>
                    <th>Paid On</th>
                    <th>Reference Number</th>
                    <th>Period</th>
                    <th>Amount</th>
                    <th>Details</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceCharges.map((charge) => (
                    <tr key={charge.id}>
                      <td>{charge.paidOn}</td>
                      <td style={{ color: 'var(--secondary-color)' }}>{charge.reference}</td>
                      <td>{charge.periodFrom} to {charge.periodTo}</td>
                      <td style={{ color: '#ef4444', fontWeight: 600 }}>{charge.amount}</td>
                      <td>{charge.details}</td>
                      <td>
                        <button className="btn-icon-small edit" onClick={() => {
                          setEditingServiceCharge(charge);
                          setServiceFormData(charge);
                          setIsServiceModalOpen(true);
                        }}>
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'maintenance-charges':
        return (
          <div className="tab-content">
             <div className="flex-between mb-4">
              <h3>Maintenance Charges</h3>
              <button className="btn" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => {
                setEditingMaintenance(null);
                setMaintenanceFormData({ date: '', amount: '', reference: '', details: '' });
                setIsMaintenanceModalOpen(true);
              }}>Log Charge</button>
            </div>
            <div className="glass-card query-table-container">
              <table className="query-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Reference</th>
                    <th>Details</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenanceCharges.map((charge) => (
                    <tr key={charge.id}>
                      <td>{charge.date}</td>
                      <td style={{ color: '#ef4444', fontWeight: 600 }}>{charge.amount}</td>
                      <td style={{ color: 'var(--secondary-color)' }}>{charge.reference}</td>
                      <td>{charge.details}</td>
                      <td>
                        <button className="btn-icon-small edit" onClick={() => {
                          setEditingMaintenance(charge);
                          setMaintenanceFormData(charge);
                          setIsMaintenanceModalOpen(true);
                        }}>
                           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (!mounted || !property) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', flexDirection: 'column', gap: '16px' }}>
        <div className="logo-icon" style={{ width: '60px', height: '60px', borderRadius: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '1.5rem' }}>P</div>
        <p style={{ color: 'var(--text-muted)' }}>Loading property details...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex-between mb-6" style={{ alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button 
            className="btn-icon-small" 
            onClick={() => router.back()}
            style={{ width: '40px', height: '40px' }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <h1 style={{ margin: 0 }}>{property.title}</h1>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="tabs-container">
        <button 
          className={`tab-button ${activeTab === 'contracts' ? 'active' : ''}`}
          onClick={() => setActiveTab('contracts')}
        >
          Contracts
        </button>
        <button 
          className={`tab-button ${activeTab === 'service-charges' ? 'active' : ''}`}
          onClick={() => setActiveTab('service-charges')}
        >
          Service Charges
        </button>
        <button 
          className={`tab-button ${activeTab === 'maintenance-charges' ? 'active' : ''}`}
          onClick={() => setActiveTab('maintenance-charges')}
        >
          Maintenance Charges
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ minHeight: '300px' }}>
        {renderTabContent()}
      </div>

      <Modal isOpen={isServiceModalOpen} onClose={() => setIsServiceModalOpen(false)} title={editingServiceCharge ? "Edit Service Charge" : "Add Service Charge"}>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (editingServiceCharge) {
            updateServiceCharges(serviceCharges.map(c => c.id === editingServiceCharge.id ? { ...serviceFormData, id: c.id } : c));
          } else {
            updateServiceCharges([...serviceCharges, { ...serviceFormData, id: Date.now() }]);
          }
          setIsServiceModalOpen(false);
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Paid On</label>
              <input type="text" className="input-glass" required value={serviceFormData.paidOn} onChange={e => setServiceFormData({...serviceFormData, paidOn: e.target.value})} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Reference</label>
              <input type="text" className="input-glass" required value={serviceFormData.reference} onChange={e => setServiceFormData({...serviceFormData, reference: e.target.value})} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Period From</label>
              <input type="text" placeholder="e.g. Oct 1, 2023" className="input-glass" required value={serviceFormData.periodFrom} onChange={e => setServiceFormData({...serviceFormData, periodFrom: e.target.value})} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Period To</label>
              <input type="text" placeholder="e.g. Dec 31, 2023" className="input-glass" required value={serviceFormData.periodTo} onChange={e => setServiceFormData({...serviceFormData, periodTo: e.target.value})} />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Amount</label>
              <input type="text" className="input-glass" required value={serviceFormData.amount} onChange={e => setServiceFormData({...serviceFormData, amount: e.target.value})} />
            </div>
          </div>
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Details</label>
            <input type="text" className="input-glass" value={serviceFormData.details} onChange={e => setServiceFormData({...serviceFormData, details: e.target.value})} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--surface-border)' }} onClick={() => setIsServiceModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn">Save</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isMaintenanceModalOpen} onClose={() => setIsMaintenanceModalOpen(false)} title={editingMaintenance ? "Edit Maintenance Charge" : "Log Maintenance Charge"}>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (editingMaintenance) {
            updateMaintenanceCharges(maintenanceCharges.map(c => c.id === editingMaintenance.id ? { ...maintenanceFormData, id: c.id } : c));
          } else {
            updateMaintenanceCharges([...maintenanceCharges, { ...maintenanceFormData, id: Date.now() }]);
          }
          setIsMaintenanceModalOpen(false);
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Date</label>
              <input type="text" className="input-glass" required value={maintenanceFormData.date} onChange={e => setMaintenanceFormData({...maintenanceFormData, date: e.target.value})} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Amount</label>
              <input type="text" className="input-glass" required value={maintenanceFormData.amount} onChange={e => setMaintenanceFormData({...maintenanceFormData, amount: e.target.value})} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Reference</label>
              <input type="text" className="input-glass" required value={maintenanceFormData.reference} onChange={e => setMaintenanceFormData({...maintenanceFormData, reference: e.target.value})} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Details</label>
              <input type="text" className="input-glass" value={maintenanceFormData.details} onChange={e => setMaintenanceFormData({...maintenanceFormData, details: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--surface-border)' }} onClick={() => setIsMaintenanceModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn">Save</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isContractModalOpen} onClose={() => setIsContractModalOpen(false)} title={editingContract ? "Edit Contract" : "Create Contract"}>
        <form onSubmit={(e) => {
          e.preventDefault();
          const newContractData = {
            tenantName: contractFormData.tenantName,
            tenantType: contractFormData.tenantType,
            startDate: contractFormData.startDate,
            endDate: contractFormData.endDate,
            totalRent: contractFormData.totalRent,
            securityDeposit: contractFormData.securityDeposit,
            chequeCount: contractFormData.chequeCount,
            documents: contractFormData.documents,
            status: contractFormData.status,
            cheques: editingContract ? editingContract.cheques : [],
            fees: editingContract ? (editingContract.fees || []) : [],
          };
          if (editingContract) {
            updateContracts(contracts.map(c => c.id === editingContract.id ? { ...newContractData, id: c.id } : c));
          } else {
            updateContracts([{ ...newContractData, id: 'CON-' + Math.floor(Math.random() * 1000) }, ...contracts]);
          }
          setIsContractModalOpen(false);
        }}>
          <h4 style={{ marginBottom: '16px', color: 'var(--primary-color)' }}>General Details</h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tenant Name</label>
              <input type="text" className="input-glass" required value={contractFormData.tenantName} onChange={e => setContractFormData({...contractFormData, tenantName: e.target.value})} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Tenant Type</label>
              <select className="input-glass" value={contractFormData.tenantType} onChange={e => setContractFormData({...contractFormData, tenantType: e.target.value})}>
                <option value="New">New</option>
                <option value="Old">Old</option>
              </select>
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Start Date</label>
              <input type="text" className="input-glass" required value={contractFormData.startDate} onChange={e => setContractFormData({...contractFormData, startDate: e.target.value})} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>End Date</label>
              <input type="text" className="input-glass" required value={contractFormData.endDate} onChange={e => setContractFormData({...contractFormData, endDate: e.target.value})} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Rent</label>
              <input type="text" className="input-glass" required value={contractFormData.totalRent} onChange={e => setContractFormData({...contractFormData, totalRent: e.target.value})} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Security Deposit</label>
              <input type="text" className="input-glass" required value={contractFormData.securityDeposit} onChange={e => setContractFormData({...contractFormData, securityDeposit: e.target.value})} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Status</label>
              <select className="input-glass" value={contractFormData.status} onChange={e => setContractFormData({...contractFormData, status: e.target.value})}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Cheque Count</label>
              <input type="number" placeholder="e.g. 4" className="input-glass" value={contractFormData.chequeCount} onChange={e => setContractFormData({...contractFormData, chequeCount: e.target.value})} />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Documents Provided</label>
              <input type="text" className="input-glass" value={contractFormData.documents} onChange={e => setContractFormData({...contractFormData, documents: e.target.value})} />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--surface-border)' }} onClick={() => setIsContractModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn">Save Contract</button>
          </div>
        </form>
      </Modal>

      {/* Dynamic Cheque Modal */}
      <Modal isOpen={isChequeModalOpen} onClose={() => setIsChequeModalOpen(false)} title={editingCheque ? "Edit Cheque Details" : "Add Cheque Schedule"}>
        <form onSubmit={handleSaveCheque}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Expected Date</label>
              <input type="text" placeholder="e.g. Jan 1, 2024" className="input-glass" required value={chequeFormData.date} onChange={e => setChequeFormData({...chequeFormData, date: e.target.value})} />
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
              <input type="text" placeholder="e.g. Jan 3, 2024" className="input-glass" value={chequeFormData.depositDate} onChange={e => setChequeFormData({...chequeFormData, depositDate: e.target.value})} />
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
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--surface-border)' }} onClick={() => setIsChequeModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn">Save Cheque</button>
          </div>
        </form>
      </Modal>

      {/* Dynamic Fee Modal */}
      <Modal isOpen={isFeeModalOpen} onClose={() => setIsFeeModalOpen(false)} title={editingFee ? "Edit Fee / Charge" : "Add Fee / Charge"}>
        <form onSubmit={handleSaveFee}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Fee Name</label>
              <input type="text" placeholder="e.g. Management Fees, Ejari, Commission" className="input-glass" required value={feeFormData.name} onChange={e => setFeeFormData({...feeFormData, name: e.target.value})} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Date</label>
              <input type="text" placeholder="e.g. Oct 2, 2023" className="input-glass" required value={feeFormData.date} onChange={e => setFeeFormData({...feeFormData, date: e.target.value})} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Amount</label>
              <input type="text" placeholder="e.g. AED 6,000" className="input-glass" required value={feeFormData.amount} onChange={e => setFeeFormData({...feeFormData, amount: e.target.value})} />
            </div>
            <div className="input-group" style={{ gridColumn: 'span 2' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Reference (Optional)</label>
              <input type="text" placeholder="e.g. TRX-9982" className="input-glass" value={feeFormData.reference} onChange={e => setFeeFormData({...feeFormData, reference: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--surface-border)' }} onClick={() => setIsFeeModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn">Save Fee</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
