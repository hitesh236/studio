
'use client';

export type MealPlan = {
  name: string;
  price: number;
};

export type RoomType = {
  name: string;
  price: number; // This is the base price for the room only (EP)
  mealPlans: MealPlan[];
};

export type Season = {
  name:string;
  roomTypes: RoomType[];
};

export type Hotel = {
  id: string;
  name: string;
  location: string;
  imageUrl: string;
  rating: number;
  seasons: Season[];
};

const hotelsData: Omit<Hotel, 'id' | 'imageUrl' | 'rating'>[] = [
  {
    name: 'The Taj Mahal Palace',
    location: 'Mumbai',
    seasons: [
      {
        name: 'Peak Season (Oct - Mar)',
        roomTypes: [
          { name: 'Luxury Grande Room', price: 45000, mealPlans: [{ name: 'Breakfast (CP)', price: 2500 }, { name: 'Breakfast & Dinner (MAP)', price: 6000 }] },
          { name: 'Taj Club Room', price: 65000, mealPlans: [{ name: 'Breakfast (CP)', price: 3500 }, { name: 'All Meals (AP)', price: 8000 }] },
          { name: 'Executive Suite', price: 90000, mealPlans: [{ name: 'Breakfast (CP)', price: 3500 }] },
        ],
      },
      {
        name: 'Off Season (Apr - Sep)',
        roomTypes: [
          { name: 'Luxury Grande Room', price: 32000, mealPlans: [{ name: 'Breakfast (CP)', price: 2500 }] },
          { name: 'Taj Club Room', price: 50000, mealPlans: [] },
          { name: 'Executive Suite', price: 75000, mealPlans: [{ name: 'Breakfast (CP)', price: 3500 }, { name: 'Breakfast & Dinner (MAP)', price: 7000 }] },
        ],
      },
    ],
  },
  {
    name: 'The Oberoi Amarvilas',
    location: 'Agra',
    seasons: [
      {
        name: 'Peak Season (Oct - Mar)',
        roomTypes: [
          { name: 'Premier Room', price: 55000, mealPlans: [{ name: 'Breakfast Included', price: 0 }] },
          { name: 'Premier Room with Balcony', price: 65000, mealPlans: [{ name: 'Breakfast Included', price: 0 }, { name: 'Dinner', price: 5000 }] },
          { name: 'Deluxe Suite with Balcony', price: 120000, mealPlans: [{ name: 'All Meals Included', price: 0 }] },
        ],
      },
      {
        name: 'Off Season (Apr - Sep)',
        roomTypes: [
          { name: 'Premier Room', price: 40000, mealPlans: [] },
          { name: 'Premier Room with Balcony', price: 48000, mealPlans: [{ name: 'Breakfast', price: 3000 }] },
          { name: 'Deluxe Suite with Balcony', price: 95000, mealPlans: [{ name: 'Breakfast', price: 3000 }, { name: 'Dinner', price: 5000 }] },
        ],
      },
    ],
  },
  {
    name: 'Umaid Bhawan Palace',
    location: 'Jodhpur',
    seasons: [
      {
        name: 'Peak Season (Oct - Mar)',
        roomTypes: [
          { name: 'Palace Room', price: 60000, mealPlans: [{ name: 'Royal Breakfast', price: 4000 }] },
          { name: 'Historical Suite', price: 150000, mealPlans: [{ name: 'Royal Breakfast', price: 5000 }, { name: 'Royal Dinner', price: 10000 }] },
          { name: 'Maharaja Suite', price: 500000, mealPlans: [{ name: 'All Inclusive Royal Service', price: 25000 }] },
        ],
      },
       {
        name: 'Off Season (Apr - Sep)',
        roomTypes: [
          { name: 'Palace Room', price: 45000, mealPlans: [{ name: 'Breakfast', price: 3000 }] },
          { name: 'Historical Suite', price: 110000, mealPlans: [{ name: 'Breakfast', price: 4000 }] },
          { name: 'Maharaja Suite', price: 380000, mealPlans: [{ name: 'All Inclusive', price: 20000 }] },
        ],
      },
    ],
  },
  {
    name: 'The Leela Palace',
    location: 'Bengaluru',
    seasons: [
      {
        name: 'All Year',
        roomTypes: [
          { name: 'Deluxe Room', price: 25000, mealPlans: [{ name: 'Breakfast Buffet', price: 1800 }] },
          { name: 'Conservatory Room', price: 35000, mealPlans: [{ name: 'Breakfast Buffet', price: 2200 }] },
          { name: 'Royal Suite', price: 75000, mealPlans: [{ name: 'Breakfast & High Tea', price: 5000 }] },
        ],
      },
    ],
  },
  {
    name: 'The Imperial',
    location: 'New Delhi',
    seasons: [
        {
            name: 'Peak Season (Oct - Mar)',
            roomTypes: [
                { name: 'Heritage Room', price: 30000, mealPlans: [{ name: 'Imperial Breakfast', price: 3000 }] },
                { name: 'Grand Heritage Room', price: 40000, mealPlans: [{ name: 'Imperial Breakfast', price: 3500 }, {name: 'Dinner at The Spice Route', price: 8000}] },
                { name: 'Luxury Suite', price: 80000, mealPlans: [] },
            ],
        },
        {
            name: 'Off Season (Apr - Sep)',
            roomTypes: [
                { name: 'Heritage Room', price: 22000, mealPlans: [] },
                { name: 'Grand Heritage Room', price: 30000, mealPlans: [{name: 'Breakfast', price: 2500}] },
                { name: 'Luxury Suite', price: 65000, mealPlans: [{name: 'Breakfast', price: 2500}] },
            ],
        }
    ]
  },
];

export const generateHotelData = (): Hotel[] => {
  return hotelsData.map((hotel, index) => ({
    ...hotel,
    id: `hotel-${index + 1}`,
    imageUrl: `https://placehold.co/400x300.png`,
    rating: Math.round((Math.random() * 0.9 + 4.1) * 10) / 10, // 4.1 to 5.0
  }));
};
