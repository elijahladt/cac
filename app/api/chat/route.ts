import { NextRequest, NextResponse } from 'next/server';
import { runOrchestrator } from '@/agents/orchestrator';
import { SupportedLanguage } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message || '';
    const language = (body.language || 'en') as SupportedLanguage;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message content is required.' },
        { status: 400 }
      );
    }

    const result = await runOrchestrator(message, language);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request. Please try again.' },
      { status: 500 }
    );
  }
}
