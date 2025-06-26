export type Person = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  saleAmount: number;
  lastSeen: Date;
  rating: number;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  bio: string;
};

const firstNames = ["John", "Jane", "Michael", "Emily", "Chris", "Jessica", "David", "Sarah", "James", "Linda"];
const lastNames = ["Smith", "Doe", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez"];
const companies = ["Innovate Inc.", "Solutions Corp.", "Quantum Tech", "Synergy LLC", "Apex Industries", "Starlight Co.", "Blue-Ribbon Ltd.", "Venture Dynamics", "Peak Performance", "Nexus Group"];
const streets = ["Main St", "Oak Ave", "Pine St", "Maple Ave", "Cedar Ln", "Elm St", "Washington Blvd", "Lakeview Dr", "Park Ave", "River Rd"];
const cities = ["Springfield", "Metropolis", "Gotham", "Star City", "Central City", "Coast City", "National City", "Fawcett City", "Keystone City", "Midway City"];
const states = ["CA", "NY", "TX", "FL", "IL", "PA", "OH", "GA", "NC", "MI"];
const bios = [
  "A dedicated professional with a passion for data analysis and strategic planning.",
  "Experienced in client relations and project management, always aiming for excellence.",
  "A creative problem-solver with a knack for identifying and capitalizing on market trends.",
  "Results-driven team player with a strong background in software development and UX design.",
  "Specializes in financial modeling and data-driven decision making for enterprise clients.",
];

const getRandomElement = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export function generateData(count: number): Person[] {
  const data: Person[] = [];
  for (let i = 0; i < count; i++) {
    const firstName = getRandomElement(firstNames);
    const lastName = getRandomElement(lastNames);
    data.push({
      id: `USR-${1000 + i}`,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@example.com`,
      company: getRandomElement(companies),
      saleAmount: Math.floor(Math.random() * 5000) + 500,
      lastSeen: new Date(Date.now() - Math.floor(Math.random() * 1000 * 60 * 60 * 24 * 30)),
      rating: Math.round((Math.random() * 4 + 1) * 10) / 10,
      address: {
        street: `${Math.floor(Math.random() * 1000) + 1} ${getRandomElement(streets)}`,
        city: getRandomElement(cities),
        state: getRandomElement(states),
        zip: `${Math.floor(Math.random() * 90000) + 10000}`,
      },
      bio: getRandomElement(bios),
    });
  }
  return data;
}
