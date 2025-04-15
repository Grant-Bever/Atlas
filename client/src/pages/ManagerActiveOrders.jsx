import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ManagerLayout from '../components/ManagerLayout';
import '../styles/Table.css'; // Shared table styles
import '../styles/Modal.css'; // Import Modal styles
import { FaPlus, FaEdit, FaTrashAlt, FaSearch, FaUpload, FaChevronDown, FaChevronRight, FaEllipsisV, FaCheckSquare, FaHistory } from 'react-icons/fa';

// Base URL for the API (Consider moving this to a config file)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function ManagerActiveOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]); // Initialize with empty array
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [openMenuId, setOpenMenuId] = useState(null); // Track which menu is open
  const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, orderId: null, type: null }); // Added type for modal reuse

  // --- Fetch Active Orders ---
  useEffect(() => {
    const fetchActiveOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/orders/active`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Ensure items is always an array
        const ordersWithItemsArray = data.map(order => ({
            ...order,
            items: order.items || []
        }));
        setOrders(ordersWithItemsArray);
      } catch (e) {
        console.error("Failed to fetch active orders:", e);
        setError("Failed to load active orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchActiveOrders();
  }, []); // Empty dependency array means run once on mount

  // --- Row Expansion ---
  const handleRowClick = (orderId) => {
     // Close menu if clicking on a row
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

  // --- Actions Menu ---
  const handleMenuToggle = (e, orderId) => {
    e.stopPropagation(); // Prevent row click when clicking dots
    setOpenMenuId(prevId => (prevId === orderId ? null : orderId));
    // Close expanded row if opening menu for it
    if (expandedRows.has(orderId) && openMenuId !== orderId) {
        handleRowClick(orderId);
    }
  };

  // Close menu if clicking outside
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
  const handleEdit = (e, orderId) => {
    e.stopPropagation();
    setOpenMenuId(null); // Close menu
    // TODO: Navigate to an edit page - this needs to be created
    // For now, maybe log or disable
    console.log(`Navigate to edit order: ${orderId}`);
    // navigate(`/orders/edit/${orderId}`); // Uncomment when edit page exists
  };

  const handleDeleteClick = (e, orderId) => {
    e.stopPropagation();
    setOpenMenuId(null); // Close menu
    setConfirmModalState({ isOpen: true, orderId: orderId, type: 'delete' }); // Open modal for deletion
  };

  const handleMarkCompleteClick = (e, orderId) => {
    e.stopPropagation();
    setOpenMenuId(null); // Close menu
    setConfirmModalState({ isOpen: true, orderId: orderId, type: 'complete' }); // Open modal for completion
  };

  // --- Modal Handlers ---
  const handleConfirmAction = async () => {
    const { orderId, type } = confirmModalState;
    if (!orderId || !type) return;

    // Close modal immediately
    setConfirmModalState({ isOpen: false, orderId: null, type: null });

    try {
      let response;
      if (type === 'delete') {
        console.log(`Deleting order: ${orderId}`);
        response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`Failed to delete order ${orderId}. Status: ${response.status}`);
        }
        // Remove from state on successful deletion
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
        // Also remove from expanded rows if it was expanded
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            newSet.delete(orderId);
            return newSet;
        });

      } else if (type === 'complete') {
        console.log(`Marking order ${orderId} complete.`);
        response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ completed: true }), // Send update data
        });
        if (!response.ok) {
          throw new Error(`Failed to mark order ${orderId} as complete. Status: ${response.status}`);
        }
        // Remove from active orders list visually
        setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
         // Also remove from expanded rows
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            newSet.delete(orderId);
            return newSet;
        });
      }
    } catch (err) {
      console.error(`Error during ${type} action for order ${orderId}:`, err);
      setError(`Failed to ${type} order ${orderId}. Please try again.`); // Display error to user
      // Optionally refetch data here if needed to reset state on error
    }
  };

  const handleCancelAction = () => {
    setConfirmModalState({ isOpen: false, orderId: null, type: null }); // Close modal
  };

  // --- Render Logic ---
  if (loading) {
    return <ManagerLayout pageTitle="Active Orders"><div className="loading-indicator">Loading active orders...</div></ManagerLayout>;
  }

  // Display error message if loading fails
   if (error) {
      return (
          <ManagerLayout pageTitle="Active Orders">
              <div className="error-message">{error}</div>
              {/* Optionally add a retry button */}
          </ManagerLayout>
      );
   }

  return (
    <ManagerLayout pageTitle="Active Orders">
      <div className="page-actions-bar">
        <div className="page-actions-left">
            <Link to="/orders/new" className="button button-primary">
                <FaPlus /> New Invoice
            </Link>
            <Link to="/orders/completed" className="button button-secondary" title="View Completed Orders">
                <FaHistory /> Completed
            </Link>
        </div>
        <div className="page-actions-right">
            {/* TODO: Implement Search */}
            <div className="search-bar">
                <input type="text" placeholder="Search Active Orders..." />
                <button className="icon-button"><FaSearch /></button>
            </div>
        </div>
      </div>

      {/* Display general error messages here if needed */}
       {error && !loading && <div className="error-message" style={{ marginBottom: '15px' }}>{error}</div>}


      <table className="data-table main-table">
        <thead>
          <tr>
            <th style={{ width: '30px' }}></th>{/* Expand Icon */}
            <th>Invoice #</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th style={{ width: '50px' }}></th>{/* Actions Menu */}
          </tr>
        </thead>
        <tbody>
          {orders.length > 0 ? orders.map((order) => {
            const isExpanded = expandedRows.has(order.id);
            const isMenuOpen = openMenuId === order.id;

            return (
              <React.Fragment key={order.id}>
                {/* Main Order Row */}
                {/* Add data-order-id to the container for click outside detection */}
                <tr onClick={() => handleRowClick(order.id)} className={`clickable-row ${isExpanded ? 'expanded' : ''}`}>
                  <td className="expand-icon-cell">
                    {order.items && order.items.length > 0 ? (isExpanded ? <FaChevronDown /> : <FaChevronRight />) : ''} {/* Only show icon if items exist */}
                  </td>
                  <td>{order.id}</td>
                  {/* Use customer name from the included association */}
                  <td>{order.customer ? order.customer.name : 'N/A'}</td>
                  {/* Format date if needed */}
                  <td>{new Date(order.date).toLocaleDateString()}</td>
                  <td>${parseFloat(order.total || 0).toFixed(2)}</td>
                  {/* Actions Cell */}
                  {/* Add data-order-id here too */}
                  <td className="action-cell action-menu-container" data-order-id={order.id}>
                     <button onClick={(e) => handleMenuToggle(e, order.id)} className="icon-button menu-dots-button">
                      <FaEllipsisV />
                    </button>
                    {/* Action Menu Dropdown */}
                    {isMenuOpen && (
                      <div className="action-menu">
                        <button onClick={(e) => handleEdit(e, order.id)} disabled><FaEdit /> Edit</button> {/* Disabled for now */}
                        <button onClick={(e) => handleDeleteClick(e, order.id)} className="danger"><FaTrashAlt /> Delete</button>
                        <button onClick={(e) => handleMarkCompleteClick(e, order.id)}><FaCheckSquare /> Mark Complete</button>
                      </div>
                    )}
                  </td>
                </tr>

                {/* Collapsible Row with Nested Table */}
                {isExpanded && order.items && order.items.length > 0 && (
                   <tr className="collapsible-row">
                    <td></td> {/* Spacer for expand icon */}
                    <td colSpan="5"> {/* Span across remaining cols + actions col */}
                      <div className="nested-table-container">
                        <table className="data-table nested-table">
                          <thead>
                             <tr>
                               <th>Quantity</th>
                               <th>Item</th> {/* Changed from Description */}
                               <th>Weight</th>
                               <th>Price</th>
                               <th>Amount</th>
                               <th>Notes</th> {/* Added Notes */}
                             </tr>
                          </thead>
                          <tbody>
                          {order.items.map((item, index) => (
                             <tr key={`${order.id}-item-${item.id || index}`}> {/* Use item.id if available */}
                               <td>{item.quantity}</td>
                               <td>{item.item}</td> {/* Use item field */}
                               <td>{item.weight ? item.weight : '-'}</td>
                               <td>${parseFloat(item.price || 0).toFixed(2)}</td>
                               <td>${parseFloat(item.amount || 0).toFixed(2)}</td>
                               <td>{item.notes || '-'}</td> {/* Display notes */}
                             </tr>
                              ))}
                           </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
                 {/* Handle case where row expanded but no items */}
                 {isExpanded && (!order.items || order.items.length === 0) && (
                     <tr className="collapsible-row no-items-row">
                         <td></td>
                         <td colSpan="5" style={{ textAlign: 'center', fontStyle: 'italic', padding: '10px' }}>
                             No items associated with this order.
                         </td>
                     </tr>
                 )}
              </React.Fragment>
            );
          }) : (
             <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', fontStyle: 'italic' }}>No active orders found.</td>
             </tr>
          )}
        </tbody>
      </table>

      {/* Confirmation Modal */}
      {confirmModalState.isOpen && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2>Confirm Action</h2>
            <p>
              {confirmModalState.type === 'delete'
                ? `Are you sure you want to delete Invoice #${confirmModalState.orderId}? This action cannot be undone.`
                : `Are you sure you want to mark Invoice #${confirmModalState.orderId} as complete?`}
            </p>
            <div className="modal-actions">
              <button onClick={handleCancelAction} className="button button-secondary">
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                className={`button ${confirmModalState.type === 'delete' ? 'button-danger' : 'button-primary'}`}
              >
                {confirmModalState.type === 'delete' ? 'Delete Invoice' : 'Mark Complete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ManagerLayout>
  );
}

export default ManagerActiveOrders; 