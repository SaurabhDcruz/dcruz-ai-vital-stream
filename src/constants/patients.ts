export interface VitalStats {
  hr: number;
  bp: string;
  temp: string;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string;
  vitals: VitalStats;
  image: string;
}

export const PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'John Doe',
    age: 45,
    condition: 'Stable',
    vitals: { hr: 72, bp: '120/80', temp: '36.6°C' },
    image: 'https://picsum.photos/seed/xray1/800/600'
  },
  {
    id: 'p2',
    name: 'Jane Smith',
    age: 32,
    condition: 'Recovering',
    vitals: { hr: 68, bp: '115/75', temp: '36.8°C' },
    image: 'https://picsum.photos/seed/xray2/800/600'
  },
  {
    id: 'p3',
    name: 'Robert Brown',
    age: 58,
    condition: 'Critical',
    vitals: { hr: 95, bp: '140/90', temp: '38.2°C' },
    image: 'https://picsum.photos/seed/xray3/800/600'
  },
  {
    id: 'p4',
    name: 'Emily Davis',
    age: 27,
    condition: 'Observation',
    vitals: { hr: 75, bp: '110/70', temp: '37.1°C' },
    image: 'https://picsum.photos/seed/xray4/800/600'
  }
];
