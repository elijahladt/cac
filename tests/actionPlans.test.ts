import { describe, it, expect } from 'vitest';
import { createDefaultCaseFile } from '@/tools/actionPlans';

describe('Action Plan & Case File Tests', () => {
  it('should initialize a valid case file with identified needs', () => {
    const caseFile = createDefaultCaseFile();
    expect(caseFile.id).toBeDefined();
    expect(caseFile.status).toBe('PLAN_CREATED');
    expect(caseFile.needs.length).toBeGreaterThan(0);
    expect(caseFile.action_plan).toBeDefined();
    expect(caseFile.action_plan?.items.length).toBeGreaterThan(0);
  });

  it('should ensure each action plan item has required instructions and document checklist', () => {
    const caseFile = createDefaultCaseFile();
    const planItems = caseFile.action_plan?.items || [];
    for (const item of planItems) {
      expect(item.title.length).toBeGreaterThan(0);
      expect(item.instructions.length).toBeGreaterThan(0);
      expect(item.documents_needed.length).toBeGreaterThan(0);
      expect(item.status).toBe('pending');
    }
  });
});
