import jwt from "jsonwebtoken";

const generateToken = (user, expiresIn = "1h") => {
  const payload = {
    sub: user._id,
    userId: user._id,
    email: user.email,
    name: user.name,
    username: user.username,
    role: user.role,
  };
  return jwt.sign(payload, process.env.JWT_KEY, {
    algorithm: process.env.ALGORITHM,
    expiresIn,
  });
};

export default generateToken;
