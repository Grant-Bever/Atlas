import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ManagerLayout from '../components/ManagerLayout';
import Modal from '../components/Modal'; // Assuming a reusable Modal component exists
import '../styles/Inventory.css';
import '../styles/Table.css'; // For action menu
import '../styles/Modal.css'; // For modal styles
import { FaPlus, FaSearch, FaChevronDown, FaChevronRight, FaEllipsisV, FaEdit, FaTrashAlt } from 'react-icons/fa';

// Base URL for the API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

function ManagerInventory() {
    const navigate = useNavigate();
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionError, setActionError] = useState(null); // For action-specific errors
    const [expandedCategories, setExpandedCategories] = useState(new Set());
    const [openItemMenuId, setOpenItemMenuId] = useState(null);

    // State for Add Quantity Modal
    const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
    const [currentItemForQty, setCurrentItemForQty] = useState(null); // { id, name, currentQty }
    const [quantityToAdd, setQuantityToAdd] = useState('');

    // State for Delete Confirmation Modal
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentItemForDelete, setCurrentItemForDelete] = useState(null); // { id, name }

    // --- Fetch Data ---
    const fetchInventory = useCallback(async () => {
        setLoading(true);
        setError(null);
        setActionError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/inventory`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setInventory(data);
            // Optionally pre-expand categories with items
            const initialExpanded = new Set(data.filter(cat => cat.items.length > 0).map(cat => cat.category));
            setExpandedCategories(initialExpanded);
        } catch (e) {
            console.error("Failed to fetch inventory:", e);
            setError("Failed to load inventory. Please try again later.");
            setInventory([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

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
        setOpenItemMenuId(null);
    };

    // --- Item Action Menu ---
    const handleItemMenuToggle = (e, itemId) => {
        e.stopPropagation();
        setOpenItemMenuId(prevId => (prevId === itemId ? null : itemId));
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
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

    // --- Item Action Handlers ---
    const handleEditItem = (e, itemId) => {
        e.stopPropagation();
        setOpenItemMenuId(null);
        console.log(`Navigate to edit item: ${itemId}`);
        navigate(`/inventory/edit/${itemId}`);
    };

    const openAddQuantityModal = (e, item) => {
        e.stopPropagation();
        setCurrentItemForQty({
            id: item.id,
            name: item.name,
            currentQty: item.quantity
        });
        setQuantityToAdd(''); // Reset input
        setIsQtyModalOpen(true);
        setOpenItemMenuId(null);
    };

    const openDeleteModal = (e, item) => {
        e.stopPropagation();
        setCurrentItemForDelete({ id: item.id, name: item.name });
        setIsDeleteModalOpen(true);
        setOpenItemMenuId(null);
    };

    // --- API Call Handlers ---
    const handleConfirmAddQuantity = async (e) => {
        e.preventDefault(); // Prevent form submission
        if (!currentItemForQty || !quantityToAdd) return;

        const amount = parseFloat(quantityToAdd);
        if (isNaN(amount) || amount <= 0) {
            setActionError('Please enter a valid positive quantity to add.');
            return;
        }

        setActionError(null);
        const url = `${API_BASE_URL}/inventory/${currentItemForQty.id}/add-quantity`;

        try {
            const response = await fetch(url, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amountToAdd: amount })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to add quantity.');
            }
            // Refetch inventory to see the updated quantity
            fetchInventory();
            setIsQtyModalOpen(false);
            setCurrentItemForQty(null);
        } catch (err) {
            console.error("Error adding quantity:", err);
            setActionError(`Failed to add quantity: ${err.message}`);
            // Keep modal open on error
        }
    };

    const handleConfirmDelete = async () => {
        if (!currentItemForDelete) return;
        setActionError(null);
        const url = `${API_BASE_URL}/inventory/${currentItemForDelete.id}`;

        try {
            const response = await fetch(url, { method: 'DELETE' });
            if (!response.ok && response.status !== 204) { // 204 is success with no content
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete item.');
            }

            // Option 1: Refetch all data
            fetchInventory();

            // Option 2: Update local state (more complex with grouped structure)
            // setInventory(prevInventory => {
            //     const updatedInventory = [];
            //     prevInventory.forEach(category => {
            //         const filteredItems = category.items.filter(item => item.id !== currentItemForDelete.id);
            //         if (filteredItems.length > 0) {
            //             updatedInventory.push({ ...category, items: filteredItems });
            //         } // Optionally remove category if empty
            //     });
            //     return updatedInventory;
            // });

            setIsDeleteModalOpen(false);
            setCurrentItemForDelete(null);

        } catch (err) {
            console.error("Error deleting item:", err);
            setActionError(`Failed to delete item: ${err.message}`);
            setIsDeleteModalOpen(false); // Close modal even on error for now
        }
    };

    // --- Render Logic ---
    if (loading) {
        return <ManagerLayout pageTitle="Inventory"><div className="loading-indicator">Loading inventory...</div></ManagerLayout>;
    }

    return (
        <ManagerLayout pageTitle="Inventory">
            {/* Actions Bar */}
            <div className="page-actions-bar">
                <Link to="/inventory/add" className="button button-primary">
                    <FaPlus /> Add Item
                </Link>
                {/* TODO: Implement Search */}
                {/* <div className="search-bar">
                    <input type="text" placeholder="Search Inventory..." />
                    <button className="icon-button"><FaSearch /></button>
                </div> */}
            </div>

            {error && <div className="error-message error-general">{error}</div>}
            {actionError && <div className="error-message error-action">{actionError}</div>}

            {/* Inventory Categories List */}
            <div className="inventory-categories">
                {inventory.length === 0 && !loading && <p>No inventory items found.</p>}
                {inventory.map((cat) => {
                    const isExpanded = expandedCategories.has(cat.category);
                    return (
                        <div key={cat.category} className="inventory-category-section">
                            <div className="category-header" onClick={() => toggleCategory(cat.category)}>
                                <h3>
                                    {isExpanded ? <FaChevronDown /> : <FaChevronRight />}
                                    {cat.category}
                                </h3>
                            </div>
                            {isExpanded && (
                                <div className="category-items-grid">
                                    {cat.items.length > 0 ? (
                                        cat.items.map(item => (
                                            <div key={item.id} className="inventory-item-card">
                                                <div className="item-card-content">
                                                    <span className="item-name">{item.name}</span>
                                                    <span className="item-quantity">Qty: {item.quantity?.toFixed(2)}</span>
                                                     {/* Display price based on what exists */}
                                                    {item.pricePerPound !== null && <span className="item-price">${item.pricePerPound.toFixed(2)}/lb</span>}
                                                    {item.pricePerBox !== null && <span className="item-price">${item.pricePerBox.toFixed(2)}/box</span>}
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
                                                            <button onClick={(e) => openAddQuantityModal(e, item)}><FaPlus /> Add Quantity</button>
                                                            <button onClick={(e) => openDeleteModal(e, item)} className="danger"><FaTrashAlt /> Delete</button>
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

            {/* Add Quantity Modal */}
            {isQtyModalOpen && currentItemForQty && (
                <Modal isOpen={isQtyModalOpen} onClose={() => setIsQtyModalOpen(false)} title={`Add Quantity for ${currentItemForQty.name}`}>
                    <form onSubmit={handleConfirmAddQuantity}>
                         <p>Current Quantity: {currentItemForQty.currentQty?.toFixed(2)}</p>
                         <div className="form-field">
                             <label htmlFor="quantityToAdd">Quantity to Add:</label>
                             <input
                                 type="number"
                                 id="quantityToAdd"
                                 value={quantityToAdd}
                                 onChange={(e) => setQuantityToAdd(e.target.value)}
                                 step="0.01" // Allow decimals if needed
                                 min="0.01"
                                 required
                                 autoFocus
                             />
                         </div>
                         {actionError && <p className="error-message">{actionError}</p>} 
                         <div className="modal-actions">
                            <button type="button" onClick={() => setIsQtyModalOpen(false)} className="button button-secondary">Cancel</button>
                            <button type="submit" className="button button-primary">Add Quantity</button>
                        </div>
                    </form>
                </Modal>
            )}

            {/* Delete Confirmation Modal */}
             {isDeleteModalOpen && currentItemForDelete && (
                <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
                    <p>Are you sure you want to delete the item: <strong>{currentItemForDelete.name}</strong>?</p>
                    <p>This action cannot be undone.</p>
                     {actionError && <p className="error-message">{actionError}</p>} 
                    <div className="modal-actions">
                        <button onClick={() => setIsDeleteModalOpen(false)} className="button button-secondary">Cancel</button>
                        <button onClick={handleConfirmDelete} className="button button-danger">Delete Item</button>
                    </div>
                </Modal>
            )}

        </ManagerLayout>
    );
}

export default ManagerInventory; 