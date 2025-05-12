const crypto = require('crypto');

// Ensure these are set in your environment variables and are the correct length
// For AES-256, key should be 32 bytes, IV should be 16 bytes.
// Generate strong random keys and IVs: crypto.randomBytes(32).toString('hex') for key, crypto.randomBytes(16).toString('hex') for IV
const ENCRYPTION_KEY = process.env.PHONE_ENCRYPTION_KEY; // Must be 32 char hex string (for 16 byte key if input is hex) or 32 byte Buffer
const IV_STRING = process.env.PHONE_ENCRYPTION_IV;        // Must be 32 char hex string (for 16 byte IV if input is hex)

const ALGORITHM = 'aes-256-cbc';

if (!ENCRYPTION_KEY || !IV_STRING) {
  console.error('PHONE_ENCRYPTION_KEY and PHONE_ENCRYPTION_IV must be set in environment variables.');
  // In a real app, you might want to throw an error here to prevent startup without keys
  // For now, allowing it to proceed but encryption/decryption will fail or be insecure.
}

// Convert hex string keys/IVs from .env to Buffers if they are hex strings
// Or ensure they are already Buffers if set directly
const key = Buffer.from(ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'), 'hex'); // Fallback to random if not set (INSECURE for prod)
const iv = Buffer.from(IV_STRING || crypto.randomBytes(16).toString('hex'), 'hex');       // Fallback to random if not set (INSECURE for prod)

function encryptData(text) {
  if (!text) return null;
  if (!ENCRYPTION_KEY || !IV_STRING) {
    console.warn('Encryption keys not configured. Data will not be encrypted.');
    return text; // Or handle more gracefully, e.g., throw error
  }
  try {
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    return null; // Or throw error
  }
}

function decryptData(encryptedText) {
  if (!encryptedText) return null;
  if (!ENCRYPTION_KEY || !IV_STRING) {
    console.warn('Encryption keys not configured. Data cannot be decrypted.');
    return encryptedText; // Or handle more gracefully
  }
  try {
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null; // Or throw error
  }
}

module.exports = {
  encryptData,
  decryptData,
}; 