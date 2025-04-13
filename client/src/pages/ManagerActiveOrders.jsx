import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import ManagerLayout from '../components/ManagerLayout';
import '../styles/Table.css'; // Shared table styles
import '../styles/Modal.css'; // Import Modal styles
import { FaPlus, FaEdit, FaTrashAlt, FaSearch, FaUpload, FaChevronDown, FaChevronRight, FaEllipsisV, FaCheckSquare, FaHistory } from 'react-icons/fa';

// Initial Sample Data (will be moved to state)
const initialSampleOrders = [
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
  const navigate = useNavigate();
  const [orders, setOrders] = useState(initialSampleOrders); // Manage orders in state
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [openMenuId, setOpenMenuId] = useState(null); // Track which menu is open
  const [confirmModalState, setConfirmModalState] = useState({ isOpen: false, orderId: null });

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
      if (openMenuId !== null && !event.target.closest('.action-menu-container')) {
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
    navigate(`/orders/edit/${orderId}`);
  };

  const handleDelete = (e, orderId) => {
    e.stopPropagation();
    // Update state to remove the order (replace with API call later)
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    setOpenMenuId(null); // Close menu
    // Also remove from expanded rows if it was expanded
    setExpandedRows(prev => {
        const newSet = new Set(prev);
        newSet.delete(orderId);
        return newSet;
    });
    console.log(`Delete order: ${orderId}`);
  };

  const handleMarkCompleteClick = (e, orderId) => {
    e.stopPropagation();
    setOpenMenuId(null); // Close menu
    setConfirmModalState({ isOpen: true, orderId: orderId }); // Open modal
  };

  // --- Modal Handlers --- 
  const handleConfirmComplete = () => {
    const orderId = confirmModalState.orderId;
    console.log(`Order ${orderId} marked complete. Notify customer.`);
    // TODO: API call to mark complete & notify
    // For now, just remove from active orders list visually
    setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
    setConfirmModalState({ isOpen: false, orderId: null }); // Close modal
  };

  const handleCancelComplete = () => {
    setConfirmModalState({ isOpen: false, orderId: null }); // Close modal
  };


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
            <div className="search-bar">
                <input type="text" placeholder="Search Active Orders..." />
                <button className="icon-button"><FaSearch /></button>
            </div>
        </div>
      </div>

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
                        <button onClick={(e) => handleEdit(e, order.id)}><FaEdit /> Edit</button>
                        <button onClick={(e) => handleDelete(e, order.id)} className="danger"><FaTrashAlt /> Delete</button>
                        <button onClick={(e) => handleMarkCompleteClick(e, order.id)}><FaCheckSquare /> Mark Complete</button> {/* Example icon */} 
                      </div>
                    )}
                  </td>
                </tr>

                {/* Collapsible Row with Nested Table */}
                {isExpanded && (
                   <tr className="collapsible-row">
                    <td></td> {/* Spacer for expand icon */} 
                    <td colSpan="5"> {/* Span across remaining cols + actions col */} 
                      <div className="nested-table-container">
                        <table className="data-table nested-table">
                          {/* ... nested table thead/tbody ... */}
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
          }) : (
             <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '20px', fontStyle: 'italic' }}>No active orders found.</td>
             </tr>
          )} 
        </tbody>
      </table>

      {/* Confirmation Modal */}
      {confirmModalState.isOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h4>Confirm Order Completion</h4>
            <p>Are you sure you want to mark order #{confirmModalState.orderId} as complete? This will notify the customer.</p>
            <div className="modal-actions">
              <button onClick={handleCancelComplete} className="button button-secondary">Cancel</button>
              <button onClick={handleConfirmComplete} className="button button-primary">Confirm</button>
            </div>
          </div>
        </div>
      )}
    </ManagerLayout>
  );
}

export default ManagerActiveOrders; 