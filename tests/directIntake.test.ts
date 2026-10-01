import { describe, it, expect } from 'vitest';
import {
  submitDirectElectronicIntake,
  getIntakeByConfirmationCode,
  updateReferralStatus,
  getAllIntakeSubmissions,
} from '@/lib/intake/directIntake';

describe('Direct Electronic Intake & Closed-Loop Referral Tracking', () => {
  it('submits single unified electronic intake and queues referrals for multiple providers', () => {
    const submission = submitDirectElectronicIntake({
      applicant: {
        fullName: 'Elena Rostova',
        phone: '(702) 555-4921',
        email: 'elena@example.com',
        address: '100 Civic Center Dr',
        city: 'North Las Vegas',
        zipCode: '89030',
      },
      household: {
        size: 4,
        monthlyIncome: 2400,
        housingStatus: 'at_risk',
        hasChildren: true,
        hasSeniors: false,
        hasDisability: false,
      },
      serviceDetails: {
        primaryNeeds: ['utility_assistance', 'food_assistance'],
        utilityProvider: 'NV Energy',
        pastDueAmount: '$340.00',
        urgentStatement: 'Received shutoff notice for electric utility.',
      },
      targetProviderIds: ['res-state-dwss-liheap', 'res-three-square'],
      language: 'en',
    });

    expect(submission.id).toBeDefined();
    expect(submission.confirmationCode).toMatch(/^NVN-2026-\d{5}$/);
    expect(submission.referrals.length).toBe(2);
    expect(submission.referrals[0].status).toBe('SUBMITTED');
    expect(submission.referrals[0].timeline.length).toBe(1);
  });

  it('retrieves electronic intake file by confirmation code', () => {
    const demo = getIntakeByConfirmationCode('NVN-2026-89421');
    expect(demo).not.toBeNull();
    expect(demo?.applicant.fullName).toBe('Maria Santos');
    expect(demo?.referrals.length).toBeGreaterThanOrEqual(1);
    expect(demo?.referrals[0].status).toBe('ACCEPTED');
  });

  it('updates closed-loop referral status and adds milestone to timeline', () => {
    const code = 'NVN-2026-89421';
    const before = getIntakeByConfirmationCode(code);
    const targetRef = before?.referrals[1]; // Three square food
    expect(targetRef).toBeDefined();

    const updated = updateReferralStatus(code, targetRef!.id, {
      status: 'ACCEPTED',
      caseworkerName: 'Carlos M.',
      benefitAmountPledged: 'Family Market Grocery Box Scheduled for Oct 5',
      caseworkerNote: 'Pantry reservation and SNAP assistance verified.',
    });

    expect(updated).not.toBeNull();
    const updatedRef = updated?.referrals.find((r) => r.id === targetRef!.id);
    expect(updatedRef?.status).toBe('ACCEPTED');
    expect(updatedRef?.benefitAmountPledged).toContain('Family Market');
    expect(updatedRef?.timeline.length).toBeGreaterThan(1);
  });
});
