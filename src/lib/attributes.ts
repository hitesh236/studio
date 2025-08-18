
import type { Attribute } from './types';

export const initialAttributes: Attribute[] = [
    { id: 'attr-brand', name: 'Brand', type: 'text', isGlobal: true, assignedCategories: [] },
    { id: 'attr-net-weight', name: 'Net Weight', type: 'text', isGlobal: true, assignedCategories: [] },
    { id: 'attr-best-before', name: 'Best Before Date', type: 'date', isGlobal: true, assignedCategories: [] },
    { id: 'attr-country-origin', name: 'Country of Origin', type: 'text', isGlobal: true, assignedCategories: [] },
    { id: 'attr-fssai', name: 'FSSAI License No.', type: 'text', isGlobal: true, assignedCategories: [] },
    { id: 'attr-dietary-info', name: 'Dietary Information', type: 'dropdown', options: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Organic'], isGlobal: true, assignedCategories: [] },

    // Category-specific attributes
    { id: 'attr-rice-type', name: 'Rice Type', type: 'dropdown', options: ['Basmati', 'Sona Masoori', 'Kolam', 'Brown Rice'], isGlobal: false, assignedCategories: ['rice'] },
    { id: 'attr-oil-type', name: 'Oil Type', type: 'dropdown', options: ['Mustard', 'Sunflower', 'Soybean', 'Groundnut', 'Olive'], isGlobal: false, assignedCategories: ['edible-oils'] },
    { id: 'attr-tea-type', name: 'Tea Type', type: 'dropdown', options: ['Black Tea', 'Green Tea', 'Herbal Tea'], isGlobal: false, assignedCategories: ['tea-coffee'] },
    { id: 'attr-soap-for', name: 'Suitable For', type: 'dropdown', options: ['Body', 'Face', 'Hands'], isGlobal: false, assignedCategories: ['soaps-shampoos'] },
    { id: 'attr-detergent-type', name: 'Detergent Type', type: 'dropdown', options: ['Powder', 'Liquid', 'Bar'], isGlobal: false, assignedCategories: ['detergents-cleaners'] },
];
