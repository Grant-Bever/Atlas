import React, { useState } from 'react';
import './CustomerView.css';
import ribeye from '../Pictures/ribeye.jfif';
import groundbeef from '../Pictures/groundbeef.jfif';
import tenderloin from '../Pictures/tenderloin.jfif';
import newYorkStrip from '../Pictures/new york strip.jfif';
import brisket from '../Pictures/brisket.jfif';
import shortribs from '../Pictures/shortribs.jfif';

const CustomerView = () => {
  const [activeTab, setActiveTab] = useState('beef');
  const [cartItems, setCartItems] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [quantities, setQuantities] = useState({});

  // Mock data - would come from backend in real implementation
  const categories = ['beef', 'poultry', 'pork', 'seafood', 'lamb', 'specialty'];
  const inventory = {
    beef: [
      { id: 1, name: 'Ribeye Steak', price: 24.99, unit: 'lb', image: ribeye },
      { id: 2, name: 'Ground Beef', price: 8.99, unit: 'lb', image: groundbeef },
      { id: 3, name: 'Tenderloin', price: 32.99, unit: 'lb', image: tenderloin },
      { id: 4, name: 'New York Strip', price: 22.99, unit: 'lb', image: newYorkStrip },
      { id: 5, name: 'Brisket', price: 12.99, unit: 'lb', image: brisket },
      { id: 6, name: 'Short Ribs', price: 18.99, unit: 'lb', image: shortribs },
    ],
    poultry: [
      { id: 7, name: 'Whole Chicken', price: 4.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 8, name: 'Chicken Breast', price: 7.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 9, name: 'Turkey Breast', price: 9.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 10, name: 'Duck Breast', price: 14.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 11, name: 'Chicken Wings', price: 5.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 12, name: 'Whole Turkey', price: 3.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
    ],
    pork: [
      { id: 13, name: 'Pork Chops', price: 8.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 14, name: 'Pork Tenderloin', price: 11.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 15, name: 'Bacon', price: 9.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 16, name: 'Pork Belly', price: 12.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 17, name: 'Pork Ribs', price: 15.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 18, name: 'Ground Pork', price: 6.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
    ],
    seafood: [
      { id: 19, name: 'Salmon Fillet', price: 16.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 20, name: 'Shrimp', price: 19.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 21, name: 'Tuna Steak', price: 24.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 22, name: 'Sea Bass', price: 28.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 23, name: 'Lobster Tails', price: 39.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 24, name: 'Scallops', price: 29.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
    ],
    lamb: [
      { id: 25, name: 'Lamb Chops', price: 18.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 26, name: 'Ground Lamb', price: 12.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 27, name: 'Lamb Leg', price: 14.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 28, name: 'Lamb Shoulder', price: 11.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 29, name: 'Lamb Rack', price: 32.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 30, name: 'Lamb Shanks', price: 16.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
    ],
    specialty: [
      { id: 31, name: 'Wagyu Beef', price: 89.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 32, name: 'Venison', price: 24.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 33, name: 'Wild Boar', price: 19.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 34, name: 'Rabbit', price: 15.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 35, name: 'Quail', price: 12.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
      { id: 36, name: 'Ostrich', price: 34.99, unit: 'lb', image: 'https://via.placeholder.com/500x300?text=Coming+Soon' },
    ]
  };

  const handleQuantityChange = (itemId, value) => {
    setQuantities(prev => ({
      ...prev,
      [itemId]: Math.max(0, parseFloat(value) || 0)
    }));
  };

  const addToCart = (item) => {
    const quantity = quantities[item.id] || 0;
    if (quantity > 0) {
      setCartItems([...cartItems, { ...item, quantity }]);
      setShowCart(true);
      setQuantities(prev => ({ ...prev, [item.id]: 0 }));
    }
  };

  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };

  const calculateItemTotal = (item) => {
    return (item.price * item.quantity).toFixed(2);
  };

  const calculateCartTotal = () => {
    return cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2);
  };

  return (
    <div className="customer-view">
      <header className="header">
        <h1>Atlas Meats</h1>
        <div className="cart-icon" onClick={() => setShowCart(!showCart)}>
          🛒 ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} lbs)
        </div>
      </header>

      <div className="main-content">
        <div className="category-tabs">
          {categories.map(category => (
            <button
              key={category}
              className={`tab ${activeTab === category ? 'active' : ''}`}
              onClick={() => setActiveTab(category)}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>

        <div className="inventory-grid">
          {inventory[activeTab]?.map(item => (
            <div key={item.id} className="inventory-item">
              <img 
                src={item.image} 
                alt={item.name} 
                className="item-image"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/500x300?text=No+Image';
                }}
              />
              <h3>{item.name}</h3>
              <p className="price">${item.price}/{item.unit}</p>
              <div className="quantity-controls">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={quantities[item.id] || ''}
                  onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                  placeholder="lbs"
                  className="quantity-input"
                />
                <button 
                  className="add-to-cart"
                  onClick={() => addToCart(item)}
                  disabled={!quantities[item.id] || quantities[item.id] <= 0}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showCart && (
        <div className="cart-sidebar">
          <div className="cart-header">
            <h2>Your Cart</h2>
            <button onClick={() => setShowCart(false)}>×</button>
          </div>
          <div className="cart-items">
            {cartItems.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-details">
                  <span className="cart-item-name">{item.name}</span>
                  <span className="cart-item-quantity">{item.quantity} lbs</span>
                </div>
                <div className="cart-item-price">
                  <span>${calculateItemTotal(item)}</span>
                  <button onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-footer">
            <div className="cart-total">
              Total: ${calculateCartTotal()}
            </div>
            <button className="checkout-button">Proceed to Checkout</button>
          </div>
        </div>
      )}

      <footer className="store-footer">
        <div className="footer-content">
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2984.838574666789!2d-73.93218468405315!3d41.70697997929915!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89dd3a0f669c69d7%3A0x1a1c1c1c1c1c1c1c!2sMarist%20College!5e0!3m2!1sen!2sus!4v1648923456789!5m2!1sen!2sus"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Store Location"
            ></iframe>
          </div>
          <div className="store-info">
            <h3>Location & Hours</h3>
            <div className="address">
              <p>3399 North Road</p>
              <p>Poughkeepsie, NY 12601</p>
            </div>
            <div className="hours">
              <h4>Hours of Operation</h4>
              <p>Monday - Friday: 8:00 AM - 8:00 PM</p>
              <p>Saturday: 9:00 AM - 7:00 PM</p>
              <p>Sunday: 10:00 AM - 6:00 PM</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerView; 