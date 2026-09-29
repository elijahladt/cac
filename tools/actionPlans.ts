import { ActionPlan, ActionPlanItem, CaseFile, ExtractedDocument } from '@/lib/types';
import { VERIFIED_RESOURCES } from '@/lib/data/verifiedResources';

export function createDefaultCaseFile(): CaseFile {
  const defaultResource1 = VERIFIED_RESOURCES[0];
  const defaultResource2 = VERIFIED_RESOURCES[2];

  const defaultItems: ActionPlanItem[] = [
    {
      id: 'plan-item-1',
      action_plan_id: 'default-plan-1',
      resource_id: defaultResource1.id,
      priority: 1,
      status: 'pending',
      title: defaultResource1.name,
      category: 'utility_assistance',
      instructions:
        'Review NV Energy Project REACH eligibility. Gather your latest electricity bill with past-due notice.',
      documents_needed: [
        'Current NV Energy bill',
        'Proof of 30-day household income',
        'State ID / Driver’s license',
      ],
      resource: defaultResource1,
    },
    {
      id: 'plan-item-2',
      action_plan_id: 'default-plan-1',
      resource_id: defaultResource2.id,
      priority: 2,
      status: 'pending',
      title: defaultResource2.name,
      category: 'food_assistance',
      instructions:
        'Visit Three Square Food Bank campus in North Las Vegas during public pantry distribution hours (Mon-Fri 8:30 AM - 4:30 PM).',
      documents_needed: ['Clark County proof of address / ID'],
      resource: defaultResource2,
    },
  ];

  const defaultDocuments: ExtractedDocument[] = [
    {
      id: 'doc-demo-1',
      document_type: 'utility_bill',
      provider_name: 'NV Energy',
      account_number_present: true,
      amount_due: '$184.27',
      due_date: '2026-10-03',
      recipient_name_present: true,
      service_address_present: true,
      verified_by_user: true,
      extracted_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      confidence: 0.96,
      summary: 'Verified NV Energy electric utility statement with active past-due disconnection balance.',
    },
  ];

  return {
    id: 'case-nv-2026-001',
    status: 'PLAN_CREATED',
    primary_language: 'en',
    needs: [
      {
        category: 'utility_assistance',
        description: 'Power shutoff prevention and past-due payment assistance',
        urgency: 'high',
      },
      {
        category: 'food_assistance',
        description: 'Emergency groceries and nutrition support for household children',
        urgency: 'medium',
      },
    ],
    documents: defaultDocuments,
    missing_information: [
      'Household size verification for state income threshold calculations',
    ],
    potential_resources: [defaultResource1, defaultResource2],
    action_plan: {
      id: 'default-plan-1',
      case_id: 'case-nv-2026-001',
      title: 'My Nevada Nexus Bridge Plan',
      items: defaultItems,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export function saveCaseFile(caseFile: CaseFile): void {
  try {
    localStorage.setItem('nv_nexus_active_case_file', JSON.stringify(caseFile));
  } catch {
    // Local storage unavailable
  }
}

export function loadCaseFile(): CaseFile {
  try {
    const raw = localStorage.getItem('nv_nexus_active_case_file');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore error
  }
  return createDefaultCaseFile();
}
