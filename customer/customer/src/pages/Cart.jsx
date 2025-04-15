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
      
      // Calculate total safely
      const cartTotal = parsedCart.reduce((sum, item) => {
        const price = parseFloat(item.price_per_pound);
        const quantity = parseInt(item.quantity, 10) || 0; // Ensure quantity is integer
        return sum + (!isNaN(price) ? price * quantity : 0);
      }, 0);
      setTotal(cartTotal);
    }
  }, []);

  // Update quantity handler
  const updateQuantity = (id, newQuantity) => {
    const quantityNum = parseInt(newQuantity, 10);
    if (isNaN(quantityNum) || quantityNum < 1) return; // Ensure valid number >= 1
    
    const updatedCart = cartItems.map(item => 
      item.id === id ? { ...item, quantity: quantityNum } : item
    );
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Recalculate total safely
    const newTotal = updatedCart.reduce((sum, item) => {
        const price = parseFloat(item.price_per_pound);
        const quantity = parseInt(item.quantity, 10) || 0;
        return sum + (!isNaN(price) ? price * quantity : 0);
    }, 0);
    setTotal(newTotal);
  };

  // Remove item handler
  const removeItem = (id) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    
    // Recalculate total safely
    const newTotal = updatedCart.reduce((sum, item) => {
        const price = parseFloat(item.price_per_pound);
        const quantity = parseInt(item.quantity, 10) || 0;
        return sum + (!isNaN(price) ? price * quantity : 0);
    }, 0);
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
                {cartItems.map(item => {
                  // Safely parse price for display and calculation
                  const pricePerPound = parseFloat(item.price_per_pound);
                  const displayPricePerPound = !isNaN(pricePerPound) ? pricePerPound.toFixed(2) : '0.00';
                  const quantity = parseInt(item.quantity, 10) || 0;
                  const itemTotal = !isNaN(pricePerPound) ? (pricePerPound * quantity) : 0;
                  const displayItemTotal = itemTotal.toFixed(2);

                  return (
                    <tr key={item.id}>
                      <td className="item-name">{item.name}</td>
                      <td className="item-price">${displayPricePerPound}</td>
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
                          value={quantity} 
                          onChange={(e) => updateQuantity(item.id, e.target.value)}
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
                        ${displayItemTotal}
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
                  );
                })}
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
