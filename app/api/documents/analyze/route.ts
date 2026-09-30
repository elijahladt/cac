import { NextRequest, NextResponse } from 'next/server';
import { analyzeDocumentVision, analyzeDocumentOffline } from '@/agents/document';

export async function POST(req: NextRequest) {
  try {
    const formData = (await req.formData()) as any;
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No document file provided.' },
        { status: 400 }
      );
    }

    const fileName = file.name || 'document.png';
    const mimeType = file.type || 'image/png';

    // Convert file to base64 buffer for vision analysis
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString('base64');

    // Run Document Agent (which strictly enforces transient analysis per PRD Section 14)
    const result = await analyzeDocumentVision(base64, mimeType, fileName);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Document analysis API error:', error);
    return NextResponse.json(
      { error: 'Unable to analyze the uploaded document. Please check the file and try again.' },
      { status: 500 }
    );
  }
}
