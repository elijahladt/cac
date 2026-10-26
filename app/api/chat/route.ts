import { NextRequest, NextResponse } from 'next/server';
import { runOrchestrator } from '@/agents/orchestrator';
import { SupportedLanguage } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message || '';
    const language = (body.preferredLanguage || body.language || 'en') as SupportedLanguage;
    const userProfile = body.userProfile;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message content is required.' },
        { status: 400 }
      );
    }

    let enrichedMessage = message;
    if (userProfile && typeof userProfile === 'object') {
      const facts = [
        userProfile.fullName ? `Name: ${userProfile.fullName}` : null,
        userProfile.zipCode ? `Location: Zip ${userProfile.zipCode} (${userProfile.neighborhood || 'North Las Vegas / NV-04'})` : null,
        userProfile.householdSize ? `Household size: ${userProfile.householdSize}` : null,
        userProfile.monthlyIncome ? `Monthly income: $${userProfile.monthlyIncome}` : null,
        userProfile.hasPastDueUtility ? 'Has past-due utility bill' : null,
        userProfile.hasDisconnectNotice ? 'Has active disconnect shutoff notice' : null,
        userProfile.isVeteran ? 'Veteran status: Yes' : null,
      ].filter(Boolean).join(', ');

      if (facts) {
        enrichedMessage = `[User Household Profile: ${facts}] ${message}`;
      }
    }

    const result = await runOrchestrator(enrichedMessage, language);
    return NextResponse.json({
      ...result,
      reply: result.responseMessage,
      detectedLanguage: result.intakeResult.language,
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your request. Please try again.' },
      { status: 500 }
    );
  }
}
