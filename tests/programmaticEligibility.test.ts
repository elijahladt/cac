import { describe, it, expect } from 'vitest';
import {
  evaluateProgrammaticEligibility,
  getMonthlyFplThreshold,
  getMonthlyAmi80Threshold,
} from '@/lib/eligibility/rulesEngine';

describe('Programmatic Eligibility Rules Engine', () => {
  it('correctly calculates Nevada 2026 FPL and AMI threshold tables', () => {
    // 150% FPL for 1 person: (1255) * 1.5 = 1882.5 -> 1883
    expect(getMonthlyFplThreshold(1, 150)).toBe(1883);
    // 150% FPL for 3 people: (1255 + 2 * 448) * 1.5 = 2151 * 1.5 = 3226.5 -> 3227
    expect(getMonthlyFplThreshold(3, 150)).toBe(3227);
    // 80% AMI Clark County for 4 people: $6,285
    expect(getMonthlyAmi80Threshold(4)).toBe(6285);
  });

  it('rules out programs when household income exceeds maximum ceiling', () => {
    const highIncomeProfile = {
      householdSize: 2,
      monthlyIncome: 6500, // Exceeds LIHEAP 150% FPL (~$2,555/mo) and SNAP 200% FPL (~$3,407/mo)
      zipCode: '89030',
      hasPastDueUtility: false,
    };

    const evaluations = evaluateProgrammaticEligibility(highIncomeProfile, 'en');
    const liheap = evaluations.find((e) => e.programId === 'prog-liheap-eap');
    expect(liheap).toBeDefined();
    expect(liheap?.status).toBe('RULED_OUT');
    expect(liheap?.disqualifyingReasons.length).toBeGreaterThan(0);
    expect(liheap?.disqualifyingReasons[0]).toContain('exceeds');
  });

  it('qualifies household when income and location meet Nevada criteria', () => {
    const qualifyingProfile = {
      householdSize: 3,
      monthlyIncome: 2100, // Under 150% FPL ($3,227/mo)
      zipCode: '89030', // In North Las Vegas / NV-04
      hasPastDueUtility: true,
      needs: ['utility_assistance' as const],
    };

    const evaluations = evaluateProgrammaticEligibility(qualifyingProfile, 'en');
    const liheap = evaluations.find((e) => e.programId === 'prog-liheap-eap');
    expect(liheap).toBeDefined();
    expect(liheap?.status).toBe('QUALIFIED');
    expect(liheap?.qualifyingReasons.length).toBeGreaterThanOrEqual(2);
  });
});
