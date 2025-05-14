import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * StripeCheckoutButton - A component to add Stripe checkout functionality
 * to your existing checkout flow
 * 
 * @param {Object} order - The order object with all details
 * @param {Function} onCheckoutStarted - Callback when checkout is started
 * @param {string} returnUrl - URL to return to after payment
 */
const StripeCheckoutButton = ({ order, onCheckoutStarted, returnUrl = '/' }) => {
  const navigate = useNavigate();
  
  const handleCheckout = () => {
    // Optionally call the existing checkout preparation function
    if (onCheckoutStarted && typeof onCheckoutStarted === 'function') {
      onCheckoutStarted(order);
    }
    
    // Navigate to the payment page with order information
    navigate('/payment', {
      state: {
        orderData: order,
        returnUrl
      }
    });
  };
  
  return (
    <button 
      onClick={handleCheckout}
      className="stripe-checkout-button"
      style={{
        backgroundColor: '#5469d4',
        color: 'white',
        border: 0,
        padding: '12px 16px',
        borderRadius: '4px',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'inline-block',
        fontSize: '16px'
      }}
    >
      Pay with Card
    </button>
  );
};

export default StripeCheckoutButton; 