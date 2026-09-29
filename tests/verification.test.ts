import { describe, it, expect } from 'vitest';
import { auditResources } from '@/agents/verification';
import { VERIFIED_RESOURCES } from '@/lib/data/verifiedResources';

describe('Verification Agent Tests', () => {
  it('should flag demo stale resources older than 60 days', () => {
    const report = auditResources(VERIFIED_RESOURCES);
    const staleItems = report.filter((r) => r.isStale);

    expect(staleItems.length).toBeGreaterThan(0);
    const staleDemo = staleItems.find((r) => r.resourceId === 'res-stale-example');
    expect(staleDemo).toBeDefined();
    expect(staleDemo?.issuesDetected.some((i) => i.includes('exceeds 60-day threshold'))).toBe(true);
  });

  it('should confirm active verified resources have authoritative URLs', () => {
    const report = auditResources(VERIFIED_RESOURCES);
    const verifiedItem = report.find((r) => r.resourceId === 'res-nv-energy-reach');

    expect(verifiedItem?.isStale).toBe(false);
    expect(verifiedItem?.currentStatus).toBe('VERIFIED');
  });
});
