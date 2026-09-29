import { Resource, ResourceCategory, SupportedLanguage } from '@/lib/types';
import { VERIFIED_RESOURCES } from '@/lib/data/verifiedResources';
import { formatRelativeTime } from '@/lib/utils';

export interface SearchResourcesParams {
  query?: string;
  category?: ResourceCategory | 'all';
  language?: SupportedLanguage | string;
  latitude?: number;
  longitude?: number;
  radiusMiles?: number;
  maxResults?: number;
  userContext?: {
    hasChildren?: boolean;
    incomeNeed?: boolean;
    city?: string;
    zip?: string;
  };
}

export interface ScoredResource extends Resource {
  score: number;
  matchReasons: string[];
}

// Approximate Haversine distance in miles
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

// Estimated driving and walking times
export function estimateTravelTimes(distanceMiles: number) {
  // Average city driving ~25mph with traffic
  const drivingMinutes = Math.max(2, Math.round((distanceMiles / 22) * 60));
  // Average walking ~3mph
  const walkingMinutes = Math.round((distanceMiles / 3.1) * 60);

  return {
    driving: `${drivingMinutes} min`,
    walking: walkingMinutes > 90 ? `${Math.round(walkingMinutes / 60)} hr ${walkingMinutes % 60}m` : `${walkingMinutes} min`,
  };
}

// Deterministic resource search and scoring per PRD Section 25 & 41
export async function searchResources(params: SearchResourcesParams): Promise<ScoredResource[]> {
  const {
    query = '',
    category,
    language = 'en',
    latitude = 36.1989, // Default to North Las Vegas center
    longitude = -115.1175,
    radiusMiles = 25,
    maxResults = 10,
    userContext,
  } = params;

  const normalizedQuery = query.toLowerCase().trim();
  const queryTokens = normalizedQuery.split(/\s+/).filter((t) => t.length > 2);

  const scoredList: ScoredResource[] = [];

  for (const resource of VERIFIED_RESOURCES) {
    let score = 0;
    const matchReasons: string[] = [];

    // Filter by category if explicitly specified (unless 'all')
    if (category && category !== 'all' && resource.category !== category) {
      continue;
    }

    // 1. Category relevance
    if (category && category === resource.category) {
      score += 40;
      matchReasons.push(`Direct match for ${resource.category.replace('_', ' ')}`);
    }

    // 2. Text keyword match in name & description
    const resText = `${resource.name} ${resource.description} ${resource.city} ${resource.zip || ''}`.toLowerCase();
    let keywordHits = 0;
    for (const token of queryTokens) {
      if (resText.includes(token)) {
        keywordHits += 1;
      }
    }
    if (queryTokens.length > 0 && keywordHits > 0) {
      const keywordScore = Math.min(35, (keywordHits / queryTokens.length) * 35);
      score += keywordScore;
      matchReasons.push(`Matched keywords in service description`);
    }

    // 3. Geographic proximity (NV-04 / North Las Vegas)
    let dist = 1.8; // default reasonable estimate if no lat/lon
    if (resource.latitude && resource.longitude && latitude && longitude) {
      dist = calculateDistance(latitude, longitude, resource.latitude, resource.longitude);
      if (dist > radiusMiles) {
        // Outside target radius
        continue;
      }
      // Closer resources get higher score bonus
      const distanceBonus = Math.max(0, 15 - dist);
      score += distanceBonus;
      matchReasons.push(`Located within ${dist} miles in North Las Vegas / NV-04`);
    }

    // 4. Language availability match
    if (language && resource.languages.includes(language)) {
      score += 10;
      matchReasons.push(
        `Staff & services documented in ${language === 'es' ? 'Spanish' : language === 'tl' ? 'Tagalog' : 'English'}`
      );
    }

    // 5. Verification status & recency bonus
    if (resource.verification_status === 'VERIFIED') {
      score += 10;
      matchReasons.push(`Officially verified record (${formatRelativeTime(resource.last_verified_at)})`);
    } else if (resource.verification_status === 'NEEDS_REVIEW') {
      score -= 15;
    }

    // 6. User context bonuses
    if (userContext?.hasChildren && (resource.category === 'childcare' || resource.category === 'food_assistance')) {
      score += 8;
      matchReasons.push('Supports households with dependent children');
    }

    const travelTimes = estimateTravelTimes(dist);

    // Build authoritative "Why this resource?" explanation (PRD Section 33)
    const whyThisResource = matchReasons.length > 0
      ? matchReasons.join('. ') + '.'
      : `Verified community resource serving the North Las Vegas area.`;

    scoredList.push({
      ...resource,
      distanceMiles: dist,
      travelTimeDriving: travelTimes.driving,
      travelTimeWalking: travelTimes.walking,
      whyThisResource,
      score: Math.round(score),
      matchReasons,
    });
  }

  // Sort deterministically by highest score descending, then distance ascending
  scoredList.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return (a.distanceMiles || 0) - (b.distanceMiles || 0);
  });

  return scoredList.slice(0, maxResults);
}

export async function getResource(id: string): Promise<Resource | null> {
  const resource = VERIFIED_RESOURCES.find((r) => r.id === id);
  return resource || null;
}
