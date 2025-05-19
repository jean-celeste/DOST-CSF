import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
// Key must be 32 bytes (256 bits) for aes-256-cbc. Our key is 64 hex chars (32 bytes).
const ENCRYPTION_KEY = process.env.APPLICATION_ENCRYPTION_KEY;
const IV_LENGTH = 16; // For AES, this is always 16

/**
 * Encrypts a plaintext string.
 * @param {string} text The plaintext to encrypt.
 * @returns {string|null} The IV and ciphertext, colon-separated and hex-encoded, or null if input is null/empty.
 * @throws Error if encryption key is not defined.
 */
export function encrypt(text) {
  if (!ENCRYPTION_KEY) {
    console.error('APPLICATION_ENCRYPTION_KEY is not defined.');
    throw new Error('Encryption key is not defined. Cannot encrypt data.');
  }
  if (text === null || typeof text === 'undefined' || text === '') {
    return null;
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
  let encrypted = cipher.update(String(text), 'utf8', 'hex'); // Ensure input is string, output hex
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Decrypts a string that was encrypted with the encrypt function.
 * @param {string} text The IV and ciphertext, colon-separated and hex-encoded.
 * @returns {string|null} The decrypted plaintext, or null if input is null/empty or decryption fails.
 * @throws Error if encryption key is not defined.
 */
export function decrypt(text) {
  if (!ENCRYPTION_KEY) {
    console.error('APPLICATION_ENCRYPTION_KEY is not defined.');
    throw new Error('Encryption key is not defined. Cannot decrypt data.');
  }
  if (text === null || typeof text === 'undefined' || text === '') {
    return null;
  }

  try {
    const parts = text.split(':');
    if (parts.length !== 2) {
      console.error('Invalid encrypted text format: Missing IV or ciphertext.');
      return null;
    }

    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    
    // Check IV length
    if (iv.length !== IV_LENGTH) {
        console.error(`Invalid IV length. Expected ${IV_LENGTH}, got ${iv.length}`);
        return null;
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY, 'hex'), iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    
    return null; 
  }
}
