import { NextRequest, NextResponse } from 'next/server';
import {
  getIntakeByConfirmationCode,
  updateReferralStatus,
} from '@/lib/intake/directIntake';

export async function GET(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code;
    if (!code) {
      return NextResponse.json({ error: 'Confirmation code is required.' }, { status: 400 });
    }

    const intake = getIntakeByConfirmationCode(code);
    if (!intake) {
      return NextResponse.json(
        {
          error: 'RECORD_NOT_FOUND',
          message: `No electronic intake record was found matching confirmation code "${code}".`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      intake,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to retrieve referral tracking file.' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const code = params.code;
    const body = await req.json();

    if (!body.referralId || !body.status) {
      return NextResponse.json(
        { error: 'referralId and status are required for closed-loop update.' },
        { status: 400 }
      );
    }

    const updated = updateReferralStatus(code, body.referralId, {
      status: body.status,
      caseworkerName: body.caseworkerName,
      caseworkerNote: body.caseworkerNote,
      benefitAmountPledged: body.benefitAmountPledged,
      actionRequired: body.actionRequired,
    });

    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update referral. Code or referralId not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Referral status updated to ${body.status}.`,
      intake: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update closed-loop referral status.' },
      { status: 500 }
    );
  }
}
