import {
  CaseStatus,
  IntakeResult,
  Resource,
  ActionPlan,
  ActionPlanItem,
  SupportedLanguage,
  ResourceCategory,
} from '@/lib/types';
import { runIntakeAgent } from '@/agents/intake';
import { searchResources, ScoredResource } from '@/tools/resources';
import { EMERGENCY_SERVICES } from '@/lib/emergency';
import { getLocalizedResource } from '@/lib/data/verifiedResources';

export interface OrchestrationStepUpdate {
  stage: string;
  message: string;
  caseStatus: CaseStatus;
}

export interface OrchestratorResult {
  responseMessage: string;
  caseStatus: CaseStatus;
  intakeResult: IntakeResult;
  resources: ScoredResource[];
  actionPlan: ActionPlan;
  isEmergency: boolean;
  followUpQuestion?: string;
}

export async function runOrchestrator(
  userMessage: string,
  preferredLanguage: SupportedLanguage = 'en',
  onStepProgress?: (step: OrchestrationStepUpdate) => void
): Promise<OrchestratorResult> {
  // Step 1: Intake Understanding
  if (onStepProgress) {
    onStepProgress({
      stage: 'UNDERSTANDING',
      message:
        preferredLanguage === 'es'
          ? 'Entendiendo su solicitud...'
          : preferredLanguage === 'tl'
          ? 'Inuunawa ang iyong kahilingan...'
          : 'Understanding your request...',
      caseStatus: 'UNDERSTANDING',
    });
  }

  const intake = await runIntakeAgent(userMessage, preferredLanguage);

  // Check emergency condition
  if (intake.urgency === 'emergency') {
    const emergencyInfo = EMERGENCY_SERVICES[0];
    const crisisInfo = EMERGENCY_SERVICES[1];

    let emergencyResponse = `IMMEDIATE CRISIS DETECTED: If you or someone else is in immediate danger, please dial ${emergencyInfo.number} immediately. For 24/7 mental health and emotional distress support, call or text ${crisisInfo.number}.`;
    if (intake.language === 'es') {
      emergencyResponse = `ALERTA DE SEGURIDAD INMEDIATA: Si usted o alguien más está en peligro inmediato, llame al ${emergencyInfo.number} ahora. Para apoyo emocional o crisis de salud mental 24/7, llame o envíe un mensaje de texto al ${crisisInfo.number}.`;
    } else if (intake.language === 'tl') {
      emergencyResponse = `AGARANG TULONG: Kung ikaw o ang iba ay nasa agarang panganib, mangyaring tumawag agad sa ${emergencyInfo.number}. Para sa 24/7 na suporta sa krisis, tumawag o mag-text sa ${crisisInfo.number}.`;
    }

    const mockPlan: ActionPlan = {
      id: `plan-${Date.now()}`,
      case_id: `case-${Date.now()}`,
      title: 'Emergency Life Safety Pathway',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      items: [
        {
          id: `item-1`,
          action_plan_id: `plan-${Date.now()}`,
          priority: 1,
          status: 'pending',
          title: 'Contact Immediate Emergency Services',
          category: 'healthcare',
          instructions: `Call ${emergencyInfo.number} for immediate life safety or ${crisisInfo.number} for confidential crisis counseling.`,
          documents_needed: [],
        },
      ],
    };

    return {
      responseMessage: emergencyResponse,
      caseStatus: 'COMPLETED',
      intakeResult: intake,
      resources: [],
      actionPlan: mockPlan,
      isEmergency: true,
    };
  }

  // Step 2: Resource Retrieval
  if (onStepProgress) {
    onStepProgress({
      stage: 'SEARCHING',
      message:
        preferredLanguage === 'es'
          ? 'Buscando recursos comunitarios verificados...'
          : preferredLanguage === 'tl'
          ? 'Naghahanap ng mga napatunayang sanggunian...'
          : 'Finding relevant resources...',
      caseStatus: 'SEARCHING',
    });
  }

  // Retrieve matching resources for primary needs
  const retrievedResources: ScoredResource[] = [];
  for (const need of intake.needs) {
    const results = await searchResources({
      category: need,
      language: intake.language,
      userContext: {
        hasChildren: intake.household_has_children,
        city: intake.location?.city,
        zip: intake.location?.zip,
      },
      maxResults: 3,
    });
    retrievedResources.push(...results);
  }

  // Deduplicate resources
  const uniqueResourcesMap = new Map<string, ScoredResource>();
  for (const r of retrievedResources) {
    if (!uniqueResourcesMap.has(r.id)) {
      uniqueResourcesMap.set(r.id, r);
    }
  }
  const targetLang = intake.language;
  const uniqueResources = Array.from(uniqueResourcesMap.values()).map((r) => {
    const loc = getLocalizedResource(r, targetLang);
    return {
      ...r,
      description: loc.description,
      whyThisResource: loc.whyThisResource || r.whyThisResource,
    };
  });

  // Step 3: Checking available information & Eligibility
  if (onStepProgress) {
    onStepProgress({
      stage: 'ELIGIBILITY_REVIEW',
      message:
        targetLang === 'es'
          ? 'Revisando información disponible y requisitos...'
          : targetLang === 'tl'
          ? 'Sinusuri ang mga kinakailangang dokumento...'
          : 'Checking available information...',
      caseStatus: 'ELIGIBILITY_REVIEW',
    });
  }

  // Step 4: Building Action Plan (PRD Section 28)
  if (onStepProgress) {
    onStepProgress({
      stage: 'PLAN_CREATED',
      message:
        targetLang === 'es'
          ? 'Creando su plan de acción personalizado...'
          : targetLang === 'tl'
          ? 'Bumubuo ng iyong personal na plano...'
          : 'Building your plan...',
      caseStatus: 'PLAN_CREATED',
    });
  }

  const planItems: ActionPlanItem[] = [];
  let priorityCounter = 1;

  for (const res of uniqueResources.slice(0, 3)) {
    let docsNeeded = [
      targetLang === 'es'
        ? 'Identificación con fotografía'
        : targetLang === 'tl'
        ? 'ID na may litrato'
        : 'Photo Identification',
    ];
    let instructions =
      targetLang === 'es'
        ? `Comuníquese con ${res.name} al ${res.phone || 'su oficina'} para iniciar la solicitud.`
        : targetLang === 'tl'
        ? `Makipag-ugnayan sa ${res.name} sa ${res.phone || 'kanilang opisina'} upang simulan ang aplikasyon.`
        : `Contact ${res.name} at ${res.phone || 'their office'} to begin application.`;

    if (res.category === 'utility_assistance') {
      docsNeeded =
        targetLang === 'es'
          ? [
              'Factura de electricidad actual con aviso de desconexión o saldo vencido',
              'Comprobante de ingresos del hogar de los últimos 30 días',
              'Identificación oficial con fotografía emitida por el gobierno',
            ]
          : targetLang === 'tl'
          ? [
              'Kasalukuyang utility bill na may notice ng pagkaputol o balanse',
              'Katibayan ng kita ng pamilya sa nakaraang 30 araw',
              'Valid na ID na may litrato mula sa gobyerno',
            ]
          : [
              'Current utility bill showing shutoff notice or balance',
              'Proof of household income for last 30 days',
              'Government photo ID',
            ];
      instructions =
        targetLang === 'es'
          ? `Reúna su factura de luz o gas más reciente. Puede fotografiarla en Nevada Nexus para verificar los requisitos y luego solicitar asistencia en ${res.name}.`
          : targetLang === 'tl'
          ? `Ihanda ang iyong pinakabagong bill sa kuryente o gas. Maaari mo itong kuhanan ng litrato sa Nevada Nexus upang masuri ang mga kinakailangan bago mag-apply sa ${res.name}.`
          : `Gather your latest power or gas bill. You can photograph it in Nevada Nexus to verify required fields, then apply for emergency credit at ${res.name}.`;
    } else if (res.category === 'food_assistance') {
      docsNeeded = [
        targetLang === 'es'
          ? 'Comprobante de residencia en North Las Vegas / Condado de Clark'
          : targetLang === 'tl'
          ? 'Katibayan ng paninirahan sa North Las Vegas / Clark County'
          : 'Proof of residency in North Las Vegas / Clark County',
      ];
      instructions =
        targetLang === 'es'
          ? `Visite ${res.name} en ${res.address || 'las instalaciones'} durante las horas de distribución para recibir paquetes de alimentos.`
          : targetLang === 'tl'
          ? `Pumunta sa ${res.name} sa ${res.address || 'kanilang opisina'} sa oras ng pamamahagi upang kumuha ng libreng pagkain.`
          : `Visit ${res.name} at ${res.address || 'campus'} during distribution hours (${res.hours || 'regular hours'}) to receive food packages.`;
    }

    planItems.push({
      id: `plan-item-${priorityCounter}`,
      action_plan_id: `plan-${Date.now()}`,
      resource_id: res.id,
      priority: priorityCounter++,
      status: 'pending',
      title: `${res.name}`,
      category: res.category,
      instructions,
      documents_needed: docsNeeded,
      resource: res,
    });
  }

  const actionPlan: ActionPlan = {
    id: `plan-${Date.now()}`,
    case_id: `case-${Date.now()}`,
    title: 'My Nevada Nexus Bridge Plan',
    items: planItems,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  // Helper to format human-readable translated needs list
  const formatNeedsList = (needs: ResourceCategory[], targetLang: SupportedLanguage): string => {
    const needTranslations: Record<SupportedLanguage, Record<ResourceCategory, string>> = {
      es: {
        utility_assistance: 'asistencia con facturas de luz y gas',
        food_assistance: 'alimentos y despensas de comida',
        housing: 'apoyo para el alquiler y vivienda',
        healthcare: 'atención médica y clínicas de bajo costo',
        jobs: 'capacitación laboral y búsqueda de empleo',
        transportation: 'transporte público y pases de autobús',
        childcare: 'cuidado infantil y programas Head Start',
        other: 'asistencia comunitaria',
      },
      tl: {
        utility_assistance: 'tulong sa bayarin sa kuryente at utility',
        food_assistance: 'tulong sa pagkain at pamilihan',
        housing: 'suporta sa upa at pabahay',
        healthcare: 'serbisyong medikal at klinika',
        jobs: 'trabaho at pagsasanay',
        transportation: 'transportasyon at bus pass',
        childcare: 'pag-aalaga ng bata at edukasyon',
        other: 'tulong ng komunidad',
      },
      en: {
        utility_assistance: 'utility and energy bill assistance',
        food_assistance: 'food and grocery support',
        housing: 'housing and rental assistance',
        healthcare: 'medical and health clinic support',
        jobs: 'job training and employment services',
        transportation: 'transportation and reduced-fare transit',
        childcare: 'early childhood education and childcare',
        other: 'community resources',
      },
    };

    const specificNeeds = needs.filter((n) => n !== 'other');
    if (specificNeeds.length === 0) return needTranslations[targetLang].other;
    const translated = specificNeeds.map((n) => needTranslations[targetLang][n] || n);
    if (targetLang === 'es') return translated.join(' y ');
    if (targetLang === 'tl') return translated.join(' at ');
    return translated.join(' and ');
  };

  // Synthesize user-facing response in the exact language detected from the user
  let responseMessage = '';
  const topResource = uniqueResources[0];
  const langToUse = intake.language || preferredLanguage;
  const isGeneralQuery = intake.needs.length === 0 || (intake.needs.length === 1 && intake.needs[0] === 'other');

  if (langToUse === 'es') {
    if (isGeneralQuery) {
      responseMessage =
        `¡Hola! Soy Nevada Nexus, su navegador de asistencia comunitaria en North Las Vegas.\n\n` +
        `¿En qué le puedo ayudar hoy? Puedo asistirle a encontrar alimentos gratuitos, ayuda para pagar la luz o gas, subsidios de alquiler, o clínicas de salud.\n\n` +
        `Puede escribirme o presionar el botón del micrófono para contarme su situación con sus propias palabras.`;
    } else {
      const needsText = formatNeedsList(intake.needs, 'es');
      responseMessage =
        `He identificado sus necesidades de **${needsText}** en North Las Vegas.\n\n` +
        `Encontré ${uniqueResources.length} recursos comunitarios verificados para asistirle. ` +
        (topResource ? `Por ejemplo, **${topResource.name}** ofrece programas de asistencia directa. ` : '') +
        `\n\nHe preparado su plan de acción personalizado a continuación con los pasos y documentos requeridos.`;
    }
  } else if (langToUse === 'tl') {
    if (isGeneralQuery) {
      responseMessage =
        `Kumusta! Ako si Nevada Nexus, ang inyong gabay sa tulong ng komunidad sa North Las Vegas.\n\n` +
        `Paano kita matutulungan ngayon? Maaari kitang tulungan sa pagkain, tulong sa bayad sa kuryente o tubig, pabahay at upa, o serbisyong medikal.\n\n` +
        `Maaari kang mag-type o pindutin ang mic button para sabihin ang iyong kailangan.`;
    } else {
      const needsText = formatNeedsList(intake.needs, 'tl');
      responseMessage =
        `Natukoy ko ang iyong pangangailangan para sa **${needsText}** sa North Las Vegas.\n\n` +
        `Nakahanap ako ng ${uniqueResources.length} napatunayang programa na makakatulong sa inyo. ` +
        (topResource ? `Halimbawa, ang **${topResource.name}** ay may direktang tulong para sa mga pamilya. ` : '') +
        `\n\nNilikha ko ang iyong plano ng aksyon sa ibaba kasama ang mga kailangang dokumento at hakbang.`;
    }
  } else {
    if (isGeneralQuery) {
      responseMessage =
        `Hello! I am Nevada Nexus, your North Las Vegas community assistance navigator.\n\n` +
        `How can I help you today? I can help you find free food and groceries, utility bill relief, housing and rent support, or low-cost medical care.\n\n` +
        `Feel free to describe what you need, or tap the microphone to tell me in your own words.`;
    } else {
      const needsText = formatNeedsList(intake.needs, 'en');
      responseMessage =
        `I identified your needs for **${needsText}** in the North Las Vegas area.\n\n` +
        `I found ${uniqueResources.length} verified community programs available to help. ` +
        (topResource ? `For example, **${topResource.name}** provides direct assistance for local residents. ` : '') +
        `\n\nI have generated your personalized action plan below with next steps and required documents.`;
    }
  }

  const followUpQuestion = intake.follow_up_questions[0] || undefined;

  return {
    responseMessage,
    caseStatus: 'PLAN_CREATED',
    intakeResult: intake,
    resources: uniqueResources,
    actionPlan,
    isEmergency: false,
    followUpQuestion,
  };
}
