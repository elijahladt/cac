// Nevada Nexus Direct Electronic Intake & Closed-Loop Referral Tracking Store
// Single unified electronic intake pipeline that dispatches structured packets to provider queues with transparent tracking.

import { ResourceCategory, SupportedLanguage, UrgencyLevel } from '@/lib/types';
import { VERIFIED_RESOURCES } from '@/lib/data/verifiedResources';

export type ReferralStatus =
  | 'SUBMITTED'
  | 'IN_REVIEW'
  | 'ACTION_REQUIRED'
  | 'ACCEPTED'
  | 'WAITLISTED'
  | 'DENIED';

export interface ReferralMilestone {
  id: string;
  status: ReferralStatus;
  timestamp: string;
  title: string;
  description: string;
  actor: 'system' | 'provider' | 'caseworker' | 'resident';
  actionRequired?: string | null;
}

export interface ProviderReferralQueueItem {
  id: string;
  intakeId: string;
  confirmationCode: string;
  providerId: string;
  providerName: string;
  programName: string;
  category: ResourceCategory;
  status: ReferralStatus;
  urgency: UrgencyLevel;
  submittedAt: string;
  updatedAt: string;
  estimatedResolutionDays: number;
  caseworkerName?: string;
  caseworkerNote?: string;
  providerContactPhone: string;
  providerContactEmail?: string;
  timeline: ReferralMilestone[];
  benefitAmountPledged?: string;
  waitlistPosition?: number;
}

export interface ElectronicIntakeSubmission {
  id: string;
  confirmationCode: string;
  createdAt: string;
  updatedAt: string;
  language: SupportedLanguage;
  applicant: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    zipCode: string;
  };
  household: {
    size: number;
    monthlyIncome: number;
    housingStatus: 'stable' | 'couch_surfing' | 'at_risk' | 'unhoused';
    hasChildren: boolean;
    hasSeniors: boolean;
    hasDisability: boolean;
  };
  serviceDetails: {
    primaryNeeds: ResourceCategory[];
    utilityProvider?: string;
    utilityAccountNumber?: string;
    pastDueAmount?: string;
    disconnectNoticeDate?: string;
    urgentStatement?: string;
  };
  attachedDocuments: {
    id: string;
    type: string;
    fileName: string;
    verified: boolean;
  }[];
  referrals: ProviderReferralQueueItem[];
}

// In-memory persistent queue store for direct intakes (seeded with realistic demo tracking files)
const GLOBAL_INTAKE_STORE: Map<string, ElectronicIntakeSubmission> = new Map();

