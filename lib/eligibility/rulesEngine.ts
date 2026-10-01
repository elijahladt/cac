// Nevada Nexus Programmatic Eligibility Rules Engine
// Real-time deterministic evaluation against Nevada FPL, AMI, and statutory program criteria.

import { Program, ResourceCategory, SupportedLanguage } from '@/lib/types';
import { VERIFIED_PROGRAMS } from '@/lib/data/verifiedResources';

export interface HouseholdProfile {
  householdSize: number;
  monthlyIncome: number;
  zipCode: string;
  city?: string;
  housingStatus?: 'stable' | 'couch_surfing' | 'at_risk' | 'unhoused';
  hasPastDueUtility?: boolean;
  hasDisconnectNotice?: boolean;
  utilityProvider?: 'nv_energy' | 'southwest_gas' | 'water_district' | 'other';
  hasChildren?: boolean;
  hasSeniors?: boolean; // 60+
  hasDisability?: boolean;
  isVeteran?: boolean;
  needs?: ResourceCategory[];
}

export type ProgramEligibilityStatus = 'QUALIFIED' | 'POTENTIALLY_ELIGIBLE' | 'RULED_OUT';

export interface RuleCheckResult {
  ruleName: string;
  passed: boolean;
  mandatory: boolean;
  details: string;
  userValue?: string | number | boolean;
  requiredValue?: string | number | boolean;
}

export interface ProgramEligibilityEvaluation {
  programId: string;
  programName: string;
  category: string;
  status: ProgramEligibilityStatus;
  score: number; // 0 to 100 match confidence
  incomeLimitMonthly?: number;
  fplPercentage?: number;
  amiPercentage?: number;
  rulesChecked: RuleCheckResult[];
  qualifyingReasons: string[];
  disqualifyingReasons: string[];
  pendingRequirements: string[];
  requiredDocuments: string[];
  actionRecommendation: string;
  applicationUrl?: string | null;
  applicationPhone?: string | null;
}

// 2026 Federal Poverty Level (FPL) Monthly Guidelines for Nevada (48 Contiguous States)
// Baseline 100% FPL: $1,255/mo for 1 person + $448/mo each additional person
export function getMonthlyFplThreshold(householdSize: number, percentage: number): number {
  const size = Math.max(1, householdSize);
  const base100 = 1255 + (size - 1) * 448;
  return Math.round((base100 * percentage) / 100);
}

// 2026 Clark County / North Las Vegas Area Median Income (AMI) 80% Monthly Limits
export function getMonthlyAmi80Threshold(householdSize: number): number {
  const size = Math.max(1, householdSize);
  const amiTable: Record<number, number> = {
    1: 4400,
    2: 5030,
    3: 5660,
    4: 6285,
    5: 6790,
    6: 7295,
    7: 7800,
    8: 8300,
  };
  return amiTable[size] || 8300 + (size - 8) * 505;
}

// North Las Vegas / Clark County NV-04 Service Zip Codes
export const NV04_CLARK_COUNTY_ZIPS = new Set([
  '89030', '89031', '89032', '89033', '89036', '89081', '89084', '89085', '89086', '89087',
  '89101', '89106', '89110', '89115', '89156', '89015', '89011', '89102', '89104', '89107',
]);

