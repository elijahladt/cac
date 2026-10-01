import { NextRequest, NextResponse } from 'next/server';
import {
  evaluateProgrammaticEligibility,
  HouseholdProfile,
} from '@/lib/eligibility/rulesEngine';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const profile: HouseholdProfile = {
      householdSize: Number(body.householdSize) || 1,
      monthlyIncome: Number(body.monthlyIncome) || 0,
      zipCode: String(body.zipCode || '89030').trim(),
      city: body.city || 'North Las Vegas',
      housingStatus: body.housingStatus || 'stable',
      hasPastDueUtility: Boolean(body.hasPastDueUtility),
      hasDisconnectNotice: Boolean(body.hasDisconnectNotice),
      utilityProvider: body.utilityProvider,
      hasChildren: Boolean(body.hasChildren),
      hasSeniors: Boolean(body.hasSeniors),
      hasDisability: Boolean(body.hasDisability),
      needs: body.needs || [],
    };

    const evaluations = evaluateProgrammaticEligibility(profile, body.language || 'en');

    const qualified = evaluations.filter((e) => e.status === 'QUALIFIED');
    const potentiallyEligible = evaluations.filter((e) => e.status === 'POTENTIALLY_ELIGIBLE');
    const ruledOut = evaluations.filter((e) => e.status === 'RULED_OUT');

    return NextResponse.json({
      success: true,
      profile,
      summary: {
        totalEvaluated: evaluations.length,
        qualifiedCount: qualified.length,
        potentiallyEligibleCount: potentiallyEligible.length,
        ruledOutCount: ruledOut.length,
      },
      evaluations,
    });
  } catch (error: any) {
    console.error('Eligibility evaluation error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to evaluate programmatic eligibility.' },
      { status: 500 }
    );
  }
}
