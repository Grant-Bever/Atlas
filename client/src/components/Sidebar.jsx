import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { FaFileInvoiceDollar, FaUsers, FaBoxOpen, FaCog, FaSignOutAlt, FaDollarSign, FaClock } from 'react-icons/fa'; // Using react-icons
import '../styles/Sidebar.css';

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        {/* You can replace this with your actual logo */}
        <Link to="/orders" className="sidebar-logo-link">
          <span className="sidebar-logo">ATLAS</span>
        </Link>
      </div>
      <nav className="sidebar-nav">
        <ul>
          {/* TODO: Replace # with actual routes later */}
          <li><Link to="/orders"><FaFileInvoiceDollar /> Orders</Link></li>
          <li><Link to="/totals"><FaDollarSign /> Totals</Link></li>
          <li><Link to="/employees"><FaUsers /> Employees</Link></li>
          <li><Link to="/inventory"><FaBoxOpen /> Inventory</Link></li>
          {/* Add other top items if needed */}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <ul>
          <li><Link to="/settings"><FaCog /> Settings</Link></li>
          <li><a href="#logout"><FaSignOutAlt /> Logout</a></li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar; 