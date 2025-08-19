
export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  saleAmount: number;
  rating: number;
  status: "Active" | "Inactive";
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  bio: string;
  isExpanded?: boolean;
  gstin?: string;
  type: 'Customer' | 'Vendor';
  balance: number;
  lastSeen: Date;
};

const firstNames = ["Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan", "Ananya", "Diya", "Saanvi", "Gauri", "Pari", "Myra", "Aadhya", "Kiara", "Anika", "Riya"];
const lastNames = ["Sharma", "Verma", "Gupta", "Singh", "Kumar", "Patel", "Reddy", "Mehta", "Jain", "Fernandes", "Khan", "Biswas", "Chatterjee", "Iyer", "Nair"];

const companies = [
    "Surya Informatics", "Chandra Exports", "Mangal Traders", "Budh Wholesalers", "Guru Textiles",
    "Shukra Logistics", "Shani Heavy Industries", "Rahu Technologies", "Ketu Solutions",
    "Innovate Solutions Ltd.", "Quantum Systems", "Synergy Creations", "Apex Logistics",
    "Starlight Innovations", "Zenith Corporation", "Phoenix Enterprises", "Odyssey Group",
    "Blue-chip Ventures", "Pinnacle Partners", "Frontier Solutions", "Nexus International",
];

const streets = ["M.G. Road", "Brigade Road", "Linking Road", "Park Street", "Hazratganj", "K.G. Marg", "S.V. Road", "C.G. Road", "Commercial Street", "FC Road"];
const cities = ["Mumbai", "Delhi", "Bengaluru", "Kolkata", "Chennai", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow"];
const states = ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "Gujarat", "West Bengal", "Rajasthan"];
const bios = [
  "A dedicated professional with a passion for data analysis and strategic planning.",
  "Experienced in client relations and project management, always aiming for excellence.",
  "A creative problem-solver with a knack for identifying and capitalizing on market trends.",
  "Results-driven team player with a strong background in software development and UX design.",
  "Specializes in financial modeling and data-driven decision making for enterprise clients.",
];
const types = ["Customer", "Vendor"] as const;

const getDeterministicElement = <T>(arr: T[] | readonly T[], index: number): T => arr[index % arr.length];


export function generateData(count: number): Person[] {
  const data: Person[] = [];
  const usedCompanyNames = new Set<string>();
  const now = new Date('2024-07-21T10:00:00Z');
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);


  for (let i = 0; i < count; i++) {
    const firstName = getDeterministicElement(firstNames, i);
    const lastName = getDeterministicElement(lastNames, i);
    const state = getDeterministicElement(states, i);
    const gstinStateCode = state === 'Maharashtra' ? '27' : '29'; // Simplified for example
    const type = getDeterministicElement(types, i);
    
    let companyName = getDeterministicElement(companies, i);
    let suffix = 1;
    while (usedCompanyNames.has(companyName)) {
        const baseName = getDeterministicElement(companies, i);
        companyName = `${baseName} #${suffix}`;
        suffix++;
    }
    usedCompanyNames.add(companyName);
    
    let balance = 0;
    if (type === 'Customer') {
        if (i % 4 !== 0) { // ~75% of customers have a balance
            balance = (i * 1234.5) % 50000 + 500;
        }
    } else { // Vendor
        if (i % 2 === 0) { // 50% of vendors have a balance
            balance = -((i * 789.1) % 25000 + 500);
        }
    }
    
    const lastSeen = new Date(now.getTime() - (i * 5 * 24 * 60 * 60 * 1000)); // Every 5 days
    const status = lastSeen >= ninetyDaysAgo ? 'Active' : 'Inactive';

    data.push({
      id: `USR-${1000 + i}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      company: companyName,
      phone: `+91 98${(10000000 + i * 12345) % 90000000}`,
      saleAmount: (i * 543.21) % 5000 + 500,
      rating: ((i * 3) % 4) + 1.5,
      status: status,
      address: {
        street: `${(i*17) % 1000 + 1} ${getDeterministicElement(streets, i)}`,
        city: getDeterministicElement(cities, i),
        state: state,
        zip: `${(400000 + i * 13) % 500000}`,
      },
      bio: getDeterministicElement(bios, i),
      gstin: `${gstinStateCode}ABCDE${1000 + i}F1Z${(i % 9) + 1}`,
      type: type,
      balance: balance,
      lastSeen: lastSeen,
    });
  }
  return data;
}
