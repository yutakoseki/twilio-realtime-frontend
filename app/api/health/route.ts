export async function GET() {
  const twilioCredentialsSet = Boolean(
    process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  );

  // デバッグ情報を追加
  const debugInfo = {
    nodeEnv: process.env.NODE_ENV,
    hasAccountSid: !!process.env.TWILIO_ACCOUNT_SID,
    hasAuthToken: !!process.env.TWILIO_AUTH_TOKEN,
    accountSidLength: process.env.TWILIO_ACCOUNT_SID?.length || 0,
    authTokenLength: process.env.TWILIO_AUTH_TOKEN?.length || 0,
    accountSidPrefix: process.env.TWILIO_ACCOUNT_SID?.substring(0, 3) || 'N/A',
  };

  return Response.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'webapp',
    environment: process.env.NODE_ENV,
    twilio: {
      credentialsSet: twilioCredentialsSet,
      accountSid: process.env.TWILIO_ACCOUNT_SID ? 'configured' : 'missing',
      authToken: process.env.TWILIO_AUTH_TOKEN ? 'configured' : 'missing'
    },
    debug: debugInfo
  });
} 