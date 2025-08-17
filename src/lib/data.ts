export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  phone: string;
  saleAmount: number;
  rating: number;
  status: "Active" | "Follow-Up" | "Lost" | "Converted";
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
};

const firstNames = ["John", "Jane", "Michael", "Emily", "Chris", "Jessica", "David", "Sarah", "James", "Linda"];
const lastNames = ["Smith", "Doe", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez"];
const companies = ["Innovate Inc.", "Solutions Corp.", "Quantum Tech", "Synergy LLC", "Apex Industries", "Starlight Co.", "Blue-Ribbon Ltd.", "Venture Dynamics", "Peak Performance", "Nexus Group"];
const streets = ["Main St", "Oak Ave", "Pine St", "Maple Ave", "Cedar Ln", "Elm St", "Washington Blvd", "Lakeview Dr", "Park Ave", "River Rd"];
const cities = ["Mumbai", "Delhi", "Bengaluru", "Kolkata", "Chennai", "Hyderabad", "Pune", "Ahmedabad", "Jaipur", "Lucknow"];
const states = ["Maharashtra", "Delhi", "Karnataka", "Tamil Nadu", "Uttar Pradesh", "Gujarat", "West Bengal", "Rajasthan"];
const statuses = ["Active", "Follow-Up", "Lost", "Converted"] as const;
const bios = [
  "A dedicated professional with a passion for data analysis and strategic planning.",
  "Experienced in client relations and project management, always aiming for excellence.",
  "A creative problem-solver with a knack for identifying and capitalizing on market trends.",
  "Results-driven team player with a strong background in software development and UX design.",
  "Specializes in financial modeling and data-driven decision making for enterprise clients.",
];
const types = ["Customer", "Vendor"] as const;

const getRandomElement = <T>(arr: T[] | readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function generateData(count: number): Person[] {
  const data: Person[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    const state = getRandomElement(states);
    const gstinStateCode = state === 'Maharashtra' ? '27' : '29'; // Simplified for example
    data.push({
      id: `USR-${1000 + i}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      company: getRandomElement(companies),
      phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      saleAmount: Math.floor(Math.random() * 5000) + 500,
      rating: Math.round((Math.random() * 4 + 1) * 10) / 10,
      status: getRandomElement(statuses),
      address: {
        street: `${Math.floor(Math.random() * 1000) + 1} ${getRandomElement(streets)}`,
        city: getRandomElement(cities),
        state: state,
        zip: `${Math.floor(Math.random() * 90000) + 10000}`,
      },
      bio: getRandomElement(bios),
      gstin: `${gstinStateCode}ABCDE${1000 + i}F1Z${(i % 9) + 1}`,
      type: getRandomElement(types),
    });
  }
  return data;
}
