import twilioClient from "@/lib/twilio";

export async function GET() {
  try {
    console.log("Fetching Twilio phone numbers...");
    console.log("Twilio client initialized:", !!twilioClient);
    console.log("Environment variables check:");
    console.log("- TWILIO_ACCOUNT_SID:", process.env.TWILIO_ACCOUNT_SID ? "present" : "missing");
    console.log("- TWILIO_AUTH_TOKEN:", process.env.TWILIO_AUTH_TOKEN ? "present" : "missing");
    
    if (!twilioClient) {
      console.error("Twilio client not initialized - missing credentials");
      return Response.json(
        { 
          error: "Twilio client not initialized - check environment variables",
          details: {
            hasAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
            hasAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
            nodeEnv: process.env.NODE_ENV
          }
        },
        { status: 500 }
      );
    }

    console.log("Calling Twilio API to list phone numbers...");
    const incomingPhoneNumbers = await twilioClient.incomingPhoneNumbers.list({
      limit: 20,
    });
    
    console.log("Phone numbers fetched successfully:", incomingPhoneNumbers.length);
    return Response.json(incomingPhoneNumbers);
  } catch (error) {
    console.error("Error fetching phone numbers:", error);
    return Response.json(
      { 
        error: "Failed to fetch phone numbers", 
        details: error instanceof Error ? error.message : "Unknown error",
        twilioError: error instanceof Error && 'code' in error ? {
          code: (error as any).code,
          status: (error as any).status,
          moreInfo: (error as any).moreInfo
        } : null
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    if (!twilioClient) {
      return Response.json(
        { error: "Twilio client not initialized" },
        { status: 500 }
      );
    }

    const { phoneNumberSid, voiceUrl } = await req.json();
    
    // localhostのURLはTwilioで使用できないため拒否
    if (voiceUrl && (voiceUrl.includes('localhost') || voiceUrl.includes('127.0.0.1'))) {
      return Response.json(
        { error: "localhost URLs are not allowed for Twilio webhooks. Use a public URL or ngrok for development." },
        { status: 400 }
      );
    }
    
    const incomingPhoneNumber = await twilioClient
      .incomingPhoneNumbers(phoneNumberSid)
      .update({ voiceUrl });

    return Response.json(incomingPhoneNumber);
  } catch (error) {
    console.error("Error updating phone number:", error);
    return Response.json(
      { error: "Failed to update phone number", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
