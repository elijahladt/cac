import OpenAI from 'openai';
import { IntakeResult, ResourceCategory, SupportedLanguage, UrgencyLevel } from '@/lib/types';
import { AI_CONFIG, SYSTEM_ROLE_DESCRIPTIONS } from '@/lib/openai/config';
import { detectImmediateEmergency } from '@/lib/emergency';

// Rule-based fallback parser ensures 100% deterministic reliability even without an active OpenAI API key
export function parseLocalIntake(userInput: string, preferredLang: SupportedLanguage = 'en'): IntakeResult {
  const lower = userInput.toLowerCase();

  // Detect immediate emergency
  if (detectImmediateEmergency(userInput)) {
    return {
      language: preferredLang,
      needs: ['healthcare'],
      raw_needs_summary: 'Immediate crisis or emergency safety alert',
      urgency: 'emergency',
      known_facts: { emergency: true },
      missing_information: [],
      follow_up_questions: ['Are you in a safe location right now? Please call 911 or 988 immediately.'],
    };
  }

  // Detect language
  let detectedLang: SupportedLanguage = preferredLang;
  const spanishMarkers = ['necesito', 'factura', 'luz', 'electricidad', 'comida', 'hijos', 'ayuda', 'alquiler', 'casa', 'por favor', 'gracias', 'cuánto', 'donde'];
  const tagalogMarkers = ['kailangan', 'kuryente', 'pagkain', 'anak', 'tulong', 'upa', 'bahay', 'pakiusap', 'salamat', 'magkano', 'saan', 'gutom'];

  if (spanishMarkers.some((m) => lower.includes(m))) {
    detectedLang = 'es';
  } else if (tagalogMarkers.some((m) => lower.includes(m))) {
    detectedLang = 'tl';
  }

  // Extract needs
  const needs: ResourceCategory[] = [];

  // Utilities
  if (
    lower.includes('power') ||
    lower.includes('electric') ||
    lower.includes('shut off') ||
    lower.includes('shutoff') ||
    lower.includes('bill') ||
    lower.includes('luz') ||
    lower.includes('electricidad') ||
    lower.includes('kuryente') ||
    lower.includes('water') ||
    lower.includes('gas')
  ) {
    needs.push('utility_assistance');
  }

  // Food
  if (
    lower.includes('food') ||
    lower.includes('kids') ||
    lower.includes('groceries') ||
    lower.includes('eat') ||
    lower.includes('hunger') ||
    lower.includes('comida') ||
    lower.includes('hambre') ||
    lower.includes('alimento') ||
    lower.includes('pagkain') ||
    lower.includes('gutom')
  ) {
    needs.push('food_assistance');
  }

  // Housing / Rent
  if (
    lower.includes('rent') ||
    lower.includes('evict') ||
    lower.includes('housing') ||
    lower.includes('shelter') ||
    lower.includes('alquiler') ||
    lower.includes('desalojo') ||
    lower.includes('vivienda') ||
    lower.includes('pabahay') ||
    lower.includes('makupkop')
  ) {
    needs.push('housing');
  }

  // Healthcare
  if (
    lower.includes('doctor') ||
    lower.includes('medicaid') ||
    lower.includes('clinic') ||
    lower.includes('medicine') ||
    lower.includes('médico') ||
    lower.includes('salud') ||
    lower.includes('klinika')
  ) {
    needs.push('healthcare');
  }

  // Jobs
  if (
    lower.includes('job') ||
    lower.includes('work') ||
    lower.includes('unemployed') ||
    lower.includes('trabajo') ||
    lower.includes('empleo') ||
    lower.includes('trabaho')
  ) {
    needs.push('jobs');
  }

  if (needs.length === 0) {
    needs.push('other');
  }

  // Detect household children
  const hasChildren =
    lower.includes('kid') ||
    lower.includes('children') ||
    lower.includes('son') ||
    lower.includes('daughter') ||
    lower.includes('hijo') ||
    lower.includes('anak');

  // Detect urgency
  let urgency: UrgencyLevel = 'medium';
  if (
    lower.includes('shut off') ||
    lower.includes('cut off') ||
    lower.includes('eviction') ||
    lower.includes('tomorrow') ||
    lower.includes('today') ||
    lower.includes('corte') ||
    lower.includes('inmediato') ||
    lower.includes('urgent') ||
    lower.includes('emergency') ||
    lower.includes('agad')
  ) {
    urgency = 'high';
  }

  // Detect location
  let locationCity = 'North Las Vegas';
  if (lower.includes('las vegas') && !lower.includes('north las vegas')) {
    locationCity = 'Las Vegas';
  }

  const missingInfo: string[] = [];
  const followUpQuestions: string[] = [];

  if (needs.includes('utility_assistance')) {
    missingInfo.push('utility_provider');
    missingInfo.push('past_due_amount');
    followUpQuestions.push(
      detectedLang === 'es'
        ? '¿Tiene a mano una copia o foto de su factura de luz o gas?'
        : detectedLang === 'tl'
        ? 'Mayroon ka bang kopya o litrato ng iyong utility bill?'
        : 'Do you have a copy or photo of your past-due utility bill?'
    );
  }

  if (!hasChildren && needs.includes('food_assistance')) {
    missingInfo.push('household_size');
  }

  return {
    language: detectedLang,
    needs,
    raw_needs_summary: `Identified needs: ${needs.join(', ')}`,
    location: {
      city: locationCity,
      zip: '89030',
    },
    urgency,
    household_has_children: hasChildren,
    known_facts: {
      has_children: hasChildren,
      primary_needs: needs.join(', '),
      city: locationCity,
    },
    missing_information: missingInfo,
    follow_up_questions: followUpQuestions,
  };
}