// Initialize initial demo tracking files for Nevada residents to explore immediately
function seedInitialIntakes() {
  if (GLOBAL_INTAKE_STORE.size > 0) return;

  const demo1: ElectronicIntakeSubmission = {
    id: 'intake-demo-1',
    confirmationCode: 'NVN-2026-89421',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    language: 'en',
    applicant: {
      fullName: 'Maria Santos',
      phone: '(702) 555-0192',
      email: 'm.santos702@example.com',
      address: '2415 E Craig Rd #104',
      city: 'North Las Vegas',
      zipCode: '89030',
    },
    household: {
      size: 3,
      monthlyIncome: 2150,
      housingStatus: 'at_risk',
      hasChildren: true,
      hasSeniors: false,
      hasDisability: false,
    },
    serviceDetails: {
      primaryNeeds: ['utility_assistance', 'food_assistance'],
      utilityProvider: 'NV Energy',
      utilityAccountNumber: '9082-114-88',
      pastDueAmount: '$218.50',
      disconnectNoticeDate: '2026-10-04',
      urgentStatement: 'Received a 10-day electric shutoff notice and need food support for 2 kids.',
    },
    attachedDocuments: [
      { id: 'doc-1', type: 'utility_bill', fileName: 'nv_energy_pastdue_sept.pdf', verified: true },
      { id: 'doc-2', type: 'pay_stub', fileName: 'paystub_august.pdf', verified: true },
    ],
    referrals: [
      {
        id: 'ref-demo-1a',
        intakeId: 'intake-demo-1',
        confirmationCode: 'NVN-2026-89421',
        providerId: 'res-state-dwss-liheap',
        providerName: 'Nevada DWSS — Energy Assistance Program (LIHEAP)',
        programName: 'LIHEAP Crisis Fast-Track Utility Grant',
        category: 'utility_assistance',
        status: 'ACCEPTED',
        urgency: 'high',
        submittedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        estimatedResolutionDays: 2,
        caseworkerName: 'Sarah Jenkins (DWSS Belrose Office)',
        caseworkerNote: 'Emergency electric pledge of $218.50 authorized directly to NV Energy account. Shutoff hold confirmed.',
        benefitAmountPledged: '$218.50 paid directly to NV Energy',
        providerContactPhone: '(702) 486-1404',
        providerContactEmail: 'energyassistance@dwss.nv.gov',
        timeline: [
          {
            id: 'm-1',
            status: 'SUBMITTED',
            timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
            title: 'Electronic Intake Dispatched',
            description: 'Single intake packet transmitted directly to Nevada DWSS LIHEAP electronic queue.',
            actor: 'system',
          },
          {
            id: 'm-2',
            status: 'IN_REVIEW',
            timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
            title: 'Caseworker Assigned & Verified',
            description: 'Caseworker Sarah J. confirmed 150% FPL eligibility and verified past-due bill balance.',
            actor: 'caseworker',
          },
          {
            id: 'm-3',
            status: 'ACCEPTED',
            timestamp: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
            title: 'Utility Benefit Pledged ($218.50)',
            description: 'Payment pledge sent to NV Energy. Your account is on an active 30-day disconnection freeze.',
            actor: 'provider',
          },
        ],
      },
      {
        id: 'ref-demo-1b',
        intakeId: 'intake-demo-1',
        confirmationCode: 'NVN-2026-89421',
        providerId: 'res-three-square',
        providerName: 'Three Square Food Bank',
        programName: 'SNAP Enrollment & Family Market Access',
        category: 'food_assistance',
        status: 'IN_REVIEW',
        urgency: 'medium',
        submittedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        estimatedResolutionDays: 3,
        caseworkerName: 'Carlos M. (Three Square Outreach)',
        caseworkerNote: 'Family box reservation scheduled. SNAP pre-screening approved.',
        providerContactPhone: '(702) 644-3663',
        timeline: [
          {
            id: 'm-4',
            status: 'SUBMITTED',
            timestamp: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
            title: 'Referral Queued',
            description: 'Intake transmitted to Three Square North Las Vegas campus queue.',
            actor: 'system',
          },
          {
            id: 'm-5',
            status: 'IN_REVIEW',
            timestamp: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
            title: 'Intake Under Triage',
            description: 'Outreach advocate is scheduling your drive-through pantry pick-up window.',
            actor: 'caseworker',
          },
        ],
      },
    ],
  };

  const demo2: ElectronicIntakeSubmission = {
    id: 'intake-demo-2',
    confirmationCode: 'NVN-2026-44109',
    createdAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    language: 'es',
    applicant: {
      fullName: 'Jose Rodriguez',
      phone: '(702) 555-0811',
      email: 'j.rodriguez77@example.com',
      address: '3900 Civic Center Dr',
      city: 'North Las Vegas',
      zipCode: '89030',
    },
    household: {
      size: 4,
      monthlyIncome: 3100,
      housingStatus: 'at_risk',
      hasChildren: true,
      hasSeniors: false,
      hasDisability: false,
    },
    serviceDetails: {
      primaryNeeds: ['housing', 'utility_assistance'],
      urgentStatement: 'Aviso de atraso en el alquiler de 30 días.',
    },
    attachedDocuments: [
      { id: 'doc-3', type: 'lease_agreement', fileName: 'contrato_arrendamiento.pdf', verified: true },
    ],
    referrals: [
      {
        id: 'ref-demo-2a',
        intakeId: 'intake-demo-2',
        confirmationCode: 'NVN-2026-44109',
        providerId: 'res-help-southern-nevada',
        providerName: 'HELP of Southern Nevada',
        programName: 'CHAP Rental Assistance & Housing Eviction Prevention',
        category: 'housing',
        status: 'ACTION_REQUIRED',
        urgency: 'high',
        submittedAt: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        estimatedResolutionDays: 5,
        caseworkerName: 'Elena Rostova (HELP Housing Triage)',
        caseworkerNote: 'Por favor cargue una foto clara del aviso de desalojo de 7 o 30 días emitido por su arrendador.',
        providerContactPhone: '(702) 369-4357',
        timeline: [
          {
            id: 'm-6',
            status: 'SUBMITTED',
            timestamp: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
            title: 'Solicitud Electrónica Recibida',
            description: 'Expediente digital ingresado a la cola de prevención de desalojo.',
            actor: 'system',
          },
          {
            id: 'm-7',
            status: 'ACTION_REQUIRED',
            timestamp: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
            title: 'Documento Requerido: Aviso de Desalojo',
            description: 'El trabajador social necesita una copia de la notificación formal de su arrendador.',
            actor: 'caseworker',
            actionRequired: 'Subir foto del aviso de desalojo',
          },
        ],
      },
    ],
  };

  GLOBAL_INTAKE_STORE.set(demo1.confirmationCode, demo1);
  GLOBAL_INTAKE_STORE.set(demo2.confirmationCode, demo2);
}

