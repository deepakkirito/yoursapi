import CryptoJS from "crypto-js";

const secretKey = process.env.NEXT_PUBLIC_CRYPT_KEY;

const encrypt = (data) => {
  const encryptedData = CryptoJS.AES.encrypt(data, secretKey).toString();
  return encryptedData;
};

const decrypt = (data) => {
  const decryptedData = CryptoJS.AES.decrypt(data, secretKey).toString(
    CryptoJS.enc.Utf8
  );
  return decryptedData.split(`"`)[1];
};

export { encrypt, decrypt };
