import { SupportedLanguage, ResourceCategory } from './index';

export type HousingStatusType = 'stable' | 'at_risk' | 'couch_surfing' | 'unhoused';

export interface UserPersonalizationProfile {
  fullName: string;
  phone?: string;
  email: string;
  zipCode: string;
  neighborhood?: string;
  preferredLanguage: SupportedLanguage;
  householdSize: number;
  monthlyIncome: number;
  housingStatus: HousingStatusType;
  primaryNeeds: ResourceCategory[];
  hasChildren: boolean;
  hasSeniors: boolean;
  hasDisability: boolean;
  isVeteran: boolean;
  hasPastDueUtility: boolean;
  hasDisconnectNotice: boolean;
  utilityProvider: 'NV Energy' | 'Southwest Gas' | 'Other' | 'None';
  onboardingCompleted: boolean;
  notes?: string;
}

export interface UserAccount {
  id: string;
  email: string;
  password?: string;
  createdAt: string;
  updatedAt: string;
  profile: UserPersonalizationProfile;
}

export interface DemoProfileOption {
  id: string;
  name: string;
  email: string;
  tagline: string;
  description: string;
  profile: UserPersonalizationProfile;
}
