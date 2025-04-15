import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ManagerLayout from '../components/ManagerLayout';
import '../styles/Table.css'; // Shared table styles
import '../styles/Modal.css'; // Keep for potential future modals
import { FaSearch, FaChevronDown, FaChevronRight, FaEllipsisV, FaEye, FaTrashAlt, FaArrowLeft } from 'react-icons/fa'; // Adjusted icons

// Base URL for the API (Consider moving this to a config file)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function ManagerCompletedOrders() {
  const navigate = useNavigate();
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [openMenuId, setOpenMenuId] = useState(null); // Still useful for view/delete menu
  // Add state for delete confirmation modal if desired
  const [confirmDeleteModalState, setConfirmDeleteModalState] = useState({ isOpen: false, orderId: null });

  // --- Fetch Completed Orders ---
  useEffect(() => {
    const fetchCompletedOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/orders/completed`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Ensure items is always an array
         const ordersWithItemsArray = data.map(order => ({
            ...order,
            items: order.items || []
        }));
        setCompletedOrders(ordersWithItemsArray);
      } catch (e) {
        console.error("Failed to fetch completed orders:", e);
        setError("Failed to load completed orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedOrders();
  }, []);

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
      // Check if the click is outside the menu container
      if (openMenuId !== null && !event.target.closest(`.action-menu-container[data-order-id="${openMenuId}"]`)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openMenuId]);

  // --- Action Handlers --- 
  const handleViewDetails = (e, orderId) => {
      e.stopPropagation();
      setOpenMenuId(null);
      // Just ensure the row is expanded to show details
      if (!expandedRows.has(orderId)) {
          handleRowClick(orderId);
      }
      console.log(`View details for completed order: ${orderId}`);
  };

  const handleDeleteClick = (e, orderId) => {
    e.stopPropagation();
    setOpenMenuId(null);
    setConfirmDeleteModalState({ isOpen: true, orderId: orderId });
  };

  // --- Delete Modal Handlers ---
  const handleConfirmDelete = async () => {
    const { orderId } = confirmDeleteModalState;
    if (!orderId) return;

    setConfirmDeleteModalState({ isOpen: false, orderId: null }); // Close modal

    try {
      console.log(`Deleting completed order: ${orderId}`);
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete completed order ${orderId}. Status: ${response.status}`);
      }

      // Remove from state
      setCompletedOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      setExpandedRows(prev => {
          const newSet = new Set(prev);
          newSet.delete(orderId);
          return newSet;
      });

    } catch (err) {
      console.error(`Error deleting completed order ${orderId}:`, err);
      setError(`Failed to delete completed order ${orderId}. Please try again.`);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteModalState({ isOpen: false, orderId: null });
  };

  // --- Render Logic ---
   if (loading) {
       return <ManagerLayout pageTitle="Completed Orders"><div className="loading-indicator">Loading completed orders...</div></ManagerLayout>;
   }

   if (error) {
       return (
           <ManagerLayout pageTitle="Completed Orders">
               <div className="error-message">{error}</div>
           </ManagerLayout>
       );
   }

  return (
    <ManagerLayout pageTitle="Completed Orders">
      <div className="page-actions-bar">
        <div className="page-actions-left">
             <Link to="/orders" className="button button-secondary" title="Back to Active Orders">
                 <FaArrowLeft /> Active Orders
             </Link>
         </div>
         <div className="page-actions-right">
             {/* TODO: Implement Search */}
            <div className="search-bar">
                <input type="text" placeholder="Search Completed Orders..." />
                <button className="icon-button"><FaSearch /></button>
            </div>
        </div>
      </div>

      {/* Display general error messages here if needed */}
       {error && !loading && <div className="error-message" style={{ marginBottom: '15px' }}>{error}</div>}

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
                    {order.items && order.items.length > 0 ? (isExpanded ? <FaChevronDown /> : <FaChevronRight />) : ''}
                  </td>
                  <td>{order.id}</td>
                  <td>{order.customer ? order.customer.name : 'N/A'}</td>
                  {/* Assuming the 'date' field reflects completion date or use updatedAt if available/relevant */}
                  <td>{new Date(order.date).toLocaleDateString()}</td>
                  <td>${parseFloat(order.total || 0).toFixed(2)}</td>
                  {/* Actions Cell */}
                  <td className="action-cell action-menu-container" data-order-id={order.id}>
                    <button onClick={(e) => handleMenuToggle(e, order.id)} className="icon-button menu-dots-button">
                      <FaEllipsisV />
                    </button>
                    {/* Action Menu Dropdown */}
                    {isMenuOpen && (
                      <div className="action-menu">
                        <button onClick={(e) => handleViewDetails(e, order.id)}><FaEye /> View Details</button>
                        <button onClick={(e) => handleDeleteClick(e, order.id)} className="danger"><FaTrashAlt /> Delete</button>
                      </div>
                    )}
                  </td>
                </tr>

                {/* Collapsible Row with Nested Table */}
                {isExpanded && order.items && order.items.length > 0 && (
                   <tr className="collapsible-row">
                    <td></td>
                    <td colSpan="5">
                      <div className="nested-table-container">
                         <table className="data-table nested-table">
                          <thead>
                             <tr>
                               <th>Quantity</th>
                               <th>Item</th>
                               <th>Weight</th>
                               <th>Price</th>
                               <th>Amount</th>
                               <th>Notes</th>
                             </tr>
                          </thead>
                          <tbody>
                          {order.items.map((item, index) => (
                             <tr key={`${order.id}-item-${item.id || index}`}>
                               <td>{item.quantity}</td>
                               <td>{item.item}</td>
                               <td>{item.weight ? item.weight : '-'}</td>
                               <td>${parseFloat(item.price || 0).toFixed(2)}</td>
                               <td>${parseFloat(item.amount || 0).toFixed(2)}</td>
                               <td>{item.notes || '-'}</td>
                             </tr>
                              ))}
                           </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
                {isExpanded && (!order.items || order.items.length === 0) && (
                     <tr className="collapsible-row no-items-row">
                         <td></td>
                         <td colSpan="5" style={{ textAlign: 'center', fontStyle: 'italic', padding: '10px' }}>
                             No item details available for this completed order.
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

      {/* Confirmation Modal for Delete */}
       {confirmDeleteModalState.isOpen && (
         <div className="modal-backdrop">
           <div className="modal">
             <h2>Confirm Deletion</h2>
             <p>Are you sure you want to delete completed Invoice #{confirmDeleteModalState.orderId}? This action cannot be undone.</p>
             <div className="modal-actions">
               <button onClick={handleCancelDelete} className="button button-secondary">Cancel</button>
               <button onClick={handleConfirmDelete} className="button button-danger">Delete Invoice</button>
             </div>
           </div>
         </div>
       )}

    </ManagerLayout>
  );
}

export default ManagerCompletedOrders; 