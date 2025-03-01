import CryptoJS from "crypto-js";

// Secret key for encryption/decryption (ensure it's securely managed)
const secretKey = process.env.NEXT_PUBLIC_CRYPT_KEY;

if (!secretKey) {
  console.error("Encryption/Decryption key is missing.");
}

/**
 * Encrypts the given data.
 * @param {string} data - The data to encrypt.
 * @returns {string|null} - The encrypted string or null if encryption fails.
 */
const encrypt = (data) => {
  try {
    if (!data) {
      throw new Error("No data provided for encryption.");
    }

    if (!secretKey) {
      throw new Error("Secret key is not defined.");
    }

    const encryptedData = CryptoJS.AES.encrypt(data, secretKey).toString();
    return encryptedData;
  } catch (error) {
    console.error("Encryption error:", error.message);
    return null; // Gracefully handle encryption errors
  }
};

/**
 * Decrypts the given data.
 * @param {string} data - The encrypted data to decrypt.
 * @returns {string|null} - The decrypted string or null if decryption fails.
 */
const decrypt = (data) => {
  try {
    if (!data) {
      throw new Error("No data provided for decryption.");
    }

    if (!secretKey) {
      throw new Error("Secret key is not defined.");
    }

    const bytes = CryptoJS.AES.decrypt(data, secretKey);

    // Validate decrypted bytes
    if (!bytes || !bytes.sigBytes || bytes.sigBytes <= 0) {
      throw new Error("Decryption failed. No valid bytes found.");
    }

    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);    

    // Handle parsing if data is serialized
    return decryptedData.split(`"`)?.length === 1
      ? decryptedData
      : decryptedData.split(`"`)[1];
  } catch (error) {
    console.error("Decryption error:", error.message);
    return null; // Gracefully handle decryption errors
  }
};

export { encrypt, decrypt };
