import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ManagerLayout from '../components/ManagerLayout';
import '../styles/Table.css'; // Shared table styles
import '../styles/Modal.css'; // Keep for potential future modals
import { FaSearch, FaChevronDown, FaChevronRight, FaEllipsisV, FaEye, FaTrashAlt, FaArrowLeft } from 'react-icons/fa'; // Adjusted icons

// --- Sample Completed Order Data --- 
// Structure similar to active orders, but representing completed ones.
// In a real app, this would be fetched separately.
const initialCompletedOrders = [
  {
    id: 105,
    customer: 'Completed Corp',
    date: '6/15/2024',
    total: 250.50,
    items: [
      { quantity: 10, description: 'Product A', weight: 5, price: 10.00, amount: 100.00 },
      { quantity: 5, description: 'Product B', weight: 10, price: 30.10, amount: 150.50 },
    ]
  },
  {
    id: 108,
    customer: 'Past Customer Inc',
    date: '6/17/2024',
    total: 99.99,
    items: [
      { quantity: 1, description: 'Service X', weight: 0, price: 99.99, amount: 99.99 },
    ]
  },
];

function ManagerCompletedOrders() {
  const navigate = useNavigate();
  const [completedOrders, setCompletedOrders] = useState(initialCompletedOrders);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [openMenuId, setOpenMenuId] = useState(null); // Still useful for view/delete menu
  // No confirmation modal needed for completion here

  // --- Row Expansion --- (Same logic as active orders)
  const handleRowClick = (orderId) => {
    if (openMenuId !== null) {
        setOpenMenuId(null);
    }
    setExpandedRows(prevExpandedRows => {
      const newExpandedRows = new Set(prevExpandedRows);
      if (newExpandedRows.has(orderId)) {
        newExpandedRows.delete(orderId);
      } else {
        newExpandedRows.add(orderId);
      }
      return newExpandedRows;
    });
  };

  // --- Actions Menu --- (Simplified for completed orders)
  const handleMenuToggle = (e, orderId) => {
    e.stopPropagation();
    setOpenMenuId(prevId => (prevId === orderId ? null : orderId));
    if (expandedRows.has(orderId) && openMenuId !== orderId) {
        handleRowClick(orderId);
    }
  };

  // Close menu if clicking outside (Same logic)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId !== null && !event.target.closest('.action-menu-container')) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openMenuId]);

  // --- Action Handlers (Placeholders/Simplified) --- 
  const handleViewDetails = (e, orderId) => {
      e.stopPropagation();
      setOpenMenuId(null);
      // Potentially navigate to a read-only view or expand the row if not already
      if (!expandedRows.has(orderId)) {
          handleRowClick(orderId);
      }
      console.log(`View details for completed order: ${orderId}`);
  };

  const handleDeleteCompleted = (e, orderId) => {
    e.stopPropagation();
    // Add confirmation modal here maybe?
    console.log(`Delete/Archive completed order: ${orderId}`);
    // TODO: API call to delete/archive
    setCompletedOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    setOpenMenuId(null);
     setExpandedRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
    });
  };


  return (
    <ManagerLayout pageTitle="Completed Orders">
      <div className="page-actions-bar">
        {/* Add Back button on the left */}
        <div className="page-actions-left">
             <Link to="/orders" className="button button-secondary" title="Back to Active Orders">
                 <FaArrowLeft /> Active Orders
             </Link>
         </div>
         {/* Keep Search bar on the right */}
         <div className="page-actions-right">
            <div className="search-bar">
                <input type="text" placeholder="Search Completed Orders..." />
                <button className="icon-button"><FaSearch /></button>
            </div>
        </div>
      </div>

      {/* Completed Orders Table */}
      <table className="data-table main-table">
        <thead>
          <tr>
            <th style={{ width: '30px' }}></th>{/* Expand Icon */}
            <th>Invoice #</th>
            <th>Customer</th>
            <th>Date Completed</th> {/* Changed header slightly */}
            <th>Total</th>
            <th style={{ width: '50px' }}></th>{/* Actions Menu */}
          </tr>
        </thead>
        <tbody>
          {completedOrders.length > 0 ? completedOrders.map((order) => {
            const isExpanded = expandedRows.has(order.id);
            const isMenuOpen = openMenuId === order.id;

            return (
              <React.Fragment key={order.id}>
                {/* Main Order Row */}
                <tr onClick={() => handleRowClick(order.id)} className={`clickable-row ${isExpanded ? 'expanded' : ''}`}>
                  <td className="expand-icon-cell">
                    {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                  </td>
                  <td>{order.id}</td>
                  <td>{order.customer}</td>
                  <td>{order.date}</td>
                  <td>${order.total.toFixed(2)}</td>
                  {/* Actions Cell */}
                  <td className="action-cell action-menu-container">
                    <button onClick={(e) => handleMenuToggle(e, order.id)} className="icon-button menu-dots-button">
                      <FaEllipsisV />
                    </button>
                    {/* Action Menu Dropdown */}
                    {isMenuOpen && (
                      <div className="action-menu">
                        <button onClick={(e) => handleViewDetails(e, order.id)}><FaEye /> View Details</button>
                        <button onClick={(e) => handleDeleteCompleted(e, order.id)} className="danger"><FaTrashAlt /> Delete</button>
                        {/* Removed Mark Complete & Edit */}
                      </div>
                    )}
                  </td>
                </tr>

                {/* Collapsible Row with Nested Table */}
                {isExpanded && (
                   <tr className="collapsible-row">
                    <td></td> 
                    <td colSpan="5"> 
                      <div className="nested-table-container">
                        {/* Reusing the same nested table structure */}
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
                                <td colSpan="5" style={{ textAlign: 'center', fontStyle: 'italic' }}>No item details available.</td>
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
          }) : (
             <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', fontStyle: 'italic' }}>No completed orders found.</td>
             </tr>
          )} 
        </tbody>
      </table>
       {/* No Confirmation Modal needed here unless adding one for delete */}
    </ManagerLayout>
  );
}

export default ManagerCompletedOrders; 