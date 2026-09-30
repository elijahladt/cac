import { Resource, Program, SupportedLanguage } from '../types';

export const VERIFIED_RESOURCES: Resource[] = [
  {
    id: 'res-nv-energy-reach',
    name: 'NV Energy — Project REACH Assistance',
    category: 'utility_assistance',
    description:
      'Emergency energy bill payment assistance administered in partnership with local human services to prevent electric service disconnection for vulnerable low-income families and individuals in North Las Vegas.',
    address: '6226 W Sahara Ave',
    city: 'North Las Vegas',
    state: 'NV',
    zip: '89030',
    latitude: 36.1444,
    longitude: -115.2289,
    phone: '(702) 402-5555',
    website: 'https://www.nvenergy.com/account-services/assistance-programs/project-reach',
    hours: 'Mon - Fri: 8:00 AM - 5:00 PM',
    languages: ['en', 'es'],
    source_url: 'https://www.nvenergy.com/account-services/assistance-programs/project-reach',
    verification_status: 'VERIFIED',
    last_verified_at: '2026-09-25T00:00:00Z',
  },
  {
    id: 'res-state-dwss-liheap',
    name: 'Nevada DWSS — Energy Assistance Program (LIHEAP)',
    category: 'utility_assistance',
    description:
      'State of Nevada annual energy grants helping eligible low-income households pay electric and natural gas utility bills, plus emergency fast-track crisis grants for households facing imminent shutoff.',
    address: '700 Belrose St',
    city: 'North Las Vegas',
    state: 'NV',
    zip: '89032',
    latitude: 36.1798,
    longitude: -115.1764,
    phone: '(702) 486-1404',
    website: 'https://dwss.nv.gov/Energy/1_Energy_Assistance/',
    hours: 'Mon - Fri: 8:00 AM - 5:00 PM',
    languages: ['en', 'es', 'tl'],
    source_url: 'https://dwss.nv.gov/Energy/1_Energy_Assistance/',
    verification_status: 'VERIFIED',
    last_verified_at: '2026-09-23T00:00:00Z',
  },
  {
    id: 'res-three-square',
    name: 'Three Square Food Bank — North Las Vegas Campus',
    category: 'food_assistance',
    description:
      'Southern Nevada’s largest food bank. Operates warehouse grocery distribution, mobile pantries, childhood nutrition meal packs, and on-site bilingual SNAP/Food Stamps application counselors.',
    address: '4190 N Pecos Rd',
    city: 'North Las Vegas',
    state: 'NV',
    zip: '89030',
    latitude: 36.2361,
    longitude: -115.0978,
    phone: '(702) 644-3663',
    website: 'https://www.threesquare.org/',
    hours: 'Mon - Fri: 8:30 AM - 4:30 PM',
    languages: ['en', 'es', 'tl'],
    source_url: 'https://www.threesquare.org/',
    verification_status: 'VERIFIED',
    last_verified_at: '2026-09-26T00:00:00Z',
  },
  {
    id: 'res-just-one-project',
    name: 'The Just One Project — Community Food Market',
    category: 'food_assistance',
    description:
      'Community-centered food pantry offering dignified grocery shopping, fresh organic produce, pantry staples, and direct assistance for families with school-aged children and senior citizens.',
    address: '4001 E Craig Rd',
    city: 'North Las Vegas',
    state: 'NV',
    zip: '89030',
    latitude: 36.2396,
    longitude: -115.0894,
    phone: '(702) 462-2253',
    website: 'https://thejustoneproject.org/',
    hours: 'Tue, Thu, Sat: 9:00 AM - 1:00 PM',
    languages: ['en', 'es'],
    source_url: 'https://thejustoneproject.org/',
    verification_status: 'VERIFIED',
    last_verified_at: '2026-09-21T00:00:00Z',
  },
  {
    id: 'res-nlv-neighborhood-services',
    name: 'City of North Las Vegas — Neighborhood & Housing Services',
    category: 'housing',
    description:
      'Municipal department offering emergency eviction diversion, rental relief grants, tenant rights counseling, and down-payment assistance programs for North Las Vegas residents.',
    address: '2250 Las Vegas Blvd N',
    city: 'North Las Vegas',
    state: 'NV',
    zip: '89030',
    latitude: 36.2001,
    longitude: -115.1172,
    phone: '(702) 633-1532',
    website: 'https://www.cityofnorthlasvegas.com/departments/neighborhood-services',
    hours: 'Mon - Thu: 8:00 AM - 5:45 PM',
    languages: ['en', 'es', 'tl'],
    source_url: 'https://www.cityofnorthlasvegas.com/',
    verification_status: 'VERIFIED',
    last_verified_at: '2026-09-24T00:00:00Z',
  },
  {
    id: 'res-clark-county-social-services',
    name: 'Clark County Social Services — North Las Vegas Office',
    category: 'housing',
    description:
      'County financial assistance for low-income residents, emergency short-term housing, long-term case management, and burial assistance.',
    address: '1600 E Carey Ave',
    city: 'North Las Vegas',
    state: 'NV',
    zip: '89030',
    latitude: 36.2052,
    longitude: -115.1294,
    phone: '(702) 455-4270',
    website: 'https://www.clarkcountynv.gov/residents/assistance_programs/',
    hours: 'Mon - Fri: 8:00 AM - 5:00 PM',
    languages: ['en', 'es'],
    source_url: 'https://www.clarkcountynv.gov/',
    verification_status: 'VERIFIED',
    last_verified_at: '2026-09-22T00:00:00Z',
  },
  {
    id: 'res-snhd-east-las-vegas',
    name: 'Southern Nevada Health District — North Las Vegas Clinic',
    category: 'healthcare',
    description:
      'Public community clinic providing low-cost or sliding-scale primary medical checkups, immunizations, family planning, tuberculosis screening, and health card exams.',
    address: '955 W Craig Rd',
    city: 'North Las Vegas',
    state: 'NV',
    zip: '89032',
    latitude: 36.2393,
    longitude: -115.1557,
    phone: '(702) 759-1000',
    website: 'https://www.southernnevadahealthdistrict.org/',
    hours: 'Mon - Thu: 8:00 AM - 4:30 PM',
    languages: ['en', 'es', 'tl'],
    source_url: 'https://www.southernnevadahealthdistrict.org/',
    verification_status: 'VERIFIED',
    last_verified_at: '2026-09-20T00:00:00Z',
  },
  {
    id: 'res-nevada-jobconnect-nlv',
    name: 'Nevada JobConnect — North Las Vegas Career Center',
    category: 'jobs',
    description:
      'State-run workforce development center offering free bilingual job matching, resume writing clinics, vocational retraining tuition grants, and veteran employment specialists.',
    address: '2827 Las Vegas Blvd N',
    city: 'North Las Vegas',
    state: 'NV',
    zip: '89030',
    latitude: 36.2114,
    longitude: -115.1092,
    phone: '(702) 486-0100',
    website: 'https://nevadajobconnect.com/',
    hours: 'Mon - Fri: 8:00 AM - 5:00 PM',
    languages: ['en', 'es'],
    source_url: 'https://nevadajobconnect.com/',
    verification_status: 'VERIFIED',
    last_verified_at: '2026-09-25T00:00:00Z',
  },
  {
    id: 'res-rtc-transit-nlv',
    name: 'RTC Southern Nevada — Paratransit & Reduced Fare Center',
    category: 'transportation',
    description:
      'Public transportation agency providing reduced-fare bus passes for low-income seniors, students, and persons with disabilities, along with specialized door-to-door paratransit.',
    address: '600 S Grand Central Pkwy',
    city: 'Las Vegas',
    state: 'NV',
    zip: '89106',
    latitude: 36.1627,
    longitude: -115.1539,
    phone: '(702) 228-7433',
    website: 'https://www.rtcsnv.com/',
    hours: 'Daily: 7:00 AM - 6:00 PM',
    languages: ['en', 'es'],
    source_url: 'https://www.rtcsnv.com/',
    verification_status: 'VERIFIED',
    last_verified_at: '2026-09-23T00:00:00Z',
  },
  {
    id: 'res-acelero-head-start',
    name: 'Acelero Learning — North Las Vegas Head Start Center',
    category: 'childcare',
    description:
      'Federally funded free early childhood education, preschool, nutrition programs, and family support services for children aged 0–5 from low-income families.',
    address: '213 E Azure Ave',
    city: 'North Las Vegas',
    state: 'NV',
    zip: '89081',
    latitude: 36.2731,
    longitude: -115.1384,
    phone: '(702) 399-5282',
    website: 'https://www.acelero.net/clark-county-nv/',
    hours: 'Mon - Fri: 7:30 AM - 4:00 PM',
    languages: ['en', 'es', 'tl'],
    source_url: 'https://www.acelero.net/',
    verification_status: 'VERIFIED',
    last_verified_at: '2026-09-24T00:00:00Z',
  },
];