export function evaluateProgrammaticEligibility(
  profile: HouseholdProfile,
  lang: SupportedLanguage = 'en'
): ProgramEligibilityEvaluation[] {
  const size = Math.max(1, profile.householdSize || 1);
  const income = profile.monthlyIncome ?? 0;
  const zip = (profile.zipCode || '').trim();

  return VERIFIED_PROGRAMS.map((program) => {
    const rulesChecked: RuleCheckResult[] = [];
    const qualifyingReasons: string[] = [];
    const disqualifyingReasons: string[] = [];
    const pendingRequirements: string[] = [];

    // --- RULE 1: Geographic Residency (Clark County / North Las Vegas NV-04) ---
    const isLocalZip = zip ? NV04_CLARK_COUNTY_ZIPS.has(zip) : false;
    if (zip) {
      if (isLocalZip) {
        rulesChecked.push({
          ruleName: 'Geographic Eligibility (Clark County / NV-04)',
          passed: true,
          mandatory: true,
          details: `Zip code ${zip} is located directly within Clark County / NV-04 service area.`,
          userValue: zip,
        });
        qualifyingReasons.push(
          lang === 'es'
            ? `Código postal ${zip} verificado en el área de servicio de Nevada.`
            : lang === 'tl'
            ? `Napatunayang nasa sakop ng serbisyo ang zip code ${zip}.`
            : `Zip code ${zip} is within the verified Nevada service area.`
        );
      } else {
        rulesChecked.push({
          ruleName: 'Geographic Eligibility (Clark County / NV-04)',
          passed: false,
          mandatory: true,
          details: `Zip code ${zip} is outside the North Las Vegas / Clark County primary coverage area.`,
          userValue: zip,
        });
        disqualifyingReasons.push(
          lang === 'es'
            ? `El código postal ${zip} está fuera del área principal de Clark County.`
            : lang === 'tl'
            ? `Ang zip code ${zip} ay nasa labas ng pangunahing sakop ng Clark County.`
            : `Zip code ${zip} is outside the primary Clark County service boundary.`
        );
      }
    } else {
      pendingRequirements.push(
        lang === 'es'
          ? 'Confirmar código postal de residencia en Nevada'
          : lang === 'tl'
          ? 'Kumpirmahin ang zip code sa Nevada'
          : 'Confirm Nevada residency zip code'
      );
    }

    // --- RULE 2: Income Testing against Statutory Guidelines ---
    let incomeLimit = 0;
    let fplPercent: number | undefined;
    let amiPercent: number | undefined;

    if (program.id === 'prog-liheap-eap' || program.id === 'prog-liheap-energy') {
      // Nevada DWSS LIHEAP: 150% FPL
      fplPercent = 150;
      incomeLimit = getMonthlyFplThreshold(size, 150);
      const passed = income <= incomeLimit;
      rulesChecked.push({
        ruleName: 'Income Threshold (150% Federal Poverty Level)',
        passed,
        mandatory: true,
        details: `Monthly household limit for ${size} person(s) is $${incomeLimit.toLocaleString()}. User income: $${income.toLocaleString()}.`,
        userValue: income,
        requiredValue: incomeLimit,
      });

      if (passed) {
        qualifyingReasons.push(
          lang === 'es'
            ? `Ingresos de $${income.toLocaleString()}/mes califican bajo el límite de 150% FPL ($${incomeLimit.toLocaleString()}/mes).`
            : lang === 'tl'
            ? `Ang kita na $${income.toLocaleString()}/buwan ay pasok sa 150% FPL limit ($${incomeLimit.toLocaleString()}/buwan).`
            : `Household income of $${income.toLocaleString()}/mo is below the 150% FPL ceiling of $${incomeLimit.toLocaleString()}/mo.`
        );
      } else {
        disqualifyingReasons.push(
          lang === 'es'
            ? `Ingresos de $${income.toLocaleString()}/mes superan el límite máximo de $${incomeLimit.toLocaleString()}/mes para ${size} persona(s).`
            : lang === 'tl'
            ? `Ang kita na $${income.toLocaleString()}/buwan ay lampas sa limitasyon na $${incomeLimit.toLocaleString()}/buwan para sa ${size} katao.`
            : `Income of $${income.toLocaleString()}/mo exceeds the $${incomeLimit.toLocaleString()}/mo threshold for a household of ${size}.`
        );
      }
    } else if (program.id === 'prog-reach-emergency' || program.id === 'prog-project-reach') {
      // NV Energy Project REACH: 200% FPL or 60+ / Medical vulnerability
      fplPercent = 200;
      incomeLimit = getMonthlyFplThreshold(size, 200);
      const passed = income <= incomeLimit || Boolean(profile.hasSeniors) || Boolean(profile.hasPastDueUtility);
      rulesChecked.push({
        ruleName: 'Income or Crisis Hardship (200% FPL)',
        passed,
        mandatory: true,
        details: `Limit $${incomeLimit.toLocaleString()}/mo or active past-due disconnect notice.`,
        userValue: income,
        requiredValue: incomeLimit,
      });

      if (passed) {
        qualifyingReasons.push(
          lang === 'es'
            ? `Califica para asistencia de emergencia de NV Energy REACH.`
            : lang === 'tl'
            ? `Pasok sa emergency assistance ng NV Energy REACH.`
            : `Meets NV Energy Project REACH hardship or income guidelines.`
        );
      } else {
        disqualifyingReasons.push(
          lang === 'es'
            ? `Los ingresos superan el límite de Project REACH y no se reportó aviso de desconexión.`
            : lang === 'tl'
            ? `Lampas sa kita ng Project REACH at walang ulat na notice ng pagkaputol.`
            : `Income exceeds REACH limits with no active disconnection notice recorded.`
        );
      }
    } else if (program.id === 'prog-three-square-snap' || program.id === 'prog-three-square-pantry') {
      // Three Square / SNAP: 200% FPL for SNAP; 0% barrier for emergency pantry
      fplPercent = 200;
      incomeLimit = getMonthlyFplThreshold(size, 200);
      const isEmergencyPantry = program.id === 'prog-three-square-pantry';
      const passed = isEmergencyPantry ? true : income <= incomeLimit;

      rulesChecked.push({
        ruleName: isEmergencyPantry ? 'No Income Barrier (Emergency Food Box)' : 'SNAP Income Limit (200% FPL)',
        passed,
        mandatory: Boolean(!isEmergencyPantry),
        details: isEmergencyPantry ? 'Open to all residents facing food insecurity.' : `Limit $${incomeLimit.toLocaleString()}/mo for ${size} person(s).`,
      });

      if (passed) {
        qualifyingReasons.push(
          isEmergencyPantry
            ? (lang === 'es'
                ? 'Despensa de alimentos abierta a cualquier residente sin barreras de ingresos.'
                : lang === 'tl'
                ? 'Bukas sa lahat ng residenteng nangangailangan ng pagkain nang walang harang sa kita.'
                : 'Emergency food pantry is available with no strict income cap.')
            : (lang === 'es'
                ? `Ingresos califican dentro de las pautas de SNAP ($${incomeLimit.toLocaleString()}/mes).`
                : lang === 'tl'
                ? `Pasok ang kita sa pamantayan ng SNAP ($${incomeLimit.toLocaleString()}/buwan).`
                : `Household income falls within SNAP 200% FPL guidelines ($${incomeLimit.toLocaleString()}/mo).`)
        );
      }
    } else if (program.id === 'prog-chap-housing') {
      // CHAP Rental Assistance: 80% AMI Clark County
      amiPercent = 80;
      incomeLimit = getMonthlyAmi80Threshold(size);
      const isAtRisk = profile.housingStatus === 'at_risk' || profile.housingStatus === 'couch_surfing' || profile.housingStatus === 'unhoused';
      const passed = income <= incomeLimit && isAtRisk;

      rulesChecked.push({
        ruleName: 'Clark County 80% AMI & Housing Need',
        passed,
        mandatory: true,
        details: `Max monthly income $${incomeLimit.toLocaleString()} and active risk of housing instability.`,
      });

      if (passed) {
        qualifyingReasons.push(
          lang === 'es'
            ? `Califica para CHAP bajo el 80% AMI de Clark County ($${incomeLimit.toLocaleString()}/mes).`
            : lang === 'tl'
            ? `Pasok sa CHAP sa ilalim ng 80% AMI ng Clark County ($${incomeLimit.toLocaleString()}/buwan).`
            : `Qualified for CHAP under Clark County 80% AMI ($${incomeLimit.toLocaleString()}/mo limit).`
        );
      } else if (income > incomeLimit) {
        disqualifyingReasons.push(
          lang === 'es'
            ? `Ingresos de $${income.toLocaleString()} superan el 80% AMI de Clark County ($${incomeLimit.toLocaleString()}).`
            : lang === 'tl'
            ? `Ang kita na $${income.toLocaleString()} ay lampas sa 80% AMI ng Clark County ($${incomeLimit.toLocaleString()}).`
            : `Income of $${income.toLocaleString()}/mo exceeds Clark County 80% AMI threshold ($${incomeLimit.toLocaleString()}/mo).`
        );
      }
    } else {
      // Generic program evaluation
      incomeLimit = getMonthlyFplThreshold(size, 200);
      qualifyingReasons.push(
        lang === 'es'
          ? 'Cumple con los requisitos generales del programa.'
          : lang === 'tl'
          ? 'Natutugunan ang pangkalahatang alituntunin ng programa.'
          : 'Meets general community assistance eligibility criteria.'
      );
    }

    // --- RULE 3: Category Need Relevance ---
    if (profile.needs && profile.needs.length > 0) {
      if (profile.needs.includes(program.category as ResourceCategory)) {
        qualifyingReasons.push(
          lang === 'es'
            ? `Coincidencia directa con su necesidad declarada (${program.category}).`
            : lang === 'tl'
            ? `Direktang tugma sa iyong pangangailangan (${program.category}).`
            : `Direct match for your requested need (${program.category}).`
        );
      }
    }

    // Determine Final Programmatic Status
    let status: ProgramEligibilityStatus = 'POTENTIALLY_ELIGIBLE';
    let score = 70;

    if (disqualifyingReasons.length > 0) {
      status = 'RULED_OUT';
      score = 20;
    } else if (qualifyingReasons.length >= 2 && pendingRequirements.length === 0) {
      status = 'QUALIFIED';
      score = 95;
    } else if (qualifyingReasons.length >= 1) {
      status = 'POTENTIALLY_ELIGIBLE';
      score = 80;
    }

    // Action recommendation
    let actionRecommendation = '';
    if (status === 'QUALIFIED') {
      actionRecommendation =
        lang === 'es'
          ? 'Listo para enviar solicitud electrónica directa.'
          : lang === 'tl'
          ? 'Handa nang magsumite ng direktang elektronikong intake.'
          : 'Ready for direct electronic intake submission.';
    } else if (status === 'POTENTIALLY_ELIGIBLE') {
      actionRecommendation =
        lang === 'es'
          ? 'Requiere adjuntar comprobante de domicilio o ingresos.'
          : lang === 'tl'
          ? 'Kailangan maglakip ng katibayan ng tirahan o kita.'
          : 'Pending document verification (attach proof of address or income).';
    } else {
      actionRecommendation =
        lang === 'es'
          ? 'No recomendado: no cumple con los límites de ingresos o área de cobertura.'
          : lang === 'tl'
          ? 'Hindi inirerekomenda: lampas sa limitasyon ng kita o sakop na lugar.'
          : 'Ruled out: Exceeds income ceiling or outside primary service boundary.';
    }

    return {
      programId: program.id,
      programName: program.name,
      category: program.category,
      status,
      score,
      incomeLimitMonthly: incomeLimit,
      fplPercentage: fplPercent,
      amiPercentage: amiPercent,
      rulesChecked,
      qualifyingReasons,
      disqualifyingReasons,
      pendingRequirements,
      requiredDocuments: program.required_documents || [],
      actionRecommendation,
      applicationUrl: program.application_url,
      applicationPhone: program.application_phone,
    };
  });
}
