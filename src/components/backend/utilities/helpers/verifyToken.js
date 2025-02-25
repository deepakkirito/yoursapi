import jwt from "jsonwebtoken";
import SessionsModel from "../../api/session/model";
import { redirectToLogin } from "../middlewares/customResponse";
import { dbConnect } from "../dbConnect";
import getRequestDetails from "../middlewares/getRequestDetails";

export async function verifyToken(req) {
  try {
    await dbConnect();

    const { token, userId, email, name, role, body, username } =
      await getRequestDetails(req);

    if (!userId) {
      await SessionsModel.deleteOne({ jwt: token.value });
      return redirectToLogin(req);
    }

    // Find active user sessions
    const sessions = await SessionsModel.find({
      userId: userId,
    });

    if (!sessions.length) {
      return redirectToLogin(req);
    }

    await SessionsModel.findOneAndUpdate(
      { jwt: token.value },
      { lastActive: new Date() }
    );

    // Check if any sessions have expired
    for (const session of sessions) {
      try {
        const sessionDecoded = jwt.verify(session.jwt, process.env.JWT_KEY);

        if (sessionDecoded.exp < Math.floor(Date.now() / 1000)) {
          await SessionsModel.deleteOne({ jwt: session.jwt });

          if (session.jwt === token.value) {
            return redirectToLogin(req);
          }
        }
      } catch (err) {
        await SessionsModel.deleteOne({ jwt: session.jwt });
      }
    }
    return { token, userId, email, name, role, body, username };
  } catch (err) {
    console.error("JWT verification error:", err);
    return redirectToLogin(req);
  }
}
