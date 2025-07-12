import "server-only";
import twilio from "twilio";

const { TWILIO_ACCOUNT_SID: accountSid, TWILIO_AUTH_TOKEN: authToken } =
  process.env;

console.log("Twilio environment check:");
console.log("- NODE_ENV:", process.env.NODE_ENV);
console.log("- TWILIO_ACCOUNT_SID:", accountSid ? `configured (${accountSid.length} chars)` : "missing");
console.log("- TWILIO_AUTH_TOKEN:", authToken ? `configured (${authToken.length} chars)` : "missing");

if (!accountSid || !authToken) {
  console.warn("Twilio credentials not set. Twilio client will be disabled.");
  console.warn("Please check AWS Amplify environment variables:");
  console.warn("- TWILIO_ACCOUNT_SID should be set");
  console.warn("- TWILIO_AUTH_TOKEN should be set");
}

export const twilioClient =
  accountSid && authToken ? twilio(accountSid, authToken) : null;

console.log("Twilio client initialized:", !!twilioClient);

export default twilioClient;
