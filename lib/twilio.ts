import "server-only";
import twilio from "twilio";

const { TWILIO_ACCOUNT_SID: accountSid, TWILIO_AUTH_TOKEN: authToken } =
  process.env;

console.log("Twilio environment check:");
console.log("- TWILIO_ACCOUNT_SID:", accountSid ? "configured" : "missing");
console.log("- TWILIO_AUTH_TOKEN:", authToken ? "configured" : "missing");

if (!accountSid || !authToken) {
  console.warn("Twilio credentials not set. Twilio client will be disabled.");
}

export const twilioClient =
  accountSid && authToken ? twilio(accountSid, authToken) : null;

console.log("Twilio client initialized:", !!twilioClient);

export default twilioClient;
