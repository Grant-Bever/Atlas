import React from 'react';
import { FaFileInvoiceDollar, FaUsers, FaBoxOpen, FaCog, FaSignOutAlt, FaDollarSign, FaClock } from 'react-icons/fa'; // Using react-icons
import '../styles/Sidebar.css';

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        {/* You can replace this with your actual logo */}
        <span className="sidebar-logo">ATLAS</span>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {/* TODO: Replace # with actual routes later */}
          <li><a href="#"><FaFileInvoiceDollar /> Orders</a></li>
          <li><a href="#"><FaUsers /> Employees</a></li>
          <li><a href="#"><FaBoxOpen /> Inventory</a></li>
          {/* Add other top items if needed */}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <ul>
          <li><a href="#"><FaCog /> Settings</a></li>
          <li><a href="#"><FaSignOutAlt /> Logout</a></li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar; 