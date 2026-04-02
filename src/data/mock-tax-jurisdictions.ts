export interface ReciprocityAgreement {
  homeState: string;
  workState: string;
  description: string;
}

export interface LocalTaxJurisdiction {
  name: string;
  state: string;
  zipCodes: string[];
  residentRate: number;
  nonResidentRate: number;
}

export const US_STATES = [
  { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' }, { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' }, { code: 'GA', name: 'Georgia' },
  { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
  { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' },
  { code: 'IA', name: 'Iowa' }, { code: 'KS', name: 'Kansas' },
  { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
  { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' },
  { code: 'MA', name: 'Massachusetts' }, { code: 'MI', name: 'Michigan' },
  { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
  { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' },
  { code: 'NE', name: 'Nebraska' }, { code: 'NV', name: 'Nevada' },
  { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
  { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' },
  { code: 'NC', name: 'North Carolina' }, { code: 'ND', name: 'North Dakota' },
  { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
  { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' },
  { code: 'RI', name: 'Rhode Island' }, { code: 'SC', name: 'South Carolina' },
  { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
  { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' },
  { code: 'VT', name: 'Vermont' }, { code: 'VA', name: 'Virginia' },
  { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
  { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' },
  { code: 'DC', name: 'District of Columbia' },
] as const;

export const RECIPROCITY_AGREEMENTS: ReciprocityAgreement[] = [
  { homeState: 'PA', workState: 'OH', description: 'Pennsylvania and Ohio have a reciprocal tax agreement. The employee can file Form IT-4NR to be exempt from Ohio withholding.' },
  { homeState: 'OH', workState: 'PA', description: 'Ohio and Pennsylvania have a reciprocal tax agreement. The employee can file REV-419 to be exempt from Pennsylvania withholding.' },
  { homeState: 'PA', workState: 'NJ', description: 'Pennsylvania and New Jersey have a reciprocal tax agreement. The employee can file NJ-165 to be exempt from New Jersey withholding.' },
  { homeState: 'NJ', workState: 'PA', description: 'New Jersey and Pennsylvania have a reciprocal tax agreement. The employee can file REV-420 to be exempt from Pennsylvania withholding.' },
  { homeState: 'MD', workState: 'DC', description: 'Maryland and DC have a reciprocal tax agreement. The employee can file D-4A to be exempt from DC withholding.' },
  { homeState: 'DC', workState: 'MD', description: 'DC and Maryland have a reciprocal tax agreement. The employee can file MW507 to be exempt from Maryland withholding.' },
  { homeState: 'VA', workState: 'DC', description: 'Virginia and DC have a reciprocal tax agreement. The employee can file D-4A to be exempt from DC withholding.' },
  { homeState: 'DC', workState: 'VA', description: 'DC and Virginia have a reciprocal tax agreement. The employee can file VA-4 to be exempt from Virginia withholding.' },
  { homeState: 'IL', workState: 'WI', description: 'Illinois and Wisconsin have a reciprocal tax agreement. The employee can file W-220 to be exempt from Wisconsin withholding.' },
  { homeState: 'WI', workState: 'IL', description: 'Wisconsin and Illinois have a reciprocal tax agreement. The employee can file IL-W-5-NR to be exempt from Illinois withholding.' },
];

export const LOCAL_TAX_JURISDICTIONS: LocalTaxJurisdiction[] = [
  { name: 'Philadelphia Wage Tax', state: 'PA', zipCodes: ['19101', '19102', '19103', '19104', '19106', '19107', '19109', '19111', '19114', '19115', '19116', '19118', '19119', '19120', '19121', '19122', '19123', '19124', '19125', '19126', '19127', '19128', '19129', '19130', '19131', '19132', '19133', '19134', '19135', '19136', '19137', '19138', '19139', '19140', '19141', '19142', '19143', '19144', '19145', '19146', '19147', '19148', '19149', '19150', '19151', '19152', '19153', '19154'], residentRate: 3.75, nonResidentRate: 3.44 },
  { name: 'Columbus RITA', state: 'OH', zipCodes: ['43085', '43201', '43202', '43203', '43204', '43205', '43206', '43207', '43209', '43210', '43211', '43212', '43213', '43214', '43215', '43216', '43217', '43218', '43219', '43220', '43221', '43222', '43223', '43224', '43226', '43227', '43228', '43229', '43230', '43231', '43232', '43234', '43235', '43236'], residentRate: 2.5, nonResidentRate: 2.5 },
  { name: 'Pittsburgh Earned Income Tax', state: 'PA', zipCodes: ['15201', '15203', '15204', '15205', '15206', '15207', '15208', '15209', '15210', '15211', '15212', '15213', '15214', '15215', '15216', '15217', '15218', '15219', '15220', '15221', '15222', '15223', '15224', '15225', '15226', '15227', '15228', '15229', '15230', '15231', '15232', '15233', '15234', '15235', '15236', '15237', '15238', '15239', '15240'], residentRate: 3.0, nonResidentRate: 1.0 },
  { name: 'Louisville Metro Revenue', state: 'KY', zipCodes: ['40201', '40202', '40203', '40204', '40205', '40206', '40207', '40208', '40209', '40210', '40211', '40212', '40213', '40214', '40215', '40216', '40217', '40218', '40219', '40220'], residentRate: 2.2, nonResidentRate: 1.45 },
  { name: 'PA School District Tax', state: 'PA', zipCodes: ['19001', '19002', '19003', '19004', '19006', '19007', '19008', '19009', '19010', '19012', '19013', '19014', '19015', '19018', '19020', '19021', '19022', '19023', '19025', '19026', '19027', '19029', '19030', '19031', '19032', '19033', '19034', '19035', '19036', '19038'], residentRate: 0.5, nonResidentRate: 0.0 },
];

export const NO_INCOME_TAX_STATES = ['AK', 'FL', 'NV', 'NH', 'SD', 'TN', 'TX', 'WA', 'WY'];

export function findReciprocity(homeState: string, workState: string): ReciprocityAgreement | undefined {
  return RECIPROCITY_AGREEMENTS.find(
    (a) => a.homeState === homeState && a.workState === workState
  );
}

export function findLocalTaxes(state: string, zip: string): LocalTaxJurisdiction[] {
  return LOCAL_TAX_JURISDICTIONS.filter(
    (j) => j.state === state && j.zipCodes.includes(zip)
  );
}

export function isNoIncomeTaxState(stateCode: string): boolean {
  return NO_INCOME_TAX_STATES.includes(stateCode);
}

export function getStateName(code: string): string {
  return US_STATES.find((s) => s.code === code)?.name ?? code;
}
