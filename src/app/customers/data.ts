
export type Customer = {
  id: string;
  name: string; // Person's name
  company?: string; // Optional company name
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

const companyNames = [
  "Innovate Solutions Ltd.", "Quantum Systems", "Synergy Creations", "Apex Logistics",
];
const personNames = [
    "Aarav Sharma", "Priya Patel", "Rohan Gupta", "Sunita Rao", "Vikram Singh",
    "Aditi Chavan", "Rajesh Kumar", "Meera Desai", "Sanjay Reddy", "Anjali Mehta",
    "Karan Malhotra", "Pooja Hegde", "Arjun Nair", "Sneha Iyer", "Vivek Anand"
];

const getDeterministicElement = <T>(arr: T[] | readonly T[], index: number): T => arr[index % arr.length];

function generateDeterministicGstin(stateCode: string, index: number): string {
    const panChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pan = '';
    for (let i = 0; i < 10; i++) {
        pan += panChars.charAt((index + i * 5) % panChars.length);
    }
    return `${stateCode}${pan}1Z${(index % 9) + 1}`;
}


export const generateCustomerData = (count?: number): Customer[] => {
    const data: Customer[] = [];
    const now = new Date();
    const allEntities = [...personNames, ...companyNames];
    const totalCount = count || allEntities.length;

    for (let i = 0; i < totalCount; i++) {
        const entityName = allEntities[i % allEntities.length];
        const isCompany = companyNames.includes(entityName);
        
        const stateName = getDeterministicElement(Object.keys(indianStatesMap), i);
        const placeOfSupply = indianStatesMap[stateName];
        
        let name: string;
        let company: string | undefined;

        if (isCompany) {
            company = entityName;
            name = getDeterministicElement(personNames, i); // A contact person for the company
        } else {
            company = undefined;
            name = entityName;
        }

        let balanceDue: number;
        if (i % 3 !== 0) { // ~66% have dues
            balanceDue = (i * 1234.5) % 50000 + 5000;
        } else { // ~33% have zero balance
            balanceDue = 0;
        }

        // Companies always have GSTIN, individuals have a smaller chance
        const hasGstin = company ? true : (i % 5 === 0);

        data.push({
            id: `cust-${1001 + i}`,
            name,
            company,
            gstin: hasGstin ? generateDeterministicGstin(placeOfSupply.code, i) : '-',
            contact: {
                phone: `98${(10000000 + i * 123456) % 90000000}`,
                email: `${name.split(' ')[0].toLowerCase()}${i}@${company ? company.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/gi, '') : 'example'}.com`,
            },
            balanceDue,
            lastTransaction: new Date(now.getTime() - (i * 24 * 60 * 60 * 1000)), // last N days
            placeOfSupply: {
                code: placeOfSupply.code,
                state: stateName,
                abbr: placeOfSupply.abbr,
            },
        });
    }
    return data;
}
