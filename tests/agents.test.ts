import { describe, it, expect } from 'vitest';
import { parseLocalIntake } from '@/agents/intake';
import { runOrchestrator } from '@/agents/orchestrator';

describe('Intake and Orchestrator Agent Tests', () => {
  it('should extract utility and food needs in English', () => {
    const input = 'My power might get shut off and I need help getting food for my kids.';
    const intake = parseLocalIntake(input, 'en');

    expect(intake.language).toBe('en');
    expect(intake.needs).toContain('utility_assistance');
    expect(intake.needs).toContain('food_assistance');
    expect(intake.household_has_children).toBe(true);
    expect(intake.urgency).toBe('high');
  });

  it('should extract utility and food needs in Spanish', () => {
    const input =
      'Mi factura de electricidad está muy alta y no tengo suficiente dinero. También necesito comida para mis hijos.';
    const intake = parseLocalIntake(input, 'es');

    expect(intake.language).toBe('es');
    expect(intake.needs).toContain('utility_assistance');
    expect(intake.needs).toContain('food_assistance');
    expect(intake.household_has_children).toBe(true);
  });

  it('should extract needs in Tagalog', () => {
    const input = 'Mataas ang kuryente at kailangan ko ng pagkain para sa mga bata.';
    const intake = parseLocalIntake(input, 'tl');

    expect(intake.language).toBe('tl');
    expect(intake.needs).toContain('utility_assistance');
    expect(intake.needs).toContain('food_assistance');
  });

  it('should orchestrate end-to-end case and return action plan', async () => {
    const input = 'I need emergency electric utility assistance in North Las Vegas';
    const result = await runOrchestrator(input, 'en');

    expect(result.caseStatus).toBe('PLAN_CREATED');
    expect(result.resources.length).toBeGreaterThan(0);
    expect(result.actionPlan.items.length).toBeGreaterThan(0);
    expect(result.actionPlan.items[0].documents_needed.length).toBeGreaterThan(0);
  });
});
