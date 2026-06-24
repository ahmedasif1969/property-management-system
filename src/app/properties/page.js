'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/Modal';
import { getProperties, saveProperties } from '@/utils/db';

export default function Properties() {
  const router = useRouter();
  
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    setProperties(getProperties());
  }, []);

  const updateProperties = (newProps) => {
    setProperties(newProps);
    saveProperties(newProps);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({ title: '', location: '', status: 'Vacant', beds: '', baths: '', price: '' });

  const handleCardClick = (id) => {
    router.push(`/properties/${id}`);
  };

  const handleEdit = (e, property) => {
    e.stopPropagation();
    setEditingProperty(property);
    setFormData(property);
    setIsModalOpen(true);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this property?")) {
      updateProperties(properties.filter(p => p.id !== id));
    }
  };

  const openAddModal = () => {
    setEditingProperty(null);
    setFormData({ title: '', location: '', status: 'Vacant', beds: '', baths: '', price: '' });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingProperty) {
      updateProperties(properties.map(p => p.id === editingProperty.id ? { ...p, ...formData } : p));
    } else {
      updateProperties([...properties, { 
        ...formData, 
        id: Date.now(),
        sqft: 1200, 
        yearBuilt: 2022, 
        description: 'New property registered in system.',
        contracts: [], 
        serviceCharges: [], 
        maintenanceCharges: [] 
      }]);
    }
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="flex-between mb-8">
        <div>
          <h1>Properties</h1>
          <p>Manage your entire property portfolio in one place.</p>
        </div>
        <button className="btn" onClick={openAddModal}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Add Property
        </button>
      </div>

      <div className="properties-grid">
        {properties.map(property => (
          <div 
            key={property.id} 
            className="glass-card clickable"
            onClick={() => handleCardClick(property.id)}
          >
            <div className="property-image">
              <img src={`https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&q=80&w=400&h=250`} alt="Property" />
              <div className="property-tag">{property.status}</div>
              <div className="property-image-hover-overlay">
                <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem', letterSpacing: '0.05em' }}>
                  View Details →
                </span>
              </div>
            </div>
            
            <h3 className="property-title">{property.title}</h3>
            <div className="property-location">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              {property.location}
            </div>
            
            <div className="property-features">
              <div className="feature">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
                {property.beds} Beds
              </div>
              <div className="feature">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2 12h20M12 2v20"></path>
                </svg>
                {property.baths} Baths
              </div>
              <div className="feature" style={{ marginLeft: 'auto', fontWeight: 600, color: 'var(--text-main)' }}>
                {property.price}
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn-icon-small edit" onClick={(e) => handleEdit(e, property)} title="Edit Property">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </button>
              <button className="btn-icon-small delete" onClick={(e) => handleDelete(e, property.id)} title="Delete Property">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingProperty ? "Edit Property" : "Add Property"}
      >
        <form onSubmit={handleSave}>
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Title</label>
            <input type="text" className="input-glass" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
          </div>
          <div className="input-group">
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Location</label>
            <input type="text" className="input-glass" required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Status</label>
              <select className="input-glass" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Vacant">Vacant</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Rent Price</label>
              <input type="text" className="input-glass" required placeholder="e.g. $2,400/mo" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Beds</label>
              <input type="number" className="input-glass" required value={formData.beds} onChange={e => setFormData({...formData, beds: e.target.value})} />
            </div>
            <div className="input-group">
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Baths</label>
              <input type="number" className="input-glass" required value={formData.baths} onChange={e => setFormData({...formData, baths: e.target.value})} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--surface-border)' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn">Save Property</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
