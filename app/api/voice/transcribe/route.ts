import { NextRequest, NextResponse } from 'next/server';
import OpenAI, { toFile } from 'openai';
import { AI_CONFIG } from '@/lib/openai/config';

export async function POST(req: NextRequest) {
  try {
    let audioFile: any = null;
    let language = 'en';

    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const body = await req.json();
      language = body.language || 'en';

      if (body.audioBase64) {
        const buffer = Buffer.from(body.audioBase64, 'base64');
        audioFile = await toFile(buffer, 'recording.m4a', {
          type: body.mimeType || 'audio/m4a',
        });
      }
    } else {
      const formData = (await req.formData()) as any;
      audioFile = (formData.get('file') || formData.get('audio')) as File | null;
      language = (formData.get('language') as string) || 'en';
    }

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file or audio data provided.' },
        { status: 400 }
      );
    }

    if (!AI_CONFIG.hasApiKey) {
      return NextResponse.json({
        error: 'NO_OPENAI_KEY',
        message: 'OpenAI API key is not configured for Whisper transcription. Use device keyboard mic or select a quick voice phrase.',
        language,
        transcript: '',
      });
    }

    const openai = new OpenAI({ apiKey: AI_CONFIG.apiKey });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: AI_CONFIG.whisperModel,
      language: language === 'es' ? 'es' : language === 'tl' ? 'tl' : 'en',
    });

    return NextResponse.json({
      transcript: transcription.text,
      text: transcription.text,
      language,
      confidence: 0.99,
      mode: 'openai_whisper',
    });
  } catch (error: any) {
    console.error('Whisper transcription error:', error?.message || error);
    const isQuotaError =
      error?.status === 429 ||
      error?.code === 'insufficient_quota' ||
      error?.code === 'credit_balance_exhausted' ||
      error?.message?.includes('credits remaining') ||
      error?.message?.includes('billing');

    return NextResponse.json(
      {
        error: isQuotaError ? 'OPENAI_QUOTA_EXHAUSTED' : 'TRANSCRIPTION_FAILED',
        message: isQuotaError
          ? 'OpenAI API key has no credit balance remaining on platform.openai.com. You can use your mobile keyboard microphone for speech recognition, or tap a quick voice phrase.'
          : (error?.message || 'Failed to transcribe audio file.'),
      },
      { status: isQuotaError ? 429 : 500 }
    );
  }
}
