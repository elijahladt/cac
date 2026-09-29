import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { AI_CONFIG } from '@/lib/openai/config';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('file') as File | null;
    const language = (formData.get('language') as string) || 'en';

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided.' },
        { status: 400 }
      );
    }

    if (!AI_CONFIG.hasApiKey) {
      // In local mode without OpenAI API key, return demo transcription based on language
      const fallbackText =
        language === 'es'
          ? 'Mi factura de electricidad está muy alta y no tengo suficiente dinero. También necesito comida para mis hijos.'
          : language === 'tl'
          ? 'Mataas ang singil sa kuryente at kailangan ko ng tulong para sa pagkain ng aking mga anak.'
          : 'My power might get shut off and I need help getting food for my kids in North Las Vegas.';

      return NextResponse.json({
        transcript: fallbackText,
        language,
        confidence: 0.98,
        mode: 'fallback_demo',
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
      language,
      confidence: 0.99,
      mode: 'openai_whisper',
    });
  } catch (error) {
    console.error('Whisper transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio file.' },
      { status: 500 }
    );
  }
}
