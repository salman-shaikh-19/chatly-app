import CryptoJS from 'crypto-js';

const SECRET_KEY = 'REACT_RECIPE_FINDER_APP'; 

export const encryptData = (data) => {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
};

export const decryptData = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) {
      throw new Error("Decryption failed");
    }
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
};
