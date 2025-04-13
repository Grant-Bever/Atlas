import React, { useState } from 'react';
import ManagerLayout from '../components/ManagerLayout';
import '../styles/Table.css'; // Shared table styles
import { FaPlus, FaEdit, FaTrashAlt, FaSearch, FaUpload, FaChevronDown, FaChevronRight } from 'react-icons/fa';

// Sample data - Updated with nested items
const sampleOrders = [
  {
    id: 112,
    customer: 'Michoacano',
    date: '6/18/2024',
    total: 457.00,
    items: [
      { quantity: 5, description: 'Ribeye Steak', weight: 15, price: 8.99, amount: 134.85 },
      { quantity: 8, description: 'Pork Chops', weight: 12, price: 3.50, amount: 42.00 },
      { quantity: 12, description: 'Chicken Breasts', weight: 20, price: 2.99, amount: 59.80 },
      { quantity: 7, description: 'Ground Beef', weight: 14, price: 4.99, amount: 69.86 },
      { quantity: 3, description: 'Salmon Fillets', weight: 8, price: 9.99, amount: 79.92 },
      { quantity: 9, description: 'Turkey Legs', weight: 18, price: 1.79, amount: 32.22 },
      { quantity: 4, description: 'Lamb Chops', weight: 10, price: 12.99, amount: 129.90 }, // Note: Amounts might not exactly match image due to calculation
      { quantity: 6, description: 'Pork Belly', weight: 15, price: 5.99, amount: 89.85 },
      { quantity: 11, description: 'Bacon', weight: 5, price: 7.99, amount: 43.95 },
      { quantity: 10, description: 'Bratwurst', weight: 10, price: 4.50, amount: 45.00 },
    ]
  },
  {
    id: 113, customer: 'Mosner', date: '6/19/2024', total: 160.00,
    items: [
      { quantity: 10, description: 'Chicken Wings', weight: 10, price: 2.50, amount: 25.00 },
      { quantity: 4, description: 'Sirloin Steak', weight: 10, price: 7.50, amount: 75.00 },
      { quantity: 6, description: 'Sausages', weight: 6, price: 5.00, amount: 60.00 }, // Example data
    ]
  },
  {
    id: 116, customer: 'Michoacano', date: '6/19/2024', total: 160.00,
    items: [
      { quantity: 5, description: 'Ground Beef', weight: 10, price: 4.99, amount: 49.90 },
      { quantity: 7, description: 'Pork Shoulder', weight: 15, price: 2.89, amount: 110.10 }, // Example data
    ]
  },
  // Add items for other orders as needed...
  { id: 117, customer: 'Carniceria', date: '6/19/2024', total: 160.00, items: [] },
  { id: 118, customer: 'Tomoe', date: '6/19/2024', total: 160.00, items: [] },
  { id: 119, customer: 'Regal', date: '6/19/2024', total: 160.00, items: [] },
  { id: 120, customer: 'Mosner', date: '6/19/2024', total: 160.00, items: [] },
];

function ManagerActiveOrders() {
  // State to keep track of expanded rows (using a Set for efficient add/delete/check)
  const [expandedRows, setExpandedRows] = useState(new Set());

  const handleRowClick = (orderId) => {
    setExpandedRows(prevExpandedRows => {
      const newExpandedRows = new Set(prevExpandedRows);
      if (newExpandedRows.has(orderId)) {
        newExpandedRows.delete(orderId); // Collapse if already expanded
      } else {
        newExpandedRows.add(orderId); // Expand if collapsed
      }
      return newExpandedRows;
    });
  };

  return (
    <ManagerLayout>
      <div className="page-header">
        <h2>Active Orders</h2>
        <div className="header-actions">
          <button className="icon-button"><FaPlus /></button>
          <button className="icon-button"><FaEdit /></button>
          <button className="icon-button"><FaUpload /></button>
          <button className="icon-button"><FaTrashAlt /></button>
          <button className="icon-button"><FaSearch /></button>
        </div>
      </div>
      <table className="data-table main-table">
        <thead>
          <tr>
            <th style={{ width: '30px' }}></th>
            <th>Invoice #</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {sampleOrders.map((order) => {
            const isExpanded = expandedRows.has(order.id);
            return (
              <React.Fragment key={order.id}>
                <tr onClick={() => handleRowClick(order.id)} className="clickable-row">
                  <td className="expand-icon-cell">
                    {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                  </td>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.date}</td>
                  <td>${order.total.toFixed(2)}</td>
                </tr>
                {isExpanded && (
                  <tr className="collapsible-row">
                    <td></td>
                    <td colSpan="4">
                      <div className="nested-table-container">
                        <table className="data-table nested-table">
                          <thead>
                            <tr>
                              <th>Quantity</th>
                              <th>Description</th>
                              <th>Weight</th>
                              <th>Price</th>
                              <th>Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.length > 0 ? (
                              order.items.map((item, index) => (
                                <tr key={`${order.id}-item-${index}`}>
                                  <td>{item.quantity}</td>
                                  <td>{item.description}</td>
                                  <td>{item.weight}</td>
                                  <td>${item.price.toFixed(2)}</td>
                                  <td>${item.amount.toFixed(2)}</td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="5" style={{ textAlign: 'center', fontStyle: 'italic' }}>No items in this order.</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </ManagerLayout>
  );
}

export default ManagerActiveOrders; 