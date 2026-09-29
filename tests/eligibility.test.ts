import { describe, it, expect } from 'vitest';
import { evaluateEligibilityLocal } from '@/agents/eligibility';
import { VERIFIED_PROGRAMS } from '@/lib/data/verifiedResources';

describe('Eligibility Agent Tests', () => {
  const reachProg = VERIFIED_PROGRAMS[0]; // Project REACH utility assistance

  it('should return POTENTIAL_MATCH when household has past-due bill in North Las Vegas', () => {
    const evaluation = evaluateEligibilityLocal(reachProg, {
      city: 'North Las Vegas',
      has_past_due_bill: true,
      has_children: true,
    });

    expect(evaluation.result).toBe('POTENTIAL_MATCH');
    expect(evaluation.matched_requirements.length).toBeGreaterThan(0);
    expect(evaluation.explanation).not.toContain('You definitely qualify');
    expect(evaluation.explanation).toContain('may be a match');
  });

  it('should return INSUFFICIENT_INFORMATION when vital data is missing', () => {
    const evaluation = evaluateEligibilityLocal(reachProg, {});

    expect(evaluation.missing_information.length).toBeGreaterThan(0);
  });
});
