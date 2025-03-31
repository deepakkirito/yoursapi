import jwt from "jsonwebtoken";
import { redirectToLogin } from "./customResponse";
import mongoose from "mongoose";

const getRequestDetails = async (req) => {
  const token = req.cookies.get("accessToken");

  let decoded = {};

  try {
    decoded = jwt.verify(token.value, process.env.JWT_KEY);
  } catch (error) {
    return redirectToLogin(req);
  }
  const { userId, email, name, role, username } = decoded;  

  let body = {};

  if (req.method !== "GET" && req.method !== "HEAD" && req.method !== "DELETE") {
    try {
      const text = await req.text(); // Read the body as text first
      body = text ? JSON.parse(text) : {}; // Parse only if body is not empty
    } catch (error) {
      console.error("Error parsing request body:", error);
      body = {}; // Default to an empty object if parsing fails
    }
  }

  return {
    token,
    userId: new mongoose.Types.ObjectId(userId),
    email,
    name,
    role,
    body,
    username,
  };
};

export default getRequestDetails;
