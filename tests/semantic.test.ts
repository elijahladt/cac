import { describe, it, expect } from 'vitest';
import { cosineSimilarity, hybridSearch, calculateSemanticOverlapScore } from '@/lib/embeddings/semanticSearch';
import { VERIFIED_RESOURCES } from '@/lib/data/verifiedResources';

describe('Semantic Search and Hybrid Retrieval Tests', () => {
  it('should compute mathematical cosine similarity correctly', () => {
    const vecA = [1, 0, 0];
    const vecB = [1, 0, 0];
    expect(cosineSimilarity(vecA, vecB)).toBeCloseTo(1.0);

    const vecC = [0, 1, 0];
    expect(cosineSimilarity(vecA, vecC)).toBeCloseTo(0.0);
  });

  it('should rank utility resources highly for shutoff query', async () => {
    const results = await hybridSearch('my electric power is getting shut off');
    expect(results.length).toBeGreaterThan(0);
    const topResource = results[0].resource;
    expect(topResource.category).toBe('utility_assistance');
  });

  it('should rank food resources highly for hungry kids query', async () => {
    const results = await hybridSearch('groceries and food pantry for children');
    expect(results.length).toBeGreaterThan(0);
    const topResource = results[0].resource;
    expect(topResource.category).toBe('food_assistance');
  });

  it('should compute semantic overlap score between 0 and 1', () => {
    const res = VERIFIED_RESOURCES[0];
    const score = calculateSemanticOverlapScore('utility power electricity assistance', res);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1.0);
  });
});
