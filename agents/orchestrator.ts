import {
  CaseStatus,
  IntakeResult,
  Resource,
  ActionPlan,
  ActionPlanItem,
  SupportedLanguage,
} from '@/lib/types';
import { runIntakeAgent } from '@/agents/intake';
import { searchResources, ScoredResource } from '@/tools/resources';
import { EMERGENCY_SERVICES } from '@/lib/emergency';

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
  const uniqueResources = Array.from(uniqueResourcesMap.values());

  // Step 3: Checking available information & Eligibility
  if (onStepProgress) {
    onStepProgress({
      stage: 'ELIGIBILITY_REVIEW',
      message:
        preferredLanguage === 'es'
          ? 'Revisando información disponible y requisitos...'
          : preferredLanguage === 'tl'
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
        preferredLanguage === 'es'
          ? 'Creando su plan de acción personalizado...'
          : preferredLanguage === 'tl'
          ? 'Bumubuo ng iyong personal na plano...'
          : 'Building your plan...',
      caseStatus: 'PLAN_CREATED',
    });
  }

  const planItems: ActionPlanItem[] = [];
  let priorityCounter = 1;

  for (const res of uniqueResources.slice(0, 3)) {
    let docsNeeded = ['Photo Identification'];
    let instructions = `Contact ${res.name} at ${res.phone || 'their office'} to begin application.`;

    if (res.category === 'utility_assistance') {
      docsNeeded = [
        'Current utility bill showing shutoff notice or balance',
        'Proof of household income for last 30 days',
        'Government photo ID',
      ];
      instructions = `Gather your latest power or gas bill. You can photograph it in Nevada Nexus to verify required fields, then apply for emergency credit at ${res.name}.`;
    } else if (res.category === 'food_assistance') {
      docsNeeded = ['Proof of residency in North Las Vegas / Clark County'];
      instructions = `Visit ${res.name} at ${res.address || 'campus'} during distribution hours (${res.hours || 'regular hours'}) to receive food packages.`;
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

  // Synthesize user-facing response in requested language
  let responseMessage = '';
  const topResource = uniqueResources[0];

  if (intake.language === 'es') {
    responseMessage = `He identificado sus necesidades de ${intake.needs
      .map((n) => (n === 'utility_assistance' ? 'ayuda con servicios públicos (luz/gas)' : n === 'food_assistance' ? 'asistencia de alimentos' : n))
      .join(' y ')} en el área de North Las Vegas.\n\n` +
      `He encontrado ${uniqueResources.length} programas verificados disponibles. ` +
      (topResource ? `Por ejemplo, **${topResource.name}** puede ayudarle con asistencia de emergencia. ` : '') +
      `He preparado su plan de acción personalizado a continuación con los pasos siguientes y documentos requeridos.`;
  } else if (intake.language === 'tl') {
    responseMessage = `Natukoy ko ang iyong pangangailangan sa ${intake.needs.join(' at ')} sa North Las Vegas.\n\n` +
      `Mayroong ${uniqueResources.length} napatunayang programa na maaaring makatulong. ` +
      (topResource ? `Halimbawa, ang **${topResource.name}** ay may mga programa para sa mga pamilya. ` : '') +
      `Nilikha ko ang iyong personal na plano sa ibaba kasama ang mga susunod na hakbang.`;
  } else {
    responseMessage = `I identified your needs for ${intake.needs
      .map((n) => n.replace('_', ' '))
      .join(' and ')} in the North Las Vegas area.\n\n` +
      `I found ${uniqueResources.length} verified community programs. ` +
      (topResource ? `For example, **${topResource.name}** provides direct assistance for local families. ` : '') +
      `I've built your personalized action plan below with next steps and document requirements.`;
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
