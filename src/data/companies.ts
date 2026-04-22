export interface Company {
  id: string
  name: string
  location: string
  accountId: string
}

export const COMPANIES: Company[] = [
  { id: 'farrell-construction', name: 'Farrell Construction LLC', location: 'Austin, TX', accountId: '2109384756' },
  { id: 'farrell-roofing', name: 'Farrell Roofing Inc.', location: 'Houston, TX', accountId: '2109384756' },
  { id: 'fc-holding', name: 'FC Holding Group', location: 'Dallas, TX', accountId: '2109384756' },
]
