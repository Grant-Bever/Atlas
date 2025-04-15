import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ManagerLayout from '../components/ManagerLayout';
import '../styles/FormPage.css'; // Shared form styles

// Base URL for the API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// --- REMOVE Sample Data Fetching ---
// const fetchInventoryItemData = (itemId) => { ... }; // REMOVED

const fetchCategories = () => {
    // Simulate fetching existing categories - Keep for now, replace later if needed
    return Promise.resolve(['Beef', 'Poultry', 'Pork', 'Miscellaneous']);
};
// --- End Sample Data Fetching ---

const ADD_NEW_CATEGORY_VALUE = '__add_new__';

function AddInventoryItem() {
  const navigate = useNavigate();
  const { itemId } = useParams();
  const isEditing = Boolean(itemId);

  // Form State
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [pricePerPound, setPricePerPound] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(''); // Holds the value from dropdown
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  // Data State
  const [existingCategories, setExistingCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch categories and item data (if editing)
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Promise for fetching categories (using placeholder for now)
    const categoriesPromise = fetchCategories();

    // Promise for fetching item data ONLY if editing
    const itemDataPromise = isEditing
        ? fetch(`${API_BASE_URL}/inventory/${itemId}`)
            .then(res => {
                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error('Inventory item not found.');
                    }
                    // Try to parse error message from backend
                    return res.json().then(errData => {
                         throw new Error(errData.message || 'Failed to fetch inventory item.');
                    });
                }
                return res.json(); // Parse successful response
            })
        : Promise.resolve(null); // Resolve with null if not editing

    Promise.all([categoriesPromise, itemDataPromise])
      .then(([categories, itemData]) => {
        setExistingCategories(categories || []);

        if (isEditing) {
          if (itemData) {
            setItemName(itemData.name || '');
            setQuantity(itemData.quantity !== undefined ? String(itemData.quantity) : '');
            // Use price_per_pound from backend data
            setPricePerPound(itemData.price_per_pound !== undefined ? String(itemData.price_per_pound) : '');

            const itemCategory = itemData.category || '';
            // Ensure the item's category is in the list, even if it was newly created before
            if (itemCategory && !categories.includes(itemCategory)) {
                 setExistingCategories(prev => [...new Set([...prev, itemCategory])]); // Use Set to avoid duplicates
            }
            setSelectedCategory(itemCategory);

          } else {
            // This case might be handled by the fetch error now, but keep as fallback
            setError('Inventory item not found.');
          }
        } else {
             // Default to first category or empty if none exist when creating
             setSelectedCategory(categories.length > 0 ? categories[0] : '');
        }
      })
      .catch(err => {
        console.error("Error loading data:", err);
        setError(err.message || 'Failed to load data.'); // Display specific error message
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [itemId, isEditing]); // Dependencies: itemId and isEditing

  // Handle category dropdown change
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
    if (value === ADD_NEW_CATEGORY_VALUE) {
      setShowNewCategoryInput(true);
    } else {
      setShowNewCategoryInput(false);
      setNewCategoryName(''); // Clear new category name if selecting existing
    }
  };

  // Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    let finalCategory = selectedCategory;
    if (selectedCategory === ADD_NEW_CATEGORY_VALUE) {
        if (!newCategoryName.trim()) {
            alert('Please enter a name for the new category.'); // Basic validation
            return;
        }
        finalCategory = newCategoryName.trim();
        // TODO: API call to potentially create the new category if it doesn't exist
        console.log("Creating/Using new category:", finalCategory);
    }

    // TODO: Add more robust validation
    
    const itemPayload = {
        name: itemName,
        category: finalCategory,
        quantity: parseFloat(quantity) || 0,
        price_per_pound: parseFloat(pricePerPound) || 0,
        // Add price_per_box if you have an input & state for it
        // price_per_box: parseFloat(pricePerBox) || 0 
    };

    // Clear previous errors
    setError(null);

    const saveItem = async () => {
        setIsLoading(true); // Show loading state during save
        try {
            let response;
            let successMessage;

            if (isEditing) {
                console.log(`UPDATING Item ${itemId}:`, itemPayload);
                // --- Update Item API Call ---
                response = await fetch(`${API_BASE_URL}/inventory/${itemId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(itemPayload)
                });
                successMessage = 'Item updated successfully!';
            } else {
                console.log("SAVING New Item:", itemPayload);
                // --- Create Item API Call ---
                response = await fetch(`${API_BASE_URL}/inventory`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(itemPayload)
                });
                successMessage = 'Item added successfully!';
            }

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'save'} item.`);
            }

            console.log(successMessage);
            navigate('/inventory'); // Navigate back only on success

        } catch (err) {
            console.error(`Error ${isEditing ? 'updating' : 'saving'} item:`, err);
            setError(err.message); // Display error on the form page
        } finally {
            setIsLoading(false); // Hide loading state
        }
    };

    saveItem(); // Call the async function
  };

  const handleCancel = () => {
    navigate('/inventory');
  };

  // --- Render Logic ---
  if (isLoading) {
    return <ManagerLayout><div>Loading...</div></ManagerLayout>;
  }

  if (error) {
    return <ManagerLayout><div style={{ color: 'red', padding: '20px' }}>Error: {error}</div></ManagerLayout>;
  }

  return (
    <ManagerLayout pageTitle={isEditing ? `Edit Item: ${itemName || itemId}` : 'Add New Inventory Item'}>
      <div className="form-page-container">
        <form onSubmit={handleSubmit}>
           {/* Use same header structure as AddEmployee */}
          <div className="form-page-header">
            <h2>{isEditing ? 'Edit Item Details' : 'Add New Item'}</h2>
            <div className="form-page-actions">
              <button type="button" onClick={handleCancel} className="button button-secondary">Cancel</button>
              <button type="submit" className="button button-primary">Confirm</button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="itemName">Name</label>
              <input type="text" id="itemName" value={itemName} onChange={(e) => setItemName(e.target.value)} required />
            </div>
            
            <div className="form-field">
              <label htmlFor="itemCategory">Item Type / Category</label>
              <select id="itemCategory" value={selectedCategory} onChange={handleCategoryChange} required>
                <option value="" disabled={!isEditing}>-- Select Category --</option> {/* Allow empty selection only if not editing */} 
                {existingCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value={ADD_NEW_CATEGORY_VALUE}>+ Add New Category</option>
              </select>
            </div>

            {/* Conditionally show input for new category name */} 
            {showNewCategoryInput && (
                <div className="form-field">
                    <label htmlFor="newCategoryName">New Category Name</label>
                    <input 
                        type="text" 
                        id="newCategoryName" 
                        value={newCategoryName} 
                        onChange={(e) => setNewCategoryName(e.target.value)} 
                        placeholder="Enter new category name" 
                        required={selectedCategory === ADD_NEW_CATEGORY_VALUE} // Make required only when adding
                    />
                </div>
            )}

            <div className="form-field">
              <label htmlFor="quantity">Quantity</label>
              <input type="number" id="quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required placeholder="e.g., 50"/>
            </div>

            <div className="form-field">
              <label htmlFor="pricePerPound">Price / Pound ($)</label>
              <input type="number" step="0.01" id="pricePerPound" value={pricePerPound} onChange={(e) => setPricePerPound(e.target.value)} required placeholder="e.g., 4.99"/>
            </div>
          </div>
        </form>
      </div>
    </ManagerLayout>
  );
}

export default AddInventoryItem; 