import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import stripePromise from '../utils/stripe';

const StripeProvider = ({ children }) => {
  return (
    <Elements stripe={stripePromise}>
      {children}
    </Elements>
  );
};

export default StripeProvider; 