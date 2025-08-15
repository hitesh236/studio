
import type { Attribute } from './types';

export const initialAttributes: Attribute[] = [
    { id: 'attr-1', name: 'Color', type: 'dropdown', options: ['Red', 'Green', 'Blue'], isGlobal: true, assignedCategories: [] },
    { id: 'attr-2', name: 'Size', type: 'dropdown', options: ['S', 'M', 'L', 'XL'], isGlobal: false, assignedCategories: ['apparel', 'men', 'women', 'men-tops', 'men-tshirts', 'men-shirts'] },
    { id: 'attr-3', name: 'Screen Size', type: 'text', isGlobal: false, assignedCategories: ['electronics', 'mobile', 'laptops', 'smartphones'] },
    { id: 'attr-4', name: 'Material', type: 'dropdown', options: ['Cotton', 'Polyester', 'Wood', 'Metal'], isGlobal: false, assignedCategories: ['apparel', 'furniture'] },
    { id: 'attr-cos-1', name: 'Industry_ID', type: 'text', isGlobal: false, assignedCategories: ['cosmetics'] },
    { id: 'attr-cos-2', name: 'Regulatory_Compliance', type: 'dropdown', options: ['FDA', 'EU'], isGlobal: false, assignedCategories: ['cosmetics'] },
    { id: 'attr-cos-3', name: 'Skin_Type', type: 'dropdown', options: ['Dry', 'Oily', 'Combination'], isGlobal: false, assignedCategories: ['skincare'] },
    { id: 'attr-cos-4', name: 'Target_Concern', type: 'dropdown', options: ['Acne', 'Aging'], isGlobal: false, assignedCategories: ['skincare'] },
    { id: 'attr-cos-5', name: 'Cleansing_Type', type: 'dropdown', options: ['Foaming', 'Non-Foaming'], isGlobal: false, assignedCategories: ['cleansers'] },
    { id: 'attr-cos-6', name: 'pH_Level', type: 'text', isGlobal: false, assignedCategories: ['cleansers'] },
    { id: 'attr-cos-7', name: 'Texture', type: 'dropdown', options: ['Gel', 'Cream'], isGlobal: false, assignedCategories: ['face-wash'] },
    { id: 'attr-cos-8', name: 'Vegan', type: 'checkbox', isGlobal: false, assignedCategories: ['face-wash'] },
    { id: 'attr-cos-9', name: 'Oil_Base', type: 'dropdown', options: ['Jojoba', 'Almond'], isGlobal: false, assignedCategories: ['cleansing-oil'] },
    { id: 'attr-cos-10', name: 'Emulsifies', type: 'checkbox', isGlobal: false, assignedCategories: ['cleansing-oil'] },
];
