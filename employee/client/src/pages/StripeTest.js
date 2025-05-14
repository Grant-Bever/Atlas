import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import '../styles/payment.css';

const StripeTest = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setMessage("Stripe has not loaded yet. Please try again.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      // Simple test payment of $1.00
      const { data } = await axios.post('http://localhost:3002/api/create-payment-intent', {
        amount: 100, // $1.00 in cents
        description: 'Test payment'
      });

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: 'Test User',
          },
        }
      });

      if (result.error) {
        setMessage(`Payment failed: ${result.error.message}`);
        setSuccess(false);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          setMessage('Payment successful! Payment ID: ' + result.paymentIntent.id);
          setSuccess(true);
        }
      }
    } catch (error) {
      setMessage(`Error: ${error.message}`);
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        color: '#32325d',
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '16px',
        '::placeholder': {
          color: '#aab7c4'
        }
      },
      invalid: {
        color: '#fa755a',
        iconColor: '#fa755a'
      }
    }
  };

  return (
    <div className="payment-page">
      <h1>Stripe Integration Test</h1>
      
      <div className="stripe-container">
        <form onSubmit={handleSubmit} className="payment-form">
          <div className="form-row">
            <label htmlFor="card-element">Credit or debit card</label>
            <CardElement id="card-element" options={cardElementOptions} />
          </div>
          
          {message && (
            <div className={success ? "payment-success" : "error-message"}>
              {message}
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={!stripe || loading} 
            className="payment-button"
          >
            {loading ? 'Processing...' : 'Pay $1.00'}
          </button>
        </form>
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
    </div>
  );
};

export default StripeTest; 