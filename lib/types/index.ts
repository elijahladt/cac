// Core TypeScript Interfaces for Nevada Nexus

export type SupportedLanguage = 'en' | 'es' | 'tl';

export type ResourceCategory =
  | 'utility_assistance'
  | 'food_assistance'
  | 'housing'
  | 'healthcare'
  | 'jobs'
  | 'transportation'
  | 'childcare'
  | 'other';

export type VerificationStatus = 'VERIFIED' | 'NEEDS_REVIEW' | 'STALE' | 'ARCHIVED';

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';

export type CaseStatus =
  | 'NEW'
  | 'UNDERSTANDING'
  | 'NEEDS_CLARIFICATION'
  | 'SEARCHING'
  | 'RESOURCES_FOUND'
  | 'ELIGIBILITY_REVIEW'
  | 'PLAN_CREATED'
  | 'DOCUMENT_REVIEW'
  | 'USER_REVIEW'
  | 'COMPLETED';

export interface Resource {
  id: string;
  name: string;
  description: string;
  category: ResourceCategory;
  address?: string | null;
  city: string;
  state: string;
  zip?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  website?: string | null;
  hours?: string | null;
  languages: string[];
  source_url: string;
  verification_status: VerificationStatus;
  last_verified_at: string;
  created_at: string;
  updated_at: string;
  // Computed fields
  distanceMiles?: number;
  travelTimeDriving?: string;
  travelTimeWalking?: string;
  whyThisResource?: string;
}

export interface Program {
  id: string;
  resource_id: string;
  name: string;
  category: string;
  description: string;
  eligibility_rules: EligibilityRule[];
  required_documents: string[];
  application_url?: string | null;
  application_phone?: string | null;
  status: 'active' | 'inactive';
  source_url: string;
  last_verified_at: string;
  created_at: string;
}

export interface EligibilityRule {
  criterion: string;
  requirement: string;
  mandatory: boolean;
}

export type EligibilityResultType =
  | 'POTENTIAL_MATCH'
  | 'POSSIBLE_MISMATCH'
  | 'INSUFFICIENT_INFORMATION'
  | 'UNKNOWN';

export interface EligibilityEvaluation {
  program_id: string;
  program_name: string;
  result: EligibilityResultType;
  confidence: number;
  matched_requirements: string[];
  unmatched_requirements: string[];
  missing_information: string[];
  explanation: string;
}

export interface IntakeResult {
  language: SupportedLanguage;
  needs: ResourceCategory[];
  raw_needs_summary: string;
  location?: {
    city?: string;
    zip?: string;
    address?: string;
  };
  urgency: UrgencyLevel;
  household_has_children?: boolean;
  known_facts: Record<string, string | number | boolean>;
  missing_information: string[];
  follow_up_questions: string[];
}

export interface ActionPlanItem {
  id: string;
  action_plan_id: string;
  resource_id?: string | null;
  priority: number;
  status: 'pending' | 'in_progress' | 'completed';
  instructions: string;
  title: string;
  category: ResourceCategory;
  documents_needed: string[];
  resource?: Resource;
}

export interface ActionPlan {
  id: string;
  case_id: string;
  title: string;
  items: ActionPlanItem[];
  created_at: string;
  updated_at: string;
}

export interface CaseFile {
  id: string;
  status: CaseStatus;
  primary_language: SupportedLanguage;
  needs: {
    category: ResourceCategory;
    description: string;
    urgency: UrgencyLevel;
  }[];
  documents: ExtractedDocument[];
  missing_information: string[];
  potential_resources: Resource[];
  action_plan?: ActionPlan;
  created_at: string;
  updated_at: string;
}

export interface ExtractedDocument {
  id: string;
  document_type: 'utility_bill' | 'pay_stub' | 'benefit_notice' | 'government_id' | 'other';
  provider_name?: string;
  account_number_present?: boolean;
  amount_due?: string;
  due_date?: string;
  recipient_name_present?: boolean;
  service_address_present?: boolean;
  verified_by_user?: boolean;
  extracted_at: string;
  confidence: number;
  summary: string;
}

export interface EmergencyPathway {
  service: string;
  number: string;
  description: string;
  available: string;
  emergency: boolean;
}
