import { describe, it, expect } from 'vitest';
import { analyzeDocumentOffline } from '@/agents/document';

describe('Document Agent Tests', () => {
  it('should analyze utility bill and extract provider, amount, and due date', () => {
    const result = analyzeDocumentOffline('nv_energy_october_bill.png');
    const doc = result.extractedDocument;

    expect(doc.document_type).toBe('utility_bill');
    expect(doc.provider_name).toBe('NV Energy');
    expect(doc.amount_due).toBe('$184.27');
    expect(doc.due_date).toBe('2026-10-03');
    expect(doc.account_number_present).toBe(true);
    expect(result.relevantProgramSuggestions.length).toBeGreaterThan(0);
    expect(result.privacyNotice).toContain('discarded');
  });

  it('should extract non-utility document with generic safe profile', () => {
    const result = analyzeDocumentOffline('benefit_notice.pdf');
    const doc = result.extractedDocument;

    expect(doc.document_type).toBe('benefit_notice');
    expect(doc.provider_name).toBeDefined();
    expect(result.privacyNotice).toContain('discarded');
  });
});
