import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ManagerLayout from '../components/ManagerLayout';
import '../styles/FormPage.css'; // Shared form styles

// --- Sample Data Fetching (Replace with actual API calls) ---
const fetchInventoryItemData = (itemId) => {
  console.log("Fetching data for item ID:", itemId);
  // Simulate finding item data
  const allItems = [
    { id: 'b1', name: 'Ribeye', quantity: 25, pricePerPound: 12.99, category: 'Beef' },
    { id: 'p1', name: 'Chicken Breast', quantity: 80, pricePerPound: 3.99, category: 'Poultry' },
    // ... other items
  ];
  const foundItem = allItems.find(item => item.id === itemId);
  return foundItem ? Promise.resolve(foundItem) : Promise.resolve(null);
};

const fetchCategories = () => {
    // Simulate fetching existing categories
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
    Promise.all([fetchCategories(), isEditing ? fetchInventoryItemData(itemId) : Promise.resolve(null)])
      .then(([categories, itemData]) => {
        setExistingCategories(categories || []);
        
        if (isEditing) {
          if (itemData) {
            setItemName(itemData.name || '');
            setQuantity(itemData.quantity !== undefined ? String(itemData.quantity) : '');
            setPricePerPound(itemData.pricePerPound !== undefined ? String(itemData.pricePerPound) : '');
            // Ensure the item's category is selected, even if it was newly created before
            if (itemData.category && !categories.includes(itemData.category)) {
                 setExistingCategories(prev => [...prev, itemData.category]);
            }
            setSelectedCategory(itemData.category || '');

          } else {
            setError('Inventory item not found.');
          }
        } else {
             // Default to first category or empty if none exist when creating
             setSelectedCategory(categories.length > 0 ? categories[0] : '');
        }
      })
      .catch(err => {
        console.error("Error loading data:", err);
        setError('Failed to load data.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [itemId, isEditing]);

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
        pricePerPound: parseFloat(pricePerPound) || 0
    };

    if (isEditing) {
        console.log(`UPDATING Item ${itemId}:`, itemPayload);
        // TODO: Call API to update itemId
    } else {
        console.log("SAVING New Item:", itemPayload);
        // TODO: Call API to create new item
    }

    navigate('/inventory'); // Navigate back to inventory list
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