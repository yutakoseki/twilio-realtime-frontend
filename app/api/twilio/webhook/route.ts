import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const callSid = formData.get('CallSid') as string;
    const callStatus = formData.get('CallStatus') as string;
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;

    console.log('Twilio Webhook received:', {
      callSid,
      callStatus,
      from,
      to
    });

    // 通話開始時のTwiMLレスポンス
    if (callStatus === 'ringing' || callStatus === 'in-progress') {
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="ja-JP">
    こんにちは！Twilioリアルタイム通話アプリへようこそ。
  </Say>
  <Pause length="1"/>
  <Say voice="alice" language="ja-JP">
    この通話は正常に接続されました。
  </Say>
  <Hangup/>
</Response>`;

      return new NextResponse(twiml, {
        status: 200,
        headers: {
          'Content-Type': 'application/xml',
        },
      });
    }

    // その他のイベント
    return new NextResponse('OK', { status: 200 });
  } catch (error) {
    console.error('Webhook error:', error);
    return new NextResponse('Error', { status: 500 });
  }
}

export async function GET() {
  return new NextResponse('Twilio Webhook endpoint is ready', { status: 200 });
} 