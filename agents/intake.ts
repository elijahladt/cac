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

  const spanishMarkers = [
    'necesito', 'factura', 'luz', 'electricidad', 'comida', 'hijos', 'ayuda',
    'alquiler', 'casa', 'por favor', 'gracias', 'cuánto', 'donde', 'dinero',
    'pagar', 'no tengo', 'necesitamos', 'mi familia', 'agua', 'renta', 'trabajo',
    'médico', 'salud', 'niños', 'desalojo', 'corte', 'apagón', 'servicio',
  ];

  // Comprehensive Tagalog/Filipino markers — covers everyday spoken Filipino
  // including informal Taglish (Tagalog-English mix) common in North Las Vegas.
  //
  // Short ambiguous markers (≤4 chars such as "at", "ng", "sa", "ba", "po")
  // must be matched as WHOLE WORDS using regex to avoid false positives inside
  // English words like "battery", "sang", "getting", "sane", etc.
  //
  // Longer, distinctive markers can use plain substring matching.

  // Short markers — whole-word match required
  const tagalogShortMarkers = [
    'ako', 'oo', 'po', 'ho', 'nga', 'ba', 'at', 'ng', 'sa', 'mga',
    'kung', 'pero', 'upa', 'wala', 'sana', 'paki', 'sige', 'ilaw',
    'ulam',
  ];

  // Longer markers — substring match is safe
  const tagalogLongMarkers = [
    // Grammar / sentence structure
    'kailangan', 'gusto', 'kami', 'aming', 'namin', 'natin',
    'mayroon', 'hindi', 'para', 'dahil',
    // Utilities
    'kuryente', 'tubig', 'singil', 'bayad', 'bayarin',
    'pabayad', 'putol', 'putulin', 'maputulan', 'koneksyon', 'utang',
    // Food
    'pagkain', 'gutom', 'kumain', 'bigas', 'kanin',
    'makakain', 'pantawid',
    // Housing
    'bahay', 'pabahay', 'renta', 'mapapaalis',
    'mapaalis', 'paupahan', 'lumayas', 'palabasin',
    // Family / Children
    'anak', 'mga bata', 'bata', 'pamilya', 'asawa', 'nanay', 'tatay',
    'lola', 'lolo', 'kapatid', 'magulang', 'inay', 'itay',
    // Help / Need
    'tulong', 'tulungan', 'saklolo', 'humingi', 'kailangan ko',
    'kailangan namin',
    // Polite markers / interrogatives
    'salamat', 'pakiusap', 'magkano', 'saan', 'kailan',
    // Work / Jobs
    'trabaho', 'trabahante', 'walang trabaho', 'nawalan', 'hanap-buhay',
    // Health
    'sakit', 'ospital', 'doktor', 'gamot', 'lunas', 'medikal', 'klinika',
    // Urgency / difficulty
    'agad', 'ngayon', 'bukas', 'mamaya', 'mahal', 'mahirap', 'hirap',
    'problema', 'naghihirap',
    // Common Tagalog sentence starters
    'hindi ko', 'hindi kami', 'wala kaming', 'wala akong',
    'may problema', 'may sakit', 'may utang',
  ];

  const hasTagalogShort = tagalogShortMarkers.some((m) =>
    new RegExp(`\\b${m}\\b`).test(lower)
  );
  const hasTagalogLong = tagalogLongMarkers.some((m) => lower.includes(m));

  if (spanishMarkers.some((m) => lower.includes(m))) {
    detectedLang = 'es';
  } else if (hasTagalogShort || hasTagalogLong) {
    detectedLang = 'tl';
  }

  // Extract needs
  const needs: ResourceCategory[] = [];

  // Utilities — English + Spanish + Tagalog
  if (
    lower.includes('power') ||
    lower.includes('electric') ||
    lower.includes('shut off') ||
    lower.includes('shutoff') ||
    lower.includes('bill') ||
    lower.includes('utility') ||
    lower.includes('luz') ||
    lower.includes('electricidad') ||
    lower.includes('apagón') ||
    // Tagalog
    lower.includes('kuryente') ||
    lower.includes('ilaw') ||
    lower.includes('singil') ||
    lower.includes('bayad sa kuryente') ||
    lower.includes('maputulan ng kuryente') ||
    lower.includes('maputulan') ||
    lower.includes('putol ang kuryente') ||
    lower.includes('walang kuryente') ||
    lower.includes('pabayad') ||
    lower.includes('tubig') ||
    lower.includes('gas')
  ) {
    needs.push('utility_assistance');
  }

  // Food — English + Spanish + Tagalog
  if (
    lower.includes('food') ||
    lower.includes('groceries') ||
    lower.includes('eat') ||
    lower.includes('hunger') ||
    lower.includes('hungry') ||
    lower.includes('meal') ||
    lower.includes('kids') ||
    lower.includes('comida') ||
    lower.includes('hambre') ||
    lower.includes('alimento') ||
    lower.includes('comer') ||
    // Tagalog
    lower.includes('pagkain') ||
    lower.includes('gutom') ||
    lower.includes('kumain') ||
    lower.includes('ulam') ||
    lower.includes('bigas') ||
    lower.includes('kanin') ||
    lower.includes('makakain') ||
    lower.includes('wala kaming pagkain') ||
    lower.includes('wala akong pagkain') ||
    lower.includes('pantawid pagkain')
  ) {
    needs.push('food_assistance');
  }

  // Housing / Rent — English + Spanish + Tagalog
  if (
    lower.includes('rent') ||
    lower.includes('evict') ||
    lower.includes('housing') ||
    lower.includes('shelter') ||
    lower.includes('homeless') ||
    lower.includes('alquiler') ||
    lower.includes('desalojo') ||
    lower.includes('vivienda') ||
    lower.includes('renta') ||
    // Tagalog
    lower.includes('bahay') ||
    lower.includes('pabahay') ||
    lower.includes('upa') ||
    lower.includes('mapapaalis') ||
    lower.includes('mapaalis') ||
    lower.includes('paupahan') ||
    lower.includes('palabasin') ||
    lower.includes('walang tirahan')
  ) {
    needs.push('housing');
  }

  // Healthcare — English + Spanish + Tagalog
  if (
    lower.includes('doctor') ||
    lower.includes('medicaid') ||
    lower.includes('clinic') ||
    lower.includes('medicine') ||
    lower.includes('medical') ||
    lower.includes('hospital') ||
    lower.includes('health') ||
    lower.includes('médico') ||
    lower.includes('salud') ||
    lower.includes('medicina') ||
    // Tagalog
    lower.includes('sakit') ||
    lower.includes('ospital') ||
    lower.includes('doktor') ||
    lower.includes('gamot') ||
    lower.includes('medikal') ||
    lower.includes('klinika') ||
    lower.includes('lunas') ||
    lower.includes('may sakit')
  ) {
    needs.push('healthcare');
  }

  // Jobs — English + Spanish + Tagalog
  if (
    lower.includes('job') ||
    lower.includes('work') ||
    lower.includes('unemployed') ||
    lower.includes('employment') ||
    lower.includes('career') ||
    lower.includes('resume') ||
    lower.includes('trabajo') ||
    lower.includes('empleo') ||
    lower.includes('desempleo') ||
    // Tagalog
    lower.includes('trabaho') ||
    lower.includes('walang trabaho') ||
    lower.includes('nawalan ng trabaho') ||
    lower.includes('hanap-buhay') ||
    lower.includes('hanap ng trabaho')
  ) {
    needs.push('jobs');
  }

  // Transportation — English + Spanish + Tagalog
  if (
    lower.includes('bus') ||
    lower.includes('transport') ||
    lower.includes('ride') ||
    lower.includes('rtc') ||
    lower.includes('transporte') ||
    // Tagalog
    lower.includes('sasakyan') ||
    lower.includes('biyahe') ||
    lower.includes('makarating') ||
    lower.includes('paano makarating')
  ) {
    needs.push('transportation');
  }

  // Childcare — English + Spanish + Tagalog
  if (
    lower.includes('childcare') ||
    lower.includes('daycare') ||
    lower.includes('preschool') ||
    lower.includes('head start') ||
    lower.includes('cuidado de niños') ||
    lower.includes('guardería') ||
    // Tagalog
    lower.includes('pag-aalaga ng bata') ||
    lower.includes('paaralan') ||
    lower.includes('maagang edukasyon')
  ) {
    needs.push('childcare');
  }

  if (needs.length === 0) {
    needs.push('other');
  }

  // Detect household children — English + Spanish + Tagalog
  const hasChildren =
    lower.includes('kid') ||
    lower.includes('child') ||
    lower.includes('children') ||
    lower.includes('son') ||
    lower.includes('daughter') ||
    lower.includes('baby') ||
    lower.includes('infant') ||
    lower.includes('toddler') ||
    lower.includes('hijo') ||
    lower.includes('hija') ||
    lower.includes('niño') ||
    lower.includes('niña') ||
    lower.includes('bebé') ||
    // Tagalog
    lower.includes('anak') ||
    lower.includes('mga bata') ||
    lower.includes('bata') ||
    lower.includes('sanggol') ||
    lower.includes('batang') ||
    lower.includes('mga anak');

  // Detect urgency — English + Spanish + Tagalog
  let urgency: UrgencyLevel = 'medium';
  if (
    lower.includes('shut off') ||
    lower.includes('cut off') ||
    lower.includes('eviction') ||
    lower.includes('tomorrow') ||
    lower.includes('today') ||
    lower.includes('urgent') ||
    lower.includes('emergency') ||
    lower.includes('immediately') ||
    lower.includes('right now') ||
    lower.includes('corte') ||
    lower.includes('inmediato') ||
    lower.includes('urgente') ||
    lower.includes('mañana') ||
    lower.includes('hoy') ||
    // Tagalog
    lower.includes('agad') ||
    lower.includes('ngayon') ||
    lower.includes('bukas na') ||
    lower.includes('maputulan') ||
    lower.includes('mapuputulan') ||
    lower.includes('aalis na') ||
    lower.includes('mapapaalis') ||
    lower.includes('kailangan agad') ||
    lower.includes('apurahan') ||
    lower.includes('emergency na') ||
    lower.includes('pang-emergency')
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
