export async function GET() {
  const twilioCredentialsSet = Boolean(
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  );

  return Response.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'webapp',
    twilio: {
      credentialsSet: twilioCredentialsSet,
      accountSid: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'missing',
      authToken: process.env.TWILIO_AUTH_TOKEN ? 'configured' : 'missing'
    }
  });
} 