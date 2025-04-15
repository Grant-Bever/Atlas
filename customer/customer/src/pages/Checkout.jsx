import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/Checkout.css';
import api from '../utils/api'; // Import the API utility

function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Load cart items from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
        
        // Calculate total
        const cartTotal = parsedCart.reduce((sum, item) => 
          sum + (item.price_per_pound * item.quantity), 0);
        setTotal(cartTotal);
      } catch (err) {
        console.error('Error parsing cart data:', err);
        navigate('/cart');
      }
    } else {
      // Redirect to cart if empty
      navigate('/cart');
    }
  }, [navigate]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCustomerInfo({
      ...customerInfo,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Format order data
      const orderData = {
        customerInfo,
        items: cartItems,
        total
      };
      
      // Call API to create order
      await api.createOrder(orderData);
      
      // Clear cart and show success message
      localStorage.removeItem('cart');
      const response = await api.createOrder(orderData);
      const orderId = response.data.order.id;
      alert(`Order #${orderId} placed successfully!`);
      
      // Redirect to home page
      navigate('/');
    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.message || 'Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="checkout-container">
        <h1>Checkout</h1>
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        <div className="checkout-content">
          <div className="order-summary">
            <h2>Order Summary</h2>
            <div className="order-items">
              {cartItems.map(item => (
                <div key={item.id} className="order-item">
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price_per_pound * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="order-total">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="customer-details">
            <h2>Your Information</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={customerInfo.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={customerInfo.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email (Optional)</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={customerInfo.email}
                  onChange={handleInputChange}
                />
              </div>
              
              {/* Payment would go here in the future */}
              <div className="payment-section">
                <h3>Payment Method</h3>
                <p>Payment processing will be implemented later. For now, orders will be processed on delivery.</p>
              </div>
              
              <div className="checkout-actions">
                <button 
                  type="button" 
                  className="button button-secondary"
                  onClick={() => navigate('/cart')}
                  disabled={isSubmitting}
                >
                  Back to Cart
                </button>
                <button 
                  type="submit" 
                  className="button button-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Checkout;
