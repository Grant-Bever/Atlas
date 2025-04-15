import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ManagerLayout from '../components/ManagerLayout';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';
import '../styles/InvoiceForm.css';

// Base URL for the API (Consider moving this to a config file)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Function to get formatted date yyyy-mm-dd
const getFormattedDate = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

function ManagerNewInvoice() {
  const navigate = useNavigate();
  const { orderId } = useParams(); // orderId will be undefined when creating new
  const isEditing = Boolean(orderId);

  // State for form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState(''); // Phone is now editable
  const [invoiceDate, setInvoiceDate] = useState(getFormattedDate());
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  // State for UI control
  const [isLoading, setIsLoading] = useState(isEditing); // Start loading immediately if editing
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [invoiceNumber, setInvoiceNumber] = useState(isEditing ? orderId : 'Auto-Generated'); // For display

  // --- Fetch Order Data if Editing ---
  useEffect(() => {
    const fetchOrderForEdit = async () => {
      console.log(`Attempting to fetch order ${orderId} for editing...`);
      setIsLoading(true);
      setError(null);
      try {
          const response = await fetch(`${API_BASE_URL}/orders/${orderId}`);
          if (!response.ok) {
             if (response.status === 404) {
                 throw new Error(`Invoice with ID ${orderId} not found.`);
             } else {
                  throw new Error(`Failed to fetch invoice ${orderId}. Status: ${response.status}`);
             }
          }
          const orderData = await response.json();
          console.log("Fetched order data:", orderData);

          // Populate state from fetched data
          setCustomerName(orderData.customer ? orderData.customer.name : '');
          setCustomerPhone(orderData.customer ? orderData.customer.phone : '');
          setInvoiceDate(getFormattedDate(new Date(orderData.date)));
          // Ensure items have a unique frontend ID if they don't have a DB id (though they should)
          setItems(orderData.items.map((item, index) => ({ ...item, id: item.id || Date.now() + index })) || []);
          // Total is calculated automatically by another useEffect based on items
          setInvoiceNumber(orderData.id); // Set the actual invoice number

      } catch (err) {
          console.error("Error fetching order for edit:", err);
          setError(err.message || `Failed to load order ${orderId} for editing.`);
      } finally {
          setIsLoading(false);
      }
    };

    if (isEditing && orderId) {
      fetchOrderForEdit();
    } else {
      // Start with one empty row for new invoice
      setItems([{ id: Date.now(), quantity: '', item: '', weight: '', price: '', notes: '', amount: 0 }]);
      setIsLoading(false); // Ensure loading is false if not editing
    }
    // No dependencies needed that would cause re-fetch on input change
  }, [orderId, isEditing]);

  // --- Item Management ---
  const addItemRow = () => {
    const newId = Date.now() + Math.random();
    setItems([...items, { id: newId, quantity: '', item: '', weight: '', price: '', notes: '', amount: 0 }]);
  };

  const handleItemChange = (id, field, value) => {
    setItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === id) {
          const newItem = { ...item, [field]: value };
          if (field === 'quantity' || field === 'price') {
            const quantity = parseFloat(newItem.quantity) || 0;
            const price = parseFloat(newItem.price) || 0;
            newItem.amount = quantity * price;
          }
          return newItem;
        }
        return item;
      });
    });
  };

  const removeItemRow = (id) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Calculate total whenever items change
  useEffect(() => {
    const newTotal = items.reduce((sum, item) => {
        const amount = parseFloat(item.amount) || 0;
        return sum + amount;
    }, 0);
    setTotal(newTotal);
  }, [items]);

   // --- Customer Input Handlers ---
    const handleCustomerNameChange = (event) => {
        setCustomerName(event.target.value);
    };
    const handleCustomerPhoneChange = (event) => {
        setCustomerPhone(event.target.value);
    };

  // --- Form Submission/Cancellation Handlers ---
  const handleSave = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    // Basic Validation
     if (!customerName.trim()) {
       setError('Please enter a customer name.');
       setIsLoading(false);
       return;
     }
     // Add validation for phone number
     if (!customerPhone.trim()) {
         setError('Please enter a customer phone number.');
         setIsLoading(false);
         return;
     }
     if (items.length === 0) {
         setError('Please add at least one item to the invoice.');
         setIsLoading(false);
         return;
     }
     if (items.some(item => !item.item || !item.quantity || !item.price)) {
         setError('Please ensure all items have at least a description, quantity, and price.');
         setIsLoading(false);
         return;
     }

    // Prepare payload for the API - Sending name and phone
    const itemPayload = items.map(({ id, ...rest }) => ({ // Include amount now
        ...rest,
        quantity: parseFloat(rest.quantity) || 0,
        price: parseFloat(rest.price) || 0,
        amount: parseFloat(rest.amount) || 0, // Ensure amount is included and is a number
        weight: rest.weight ? parseFloat(rest.weight) : null,
    }));

    try {
        let response;
        let responseData;
        if (isEditing) {
            // --- Prepare Update Payload --- 
            const updatePayload = {
              // For now, assume we only update fields directly on the Invoice table
              // We are NOT updating customer or items via this PUT request yet
              // customerName: customerName.trim(), // Decide if customer name should be updatable here
              // customerPhone: customerPhone.trim(), // Decide if customer phone should be updatable here
              date: invoiceDate,
              total: total, // Send updated total based on frontend calculation
              // Potentially add other status fields if needed: checked_out, paid, completed
              // TODO: Handle item updates (add/delete/modify) - Requires more complex logic
              // This might involve fetching original items, diffing, and making separate API calls or a more complex backend endpoint.
            };

            console.log(`UPDATING Invoice ${orderId} with payload:`, updatePayload);
            response = await fetch(`${API_BASE_URL}/orders/${orderId}`, { // Use the orderId in the URL
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatePayload),
            });
             if (!response.ok) {
                let errorMsg = `Failed to update invoice. Status: ${response.status} ${response.statusText}`;
                try { const errorBody = await response.json(); errorMsg = errorBody.message || errorMsg; } catch (e) {} 
                throw new Error(errorMsg);
            }
            responseData = await response.json();
            setSuccessMessage(`Invoice #${responseData.id} updated successfully!`);
            setTimeout(() => navigate('/orders'), 2000); // Redirect after update

        } else {
            // --- Prepare Create Payload ---
            const createPayload = {
              customerName: customerName.trim(),
              customerPhone: customerPhone.trim(),
              date: invoiceDate,
              total: total,
              items: itemPayload, // Send the processed items
              checked_out: false,
              paid: false,
              completed: false,
            };
            console.log("SAVING New Invoice:", createPayload);
            response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(createPayload),
            });
            if (!response.ok) {
                let errorMsg = `Failed to create invoice. Status: ${response.status} ${response.statusText}`;
                try {
                    const errorBody = await response.json();
                    errorMsg = errorBody.message || errorMsg;
                } catch (parseError) {
                    console.error("Could not parse error response body");
                }
                throw new Error(errorMsg);
            }
            responseData = await response.json();
            setSuccessMessage(`Invoice #${responseData.id} created successfully!`);
            setInvoiceNumber(responseData.id);
            setTimeout(() => navigate('/orders'), 2000);
        }

    } catch (err) {
        console.error("Error saving invoice:", err);
        setError(err.message || 'An unexpected error occurred while saving the invoice.');
    } finally {
        setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/orders');
  };

  // --- Render Logic --- 
  if (isLoading) {
      return <ManagerLayout><div>Loading invoice data...</div></ManagerLayout>;
  }

  if (error) {
       return <ManagerLayout><div style={{ color: 'red', padding: '20px' }}>Error: {error}</div></ManagerLayout>;
  }

  return (
    <ManagerLayout pageTitle={isEditing ? `Edit Invoice #${invoiceNumber}` : 'New Invoice'}>
      <form onSubmit={handleSave} className="invoice-form-container">
        <div className="invoice-form-header">
          <h2>{isEditing ? `Edit Invoice #${invoiceNumber}` : 'New Invoice'}</h2>
          <div className="invoice-actions">
            <button type="submit" className="button button-primary" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Invoice'}
            </button>
            <button type="button" onClick={handleCancel} className="button button-secondary" disabled={isLoading}>
              Cancel
            </button>
          </div>
        </div>

        {isLoading && <div className="loading-indicator">Loading...</div>}
        {error && <div className="error-message">Error: {error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        {/* Invoice Header Fields */}
        <div className="invoice-meta">
            <div className="meta-item">
                <label htmlFor="customerNameInput">Customer Name*:</label>
                 <input
                     type="text"
                     id="customerNameInput"
                     value={customerName}
                     onChange={handleCustomerNameChange}
                     placeholder="Customer Name"
                     required
                     disabled={isEditing}
                 />
            </div>
            <div className="meta-item">
                <label htmlFor="customerPhoneInput">Phone*:</label>
                <input
                    type="tel"      // Changed type to tel
                    id="customerPhoneInput" // Changed ID
                    value={customerPhone}
                    onChange={handleCustomerPhoneChange} // Added onChange handler
                    placeholder="Customer Phone Number"
                    required     // Made phone required
                    disabled={isEditing}
                />
            </div>
             <div className="meta-item">
                 <label>Invoice #:</label>
                 <span className="invoice-number">{invoiceNumber}</span>
             </div>
            <div className="meta-item">
                <label htmlFor="invoiceDate">Date:</label>
                <input
                    type="date"
                    id="invoiceDate"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    required
                />
            </div>
        </div>

        {/* Invoice Items Table */}
        <div className="invoice-items-section scrollable">
          <table className="data-table invoice-items-table">
            <thead>
              <tr>
                <th>Quantity*</th>
                <th>Item Description*</th>
                <th>Weight</th>
                <th>Unit Price*</th>
                <th>Amount</th>
                <th>Notes</th>
                <th style={{width: '50px'}}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
                  <td><input type="number" step="any" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} placeholder="0" required className="input-narrow" /></td>
                  <td><input type="text" value={item.item} onChange={(e) => handleItemChange(item.id, 'item', e.target.value)} placeholder="Item description" required /></td>
                  <td><input type="number" step="any" value={item.weight} onChange={(e) => handleItemChange(item.id, 'weight', e.target.value)} placeholder="Optional" className="input-narrow" /></td>
                  <td><input type="number" step="0.01" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} placeholder="0.00" required className="input-narrow"/></td>
                  <td className="amount-cell">${(parseFloat(item.amount) || 0).toFixed(2)}</td>
                   <td><input type="text" value={item.notes} onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)} placeholder="Optional notes" /></td>
                  <td className="action-cell">
                    {(items.length > 1 || isEditing) && (
                        <button type="button" onClick={() => removeItemRow(item.id)} className="icon-button danger" title="Remove Item"><FaTrashAlt /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button type="button" onClick={addItemRow} className="button add-item-button" disabled={isLoading}>
            <FaPlus /> Add Item
          </button>
        </div>

        {/* Invoice Total */}
        <div className="invoice-total">
          <span>TOTAL:</span>
          <span>${total.toFixed(2)}</span>
        </div>

      </form>
    </ManagerLayout>
  );
}

export default ManagerNewInvoice; 