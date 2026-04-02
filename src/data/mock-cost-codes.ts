export interface TradeType {
  id: string;
  name: string;
}

export interface CostCode {
  id: string;
  code: string;
  description: string;
  tradeTypeId: string;
}

export interface WcCode {
  code: string;
  description: string;
}

export const TRADE_TYPES: TradeType[] = [
  { id: 'carpentry', name: 'Carpentry' },
  { id: 'electrical', name: 'Electrical' },
  { id: 'plumbing', name: 'Plumbing' },
  { id: 'concrete', name: 'Concrete' },
  { id: 'framing', name: 'Framing' },
  { id: 'roofing', name: 'Roofing' },
  { id: 'hvac', name: 'HVAC' },
  { id: 'painting', name: 'Painting' },
  { id: 'general_labor', name: 'General Labor' },
  { id: 'supervision', name: 'Supervision' },
];

export const COST_CODES: CostCode[] = [
  { id: 'cc-01', code: '01-100', description: 'Rough Carpentry', tradeTypeId: 'carpentry' },
  { id: 'cc-02', code: '01-200', description: 'Finish Carpentry', tradeTypeId: 'carpentry' },
  { id: 'cc-03', code: '02-100', description: 'Electrical Rough-In', tradeTypeId: 'electrical' },
  { id: 'cc-04', code: '02-200', description: 'Electrical Finish', tradeTypeId: 'electrical' },
  { id: 'cc-05', code: '03-100', description: 'Plumbing Rough-In', tradeTypeId: 'plumbing' },
  { id: 'cc-06', code: '03-200', description: 'Plumbing Finish', tradeTypeId: 'plumbing' },
  { id: 'cc-07', code: '04-100', description: 'Concrete Foundation', tradeTypeId: 'concrete' },
  { id: 'cc-08', code: '04-200', description: 'Concrete Flatwork', tradeTypeId: 'concrete' },
  { id: 'cc-09', code: '05-100', description: 'Wood Framing', tradeTypeId: 'framing' },
  { id: 'cc-10', code: '05-200', description: 'Steel Framing', tradeTypeId: 'framing' },
  { id: 'cc-11', code: '06-100', description: 'Roofing - Residential', tradeTypeId: 'roofing' },
  { id: 'cc-12', code: '06-200', description: 'Roofing - Commercial', tradeTypeId: 'roofing' },
  { id: 'cc-13', code: '07-100', description: 'HVAC Install', tradeTypeId: 'hvac' },
  { id: 'cc-14', code: '07-200', description: 'HVAC Service', tradeTypeId: 'hvac' },
  { id: 'cc-15', code: '08-100', description: 'Interior Painting', tradeTypeId: 'painting' },
  { id: 'cc-16', code: '08-200', description: 'Exterior Painting', tradeTypeId: 'painting' },
  { id: 'cc-17', code: '09-100', description: 'General Labor', tradeTypeId: 'general_labor' },
  { id: 'cc-18', code: '09-200', description: 'Site Cleanup', tradeTypeId: 'general_labor' },
  { id: 'cc-19', code: '10-100', description: 'Project Supervision', tradeTypeId: 'supervision' },
  { id: 'cc-20', code: '10-200', description: 'Site Foreman', tradeTypeId: 'supervision' },
];

export const WC_CODES: WcCode[] = [
  { code: '5403', description: 'Carpentry - NOC' },
  { code: '5190', description: 'Electrical Wiring' },
  { code: '5183', description: 'Plumbing - NOC' },
  { code: '5213', description: 'Concrete Work' },
  { code: '5403', description: 'Framing - Wood' },
  { code: '5551', description: 'Roofing' },
  { code: '5537', description: 'HVAC' },
  { code: '5474', description: 'Painting' },
  { code: '5606', description: 'General Labor - Construction' },
  { code: '5606', description: 'Supervision - Construction' },
];

export function getCostCodesForTrade(tradeTypeId: string): CostCode[] {
  return COST_CODES.filter((cc) => cc.tradeTypeId === tradeTypeId);
}
