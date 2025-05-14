const express = require('express');
const router = express.Router();
// Get the STRIPE_SECRET_KEY from environment variables, ensure it's trimmed
const stripeKey = (process.env.STRIPE_SECRET_KEY || '').trim();
const stripe = require('stripe')(stripeKey);
const db = require('../models');

// Create a payment intent
router.post('/create-payment-intent', async (req, res) => {
  try {
    const { amount, description, customerId, orderDetails } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    // Extract order information to include in metadata
    let metadata = {
      customerId: customerId || '',
    };

    // Add order details to metadata if available
    if (orderDetails) {
      metadata = {
        ...metadata,
        orderId: orderDetails.id || '',
        orderItems: orderDetails.items ? JSON.stringify(orderDetails.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity
        }))) : ''
      };
    }

    // Create a payment intent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Amount in cents
      currency: 'usd',
      description: description || 'Atlas payment',
      payment_method_types: ['card'],
      metadata
    });

    // Create a pending payment record in our database
    await db.PaymentTransaction.create({
      stripePaymentId: paymentIntent.id,
      amount: amount / 100, // Convert cents to dollars for database
      currency: 'usd',
      status: 'pending',
      description,
      customerId: customerId || null,
      metadata: {
        paymentIntentId: paymentIntent.id,
        orderDetails: orderDetails ? JSON.stringify(orderDetails) : null
      }
    }).catch(err => {
      // Log error but don't fail the request if database record creation fails
      console.error('Failed to create payment transaction record:', err);
    });

    // Send the client secret to the client
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook for handling Stripe events
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful:', paymentIntent.id);
      
      // Update the payment record in our database
      try {
        const transaction = await db.PaymentTransaction.findOne({
          where: { stripePaymentId: paymentIntent.id }
        });

        if (transaction) {
          // Update transaction status
          await transaction.update({ status: 'completed' });

          // If this payment is for an order, update the order status
          const metadata = transaction.metadata || {};
          if (metadata.orderDetails) {
            try {
              const orderDetails = JSON.parse(metadata.orderDetails);
              
              // Update order status through your existing order service/model
              // This part would integrate with your existing order flow
              if (db.Order && orderDetails.id) {
                await db.Order.update(
                  { 
                    status: 'paid',
                    paymentId: paymentIntent.id
                  },
                  { where: { id: orderDetails.id } }
                );
              }
            } catch (parseError) {
              console.error('Error parsing order details:', parseError);
            }
          }
        }
      } catch (err) {
        console.error('Error updating payment record:', err);
      }
      break;
      
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id, failedPayment.last_payment_error?.message);
      
      // Update the payment record in our database
      try {
        await db.PaymentTransaction.update(
          { 
            status: 'failed',
            metadata: {
              errorMessage: failedPayment.last_payment_error?.message,
              failureCode: failedPayment.last_payment_error?.code
            }
          },
          { where: { stripePaymentId: failedPayment.id } }
        );
      } catch (err) {
        console.error('Error updating payment record:', err);
      }
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
});

// Get all payment transactions
router.get('/payments', async (req, res) => {
  try {
    const payments = await db.PaymentTransaction.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: error.message });
  }
});

// Retrieve payment information
router.get('/payments/:paymentId', async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // First look in our database
    const paymentRecord = await db.PaymentTransaction.findOne({
      where: { stripePaymentId: paymentId }
    });
    
    if (!paymentRecord) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Get the latest details from Stripe
    const stripePayment = await stripe.paymentIntents.retrieve(paymentId);
    
    // Combine database record with Stripe data
    res.json({
      ...paymentRecord.toJSON(),
      stripeData: stripePayment
    });
  } catch (error) {
    console.error('Error retrieving payment:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router; 