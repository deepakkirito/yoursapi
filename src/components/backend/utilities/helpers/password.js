import bcrypt from "bcryptjs";
import generator from "generate-password";

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(Number(process.env.SALT) || 13);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

export async function comparePassword(password, hashedPassword) {
  const isPasswordValid = await bcrypt.compare(password, hashedPassword);
  return isPasswordValid;
}

export async function generatePassword({
  length = 12,
  specialCharacters = true,
  numbers = true,
  uppercase = true,
  lowercase = true,
}) {
  let password = generator.generate({
    length: length,
    lowercase: lowercase,
    numbers: numbers,
    uppercase: uppercase,
    symbols: specialCharacters,
  });
  return password;
}
