import { describe, it, expect } from 'vitest';
import { runOrchestrator } from '@/agents/orchestrator';
import { analyzeDocumentOffline } from '@/agents/document';
import { evaluateEligibilityLocal } from '@/agents/eligibility';
import { getProgram } from '@/tools/programs';

describe('End-to-End Primary Demo Workflow (PRD Section 51)', () => {
  it('should execute the complete Spanish intake to Action Plan and Document verification flow', async () => {
    // Step 1 & 2: Spanish user voice/text input
    const spanishInput =
      'Mi factura de electricidad está muy alta y no tengo suficiente dinero. También necesito comida para mis hijos.';

    // Step 3, 4, 5: Orchestrator executes intake, searches verified resources, builds plan
    const result = await runOrchestrator(spanishInput, 'es');

    // Verification of Step 5 in PRD:
    expect(result.intakeResult.language).toBe('es');
    expect(result.intakeResult.needs).toContain('utility_assistance');
    expect(result.intakeResult.needs).toContain('food_assistance');
    expect(result.intakeResult.household_has_children).toBe(true);

    // Verification of Step 6 & 8: Verified resources and "Why this resource?" rationale
    expect(result.resources.length).toBeGreaterThan(0);
    const utilityResource = result.resources.find((r) => r.category === 'utility_assistance');
    expect(utilityResource).toBeDefined();
    expect(utilityResource?.whyThisResource).toBeDefined();
    expect(utilityResource?.verification_status).toBe('VERIFIED');

    // Verification of Step 10 & 11: Document Agent analysis of utility bill
    const docResult = analyzeDocumentOffline('nv_energy_bill.jpg');
    expect(docResult.extractedDocument.provider_name).toBe('NV Energy');
    expect(docResult.extractedDocument.amount_due).toBe('$184.27');
    expect(docResult.extractedDocument.account_number_present).toBe(true);

    // Verification of Step 12: Eligibility evaluation for NV Energy Project REACH
    const reachProgram = await getProgram('prog-reach-emergency');
    expect(reachProgram).not.toBeNull();
    if (reachProgram) {
      const eligibility = evaluateEligibilityLocal(reachProgram, {
        city: 'North Las Vegas',
        has_past_due_bill: true,
        has_children: true,
      });
      expect(eligibility.result).toBe('POTENTIAL_MATCH');
      expect(eligibility.explanation).toContain('may be a match');
    }

    // Verification of Step 13: Action plan generated with next steps and document requirements
    expect(result.actionPlan.items.length).toBeGreaterThanOrEqual(2);
    const planStep1 = result.actionPlan.items[0];
    expect(planStep1.instructions.length).toBeGreaterThan(15);
    expect(planStep1.documents_needed.length).toBeGreaterThan(0);
  });
});
