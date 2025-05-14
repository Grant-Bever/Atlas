import { loadStripe } from '@stripe/stripe-js';

// Using the provided publishable key
const stripePromise = loadStripe('pk_test_51ROVIyBRcAeJCHHx55cKLrzm1SVYZLpPngAhvbhAzDzlJ8xel7h5Ibw4BUxXRyhdWgRbDr6yDYTNQrbugq3Zps4400xE7ogoCy');

export default stripePromise; 