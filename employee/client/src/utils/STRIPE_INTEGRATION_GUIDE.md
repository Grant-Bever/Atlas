# Stripe Integration Guide for Atlas

This guide explains how to integrate the Stripe payment system with your existing checkout flow without disrupting the current functionality.

## Overview

The Stripe integration we've added works alongside your existing checkout process by:

1. Accepting payment through Stripe
2. Processing the payment securely
3. Updating the order status in your existing order system
4. Returning the user to your flow after payment is complete

## How to Add Stripe Checkout to Your Existing Pages

### 1. Import the StripeCheckoutButton Component

In your existing checkout page:

```jsx
import StripeCheckoutButton from '../components/StripeCheckoutButton';
```

### 2. Add the Button to Your Checkout Page

Place the button alongside your existing checkout options:

```jsx
<div className="checkout-options">
  {/* Your existing checkout options */}
  <button onClick={handleExistingCheckout}>Pay on Delivery</button>
  
  {/* Add Stripe checkout button */}
  <StripeCheckoutButton 
    order={currentOrder} 
    onCheckoutStarted={handleCheckoutStarted} 
    returnUrl="/order-confirmation" 
  />
</div>
```

### 3. Make Sure Your Order Object Has the Required Format

The order object should have this structure:

```javascript
const order = {
  id: 123,                       // Order ID
  customerId: 456,               // Customer ID (optional)
  items: [                      
    {
      id: 789,                  // Item ID
      name: "Product Name",     // Item name
      price: 19.99,             // Item price
      quantity: 2               // Quantity
    },
    // More items...
  ],
  total: 39.98,                 // Total amount (optional, will be calculated if not provided)
  
  // Any other fields your system needs
  notes: "Delivery instructions...",
  
  // Optional: your existing order processing function
  processOrder: (updatedOrder) => {
    // Your existing code to process orders
    // This will be called after successful payment
  }
};
```

### 4. Add Payment Page to Your Routes

In your app's routing configuration:

```jsx
import PaymentPage from './pages/PaymentPage';

// In your Routes component
<Routes>
  {/* Your existing routes */}
  <Route path="/checkout" element={<CheckoutPage />} />
  <Route path="/order-confirmation" element={<OrderConfirmationPage />} />
  
  {/* Add the payment page route */}
  <Route path="/payment" element={<PaymentPage />} />
</Routes>
```

## How the Integration Works

1. When a user clicks the "Pay with Card" button, they're directed to the payment page with their order details.
2. On the payment page, they enter their card details using Stripe's secure components.
3. When payment succeeds:
   - The payment record is stored in the database
   - If your order has a `processOrder` function, it will be called with updated order details
   - The user is redirected back to your specified return URL (e.g., order confirmation)
4. Your existing order backend receives the payment information and can update order status accordingly.

## Testing the Integration

### Quick Test Page
For quick testing, you can navigate to `/stripe-test` in your application to make a simple $1 test payment.

### Test Cards
Use these test card numbers:
- Success: 4242 4242 4242 4242
- Decline: 4000 0000 0000 0002

For any test card:
- Any future expiration date
- Any 3-digit CVC
- Any postal code

## System Requirements

Make sure you have the following:

1. Server requirements:
   - Node.js version 14+ (recommended 18+)
   - PostgreSQL running on port 5432 (not 3000)
   - `npm install stripe` installed on the server

2. Client requirements:
   - React 16.8+ (for hooks)
   - `npm install @stripe/react-stripe-js @stripe/stripe-js` in your client application

## Troubleshooting

If you encounter issues:

1. Check browser console for errors
2. Verify API keys are correctly set in your .env file:
   ```
   STRIPE_SECRET_KEY=sk_test_your_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
   ```
   Note: Ensure there are no line breaks in your API keys

3. Check server logs for payment processing errors
4. Make sure CORS is properly configured to allow communication between your client and server
5. Verify database connection and table creation:
   ```
   npx sequelize-cli db:migrate
   ```
6. If testing on different ports, update your CORS policy to allow those origins

7. Ensure your React routes include the payment page:
   ```jsx
   <Route path="/payment" element={<PaymentPage />} />
   ```

8. If your client can't reach the server, check that your proxy settings in package.json point to the correct server URL

For more help, contact the development team. 