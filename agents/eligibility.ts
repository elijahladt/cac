import {
  Program,
  EligibilityEvaluation,
  EligibilityResultType,
} from '@/lib/types';
import OpenAI from 'openai';
import { AI_CONFIG, SYSTEM_ROLE_DESCRIPTIONS } from '@/lib/openai/config';

// Deterministic rule-based eligibility comparator
export function evaluateEligibilityLocal(
  program: Program,
  userFacts: Record<string, string | number | boolean>
): EligibilityEvaluation {
  const matched: string[] = [];
  const unmatched: string[] = [];
  const missing: string[] = [];

  // Check Residency
  const city = String(userFacts.city || '').toLowerCase();
  if (city.includes('north las vegas') || city.includes('las vegas') || city.includes('nv') || userFacts.residency_confirmed) {
    matched.push('Nevada residency (North Las Vegas / Clark County)');
  } else if (!userFacts.city) {
    missing.push('Proof of residency in Nevada');
  }

  // Check Utility status if utility program
  if (program.category === 'utility_assistance') {
    if (userFacts.utility_shutoff || userFacts.has_past_due_bill) {
      matched.push('Active utility account with past-due or disconnect notice');
    } else {
      missing.push('Latest NV Energy electric or gas bill statement');
    }
  }

  // Check Children for food / family programs
  if (program.category === 'childcare' || program.name.toLowerCase().includes('kid')) {
    if (userFacts.has_children) {
      matched.push('Household includes dependent children');
    } else if (userFacts.has_children === false) {
      unmatched.push('Program is designated specifically for households with children');
    } else {
      missing.push('Household size and dependent children details');
    }
  }

  // Determine overall result
  let result: EligibilityResultType = 'POTENTIAL_MATCH';
  let explanation = '';

  if (unmatched.length > 0) {
    result = 'POSSIBLE_MISMATCH';
    explanation = `Based on current information, this program may not match because: ${unmatched.join(', ')}.`;
  } else if (missing.length > 0 && matched.length === 0) {
    result = 'INSUFFICIENT_INFORMATION';
    explanation = `Additional details needed (${missing.join(', ')}) before determining potential match.`;
  } else if (missing.length > 0) {
    result = 'POTENTIAL_MATCH';
    explanation = `This program may be a match based on the information you have provided so far (${matched.join(', ')}). You will still need to verify: ${missing.join(', ')}.`;
  } else {
    result = 'POTENTIAL_MATCH';
    explanation = `This program may be a match based on the information you've provided. (Official determination will be made directly by ${program.name}).`;
  }

  return {
    program_id: program.id,
    program_name: program.name,
    result,
    confidence: matched.length > 0 ? 0.85 : 0.5,
    matched_requirements: matched,
    unmatched_requirements: unmatched,
    missing_information: missing,
    explanation,
  };
}

// Eligibility Agent with AI Reasoning (PRD Section 12)
export async function evaluateEligibility(
  program: Program,
  userFacts: Record<string, string | number | boolean>
): Promise<EligibilityEvaluation> {
  if (!AI_CONFIG.hasApiKey) {
    return evaluateEligibilityLocal(program, userFacts);
  }

  try {
    const openai = new OpenAI({ apiKey: AI_CONFIG.apiKey });

    const prompt = `
Compare the documented requirements for program: "${program.name}"
Documented rules: ${JSON.stringify(program.eligibility_rules)}
Required documents: ${JSON.stringify(program.required_documents)}

Against user-provided facts:
${JSON.stringify(userFacts)}

Return JSON adhering to schema:
{
  "result": "POTENTIAL_MATCH" | "POSSIBLE_MISMATCH" | "INSUFFICIENT_INFORMATION" | "UNKNOWN",
  "matched_requirements": ["string"],
  "unmatched_requirements": ["string"],
  "missing_information": ["string"],
  "explanation": "string non-authoritative explanation using 'This program may be a match...'. NEVER say 'You definitely qualify'."
}
`;

    const response = await openai.chat.completions.create({
      model: AI_CONFIG.fastModel,
      messages: [
        { role: 'system', content: SYSTEM_ROLE_DESCRIPTIONS.eligibility },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const parsed = JSON.parse(response.choices[0].message.content || '{}');

    return {
      program_id: program.id,
      program_name: program.name,
      result: parsed.result || 'POTENTIAL_MATCH',
      confidence: 0.9,
      matched_requirements: parsed.matched_requirements || [],
      unmatched_requirements: parsed.unmatched_requirements || [],
      missing_information: parsed.missing_information || [],
      explanation:
        parsed.explanation ||
        `This program may be a match based on the information you've provided.`,
    };
  } catch (err) {
    console.warn('AI eligibility evaluation failed, using deterministic evaluation:', err);
    return evaluateEligibilityLocal(program, userFacts);
  }
}
