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
            <Link to="/" className="button button-secondary">Continue Shopping</Link>
          </div>
        ) : (
          <>
            <table className="cart-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price/lb</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map(item => (
                  <tr key={item.id}>
                    <td className="item-name">{item.name}</td>
                    <td className="item-price">${item.price_per_pound.toFixed(2)}</td>
                    <td className="item-quantity">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <input 
                        type="number" 
                        min="1" 
                        value={item.quantity} 
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value))}
                        aria-label={`Quantity for ${item.name}`}
                      />
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                    </td>
                    <td className="item-total">
                      ${(item.price_per_pound * item.quantity).toFixed(2)}
                    </td>
                    <td className="item-actions">
                      <button 
                        className="button button-danger"
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="cart-summary">
              <div className="cart-total">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
              
              <div className="cart-actions">
                <Link to="/" className="button button-secondary">Continue Shopping</Link>
                <Link to="/checkout" className="button button-primary">Proceed to Checkout</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

export default Cart;
