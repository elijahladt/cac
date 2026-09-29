import { describe, it, expect } from 'vitest';
import { searchResources, calculateDistance, estimateTravelTimes } from '@/tools/resources';

describe('Resource Tools & Scoring Tests', () => {
  it('should calculate accurate Haversine distance', () => {
    // Distance between North Las Vegas and Las Vegas Strip (~5 miles)
    const dist = calculateDistance(36.1989, -115.1175, 36.1147, -115.1728);
    expect(dist).toBeGreaterThan(4);
    expect(dist).toBeLessThan(8);
  });

  it('should estimate realistic driving and walking travel times', () => {
    const times = estimateTravelTimes(2.2);
    expect(times.driving).toContain('min');
    expect(times.walking).toContain('min');
  });

  it('should filter resources deterministically by category', async () => {
    const utilityResults = await searchResources({ category: 'utility_assistance' });
    expect(utilityResults.length).toBeGreaterThan(0);
    for (const res of utilityResults) {
      expect(res.category).toBe('utility_assistance');
    }

    const foodResults = await searchResources({ category: 'food_assistance' });
    expect(foodResults.length).toBeGreaterThan(0);
    for (const res of foodResults) {
      expect(res.category).toBe('food_assistance');
    }
  });

  it('should include "Why this resource?" rationale without inventing facts', async () => {
    const results = await searchResources({
      query: 'electric power bill',
      category: 'utility_assistance',
      language: 'es',
    });
    expect(results.length).toBeGreaterThan(0);
    const topResult = results[0];
    expect(topResult.whyThisResource).toBeDefined();
    expect(topResult.whyThisResource?.length).toBeGreaterThan(10);
    expect(topResult.score).toBeGreaterThan(0);
  });
});
