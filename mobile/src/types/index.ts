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

export type UrgencyLevel = 'low' | 'medium' | 'high' | 'emergency';

export interface Resource {
  id: string;
  name: string;
  category: ResourceCategory;
  description: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  phone: string;
  website: string;
  hours: string;
  languages: SupportedLanguage[];
  source_url: string;
  verification_status: 'VERIFIED' | 'STALE' | 'PENDING_REVIEW' | 'UNVERIFIED';
  last_verified_at: string;
  whyThisResource?: string;
}

export interface Program {
  id: string;
  resource_id: string;
  name: string;
  description: string;
  eligibility_summary: string;
  income_limit_pct_fpl?: number;
  required_documents: string[];
  application_url: string;
  target_population?: string;
  languages: SupportedLanguage[];
  verification_status: 'VERIFIED' | 'STALE' | 'PENDING_REVIEW';
  last_verified_at: string;
}

export interface EmergencyPathway {
  service: string;
  number: string;
  description: string;
  available: string;
  emergency: boolean;
}

export interface ActionPlanItem {
  id: string;
  step_number: number;
  title: string;
  description: string;
  resource_name: string;
  resource_id?: string;
  resource_phone?: string;
  resource_address?: string;
  website?: string;
  documents_needed: string[];
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  completed?: boolean;
}

export interface ActionPlan {
  id: string;
  created_at: string;
  summary: string;
  items: ActionPlanItem[];
}

export interface CaseFile {
  id: string;
  language: SupportedLanguage;
  created_at: string;
  updated_at: string;
  status: 'INTAKE' | 'ANALYZING' | 'PLAN_CREATED' | 'IN_PROGRESS' | 'RESOLVED';
  intake_summary: string;
  identified_needs: ResourceCategory[];
  action_plan: ActionPlan;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  suggested_resources?: Resource[];
  action_plan?: ActionPlan;
  urgency?: UrgencyLevel;
  emergency_alert?: boolean;
}

export interface DocumentAnalysis {
  document_type: string;
  provider?: string;
  amount_due?: string;
  due_date?: string;
  account_number_present?: boolean;
  extracted_fields: Record<string, string>;
  matching_programs: string[];
  missing_requirements: string[];
  confidence_score: number;
}

export interface IntakeResult {
  language: SupportedLanguage;
  needs: ResourceCategory[];
  raw_needs_summary: string;
  location?: { city: string; zip?: string };
  urgency: UrgencyLevel;
  household_has_children?: boolean;
  known_facts?: Record<string, any>;
  missing_information?: string[];
  follow_up_questions?: string[];
  emergency?: boolean;
}

export type IncomeRange = '$0' | 'under_1500' | '1500_3000' | '3000_plus' | 'prefer_not_to_say';
export type HousingStability = 'stable' | 'couch_surfing' | 'at_risk' | 'unhoused';

export interface UserSurveyData {
  primaryNeeds: ResourceCategory[];
  householdSize: number;
  incomeRange: IncomeRange;
  housingStatus: HousingStability;
  languagePreference: SupportedLanguage;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  surveyCompleted: boolean;
  surveyData?: UserSurveyData;
}


