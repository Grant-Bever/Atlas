import React, { useState, useEffect } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { useLocation, useNavigate } from 'react-router-dom';
import stripePromise from '../utils/stripe';
import PaymentForm from '../components/PaymentForm';
import '../styles/payment.css';

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderData, setOrderData] = useState(null);
  const [amount, setAmount] = useState(0);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentError, setPaymentError] = useState(null);

  // Extract order data from location state (passed from previous page)
  useEffect(() => {
    if (location.state && location.state.orderData) {
      const orderFromState = location.state.orderData;
      setOrderData(orderFromState);
      
      // Calculate the total amount from the order items
      if (orderFromState.items && orderFromState.items.length > 0) {
        const totalAmount = orderFromState.items.reduce(
          (sum, item) => sum + (item.price * item.quantity), 0
        );
        setAmount(totalAmount);
      } else if (orderFromState.total) {
        setAmount(orderFromState.total);
      }
    }
  }, [location.state]);

  const handleSuccess = (paymentIntent) => {
    console.log('Payment successful:', paymentIntent);
    setPaymentComplete(true);
    
    // Redirect to order confirmation page or back to previous page
    setTimeout(() => {
      if (location.state && location.state.returnUrl) {
        navigate(location.state.returnUrl, { 
          state: { 
            orderCompleted: true, 
            orderId: orderData?.id,
            paymentId: paymentIntent.id
          } 
        });
      }
    }, 2000);
  };

  const handleError = (error) => {
    console.error('Payment error:', error);
    setPaymentError(error.message || 'An error occurred during payment processing');
  };

  if (!orderData && !location.state?.allowManualAmount) {
    return (
      <div className="payment-page">
        <h1>Payment</h1>
        <div className="error-message">
          No order data provided. Please start from the checkout page.
        </div>
        <button 
          onClick={() => navigate(-1)} 
          className="payment-button"
          style={{ marginTop: '20px', maxWidth: '200px' }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <h1>Complete Your Payment</h1>
      
      {paymentComplete ? (
        <div className="payment-success">
          <h2>Thank you for your payment!</h2>
          <p>Your transaction has been completed successfully.</p>
          <p>Order #{orderData?.id || 'N/A'}</p>
          <button onClick={() => navigate('/')}>Back to Home</button>
        </div>
      ) : (
        <>
          {/* Order Summary */}
          <div className="order-summary">
            <h2>Order Summary</h2>
            {orderData && orderData.items && (
              <div className="order-items">
                {orderData.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <span>{item.quantity}x {item.name}</span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="order-total">
                  <strong>Total:</strong>
                  <strong>${amount.toFixed(2)}</strong>
                </div>
              </div>
            )}
            
            {/* Manual amount entry if needed */}
            {location.state?.allowManualAmount && (
              <div className="amount-selector">
                <label htmlFor="payment-amount">Payment Amount ($)</label>
                <input
                  id="payment-amount"
                  type="number"
                  min="1"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                />
              </div>
            )}
          </div>
          
          {paymentError && (
            <div className="error-message">
              {paymentError}
            </div>
          )}
          
          <div className="stripe-container">
            <Elements stripe={stripePromise}>
              <PaymentForm 
                amount={amount} 
                description={orderData ? `Order #${orderData.id}` : "Payment for services"}
                orderDetails={orderData}
                customerId={orderData?.customerId}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </Elements>
          </div>
          
          <div className="payment-info">
            <p>For testing, you can use the following test card:</p>
            <ul>
              <li>Card number: 4242 4242 4242 4242</li>
              <li>Expiration: Any future date</li>
              <li>CVC: Any 3 digits</li>
              <li>ZIP: Any 5 digits</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentPage; 