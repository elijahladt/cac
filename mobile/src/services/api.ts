import { Platform } from 'react-native';
import Constants from 'expo-constants';
import {
  ActionPlan,
  CaseFile,
  DocumentAnalysis,
  IntakeResult,
  Resource,
  ResourceCategory,
  SupportedLanguage,
  UrgencyLevel,
} from '../types';
import {
  VERIFIED_RESOURCES,
  VERIFIED_PROGRAMS,
  getLocalizedResource,
  getLocalizedProgram,
} from '../data/resources';
import { detectImmediateEmergency } from '../emergency/pathways';

// Dynamically resolve API URL: web localhost or mobile LAN IP
export function getApiBaseUrl(): string {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    return `http://${ip}:3000`;
  }
  return 'http://192.168.0.72:3000';
}

export const API_BASE_URL = getApiBaseUrl();

export function parseLocalIntake(userInput: string, preferredLang: SupportedLanguage = 'en') {
  const lower = userInput.toLowerCase();

  // Detect immediate emergency
  if (detectImmediateEmergency(userInput)) {
    return {
      language: preferredLang,
      needs: ['healthcare' as ResourceCategory],
      raw_needs_summary: 'Immediate crisis or emergency safety alert',
      urgency: 'emergency' as UrgencyLevel,
      emergency: true,
      follow_up_questions: ['Are you in a safe location right now? Please call 911 or 988 immediately.'],
    };
  }

  // Language detection — detects user's actual spoken/typed language
  let detectedLang: SupportedLanguage = preferredLang;

  const spanishMarkers = [
    'hola', 'buenos', 'buenas', 'días', 'tardes', 'noches', 'necesito', 'factura',
    'luz', 'electricidad', 'comida', 'hijos', 'ayuda', 'ayudar', 'alquiler',
    'casa', 'por favor', 'gracias', 'cuánto', 'donde', 'dinero', 'pagar',
    'tengo', 'no tengo', 'necesitamos', 'mi familia', 'familia', 'agua',
    'renta', 'trabajo', 'médico', 'salud', 'niños', 'desalojo', 'corte',
    'apagón', 'servicio', 'busco', 'buscar', 'gratis', 'solicitar', 'puedo',
    'urgente', 'problema', 'enfermo', 'medicina', 'doctor', 'despensa',
  ];

  const tagalogShortMarkers = [
    'ako', 'oo', 'po', 'ho', 'nga', 'ba', 'at', 'ng', 'sa', 'mga',
    'kung', 'pero', 'upa', 'wala', 'sana', 'paki', 'sige', 'ilaw', 'ulam',
  ];

  const tagalogLongMarkers = [
    'kumusta', 'magandang', 'araw', 'kailangan', 'gusto', 'kami', 'aming', 'namin', 'natin',
    'mayroon', 'hindi', 'para', 'dahil', 'kuryente', 'tubig', 'singil', 'bayad', 'bayarin',
    'pabayad', 'putol', 'putulin', 'maputulan', 'koneksyon', 'utang', 'pagkain', 'gutom',
    'kumain', 'bigas', 'kanin', 'makakain', 'pantawid', 'bahay', 'pabahay', 'renta',
    'mapapaalis', 'mapaalis', 'paupahan', 'anak', 'mga bata', 'bata', 'pamilya', 'asawa',
    'nanay', 'tatay', 'tulong', 'tulungan', 'saklolo', 'humingi', 'kailangan ko',
    'kailangan namin', 'salamat', 'pakiusap', 'magkano', 'saan', 'kailan', 'trabaho',
    'trabahante', 'walang trabaho', 'nawalan', 'hanap-buhay', 'sakit', 'ospital', 'doktor',
    'gamot', 'lunas', 'medikal', 'klinika', 'agad', 'ngayon', 'bukas', 'mamaya', 'mahal',
    'mahirap', 'hirap', 'problema', 'naghihirap',
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

  if (
    lower.includes('power') || lower.includes('electric') || lower.includes('shut off') ||
    lower.includes('bill') || lower.includes('utility') || lower.includes('luz') ||
    lower.includes('electricidad') || lower.includes('kuryente') || lower.includes('ilaw') ||
    lower.includes('singil') || lower.includes('tubig') || lower.includes('gas') ||
    lower.includes('pabayad')
  ) {
    needs.push('utility_assistance');
  }

  if (
    lower.includes('food') || lower.includes('groceries') || lower.includes('eat') ||
    lower.includes('hunger') || lower.includes('kids') || lower.includes('comida') ||
    lower.includes('alimento') || lower.includes('pagkain') || lower.includes('gutom') ||
    lower.includes('bigas') || lower.includes('ulam') || lower.includes('pantawid')
  ) {
    needs.push('food_assistance');
  }

  if (
    lower.includes('rent') || lower.includes('evict') || lower.includes('housing') ||
    lower.includes('shelter') || lower.includes('alquiler') || lower.includes('desalojo') ||
    lower.includes('vivienda') || lower.includes('renta') || lower.includes('bahay') ||
    lower.includes('upa') || lower.includes('mapapaalis') || lower.includes('mapaalis')
  ) {
    needs.push('housing');
  }

  if (
    lower.includes('doctor') || lower.includes('medicaid') || lower.includes('clinic') ||
    lower.includes('medicine') || lower.includes('salud') || lower.includes('médico') ||
    lower.includes('sakit') || lower.includes('doktor') || lower.includes('gamot') ||
    lower.includes('klinika') || lower.includes('ospital')
  ) {
    needs.push('healthcare');
  }

  if (
    lower.includes('job') || lower.includes('work') || lower.includes('unemployed') ||
    lower.includes('trabajo') || lower.includes('empleo') || lower.includes('trabaho') ||
    lower.includes('hanap-buhay')
  ) {
    needs.push('jobs');
  }

  if (needs.length === 0) {
    needs.push('other');
  }

  // Urgency
  let urgency: UrgencyLevel = 'medium';
  if (
    lower.includes('shut off') || lower.includes('cut off') || lower.includes('eviction') ||
    lower.includes('tomorrow') || lower.includes('today') || lower.includes('urgent') ||
    lower.includes('emergency') || lower.includes('inmediato') || lower.includes('urgente') ||
    lower.includes('agad') || lower.includes('ngayon') || lower.includes('bukas')
  ) {
    urgency = 'high';
  }

  return {
    language: detectedLang,
    needs,
    raw_needs_summary: `Identified needs: ${needs.join(', ')}`,
    urgency,
    emergency: false,
  };
}

export function formatHumanNeeds(needs: ResourceCategory[], lang: SupportedLanguage): string {
  const translations: Record<SupportedLanguage, Record<ResourceCategory, string>> = {
    es: {
      utility_assistance: 'asistencia con la factura de luz y gas',
      food_assistance: 'comida y despensas de alimentos',
      housing: 'apoyo para el alquiler y vivienda',
      healthcare: 'atención médica y clínicas comunitarias',
      jobs: 'capacitación y empleo',
      transportation: 'transporte y pases de autobús',
      childcare: 'cuidado infantil y Head Start',
      other: 'asistencia comunitaria',
    },
    tl: {
      utility_assistance: 'tulong sa bayarin sa kuryente at utility',
      food_assistance: 'tulong sa pagkain at grocery',
      housing: 'suporta sa upa at pabahay',
      healthcare: 'serbisyong medikal at klinika',
      jobs: 'pagsasanay sa trabaho at hanapbuhay',
      transportation: 'transportasyon at bus pass',
      childcare: 'pag-aalaga ng bata at edukasyon',
      other: 'tulong sa komunidad',
    },
    en: {
      utility_assistance: 'utility and electric bill assistance',
      food_assistance: 'food and grocery support',
      housing: 'housing and rental assistance',
      healthcare: 'medical and healthcare clinics',
      jobs: 'job training and employment',
      transportation: 'transit and bus passes',
      childcare: 'childcare and preschool',
      other: 'community assistance',
    },
  };

  const specificNeeds = needs.filter((n) => n !== 'other');
  if (specificNeeds.length === 0) return translations[lang].other;
  const list = specificNeeds.map((n) => translations[lang][n] || n);
  if (lang === 'es') return list.join(' y ');
  if (lang === 'tl') return list.join(' at ');
  return list.join(' and ');
}

export function generateLocalActionPlan(
  needs: ResourceCategory[],
  lang: SupportedLanguage
): ActionPlan {
  const matchingResources = VERIFIED_RESOURCES.filter((r) => needs.includes(r.category)).map((r) =>
    getLocalizedResource(r, lang)
  );
  const planItems = matchingResources.map((res, index) => {
    let docs = ['Proof of Nevada address (ID or lease)'];
    if (res.category === 'utility_assistance') {
      docs =
        lang === 'es'
          ? [
              'Factura vencida o aviso de desconexión de NV Energy',
              'Identificación con foto emitida por el gobierno de Nevada',
              'Comprobante de ingresos de los últimos 30 días (talones de pago o carta de beneficios)',
            ]
          : lang === 'tl'
          ? [
              'Kasalukuyang utility bill o notice ng pagkaputol mula sa NV Energy',
              'Valid na Photo ID (Nevada Driver License o State ID)',
              'Katibayan ng kita sa nakaraang 30 araw',
            ]
          : [
              'Past-due NV Energy or Southwest Gas bill with disconnect notice',
              'State-issued Photo ID (Nevada Driver License or ID Card)',
              'Proof of prior 30 days household income (paystubs, SSI award)',
            ];
    } else if (res.category === 'food_assistance') {
      docs =
        lang === 'es'
          ? ['Declaración de necesidad alimentaria (No se requiere identificación obligatoria para despensa)']
          : lang === 'tl'
          ? ['Pahayag ng pangangailangan (Walang ID na mahigpit na kailangan para sa emergency food box)']
          : ['Self-attestation of food need (No ID strictly required for emergency box)'];
    } else if (res.category === 'housing') {
      docs =
        lang === 'es'
          ? ['Aviso de desalojo o pago atrasado', 'Copia del contrato de arrendamiento actual', 'Comprobante de pérdida de ingresos']
          : lang === 'tl'
          ? ['Abiso ng pagpapaalis o atrasadong upa', 'Kopya ng kontrata sa upa', 'Katibayan ng pagkawala ng kita']
          : ['Eviction notice or late payment letter', 'Copy of current lease agreement', 'Proof of loss of income'];
    }

    return {
      id: `plan-item-${index + 1}`,
      step_number: index + 1,
      title:
        lang === 'es'
          ? `Comunicarse con ${res.name}`
          : lang === 'tl'
          ? `Makipag-ugnayan sa ${res.name}`
          : `Contact ${res.name}`,
      description: res.description,
      resource_name: res.name,
      resource_id: res.id,
      resource_phone: res.phone,
      resource_address: `${res.address}, ${res.city}, NV ${res.zip}`,
      website: res.website,
      documents_needed: docs,
      status: 'PENDING' as const,
      completed: false,
    };
  });

  return {
    id: `plan-${Date.now()}`,
    created_at: new Date().toISOString(),
    summary:
      lang === 'es'
        ? `Plan personalizado para ${needs.length} necesidad(es) detectadas.`
        : lang === 'tl'
        ? `Personaladong plano para sa ${needs.length} natukoy na pangangailangan.`
        : `Personalized action plan for ${needs.length} identified need(s).`,
    items: planItems,
  };
}

export async function sendChatMessage(
  message: string,
  preferredLang: SupportedLanguage
): Promise<{
  reply: string;
  resources: Resource[];
  actionPlan?: ActionPlan;
  urgency: UrgencyLevel;
  emergencyAlert: boolean;
  detectedLanguage: SupportedLanguage;
}> {
  // First detect language from the user's actual text
  const intake = parseLocalIntake(message, preferredLang);
  const activeLang = intake.language;

  // First attempt to call the Next.js API backend if accessible
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        language: activeLang,
        preferredLanguage: activeLang,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const localizedResources = (data.resources || []).map((r: Resource) =>
        getLocalizedResource(r, data.detectedLanguage || activeLang)
      );
      return {
        reply: data.reply || data.responseMessage || data.explanation,
        resources: localizedResources,
        actionPlan: data.actionPlan,
        urgency: data.urgency || 'medium',
        emergencyAlert: Boolean(data.emergencyAlert || data.isEmergency),
        detectedLanguage: data.detectedLanguage || activeLang,
      };
    }
  } catch (e) {
    // Graceful fallback to local engine
  }

  // Resilient local engine fallback
  if (intake.emergency) {
    return {
      reply:
        activeLang === 'es'
          ? 'ALERTA DE SEGURIDAD INMEDIATA: Si usted o alguien cercano está en peligro físico inmediato, por favor llame al 911 o 988 de inmediato.'
          : activeLang === 'tl'
          ? 'BABALA SA KALIGTASAN: Kung ikaw o ang kasama mo ay nasa agarang panganib, tumawag agad sa 911 o 988.'
          : 'IMMEDIATE SAFETY ALERT: If you or someone around you is in danger, please dial 911 or 988 immediately.',
      resources: [],
      urgency: 'emergency',
      emergencyAlert: true,
      detectedLanguage: activeLang,
    };
  }

  const matchingResources = VERIFIED_RESOURCES.filter((r) => intake.needs.includes(r.category)).map((r) =>
    getLocalizedResource(r, activeLang)
  );
  const plan = generateLocalActionPlan(intake.needs, activeLang);
  const isGeneral = intake.needs.length === 0 || (intake.needs.length === 1 && intake.needs[0] === 'other');
  const topResource = matchingResources[0];

  let reply = '';
  if (activeLang === 'es') {
    if (isGeneral) {
      reply =
        `¡Hola! Soy Nevada Nexus, su navegador comunitario de asistencia en North Las Vegas.\n\n` +
        `¿En qué le puedo asistir hoy? Puedo ayudarle a encontrar alimentos gratuitos, ayuda para pagar la factura de luz o gas, subsidios de alquiler, o clínicas médicas de bajo costo.\n\n` +
        `Puede escribirme o hablarme en español para comenzar.`;
    } else {
      const needsFormatted = formatHumanNeeds(intake.needs, 'es');
      reply =
        `He identificado sus necesidades de **${needsFormatted}** en North Las Vegas.\n\n` +
        `Encontré ${matchingResources.length} recursos comunitarios verificados para asistirle. ` +
        (topResource ? `Por ejemplo, **${topResource.name}** ofrece programas de asistencia directa. ` : '') +
        `\n\nHe preparado su plan de acción personalizado a continuación con los pasos y documentos requeridos.`;
    }
  } else if (activeLang === 'tl') {
    if (isGeneral) {
      reply =
        `Kumusta! Ako si Nevada Nexus, ang inyong gabay sa tulong ng komunidad sa North Las Vegas.\n\n` +
        `Paano kita matutulungan ngayon? Maaari kitang tulungan sa libreng pagkain, tulong sa bayad sa kuryente o tubig, suporta sa upa ng bahay, o libreng klinika.\n\n` +
        `Maaari kang mag-type o magsalita sa Tagalog.`;
    } else {
      const needsFormatted = formatHumanNeeds(intake.needs, 'tl');
      reply =
        `Natukoy ko ang iyong pangangailangan para sa **${needsFormatted}** sa North Las Vegas.\n\n` +
        `Nakahanap ako ng ${matchingResources.length} napatunayang programa na makakatulong sa inyo. ` +
        (topResource ? `Halimbawa, ang **${topResource.name}** ay may direktang tulong para sa mga pamilya. ` : '') +
        `\n\nNilikha ko ang iyong plano ng aksyon sa ibaba kasama ang mga kailangang dokumento at hakbang.`;
    }
  } else {
    if (isGeneral) {
      reply =
        `Hello! I am Nevada Nexus, your North Las Vegas community assistance navigator.\n\n` +
        `How can I help you today? I can help you find free food and groceries, utility bill relief, housing and rent support, or low-cost medical care.\n\n` +
        `Feel free to tell me what you are looking for in your own words.`;
    } else {
      const needsFormatted = formatHumanNeeds(intake.needs, 'en');
      reply =
        `I identified your needs for **${needsFormatted}** in the North Las Vegas area.\n\n` +
        `I found ${matchingResources.length} verified community programs available to help. ` +
        (topResource ? `For example, **${topResource.name}** provides direct assistance for local residents. ` : '') +
        `\n\nI have generated your personalized action plan below with next steps and required documents.`;
    }
  }

  return {
    reply,
    resources: matchingResources,
    actionPlan: plan,
    urgency: intake.urgency,
    emergencyAlert: false,
    detectedLanguage: activeLang,
  };
}

export function analyzeLocalDocument(fileName: string): DocumentAnalysis {
  return {
    document_type: 'utility_bill',
    provider: 'NV Energy',
    amount_due: '$184.27',
    due_date: 'October 3, 2026',
    account_number_present: true,
    extracted_fields: {
      'Utility Provider': 'NV Energy',
      'Account Status': 'Past Due / Disconnect Notice Pending',
      'Total Past Due': '$184.27',
      'Service Address': 'North Las Vegas, NV 89030',
      'Notice Date': 'September 24, 2026',
    },
    matching_programs: [
      'NV Energy Project REACH Disconnection Prevention Grant',
      'State of Nevada LIHEAP Fast-Track Crisis Benefit',
    ],
    missing_requirements: [
      'Proof of gross household income for prior 30 days',
      'Government-issued Photo ID (Nevada Driver License or ID Card)',
    ],
    confidence_score: 0.94,
  };
}
