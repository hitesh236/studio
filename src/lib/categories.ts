
import type { Category } from './types';

export const initialCategoriesData: Category[] = [
  {
    id: 'grocery',
    name: 'Grocery',
    children: [
      {
        id: 'staples-pulses',
        name: 'Staples & Pulses',
        children: [
          { id: 'rice', name: 'Rice' },
          { id: 'wheat-flour', name: 'Wheat & Flour' },
          { id: 'dals-lentils', name: 'Dals & Lentils' },
          { id: 'edible-oils', name: 'Edible Oils' },
          { id: 'salt-sugar', name: 'Salt & Sugar' },
        ],
      },
      {
        id: 'spices-condiments',
        name: 'Spices & Condiments',
        children: [
          { id: 'whole-spices', name: 'Whole Spices' },
          { id: 'powdered-spices', name: 'Powdered Spices' },
          { id: 'blended-masalas', name: 'Blended Masalas' },
          { id: 'herbs-seasonings', name: 'Herbs & Seasonings' },
        ],
      },
      {
        id: 'beverages',
        name: 'Beverages',
        children: [
          { id: 'tea-coffee', name: 'Tea & Coffee' },
          { id: 'juices-soft-drinks', name: 'Juices & Soft Drinks' },
          { id: 'health-drinks', name: 'Health Drinks' },
        ],
      },
      {
        id: 'personal-care-household',
        name: 'Personal Care & Household',
        children: [
          { id: 'soaps-shampoos', name: 'Soaps & Shampoos' },
          { id: 'detergents-cleaners', name: 'Detergents & Cleaners' },
          { id: 'pooja-essentials', name: 'Pooja Essentials' },
        ],
      },
    ],
  },
];