export async function runIntakeAgent(
  userInput: string,
  preferredLang: SupportedLanguage = 'en'
): Promise<IntakeResult> {
  // If no OpenAI API Key configured, gracefully use the deterministic fallback parser
  if (!AI_CONFIG.hasApiKey) {
    return parseLocalIntake(userInput, preferredLang);
  }

  try {
    const openai = new OpenAI({ apiKey: AI_CONFIG.apiKey });

    const prompt = `
Analyze this community assistance request from a Nevada resident:
"${userInput}"

Extract structured intake information strictly according to this JSON schema:
{
  "language": "en" | "es" | "tl",
  "needs": ("utility_assistance" | "food_assistance" | "housing" | "healthcare" | "jobs" | "transportation" | "childcare" | "other")[],
  "raw_needs_summary": "brief English summary of user needs",
  "location": { "city": "North Las Vegas", "zip": "string or null" },
  "urgency": "low" | "medium" | "high" | "emergency",
  "household_has_children": boolean,
  "known_facts": {},
  "missing_information": string[],
  "follow_up_questions": string[]
}

Rules:
1. Normalize internal identifiers to English.
2. The initial geography is North Las Vegas / NV-04.
3. NEVER invent facts or resources.
4. If immediate life threat/violence/suicide detected, urgency must be "emergency".
`;

    const response = await openai.chat.completions.create({
      model: AI_CONFIG.fastModel,
      messages: [
        { role: 'system', content: SYSTEM_ROLE_DESCRIPTIONS.intake },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const parsed = JSON.parse(response.choices[0].message.content || '{}');
    return {
      language: parsed.language || preferredLang,
      needs: parsed.needs || ['other'],
      raw_needs_summary: parsed.raw_needs_summary || userInput,
      location: parsed.location || { city: 'North Las Vegas' },
      urgency: parsed.urgency || 'medium',
      household_has_children: Boolean(parsed.household_has_children),
      known_facts: parsed.known_facts || {},
      missing_information: parsed.missing_information || [],
      follow_up_questions: parsed.follow_up_questions || [],
    };
  } catch (err) {
    console.warn('OpenAI intake failed, falling back to deterministic intake:', err);
    return parseLocalIntake(userInput, preferredLang);
  }
}
