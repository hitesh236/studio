
export type Customer = {
  id: string;
  name: string;
  gstin: string; // or '-'
  contact: {
    phone?: string;
    email?: string;
  };
  balanceDue: number;
  lastTransaction: Date;
  placeOfSupply: {
    code: string;
    state: string;
    abbr: string;
  };
};

const indianStatesMap: Record<string, { code: string; abbr: string }> = {
  'Maharashtra': { code: '27', abbr: 'MH' },
  'Karnataka': { code: '29', abbr: 'KA' },
  'Delhi': { code: '07', abbr: 'DL' },
  'Tamil Nadu': { code: '33', abbr: 'TN' },
  'Uttar Pradesh': { code: '09', abbr: 'UP' },
  'Gujarat': { code: '24', abbr: 'GJ' },
  'West Bengal': { code: '19', abbr: 'WB' },
  'Rajasthan': { code: '08', abbr: 'RJ' },
};

const customerNames = [
  "Innovate Solutions Ltd.", "Quantum Systems", "Synergy Creations", "Apex Logistics",
  "Starlight Fabrics", "Blue Ribbon Foods", "Venture Dynamics", "Peak Performance Co.",
  "Nexus Infotech", "Aarav Sharma", "Priya Patel", "Rohan Gupta", "Sunita Rao", "Vikram Singh"
];

const getRandomElement = <T>(arr: T[] | readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

function generateRandomGstin(stateCode: string): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const pan = Array(10).fill(null).map(() => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
    return `${stateCode}${pan}1Z${Math.floor(Math.random() * 9) + 1}`;
}


export const generateCustomerData = (): Customer[] => {
    const data: Customer[] = [];
    const now = new Date();

    for (let i = 0; i < 14; i++) {
        const name = customerNames[i];
        const isB2B = Math.random() > 0.3; // 70% chance of being B2B
        const stateName = getRandomElement(Object.keys(indianStatesMap));
        const placeOfSupply = indianStatesMap[stateName];

        const balanceRandom = Math.random();
        let balanceDue: number;
        if (balanceRandom < 0.7) { // 70% have dues
            balanceDue = Math.floor(Math.random() * 50000) + 5000;
        } else { // 30% have zero balance
            balanceDue = 0;
        }

        data.push({
            id: `cust-${1001 + i}`,
            name: name,
            gstin: isB2B ? generateRandomGstin(placeOfSupply.code) : '-',
            contact: {
                phone: `98${Math.floor(Math.random() * 90000000) + 10000000}`,
                email: `${name.split(' ')[0].toLowerCase()}@example.com`,
            },
            balanceDue,
            lastTransaction: new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000), // last 30 days
            placeOfSupply,
        });
    }
    return data;
}
