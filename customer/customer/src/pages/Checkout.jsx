import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import '../styles/Checkout.css';

function Checkout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });

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
    
    // TODO: Replace with actual API call
    console.log('Submitting order:', {
      customer: customerInfo,
      items: cartItems,
      total
    });
    
    // For demonstration, just clear cart and redirect
    alert('Order placed successfully!');
    localStorage.removeItem('cart');
    navigate('/');
  };

  return (
    <Layout>
      <div className="checkout-container">
        <h1>Checkout</h1>
        
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
              
              {/* Payment details would go here (Stripe integration) */}
              <div className="payment-section">
                <h3>Payment Method</h3>
                <p>Payment processing will be implemented with Stripe.</p>
                {/* Stripe Elements would go here */}
              </div>
              
              <div className="checkout-actions">
                <button 
                  type="button" 
                  className="back-btn"
                  onClick={() => navigate('/cart')}
                >
                  Back to Cart
                </button>
                <button type="submit" className="place-order-btn">
                  Place Order
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
