import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';

const CARD_ELEMENT_OPTIONS = {
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

const PaymentForm = ({ 
  amount, 
  description, 
  orderDetails,
  customerId,
  onSuccess, 
  onError 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      // Stripe.js has not yet loaded
      // Make sure to disable form submission until Stripe.js has loaded
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      // Create a payment intent on your server
      const { data: clientSecret } = await axios.post('http://localhost:3002/api/create-payment-intent', {
        amount: amount * 100, // Stripe requires amount in cents
        description,
        customerId,
        orderDetails
      });

      // Use the client secret from the payment intent to confirm the payment
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: orderDetails?.customer?.name || '',
            email: orderDetails?.customer?.email || ''
          },
        },
        metadata: {
          orderId: orderDetails?.id || '',
          orderItems: orderDetails?.items?.map(item => item.id).join(',') || ''
        }
      });

      if (result.error) {
        setErrorMessage(result.error.message);
        if (onError) onError(result.error);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          if (orderDetails && orderDetails.processOrder) {
            try {
              await orderDetails.processOrder({
                ...orderDetails,
                payment: {
                  id: result.paymentIntent.id,
                  status: 'paid',
                  amount: amount,
                  method: 'stripe'
                }
              });
            } catch (orderError) {
              console.error('Error processing order:', orderError);
            }
          }
          
          if (onSuccess) onSuccess(result.paymentIntent);
        }
      }
    } catch (error) {
      setErrorMessage(error.message);
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <div className="form-row">
        <label htmlFor="card-element">Credit or debit card</label>
        <CardElement id="card-element" options={CARD_ELEMENT_OPTIONS} />
        <div className="card-errors" role="alert">{errorMessage}</div>
      </div>
      <button type="submit" disabled={!stripe || loading} className="payment-button">
        {loading ? 'Processing...' : `Pay $${amount}`}
      </button>
    </form>
  );
};

export default PaymentForm; 