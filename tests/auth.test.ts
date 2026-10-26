import { describe, it, expect } from 'vitest';
import { DEMO_PROFILES, NV04_ZIP_CODES } from '../lib/auth/demoProfiles';
import { evaluateProgrammaticEligibility, getMonthlyFplThreshold } from '../lib/eligibility/rulesEngine';
import { getTranslation } from '../lib/i18n';

describe('Auth & Personalization System', () => {
  it('defines valid North Las Vegas / NV-04 demo profiles', () => {
    expect(DEMO_PROFILES.length).toBeGreaterThanOrEqual(3);

    DEMO_PROFILES.forEach((demo) => {
      expect(demo.id).toBeDefined();
      expect(demo.email).toContain('@');
      expect(demo.profile.fullName).toBeTruthy();
      expect(demo.profile.householdSize).toBeGreaterThan(0);
      expect(demo.profile.monthlyIncome).toBeGreaterThan(0);
      expect(demo.profile.primaryNeeds.length).toBeGreaterThan(0);
      expect(NV04_ZIP_CODES.map((z) => z.zip)).toContain(demo.profile.zipCode);
    });
  });

  it('contains verified NV-04 zip codes', () => {
    const zips = NV04_ZIP_CODES.map((z) => z.zip);
    expect(zips).toContain('89030');
    expect(zips).toContain('89031');
    expect(zips).toContain('89032');
    expect(zips).toContain('89081');
    expect(zips).toContain('89115');
  });

  it('evaluates personalized eligibility accurately from a demo user profile', () => {
    const elena = DEMO_PROFILES.find((d) => d.id === 'demo-elena')!;
    expect(elena).toBeDefined();

    const evaluations = evaluateProgrammaticEligibility(
      {
        householdSize: elena.profile.householdSize,
        monthlyIncome: elena.profile.monthlyIncome,
        zipCode: elena.profile.zipCode,
        housingStatus: elena.profile.housingStatus,
        hasPastDueUtility: elena.profile.hasPastDueUtility,
        hasDisconnectNotice: elena.profile.hasDisconnectNotice,
        hasChildren: elena.profile.hasChildren,
        hasSeniors: elena.profile.hasSeniors,
        hasDisability: elena.profile.hasDisability,
      },
      'en'
    );

    const qualified = evaluations.filter((e) => e.status === 'QUALIFIED');
    expect(qualified.length).toBeGreaterThanOrEqual(2);

    // Elena has household size 3 and income $1,850, well under 150% FPL ceiling ($3,227)
    const fpl150 = getMonthlyFplThreshold(3, 150);
    expect(elena.profile.monthlyIncome).toBeLessThan(fpl150);
  });

  it('correctly handles veteran-specific circumstances in personalization', () => {
    const marcus = DEMO_PROFILES.find((d) => d.id === 'demo-marcus')!;
    expect(marcus.profile.isVeteran).toBe(true);
    expect(marcus.profile.householdSize).toBe(1);
    expect(marcus.profile.primaryNeeds).toContain('housing');
  });

  it('translates entire app for personalized languages (Spanish and Tagalog)', () => {
    const es = getTranslation('es');
    const tl = getTranslation('tl');

    expect(es.nav.home).toBe('Inicio');
    expect(es.nav.eligibility).toBe('Elegibilidad');
    expect(es.nav.intake).toBe('Trámite Directo');
    expect(es.auth.fullName).toBe('Nombre Completo');
    expect(es.categories.utility_assistance).toContain('Servicios');

    expect(tl.nav.home).toBe('Home');
    expect(tl.nav.eligibility).toBe('Pagiging Karapat-dapat');
    expect(tl.nav.intake).toBe('Direktang Aplikasyon');
    expect(tl.auth.fullName).toBe('Buong Pangalan');
    expect(tl.categories.food_assistance).toContain('Pagkain');

    // Tagalog demo profile (Rosario Cruz)
    const cruz = DEMO_PROFILES.find((d) => d.id === 'demo-cruz')!;
    expect(cruz.profile.preferredLanguage).toBe('tl');
  });
});
