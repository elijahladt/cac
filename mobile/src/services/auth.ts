import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, UserSurveyData } from '../types';

const CURRENT_USER_KEY = '@nevada_nexus_current_user';
const USERS_DB_KEY = '@nevada_nexus_users_db';

export interface StoredAccount {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
  surveyCompleted: boolean;
  surveyData?: UserSurveyData;
}

// Initial seed accounts so pre-existing demo accounts exist if needed
const SEED_ACCOUNTS: StoredAccount[] = [
  {
    id: 'user-elena-1',
    email: 'elena@nexus.org',
    password: 'password123',
    name: 'Elena Ramos',
    createdAt: new Date().toISOString(),
    surveyCompleted: true,
    surveyData: {
      primaryNeeds: ['utility_assistance', 'food_assistance'],
      householdSize: 4,
      incomeRange: 'under_1500',
      housingStatus: 'at_risk',
      languagePreference: 'en',
    },
  },
];

export function createDemoUser(): UserProfile {
  return {
    id: SEED_ACCOUNTS[0].id,
    email: SEED_ACCOUNTS[0].email,
    name: SEED_ACCOUNTS[0].name,
    surveyCompleted: true,
    surveyData: SEED_ACCOUNTS[0].surveyData,
  };
}

async function getRegisteredAccounts(): Promise<StoredAccount[]> {
  try {
    const raw = await AsyncStorage.getItem(USERS_DB_KEY);
    if (!raw) {
      // Seed default accounts
      await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(SEED_ACCOUNTS));
      return SEED_ACCOUNTS;
    }
    return JSON.parse(raw) as StoredAccount[];
  } catch (e) {
    return SEED_ACCOUNTS;
  }
}

async function saveRegisteredAccounts(accounts: StoredAccount[]): Promise<void> {
  try {
    await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.warn('Failed to save accounts database:', e);
  }
}

// Get active session user
export async function getStoredUser(): Promise<UserProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch (e) {
    return null;
  }
}

// Save active session user
export async function saveUser(profile: UserProfile): Promise<void> {
  try {
    await AsyncStorage.setItem(CURRENT_USER_KEY, JSON.stringify(profile));
  } catch (e) {
    console.warn('Failed to save current user session:', e);
  }
}

// Clear active session (Log Out)
export async function clearUser(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CURRENT_USER_KEY);
  } catch (e) {
    console.warn('Failed to clear user session:', e);
  }
}

// Real Sign Up
export async function signUpUser(
  name: string,
  email: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();

  if (!cleanName) {
    return { success: false, error: 'Please enter your full name.' };
  }
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, error: 'Please enter a valid email address.' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Password must be at least 6 characters long.' };
  }

  const accounts = await getRegisteredAccounts();
  const exists = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
  if (exists) {
    return { success: false, error: 'An account with this email already exists. Please sign in instead.' };
  }

  const newAccount: StoredAccount = {
    id: `user-${Date.now()}`,
    email: cleanEmail,
    password,
    name: cleanName,
    createdAt: new Date().toISOString(),
    surveyCompleted: false,
  };

  accounts.push(newAccount);
  await saveRegisteredAccounts(accounts);

  const profile: UserProfile = {
    id: newAccount.id,
    email: newAccount.email,
    name: newAccount.name,
    surveyCompleted: false,
  };

  await saveUser(profile);
  return { success: true, user: profile };
}

// Real Sign In
export async function signInUser(
  email: string,
  password: string
): Promise<{ success: boolean; user?: UserProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail || !password) {
    return { success: false, error: 'Please enter both email and password.' };
  }

  const accounts = await getRegisteredAccounts();
  const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

  if (!account) {
    return { success: false, error: 'No account found with this email address. Please sign up.' };
  }

  if (account.password !== password) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }

  const profile: UserProfile = {
    id: account.id,
    email: account.email,
    name: account.name,
    surveyCompleted: account.surveyCompleted,
    surveyData: account.surveyData,
  };

  await saveUser(profile);
  return { success: true, user: profile };
}

// Update survey responses for an account
export async function updateUserSurvey(
  userId: string,
  surveyData: UserSurveyData
): Promise<void> {
  const accounts = await getRegisteredAccounts();
  const index = accounts.findIndex((a) => a.id === userId);
  if (index !== -1) {
    accounts[index].surveyCompleted = true;
    accounts[index].surveyData = surveyData;
    await saveRegisteredAccounts(accounts);
  }

  const current = await getStoredUser();
  if (current && current.id === userId) {
    current.surveyCompleted = true;
    current.surveyData = surveyData;
    await saveUser(current);
  }
}
