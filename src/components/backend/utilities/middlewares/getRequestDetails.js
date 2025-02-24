import jwt from "jsonwebtoken";

const getRequestDetails = async (req) => {
  const token = req.cookies.get("accessToken");
  console.log(token);

  const decoded = jwt.verify(token.value, process.env.JWT_KEY);
  const { userId, email, name, role } = decoded;

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
  };
};

export default getRequestDetails;
