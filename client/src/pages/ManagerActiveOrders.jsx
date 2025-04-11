import React from 'react';
import ManagerLayout from '../components/ManagerLayout';
import '../styles/Table.css'; // Shared table styles
import { FaPlus, FaEdit, FaTrashAlt, FaSearch, FaUpload } from 'react-icons/fa';

// Sample data - replace with actual data fetching later
const sampleOrders = [
  { id: 112, customer: 'Michoacano', date: '6/18/2024', total: 457.00 },
  { id: 113, customer: 'Mosner', date: '6/19/2024', total: 160.00 },
  { id: 116, customer: 'Michoacano', date: '6/19/2024', total: 160.00 }, // Note: ID 116 in image, not sequential
  { id: 117, customer: 'Carniceria', date: '6/19/2024', total: 160.00 },
  { id: 118, customer: 'Tomoe', date: '6/19/2024', total: 160.00 },
  { id: 119, customer: 'Regal', date: '6/19/2024', total: 160.00 },
  { id: 120, customer: 'Mosner', date: '6/19/2024', total: 160.00 },
];

function ManagerActiveOrders() {
  return (
    <ManagerLayout>
      <div className="page-header">
        <h2>Active Orders</h2>
        <div className="header-actions">
          {/* Placeholder Icons based on image */}
          <button className="icon-button"><FaPlus /></button>
          <button className="icon-button"><FaEdit /></button>
          <button className="icon-button"><FaUpload /></button>
          <button className="icon-button"><FaTrashAlt /></button>
          <button className="icon-button"><FaSearch /></button>
        </div>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>Invoice #</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {sampleOrders.map((order) => (
            <tr key={order.id}>
              <td>{order.id}</td>
              <td>{order.customer}</td>
              <td>{order.date}</td>
              <td>${order.total.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ManagerLayout>
  );
}

export default ManagerActiveOrders; 