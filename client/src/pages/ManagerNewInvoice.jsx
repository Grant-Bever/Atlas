import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ManagerLayout from '../components/ManagerLayout';
import { FaPlus, FaTrashAlt } from 'react-icons/fa';
import '../styles/InvoiceForm.css';

// Function to get formatted date yyyy-mm-dd
const getFormattedDate = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

// --- Sample Data Fetching (Replace with actual API call) ---
// This is just for demonstration purposes. In a real app, 
// you would fetch this from your backend based on orderId.
const fetchOrderData = (orderId) => {
    console.log("Fetching data for order ID:", orderId);
    // Simulate finding order data (replace with actual API call)
    const allOrders = [
      { id: 112, customerName: 'Michoacano', customerPhone: '123-456-7890', invoiceDate: '2024-06-18', total: 457.00, items: [ { id: 1, quantity: 5, description: 'Ribeye Steak', weight: 15, price: 8.99, amount: 134.85 }, /* ... more items */ ] },
      { id: 113, customerName: 'Mosner', customerPhone: '987-654-3210', invoiceDate: '2024-06-19', total: 160.00, items: [ { id: 1, quantity: 10, description: 'Chicken Wings', weight: 10, price: 2.50, amount: 25.00 }, /* ... more items */ ] },
      // ... add other sample orders if needed for testing edit
    ];
    const numericOrderId = parseInt(orderId, 10);
    const foundOrder = allOrders.find(order => order.id === numericOrderId);
    console.log("Found Order:", foundOrder)
    return foundOrder ? Promise.resolve(foundOrder) : Promise.resolve(null); 
};
// --- End Sample Data Fetching ---

function ManagerNewInvoice() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const isEditing = Boolean(orderId);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(getFormattedDate());
  const [items, setItems] = useState([
    // Start with one empty item row only if creating new
    // { id: 1, quantity: '', description: '', weight: '', price: '', amount: 0 },
  ]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(isEditing);
  const [error, setError] = useState(null);

  // Fetch data if in edit mode
  useEffect(() => {
    if (isEditing) {
      setIsLoading(true);
      fetchOrderData(orderId)
        .then(data => {
          if (data) {
            setCustomerName(data.customerName || '');
            setCustomerPhone(data.customerPhone || '');
            setInvoiceDate(data.invoiceDate ? getFormattedDate(new Date(data.invoiceDate)) : getFormattedDate());
            setItems(data.items.map((item, index) => ({ ...item, id: item.id || Date.now() + index })) || []);
            setTotal(data.total || 0);
          } else {
            setError('Order not found.');
          }
        })
        .catch(err => {
          console.error("Error fetching order data:", err);
          setError('Failed to load order data.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
        // Start with one empty row if creating a new invoice
        setItems([{ id: Date.now(), quantity: '', description: '', weight: '', price: '', amount: 0 }]);
    }
  }, [orderId, isEditing]);

  // Function to add a new item row
  const addItemRow = () => {
    const newId = Date.now();
    setItems([...items, { id: newId, quantity: '', description: '', weight: '', price: '', amount: 0 }]);
  };

  // Function to handle changes in item rows
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

  // Function to remove an item row
  const removeItemRow = (id) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Calculate total whenever items change
  useEffect(() => {
    const newTotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    setTotal(newTotal);
  }, [items]);

  // --- Form Submission/Cancellation Handlers ---
  const handleSave = () => {
    const invoicePayload = {
      customerName,
      customerPhone,
      invoiceDate,
      items: items.map(({ id, ...rest }) => rest),
      total
    };

    if (isEditing) {
        console.log(`UPDATING Invoice ${orderId}:`, invoicePayload);
        // TODO: Call API to update orderId
    } else {
        console.log("SAVING New Invoice:", invoicePayload);
        // TODO: Call API to create new invoice
    }

    navigate('/orders');
  };

  const handleCancel = () => {
    navigate('/orders'); // Navigate back to active orders
  };

  // --- Render Logic --- 
  if (isLoading) {
      return <ManagerLayout><div>Loading invoice data...</div></ManagerLayout>;
  }

  if (error) {
       return <ManagerLayout><div style={{ color: 'red', padding: '20px' }}>Error: {error}</div></ManagerLayout>;
  }

  return (
    <ManagerLayout>
      <div className="invoice-form-container">
        <div className="invoice-form-header">
          <h2>{isEditing ? `Edit Invoice #${orderId}` : 'New Invoice'}</h2>
          <div className="invoice-actions">
            <button onClick={handleSave} className="button button-primary">Save Invoice</button>
            <button onClick={handleCancel} className="button button-secondary">Cancel</button>
          </div>
        </div>

        {/* Invoice Header Fields */}
        <div className="invoice-meta">
            <div className="meta-item">
                <label htmlFor="customerName">Name:</label>
                <input
                    type="text"
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer Name"
                />
            </div>
            <div className="meta-item">
                <label htmlFor="customerPhone">Phone:</label>
                <input
                    type="tel"
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Customer Phone"
                />
            </div>
            <div className="meta-item">
                <label>Invoice #:</label>
                <span className="invoice-number">{isEditing ? orderId : 'Auto-Generated'}</span>
            </div>
            <div className="meta-item">
                <label htmlFor="invoiceDate">Date:</label>
                <input
                    type="date"
                    id="invoiceDate"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                />
            </div>
        </div>

        {/* Invoice Items Table */}
        <div className="invoice-items-section scrollable">
          <table className="data-table invoice-items-table">
            <thead>
              <tr>
                <th>Quantity</th>
                <th>Description</th>
                <th>Weight</th>
                <th>Price</th>
                <th>Amount</th>
                <th style={{width: '50px'}}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td><input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} placeholder="0" /></td>
                  <td><input type="text" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} placeholder="Item description" /></td>
                  <td><input type="number" value={item.weight} onChange={(e) => handleItemChange(item.id, 'weight', e.target.value)} placeholder="0" /></td>
                  <td><input type="number" step="0.01" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} placeholder="0.00" /></td>
                  <td>${(item.amount || 0).toFixed(2)}</td>
                  <td className="action-cell">
                    {(items.length > 1 || isEditing) && (
                        <button onClick={() => removeItemRow(item.id)} className="icon-button danger"><FaTrashAlt /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={addItemRow} className="button add-item-button">
            <FaPlus /> Add Item
          </button>
        </div>

        {/* Invoice Total */}
        <div className="invoice-total">
          <span>TOTAL:</span>
          <span>${total.toFixed(2)}</span>
        </div>

      </div>
    </ManagerLayout>
  );
}

export default ManagerNewInvoice; 