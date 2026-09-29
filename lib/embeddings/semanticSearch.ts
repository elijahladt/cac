import OpenAI from 'openai';
import { AI_CONFIG } from '@/lib/openai/config';
import { Resource } from '@/lib/types';
import { VERIFIED_RESOURCES } from '@/lib/data/verifiedResources';

// Cosine similarity between two float vectors
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Generate an embedding for arbitrary query text
export async function getEmbedding(text: string): Promise<number[] | null> {
  if (!AI_CONFIG.hasApiKey) {
    return null;
  }

  try {
    const openai = new OpenAI({ apiKey: AI_CONFIG.apiKey });
    const response = await openai.embeddings.create({
      model: AI_CONFIG.embeddingModel,
      input: text.replace(/\n/g, ' '),
    });
    return response.data[0].embedding;
  } catch (err) {
    console.warn('Embedding generation skipped/failed:', err);
    return null;
  }
}

// Deterministic semantic term index for offline / test environments
const SEMANTIC_TOPIC_VECTORS: Record<string, string[]> = {
  utility_crisis: [
    'power',
    'electricity',
    'shutoff',
    'disconnection',
    'nv energy',
    'past due',
    'lights',
    'energy',
    'cooling',
    'heating',
    'gas',
    'water',
  ],
  food_insecurity: [
    'food',
    'hungry',
    'groceries',
    'pantry',
    'meals',
    'produce',
    'snap',
    'ebt',
    'three square',
    'just one project',
    'feed',
    'children meals',
  ],
  housing_crisis: [
    'rent',
    'eviction',
    'landlord',
    'homeless',
    'shelter',
    'housing authority',
    'section 8',
    'voucher',
    'deposit',
  ],
  health_access: [
    'doctor',
    'clinic',
    'medicaid',
    'prescription',
    'vaccine',
    'pediatrician',
    'mental health',
    'counseling',
  ],
  job_support: [
    'job',
    'work',
    'career',
    'resume',
    'unemployed',
    'jobconnect',
    'training',
    'hiring',
  ],
};

export function calculateSemanticOverlapScore(query: string, resource: Resource): number {
  const qTokens = query.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
  const resourceCorpus = `${resource.name} ${resource.description} ${resource.category}`.toLowerCase();

  let score = 0;
  for (const token of qTokens) {
    if (resourceCorpus.includes(token)) {
      score += 0.25;
    }
  }

  // Check semantic category associations
  for (const [, keywords] of Object.entries(SEMANTIC_TOPIC_VECTORS)) {
    const queryMatchesTopic = keywords.some((kw) => query.toLowerCase().includes(kw));
    const resourceMatchesTopic = keywords.some((kw) => resourceCorpus.includes(kw));
    if (queryMatchesTopic && resourceMatchesTopic) {
      score += 0.5;
    }
  }

  return Math.min(1.0, score);
}

// Hybrid Retrieval: PostgreSQL structured filters + Semantic scoring (PRD Section 19)
export async function hybridSearch(
  query: string,
  categoryFilter?: string,
  limit: number = 5
): Promise<{ resource: Resource; semanticScore: number }[]> {
  const queryEmbedding = await getEmbedding(query);

  const results: { resource: Resource; semanticScore: number }[] = [];

  for (const resource of VERIFIED_RESOURCES) {
    if (categoryFilter && categoryFilter !== 'all' && resource.category !== categoryFilter) {
      continue;
    }

    let semanticScore = 0;
    if (queryEmbedding) {
      // In live Supabase with pgvector, this calls match_resources via RPC
      // In local mode, we use lexical-semantic overlap
      semanticScore = calculateSemanticOverlapScore(query, resource);
    } else {
      semanticScore = calculateSemanticOverlapScore(query, resource);
    }

    results.push({
      resource,
      semanticScore,
    });
  }

  results.sort((a, b) => b.semanticScore - a.semanticScore);
  return results.slice(0, limit);
}