export const RESOURCE_TRANSLATIONS: Record<
  string,
  Record<SupportedLanguage, { name: string; description: string; whyThisResource?: string }>
> = {
  'res-nv-energy-reach': {
    en: {
      name: 'NV Energy — Project REACH Assistance',
      description:
        'Emergency energy bill payment assistance administered in partnership with local human services to prevent electric service disconnection for vulnerable low-income families and individuals in North Las Vegas.',
      whyThisResource: 'Direct match for utility assistance in North Las Vegas.',
    },
    es: {
      name: 'NV Energy — Asistencia de Proyecto REACH',
      description:
        'Asistencia de emergencia para el pago de facturas de energía, administrada en colaboración con servicios humanos locales para prevenir la desconexión del servicio eléctrico para familias e individuos de bajos ingresos en North Las Vegas.',
      whyThisResource: 'Ayuda directa para facturas de electricidad en North Las Vegas.',
    },
    tl: {
      name: 'NV Energy — Tulong sa Project REACH',
      description:
        'Pang-emerhensiyang tulong sa pagbabayad ng kuryente sa pakikipagtulungan sa mga lokal na serbisyo upang maiwasan ang pagkaputol ng kuryente para sa mga pamilya sa North Las Vegas.',
      whyThisResource: 'Direktang tulong para sa bayarin sa kuryente sa North Las Vegas.',
    },
  },
  'res-state-dwss-liheap': {
    en: {
      name: 'Nevada DWSS — Energy Assistance Program (LIHEAP)',
      description:
        'State of Nevada annual energy grants helping eligible low-income households pay electric and natural gas utility bills, plus emergency fast-track crisis grants for households facing imminent shutoff.',
      whyThisResource: 'State energy grant program offering crisis assistance.',
    },
    es: {
      name: 'Nevada DWSS — Programa de Asistencia de Energía (LIHEAP)',
      description:
        'Subsidios anuales de energía del Estado de Nevada que ayudan a los hogares de bajos ingresos a pagar las facturas de electricidad y gas natural, además de subsidios de crisis de emergencia para hogares que enfrentan un corte inminente.',
      whyThisResource: 'Programa estatal de energía que ofrece subsidios de crisis.',
    },
    tl: {
      name: 'Nevada DWSS — Programa sa Tulong sa Enerhiya (LIHEAP)',
      description:
        'Taunang tulong pinansyal sa enerhiya mula sa Estado ng Nevada upang tulungan ang mga kwalipikadong pamilya sa bayarin sa kuryente at gas, pati na ang emergency crisis grant kung mapuputulan na.',
      whyThisResource: 'Programa ng estado para sa tulong sa kuryente at gas.',
    },
  },
  'res-three-square': {
    en: {
      name: 'Three Square Food Bank — North Las Vegas Campus',
      description:
        'Southern Nevada’s largest food bank. Operates warehouse grocery distribution, mobile pantries, childhood nutrition meal packs, and on-site bilingual SNAP/Food Stamps application counselors.',
      whyThisResource: 'Direct food assistance with fresh produce and groceries.',
    },
    es: {
      name: 'Banco de Alimentos Three Square — Campus North Las Vegas',
      description:
        'El banco de alimentos más grande del sur de Nevada. Opera distribución de comestibles, despensas móviles, paquetes de nutrición infantil y consejeros bilingües de SNAP/estampillas de comida.',
      whyThisResource: 'Asistencia directa de alimentos con productos frescos y despensa.',
    },
    tl: {
      name: 'Three Square Food Bank — Campus sa North Las Vegas',
      description:
        'Ang pinakamalaking food bank sa Southern Nevada. Namamahagi ng libreng grocery, mga pagkain para sa mga bata, at may tagapayo para sa SNAP/Food Stamps.',
      whyThisResource: 'Direktang tulong sa pagkain at sariwang ani.',
    },
  },
  'res-just-one-project': {
    en: {
      name: 'The Just One Project — Community Food Market',
      description:
        'Community-centered food pantry offering dignified grocery shopping, fresh organic produce, pantry staples, and direct assistance for families with school-aged children and senior citizens.',
      whyThisResource: 'Free fresh produce and groceries for local families.',
    },
    es: {
      name: 'The Just One Project — Mercado Comunitario de Alimentos',
      description:
        'Despensa de alimentos comunitaria que ofrece compras dignas de comestibles, productos frescos, alimentos básicos y asistencia directa para familias con niños en edad escolar y adultos mayores.',
      whyThisResource: 'Alimentos y productos frescos gratuitos para familias locales.',
    },
    tl: {
      name: 'The Just One Project — Pamilihan ng Pagkain sa Komunidad',
      description:
        'Pampamayanang pamilihan ng pagkain na nag-aalok ng sariwang gulay, prutas, at mga pangunahing pagkain para sa mga pamilya at senior citizens.',
      whyThisResource: 'Libreng sariwang pagkain para sa mga pamilya.',
    },
  },
  'res-nlv-neighborhood-services': {
    en: {
      name: 'City of North Las Vegas — Neighborhood & Housing Services',
      description:
        'Municipal department offering emergency eviction diversion, rental relief grants, tenant rights counseling, and down-payment assistance programs for North Las Vegas residents.',
      whyThisResource: 'Direct eviction prevention and emergency rental assistance.',
    },
    es: {
      name: 'Ciudad de North Las Vegas — Servicios de Vecindario y Vivienda',
      description:
        'Departamento municipal que ofrece prevención de desalojos de emergencia, subsidios de alivio de alquiler, asesoría de derechos de inquilinos y programas de asistencia para residentes de North Las Vegas.',
      whyThisResource: 'Prevención directa de desalojos y asistencia de alquiler.',
    },
    tl: {
      name: 'Lungsod ng North Las Vegas — Serbisyong Pabahay at Pamayanan',
      description:
        'Departamento ng lungsod na nag-aalok ng tulong upang maiwasan ang pagpapaalis sa bahay, pambayad sa upa, at payo sa karapatan ng nangungupahan sa North Las Vegas.',
      whyThisResource: 'Direktang tulong sa pag-iwas sa pagpapaalis at pambayad sa upa.',
    },
  },
  'res-clark-county-social-services': {
    en: {
      name: 'Clark County Social Services — North Las Vegas Office',
      description:
        'County financial assistance for low-income residents, emergency short-term housing, long-term case management, and burial assistance.',
      whyThisResource: 'Comprehensive emergency housing, utility, and basic needs support.',
    },
    es: {
      name: 'Servicios Sociales del Condado de Clark — Oficina North Las Vegas',
      description:
        'Asistencia financiera del condado para residentes de bajos ingresos, vivienda de emergencia a corto plazo, gestión de casos a largo plazo y asistencia funeraria.',
      whyThisResource: 'Apoyo integral de vivienda de emergencia y necesidades básicas.',
    },
    tl: {
      name: 'Clark County Social Services — Tanggapan sa North Las Vegas',
      description:
        'Tulong pinansyal mula sa county para sa pansamantalang tirahan, pamamahala ng kaso, at tulong sa mga pangunahing pangangailangan.',
      whyThisResource: 'Komprehensibong tulong sa emergency housing at bayarin.',
    },
  },
  'res-snhd-east-las-vegas': {
    en: {
      name: 'Southern Nevada Health District — North Las Vegas Clinic',
      description:
        'Public community clinic providing low-cost or sliding-scale primary medical checkups, immunizations, family planning, tuberculosis screening, and health card exams.',
      whyThisResource: 'Low-cost healthcare clinic with sliding scale fees.',
    },
    es: {
      name: 'Distrito de Salud del Sur de Nevada — Clínica North Las Vegas',
      description:
        'Clínica comunitaria pública que ofrece chequeos médicos primarios de bajo costo o a escala variable según ingresos, vacunas, planificación familiar y exámenes de salud.',
      whyThisResource: 'Clínica de salud de bajo costo con tarifas según ingresos.',
    },
    tl: {
      name: 'Southern Nevada Health District — Klinika sa North Las Vegas',
      description:
        'Pampublikong klinika na nagbibigay ng abot-kayang checkup, bakuna, pagpaplano ng pamilya, at serbisyong medikal batay sa kakayahang magbayad.',
      whyThisResource: 'Mababang bayad sa klinika batay sa kita ng pamilya.',
    },
  },
  'res-nevada-jobconnect-nlv': {
    en: {
      name: 'Nevada JobConnect — North Las Vegas Career Center',
      description:
        'State-run workforce development center offering free bilingual job matching, resume writing clinics, vocational retraining tuition grants, and veteran employment specialists.',
      whyThisResource: 'Free job search assistance, resume help, and vocational training grants.',
    },
    es: {
      name: 'Nevada JobConnect — Centro de Empleo North Las Vegas',
      description:
        'Centro estatal de desarrollo laboral que ofrece búsqueda de empleo bilingüe gratuita, talleres de redacción de currículum, subsidios de capacitación vocacional y especialistas para veteranos.',
      whyThisResource: 'Asistencia gratuita para encontrar trabajo y capacitación laboral.',
    },
    tl: {
      name: 'Nevada JobConnect — Sentro ng Trabaho sa North Las Vegas',
      description:
        'Sentro ng trabaho ng estado na nagbibigay ng libreng tulong sa paghahanap ng trabaho, paggawa ng resume, at tulong sa pagsasanay bokasyonal.',
      whyThisResource: 'Libreng tulong sa paghahanap ng trabaho at pagsasanay.',
    },
  },
  'res-rtc-transit-nlv': {
    en: {
      name: 'RTC Southern Nevada — Paratransit & Reduced Fare Center',
      description:
        'Public transportation agency providing reduced-fare bus passes for low-income seniors, students, and persons with disabilities, along with specialized door-to-door paratransit.',
      whyThisResource: 'Discounted bus transit passes and paratransit mobility support.',
    },
    es: {
      name: 'RTC Southern Nevada — Centro de Tránsito y Tarifas Reducidas',
      description:
        'Agencia de transporte público que proporciona pases de autobús con tarifa reducida para personas de la tercera edad de bajos ingresos, estudiantes y personas con discapacidades, además de paratránsito.',
      whyThisResource: 'Pases de autobús con descuento y apoyo de transporte.',
    },
    tl: {
      name: 'RTC Southern Nevada — Sentro ng Murang Pasahe at Transit',
      description:
        'Ahensya ng pampublikong transportasyon na nagbibigay ng murang pasahe sa bus para sa mga senior, estudyante, at may kapansanan.',
      whyThisResource: 'May diskwentong bus pass at tulong sa transportasyon.',
    },
  },
  'res-acelero-head-start': {
    en: {
      name: 'Acelero Learning — North Las Vegas Head Start Center',
      description:
        'Federally funded free early childhood education, preschool, nutrition programs, and family support services for children aged 0–5 from low-income families.',
      whyThisResource: 'Free early childhood education, preschool, and nutritional meals.',
    },
    es: {
      name: 'Acelero Learning — Centro Head Start North Las Vegas',
      description:
        'Educación temprana y preescolar gratuita financiada por el gobierno federal, programas de nutrición y servicios de apoyo familiar para niños de 0 a 5 años de familias de bajos ingresos.',
      whyThisResource: 'Educación preescolar gratuita y comidas nutritivas para niños pequeños.',
    },
    tl: {
      name: 'Acelero Learning — Sentro ng Head Start sa North Las Vegas',
      description:
        'Libreng edukasyon sa maagang pagkabata, preschool, programa sa nutrisyon, at suporta sa pamilya para sa mga batang 0-5 taong gulang.',
      whyThisResource: 'Libreng preschool at masustansyang pagkain para sa mga bata.',
    },
  },
};