// Generate unique confirmation code in format NVN-2026-XXXXX
export function generateConfirmationCode(): string {
  const random5 = Math.floor(10000 + Math.random() * 90000);
  return `NVN-2026-${random5}`;
}

export function submitDirectElectronicIntake(payload: {
  applicant: {
    fullName: string;
    phone: string;
    email: string;
    address: string;
    city: string;
    zipCode: string;
  };
  household: {
    size: number;
    monthlyIncome: number;
    housingStatus: 'stable' | 'couch_surfing' | 'at_risk' | 'unhoused';
    hasChildren: boolean;
    hasSeniors: boolean;
    hasDisability: boolean;
  };
  serviceDetails: {
    primaryNeeds: ResourceCategory[];
    utilityProvider?: string;
    utilityAccountNumber?: string;
    pastDueAmount?: string;
    disconnectNoticeDate?: string;
    urgentStatement?: string;
  };
  targetProviderIds: string[];
  attachedDocuments?: { id: string; type: string; fileName: string; verified: boolean }[];
  language?: SupportedLanguage;
}): ElectronicIntakeSubmission {
  seedInitialIntakes();

  const id = `intake-${Date.now()}`;
  const confirmationCode = generateConfirmationCode();
  const now = new Date().toISOString();
  const lang = payload.language || 'en';

  // Build referral entries for each targeted provider
  const referrals: ProviderReferralQueueItem[] = payload.targetProviderIds.map((provId, index) => {
    const resource = VERIFIED_RESOURCES.find((r) => r.id === provId) || {
      id: provId,
      name: 'Nevada Community Provider',
      phone: '(702) 486-1404',
      category: payload.serviceDetails.primaryNeeds[0] || 'utility_assistance',
    };

    const isEmergency = Boolean(
      payload.serviceDetails.disconnectNoticeDate ||
      payload.household.housingStatus === 'unhoused' ||
      payload.household.housingStatus === 'at_risk'
    );

    const initialMilestone: ReferralMilestone = {
      id: `m-${Date.now()}-${index}`,
      status: 'SUBMITTED',
      timestamp: now,
      title:
        lang === 'es'
          ? 'Expediente Electrónico Transmitido'
          : lang === 'tl'
          ? 'Naipasa ang Elektronikong Intake'
          : 'Electronic Intake Packet Transmitted',
      description:
        lang === 'es'
          ? `Su solicitud única fue enviada directamente a la cola de ${resource.name}.`
          : lang === 'tl'
          ? `Ang iyong intake ay ligtas na naipadala sa queue ng ${resource.name}.`
          : `Your single electronic intake packet was securely queued for ${resource.name}.`,
      actor: 'system',
    };

    return {
      id: `ref-${Date.now()}-${index}`,
      intakeId: id,
      confirmationCode,
      providerId: resource.id,
      providerName: resource.name,
      programName: `${resource.name} Direct Assistance`,
      category: (resource.category as ResourceCategory) || 'utility_assistance',
      status: 'SUBMITTED',
      urgency: isEmergency ? 'high' : 'medium',
      submittedAt: now,
      updatedAt: now,
      estimatedResolutionDays: isEmergency ? 2 : 5,
      providerContactPhone: resource.phone || '(702) 486-1404',
      timeline: [initialMilestone],
    };
  });

  const submission: ElectronicIntakeSubmission = {
    id,
    confirmationCode,
    createdAt: now,
    updatedAt: now,
    language: lang,
    applicant: payload.applicant,
    household: payload.household,
    serviceDetails: payload.serviceDetails,
    attachedDocuments: payload.attachedDocuments || [],
    referrals,
  };

  GLOBAL_INTAKE_STORE.set(confirmationCode, submission);
  return submission;
}

