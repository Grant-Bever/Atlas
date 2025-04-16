import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import ErrorMessage from '../../common/ErrorMessage';
import './EmployeeInventory.css';

const EmployeeInventory = () => {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await api.get('/inventory');
        setInventory(response.data);
        setLoading(false);
      } catch (err) {
        setError(err.message || 'Failed to fetch inventory');
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading">Loading inventory...</div>;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="employee-inventory">
      <div className="inventory-header">
        <h2>Inventory Status</h2>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="inventory-grid">
        {filteredInventory.map(item => (
          <div key={item.id} className="inventory-card">
            <h3>{item.name}</h3>
            <div className="inventory-details">
              <p>
                <strong>Quantity:</strong> {item.quantity}
                <span className={`stock-status ${item.quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {item.quantity > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </p>
              <p><strong>Category:</strong> {item.category}</p>
              <p><strong>Location:</strong> {item.location}</p>
              {item.quantity <= item.reorderPoint && (
                <p className="reorder-warning">Low Stock Alert!</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmployeeInventory; 