
export type Customer = {
  id: string;
  name: string;
  company: string | null;
  contact: {
    email: string | null;
    phone: string | null;
  };
  gstin: string;
  balanceDue: number;
  lastTransaction: Date;
  status: 'Active' | 'Inactive';
  placeOfSupply: {
    state: string;
    code: string;
    abbr: string;
  };
};

const personNames = [
  "Aarav Sharma", "Vivaan Singh", "Aditya Kumar", "Vihaan Gupta", "Arjun Patel",
  "Sai Reddy", "Reyansh Mehta", "Ayaan Jain", "Krishna Iyer", "Ishaan Nair",
  "Ananya Verma", "Diya Shah", "Saanvi Pillai", "Gauri Menon", "Pari Joshi"
];

const companyNames = [
  "Innovate Solutions", "Quantum Systems", "Synergy Creations", "Apex Logistics",
];

const states = [
    { name: "Maharashtra", code: "27", abbr: "MH" },
    { name: "Delhi", code: "07", abbr: "DL" },
    { name: "Karnataka", code: "29", abbr: "KA" },
    { name: "Tamil Nadu", code: "33", abbr: "TN" },
    { name: "Uttar Pradesh", code: "09", abbr: "UP" },
    { name: "Gujarat", code: "24", abbr: "GJ" },
    { name: "West Bengal", code: "19", abbr: "WB" },
    { name: "Rajasthan", code: "08", abbr: "RJ" },
];

const getDeterministicElement = <T>(arr: T[], index: number): T => arr[index % arr.length];

export function generateCustomerData(count: number): Customer[] {
  const customers: Customer[] = [];
  const now = new Date('2024-07-21T10:00:00Z');
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  
  const allNames = [...personNames, ...companyNames];

  for (let i = 0; i < count; i++) {
    const isCompany = i >= personNames.length;
    const name = allNames[i];
    const state = getDeterministicElement(states, i);
    const lastSeen = new Date(now.getTime() - (i * 5 * 24 * 60 * 60 * 1000));
    
    customers.push({
      id: `CUST-${1001 + i}`,
      name: isCompany ? `${getDeterministicElement(personNames, i).split(' ')[0]} (Contact)` : name,
      company: isCompany ? name : null,
      contact: {
        email: `${name.split(' ')[0].toLowerCase()}@example.com`,
        phone: `+91 98765432${i.toString().padStart(2, '0')}`,
      },
      gstin: i % 3 !== 0 ? `${state.code}ABCDE${1000 + i}F1Z${(i % 9) + 1}` : '-',
      balanceDue: i % 4 !== 0 ? (i * 1234.5) % 50000 + 500 : 0,
      lastTransaction: lastSeen,
      status: lastSeen > ninetyDaysAgo ? 'Active' : 'Inactive',
      placeOfSupply: state,
    });
  }
  return customers;
}
