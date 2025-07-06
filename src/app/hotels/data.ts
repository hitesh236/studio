
'use client';

export type RoomType = {
  name: string;
  price: number;
};

export type Season = {
  name: string;
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
          { name: 'Luxury Grande Room', price: 45000 },
          { name: 'Taj Club Room', price: 65000 },
          { name: 'Executive Suite', price: 90000 },
        ],
      },
      {
        name: 'Off Season (Apr - Sep)',
        roomTypes: [
          { name: 'Luxury Grande Room', price: 32000 },
          { name: 'Taj Club Room', price: 50000 },
          { name: 'Executive Suite', price: 75000 },
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
          { name: 'Premier Room', price: 55000 },
          { name: 'Premier Room with Balcony', price: 65000 },
          { name: 'Deluxe Suite with Balcony', price: 120000 },
        ],
      },
      {
        name: 'Off Season (Apr - Sep)',
        roomTypes: [
          { name: 'Premier Room', price: 40000 },
          { name: 'Premier Room with Balcony', price: 48000 },
          { name: 'Deluxe Suite with Balcony', price: 95000 },
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
          { name: 'Palace Room', price: 60000 },
          { name: 'Historical Suite', price: 150000 },
          { name: 'Maharaja Suite', price: 500000 },
        ],
      },
       {
        name: 'Off Season (Apr - Sep)',
        roomTypes: [
          { name: 'Palace Room', price: 45000 },
          { name: 'Historical Suite', price: 110000 },
          { name: 'Maharaja Suite', price: 380000 },
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
          { name: 'Deluxe Room', price: 25000 },
          { name: 'Conservatory Room', price: 35000 },
          { name: 'Royal Suite', price: 75000 },
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
                { name: 'Heritage Room', price: 30000 },
                { name: 'Grand Heritage Room', price: 40000 },
                { name: 'Luxury Suite', price: 80000 },
            ],
        },
        {
            name: 'Off Season (Apr - Sep)',
            roomTypes: [
                { name: 'Heritage Room', price: 22000 },
                { name: 'Grand Heritage Room', price: 30000 },
                { name: 'Luxury Suite', price: 65000 },
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
