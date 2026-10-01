import { NextRequest, NextResponse } from 'next/server';
import {
  submitDirectElectronicIntake,
  getAllIntakeSubmissions,
} from '@/lib/intake/directIntake';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.applicant?.fullName || !body.applicant?.phone) {
      return NextResponse.json(
        { error: 'Applicant name and phone number are required.' },
        { status: 400 }
      );
    }

    if (!body.targetProviderIds || !Array.isArray(body.targetProviderIds) || body.targetProviderIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one target provider must be selected for electronic intake dispatch.' },
        { status: 400 }
      );
    }

    const submission = submitDirectElectronicIntake({
      applicant: {
        fullName: body.applicant.fullName,
        phone: body.applicant.phone,
        email: body.applicant.email || '',
        address: body.applicant.address || '',
        city: body.applicant.city || 'North Las Vegas',
        zipCode: body.applicant.zipCode || '89030',
      },
      household: {
        size: Number(body.household?.size) || 1,
        monthlyIncome: Number(body.household?.monthlyIncome) || 0,
        housingStatus: body.household?.housingStatus || 'stable',
        hasChildren: Boolean(body.household?.hasChildren),
        hasSeniors: Boolean(body.household?.hasSeniors),
        hasDisability: Boolean(body.household?.hasDisability),
      },
      serviceDetails: {
        primaryNeeds: body.serviceDetails?.primaryNeeds || ['utility_assistance'],
        utilityProvider: body.serviceDetails?.utilityProvider,
        utilityAccountNumber: body.serviceDetails?.utilityAccountNumber,
        pastDueAmount: body.serviceDetails?.pastDueAmount,
        disconnectNoticeDate: body.serviceDetails?.disconnectNoticeDate,
        urgentStatement: body.serviceDetails?.urgentStatement,
      },
      targetProviderIds: body.targetProviderIds,
      attachedDocuments: body.attachedDocuments || [],
      language: body.language || 'en',
    });

    return NextResponse.json({
      success: true,
      message: 'Direct electronic intake submitted successfully.',
      confirmationCode: submission.confirmationCode,
      submission,
    });
  } catch (error: any) {
    console.error('Direct electronic intake submission error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit electronic intake.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const list = getAllIntakeSubmissions();
    return NextResponse.json({
      success: true,
      count: list.length,
      intakes: list,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch electronic intake queue.' },
      { status: 500 }
    );
  }
}
