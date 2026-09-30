import { EmergencyPathway } from '../types';

export const EMERGENCY_SERVICES: EmergencyPathway[] = [
  {
    service: 'Immediate Life Threat / Police / Fire / Medical',
    number: '911',
    description: 'Call immediately for life-threatening emergencies, immediate physical danger, medical crises, or active fires.',
    available: '24/7',
    emergency: true,
  },
  {
    service: 'Suicide & Crisis Lifeline (Nevada & National)',
    number: '988',
    description: 'Free, confidential support for people in suicidal crisis or emotional distress. Spanish, English, and Tagalog translation available.',
    available: '24/7 / Call or Text',
    emergency: true,
  },
  {
    service: 'Nevada 211 (Statewide Community Assistance)',
    number: '2-1-1',
    description: 'Dial 211 or text your zip code to 898211 for official Nevada health and human service information.',
    available: '24/7',
    emergency: false,
  },
  {
    service: 'Safe Nest Domestic Violence Crisis Line (Clark County / NLV)',
    number: '702-646-4981',
    description: 'Confidential crisis intervention, safe shelter, counseling, and advocacy for victims of domestic violence.',
    available: '24/7 Hotline',
    emergency: true,
  },
  {
    service: 'Child Abuse / Neglect Hotline (Clark County DFS)',
    number: '702-399-0081',
    description: 'Report suspected child abuse or neglect in Clark County / North Las Vegas.',
    available: '24/7',
    emergency: true,
  },
];

const EMERGENCY_KEYWORDS = [
  'suicide',
  'kill myself',
  'end my life',
  'suicidio',
  'quitarme la vida',
  'magpakamatay',
  'overdose',
  'gun to head',
  'heart attack',
  'stroke',
  'bleeding heavily',
  'abuse',
  'choking',
  'fire',
  'someone is hurting me',
  'threatened with weapon',
];

export function detectImmediateEmergency(input: string): boolean {
  if (!input) return false;
  const lower = input.toLowerCase();
  return EMERGENCY_KEYWORDS.some((kw) => lower.includes(kw));
}