export const VERIFIED_PROGRAMS: Program[] = [
  {
    id: 'prog-reach-emergency-grant',
    resource_id: 'res-nv-energy-reach',
    name: 'Project REACH Disconnection Prevention Grant',
    description:
      'Direct grant applied directly to delinquent NV Energy utility accounts to stop disconnection or restore electricity for vulnerable households.',
    eligibility_summary:
      'Must have an active NV Energy account, past due balance, reside in service territory, and household income below 200% Federal Poverty Line or proof of hardship.',
    income_limit_pct_fpl: 200,
    required_documents: [
      'Past-due NV Energy utility bill showing account number & service address',
      'Government-issued Photo ID (Nevada Driver License or ID Card)',
      'Proof of last 30 days household gross income (pay stubs, benefit award letters)',
    ],
    application_url: 'https://www.nvenergy.com/account-services/assistance-programs/project-reach',
    languages: ['en', 'es'],
    verification_status: 'VERIFIED',
    last_verified_at: '2026-09-25T00:00:00Z',
  },
  {
    id: 'prog-liheap-crisis',
    resource_id: 'res-state-dwss-liheap',
    name: 'State of Nevada LIHEAP Fast-Track Crisis Benefit',
    description:
      'Expedited emergency assistance grant processed within 48 hours for households facing imminent electric or gas shutoff, or already disconnected.',
    eligibility_summary:
      'Nevada resident, household gross income at or below 150% of the Federal Poverty Level, must be responsible for home heating/cooling costs with disconnection notice.',
    income_limit_pct_fpl: 150,
    required_documents: [
      'Past-due energy bill with 48-hour shut-off notice or disconnect date',
      'Proof of Nevada residency (lease agreement or recent utility bill)',
      'Proof of identity and Social Security numbers for all household members',
      'Proof of all income received in the prior 30 days',
    ],
    application_url: 'https://dwss.nv.gov/Energy/1_Energy_Assistance/',
    languages: ['en', 'es', 'tl'],
    verification_status: 'VERIFIED',
    last_verified_at: '2026-09-23T00:00:00Z',
  },
  {
    id: 'prog-three-square-pantry',
    resource_id: 'res-three-square',
    name: 'Community Food Pantry & Fresh Produce Box',
    description:
      'No-cost emergency groceries, canned goods, rice, milk, meat, and fresh fruits/vegetables for families experiencing food scarcity.',
    eligibility_summary:
      'Open to any Nevada resident in need. No income verification or photo ID required to receive immediate emergency food package.',
    required_documents: [
      'Self-attestation of need (no paperwork strictly required for same-day food parcel)',
    ],
    application_url: 'https://www.threesquare.org/find-food',
    languages: ['en', 'es', 'tl'],
    verification_status: 'VERIFIED',
    last_verified_at: '2026-09-26T00:00:00Z',
  },
];

