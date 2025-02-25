import jwt from "jsonwebtoken";
import { redirectToLogin } from "./customResponse";

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
  if (req.method !== "GET") {
    body = await req.json();
  }

  return {
    token,
    userId,
    email,
    name,
    role,
    body,
    username,
  };
};

export default getRequestDetails;
