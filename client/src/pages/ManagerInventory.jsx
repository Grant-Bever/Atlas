import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ManagerLayout from '../components/ManagerLayout';
import '../styles/Inventory.css'; // Create this CSS file
import '../styles/Table.css';   // For action menu styles
import { FaPlus, FaSearch, FaChevronDown, FaChevronRight, FaEllipsisV, FaEdit, FaTrashAlt } from 'react-icons/fa';

// --- Sample Data ---
// Structure: Array of categories, each with items
const initialInventory = [
  {
    category: 'Beef',
    items: [
      { id: 'b1', name: 'Ribeye', quantity: 25, pricePerPound: 12.99 },
      { id: 'b2', name: 'Porterhouse', quantity: 15, pricePerPound: 14.50 },
      { id: 'b3', name: 'Filet Mignon', quantity: 30, pricePerPound: 18.75 },
      { id: 'b4', name: 'Ground Beef', quantity: 150, pricePerPound: 4.99 },
    ]
  },
  {
    category: 'Poultry',
    items: [
      { id: 'p1', name: 'Chicken Breast', quantity: 80, pricePerPound: 3.99 },
      { id: 'p2', name: 'Chicken Thighs', quantity: 120, pricePerPound: 2.49 },
      { id: 'p3', name: 'Whole Chicken', quantity: 40, pricePerPound: 1.99 },
    ]
  },
  {
    category: 'Pork',
    items: [
       { id: 'pk1', name: 'Pork Chops', quantity: 65, pricePerPound: 4.25 },
       { id: 'pk2', name: 'Pork Belly', quantity: 35, pricePerPound: 6.99 },
    ]
  },
  {
      category: 'Miscellaneous',
      items: []
  }
];

function ManagerInventory() {
  const navigate = useNavigate();
  const [inventory, setInventory] = useState(initialInventory);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [openItemMenuId, setOpenItemMenuId] = useState(null); // Tracks menu for item.id

  // --- Category Expansion --- 
  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryName)) {
        newSet.delete(categoryName);
      } else {
        newSet.add(categoryName);
      }
      return newSet;
    });
     // Close any open item menu when toggling category
    setOpenItemMenuId(null); 
  };

  // --- Item Action Menu --- 
  const handleItemMenuToggle = (e, itemId) => {
    e.stopPropagation(); // Prevent category toggle if clicking dots
    setOpenItemMenuId(prevId => (prevId === itemId ? null : itemId));
  };

   // Close item menu if clicking outside
   useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside an open menu AND not on a menu toggle button itself
      if (openItemMenuId !== null && 
          !event.target.closest('.item-action-menu') && 
          !event.target.closest('.item-menu-dots-button')) {
        setOpenItemMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openItemMenuId]); 

  // --- Item Action Handlers (Placeholders) --- 
  const handleEditItem = (e, itemId) => {
    e.stopPropagation();
    console.log(`Edit item: ${itemId}`);
    setOpenItemMenuId(null);
    navigate(`/inventory/edit/${itemId}`); // Navigate to edit page
  };

  const handleDeleteItem = (e, categoryName, itemId) => {
     e.stopPropagation();
     console.log(`Delete item: ${itemId} from category ${categoryName}`);
     // TODO: API call to delete item
     setInventory(prevInventory => 
         prevInventory.map(category => {
             if (category.category === categoryName) {
                 return {
                     ...category,
                     items: category.items.filter(item => item.id !== itemId)
                 };
             }
             return category;
         })
     );
     setOpenItemMenuId(null);
  };

   const handleAddQuantity = (e, itemId) => {
    e.stopPropagation();
    console.log(`Add quantity for item: ${itemId}`);
    // TODO: Implement modal or inline form to add quantity
    setOpenItemMenuId(null);
  };

  return (
    <ManagerLayout pageTitle="Inventory">
      {/* Actions Bar */}
      <div className="page-actions-bar">
        <Link to="/inventory/add" className="button button-primary">
          <FaPlus /> Add Item
        </Link>
        <div className="search-bar">
          <input type="text" placeholder="Search Inventory..." />
          <button className="icon-button"><FaSearch /></button>
        </div>
      </div>

      {/* Inventory Categories List */}
      <div className="inventory-categories">
        {inventory.map((cat) => {
          const isExpanded = expandedCategories.has(cat.category);
          return (
            <div key={cat.category} className="inventory-category-section">
              <div className="category-header" onClick={() => toggleCategory(cat.category)}>
                <h3>
                  {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                  {cat.category}
                </h3>
                 {/* Optional: Add category-level actions here? */}
              </div>
              {isExpanded && (
                <div className="category-items-grid">
                  {cat.items.length > 0 ? (
                    cat.items.map(item => (
                      <div key={item.id} className="inventory-item-card">
                        <div className="item-card-content">
                            <span className="item-name">{item.name}</span>
                            <span className="item-quantity">Qty: {item.quantity}</span>
                        </div>
                        {/* Action Menu for Item */}
                         <div className="item-action-menu-container">
                            <button 
                                onClick={(e) => handleItemMenuToggle(e, item.id)} 
                                className="icon-button item-menu-dots-button">
                            <FaEllipsisV />
                            </button>
                            {openItemMenuId === item.id && (
                            <div className="action-menu item-action-menu"> { /* Reuse action-menu styles */}
                                <button onClick={(e) => handleEditItem(e, item.id)}><FaEdit /> Edit</button>
                                <button onClick={(e) => handleAddQuantity(e, item.id)}><FaPlus /> Add Quantity</button> {/* Placeholder */}
                                <button onClick={(e) => handleDeleteItem(e, cat.category, item.id)} className="danger"><FaTrashAlt /> Delete</button>
                            </div>
                            )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-items-message">No items in this category.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </ManagerLayout>
  );
}

export default ManagerInventory; 