export const PROGRAM_TRANSLATIONS: Record<
  string,
  Record<SupportedLanguage, { name: string; description: string }>
> = {
  'prog-reach-emergency-grant': {
    en: {
      name: 'Project REACH Disconnection Prevention Grant',
      description:
        'Direct grant applied directly to delinquent NV Energy utility accounts to stop disconnection or restore electricity for vulnerable households.',
    },
    es: {
      name: 'Subsidio de Prevención de Desconexión de Proyecto REACH',
      description:
        'Subsidio directo aplicado a cuentas vencidas de NV Energy para detener la desconexión o restablecer el servicio eléctrico.',
    },
    tl: {
      name: 'Project REACH Grant Laban sa Pagkaputol ng Kuryente',
      description:
        'Direktang tulong pinansyal na inilalapat sa bayarin sa NV Energy upang maiwasan ang pagkaputol o ibalik ang kuryente.',
    },
  },
  'prog-liheap-crisis': {
    en: {
      name: 'State of Nevada LIHEAP Fast-Track Crisis Benefit',
      description:
        'Expedited emergency assistance grant processed within 48 hours for households facing imminent electric or gas shutoff, or already disconnected.',
    },
    es: {
      name: 'Beneficio de Crisis de Vía Rápida LIHEAP de Nevada',
      description:
        'Subsidio de emergencia procesado en 48 horas para hogares que enfrentan un corte inminente de luz o gas, o ya están desconectados.',
    },
    tl: {
      name: 'LIHEAP Fast-Track Crisis Benefit ng Estado ng Nevada',
      description:
        'Mabilisang tulong na pangkagipitan na pinoproseso sa loob ng 48 oras para sa mga pamilyang mapuputulan ng kuryente o gas.',
    },
  },
  'prog-three-square-pantry': {
    en: {
      name: 'Community Food Pantry & Fresh Produce Box',
      description:
        'No-cost emergency groceries, canned goods, rice, milk, meat, and fresh fruits/vegetables for families experiencing food scarcity.',
    },
    es: {
      name: 'Despensa Comunitaria y Caja de Productos Frescos',
      description:
        'Comestibles de emergencia sin costo, alimentos enlatados, arroz, leche, carne y frutas y verduras frescas para familias necesitadas.',
    },
    tl: {
      name: 'Pampamayanang Pamilihan ng Pagkain at Sariwang Ani',
      description:
        'Libreng pagkain sa oras ng kagipitan, mga de-lata, bigas, gatas, karne, at sariwang prutas at gulay para sa mga pamilya.',
    },
  },
};

export function getLocalizedResource(res: Resource, lang: SupportedLanguage): Resource {
  const trans = RESOURCE_TRANSLATIONS[res.id]?.[lang];
  if (!trans) return res;
  return {
    ...res,
    name: trans.name || res.name,
    description: trans.description || res.description,
    whyThisResource: trans.whyThisResource || res.whyThisResource,
  };
}

export function getLocalizedProgram(prog: Program, lang: SupportedLanguage): Program {
  const trans = PROGRAM_TRANSLATIONS[prog.id]?.[lang];
  if (!trans) return prog;
  return {
    ...prog,
    name: trans.name || prog.name,
    description: trans.description || prog.description,
  };
}
