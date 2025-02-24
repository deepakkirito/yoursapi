import axios from "axios";
// import UAParser from "ua-parser-js";
import { UAParser } from "ua-parser-js";

export async function GET(req) {
  try {
    const sessionDetails = await getSessionDetails(req);
    return Response.json({ sessionDetails }, { status: 200 });
  } catch (error) {
    console.error("Error fetching session details:", error);
    return Response.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function getSessionDetails(req) {
  let ip =
    req.headers.get("x-forwarded-for") ||
    req.ip ||
    req.headers.get("cf-connecting-ip") ||
    "";

  let clientIp = ip ? ip.split(",")[0].trim() : "";

  // Handle localhost IPs
  if (clientIp === "::1" || clientIp === "127.0.0.1") {
    clientIp = ""; // Allow API to auto-detect
  }

  // ✅ Correct usage of `UAParser`
  const parser = UAParser(req.headers.get("user-agent") || "");

  const sessionDetails = {
    ip: clientIp,
    browser: parser.browser.name + ", " + parser.browser.version || "Unknown",
    os: parser?.os?.name + ", " + parser?.os?.version || "Unknown",
    device:
      `${parser?.device?.model || ""} ${parser?.device?.type || ""} ${parser?.device?.vendor || ""}` ||
      "Unknown",
  };

  // Fetch location details if not localhost
  try {
    const { data } = await axios.get(`http://ip-api.com/json/${clientIp}`);
    if (data.status === "success") {
      Object.assign(sessionDetails, {
        country: data.country,
        region: data.regionName,
        city: data.city,
        lat: data.lat,
        lon: data.lon,
        ip: clientIp || data.query,
        timezone: data.timezone,
      });
    }
  } catch (err) {
    console.error("Location fetch error:", err.message);
  }

  return sessionDetails;
}