export function getIntakeByConfirmationCode(code: string): ElectronicIntakeSubmission | null {
  seedInitialIntakes();
  const cleanCode = code.trim().toUpperCase();
  return GLOBAL_INTAKE_STORE.get(cleanCode) || null;
}

export function getAllIntakeSubmissions(): ElectronicIntakeSubmission[] {
  seedInitialIntakes();
  return Array.from(GLOBAL_INTAKE_STORE.values()).sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function updateReferralStatus(
  confirmationCode: string,
  referralId: string,
  update: {
    status: ReferralStatus;
    caseworkerName?: string;
    caseworkerNote?: string;
    benefitAmountPledged?: string;
    actionRequired?: string;
  }
): ElectronicIntakeSubmission | null {
  seedInitialIntakes();
  const submission = GLOBAL_INTAKE_STORE.get(confirmationCode.toUpperCase());
  if (!submission) return null;

  const ref = submission.referrals.find((r) => r.id === referralId);
  if (!ref) return null;

  const now = new Date().toISOString();
  ref.status = update.status;
  ref.updatedAt = now;
  if (update.caseworkerName) ref.caseworkerName = update.caseworkerName;
  if (update.caseworkerNote) ref.caseworkerNote = update.caseworkerNote;
  if (update.benefitAmountPledged) ref.benefitAmountPledged = update.benefitAmountPledged;

  // Add milestone
  let title = `Status Updated to ${update.status}`;
  let description = update.caseworkerNote || `Referral status progressed to ${update.status}`;

  if (update.status === 'IN_REVIEW') {
    title = 'Caseworker Under Review';
    description = `Application is being reviewed by caseworker ${update.caseworkerName || ''}.`;
  } else if (update.status === 'ACCEPTED') {
    title = 'Assistance Approved';
    description = update.benefitAmountPledged
      ? `Benefit approved: ${update.benefitAmountPledged}`
      : 'Application accepted and assistance authorized.';
  } else if (update.status === 'ACTION_REQUIRED') {
    title = 'Additional Information Required';
    description = update.actionRequired || 'Caseworker requested additional documentation.';
  } else if (update.status === 'WAITLISTED') {
    title = 'Placed on Active Waitlist';
    description = 'Application qualified and placed on prioritized waitlist queue.';
  } else if (update.status === 'DENIED') {
    title = 'Application Not Approved';
    description = update.caseworkerNote || 'Application did not meet program guidelines.';
  }

  ref.timeline.push({
    id: `m-${Date.now()}`,
    status: update.status,
    timestamp: now,
    title,
    description,
    actor: 'caseworker',
    actionRequired: update.actionRequired,
  });

  submission.updatedAt = now;
  GLOBAL_INTAKE_STORE.set(submission.confirmationCode, submission);
  return submission;
}
