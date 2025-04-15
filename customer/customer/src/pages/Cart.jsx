import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/Cart.css';

function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);

  // Load cart items from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCartItems(parsedCart);
      
      // Calculate total
      const cartTotal = parsedCart.reduce((sum, item) => 
        sum + (item.price_per_pound * item.quantity), 0);
      setTotal(cartTotal);
    }
  }, []);

  // Update quantity handler
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Recalculate total
    const newTotal = updatedCart.reduce((sum, item) => 
      sum + (item.price_per_pound * item.quantity), 0);
    setTotal(newTotal);
  };

  // Remove item handler
  const removeItem = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Recalculate total
    const newTotal = updatedCart.reduce((sum, item) => 
      sum + (item.price_per_pound * item.quantity), 0);
    setTotal(newTotal);
  };

  return (
    <Layout>
      <div className="cart-container">
        <h1>Your Cart</h1>
        
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Your cart is empty.</p>
            <Link to="/" className="continue-shopping">Continue Shopping</Link>
          </div>
        ) : (
          <>
            <div className="cart-items">
              <div className="cart-header">
                <span>Product</span>
                <span>Price/lb</span>
                <span>Quantity</span>
                <span>Total</span>
                <span>Actions</span>
              </div>
              
              {cartItems.map(item => (
                <div key={item.id} className="cart-item">
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">${item.price_per_pound.toFixed(2)}</span>
                  <span className="item-quantity">
                    <button 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      min="1" 
                      value={item.quantity} 
                      onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                    />
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </span>
                  <span className="item-total">
                    ${(item.price_per_pound * item.quantity).toFixed(2)}
                  </span>
                  <span className="item-actions">
                    <button 
                      className="remove-btn"
                      onClick={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </span>
                </div>
              ))}
            </div>
            
            <div className="cart-summary">
              <div className="cart-total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              <div className="cart-actions">
                <Link to="/" className="continue-shopping">Continue Shopping</Link>
                <Link to="/checkout" className="checkout-btn">Proceed to Checkout</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default Cart;
