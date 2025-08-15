
import type { Category } from './types';

const cosmeticsData = {
  "Cosmetics": {
    "Skincare": {
      "Cleansers": {
        "Face Wash": {},
        "Cleansing Oil": {},
        "Micellar Water": {}
      },
      "Moisturizers": {
        "Face Cream": {},
        "Face Lotion": {},
        "Night Cream": {}
      },
      "Treatments": {
        "Serums": {},
        "Face Oils": {},
        "Acne Treatments": {}
      },
      "Sunscreen": {
        "SPF 30": {},
        "SPF 50": {},
        "Mineral Sunscreen": {}
      }
    },
    "Haircare": {
      "Shampoo": {
        "Volumizing": {},
        "Anti-Dandruff": {},
        "Sulfate-Free": {}
      },
      "Conditioner": {
        "Deep Conditioning": {},
        "Leave-In": {},
        "Color Protection": {}
      },
      "Hair Treatments": {
        "Hair Masks": {},
        "Hair Oils": {},
        "Scalp Treatments": {}
      }
    },
    "Makeup": {
      "Face": {
        "Foundation": {},
        "Concealer": {},
        "Blush": {}
      },
      "Eyes": {
        "Eyeshadow": {},
        "Mascara": {},
        "Eyeliner": {}
      },
      "Lips": {
        "Lipstick": {},
        "Lip Gloss": {},
        "Lip Balm": {}
      }
    },
    "Fragrance": {
      "Perfume": {
        "Eau de Parfum": {},
        "Eau de Toilette": {},
        "Roll-On": {}
      },
      "Body Mist": {
        "Floral": {},
        "Fruity": {},
        "Woody": {}
      }
    },
    "Bath & Body": {
      "Body Wash": {
        "Shower Gel": {},
        "Bar Soap": {},
        "Body Scrub": {}
      },
      "Lotions": {
        "Body Butter": {},
        "Hand Cream": {},
        "Foot Cream": {}
      }
    },
    "Men’s Grooming": {
      "Shaving": {
        "Shaving Cream": {},
        "Aftershave": {},
        "Razors": {}
      },
      "Beard Care": {
        "Beard Oil": {},
        "Beard Balm": {},
        "Beard Wash": {}
      }
    },
    "Nail Care": {
      "Nail Polish": {
        "Regular": {},
        "Gel": {},
        "Matte": {}
      },
      "Nail Treatments": {
        "Nail Strengthener": {},
        "Cuticle Oil": {},
        "Base/Top Coat": {}
      }
    },
    "Oral Care": {
      "Toothpaste": {
        "Whitening": {},
        "Sensitive": {},
        "Herbal": {}
      },
      "Mouthwash": {
        "Fluoride": {},
        "Alcohol-Free": {},
        "Breath Freshener": {}
      }
    }
  }
};

const transformDataToCategories = (data: any): Category[] => {
    return Object.entries(data).map(([key, value]) => {
        const id = key.toLowerCase().replace(/ & | /g, '-').replace(/’s/g, 's');
        const children = Object.keys(value as object).length > 0 ? transformDataToCategories(value) : [];
        return {
            id,
            name: key,
            children: children.length > 0 ? children : undefined
        };
    });
};

const cosmeticsCategories: Category[] = transformDataToCategories(cosmeticsData);


export const initialCategoriesData: Category[] = [
  ...cosmeticsCategories,
  {
    id: 'electronics',
    name: 'Electronics',
    children: [
      {
        id: 'mobile',
        name: 'Mobile Phones',
        children: [
          { id: 'smartphones', name: 'Smartphones' },
          { id: 'featurephones', name: 'Feature Phones' },
        ],
      },
      { id: 'laptops', name: 'Laptops' },
      {
        id: 'accessories',
        name: 'Accessories',
        children: [
          { id: 'keyboards', name: 'Keyboards' },
          { id: 'mice', name: 'Mice' },
        ],
      },
    ],
  },
  {
    id: 'apparel',
    name: 'Apparel',
    children: [
      {
        id: 'men',
        name: 'Men',
        children: [
          {
            id: 'men-tops',
            name: 'Tops',
            children: [
              { id: 'men-tshirts', name: 'T-Shirts' },
              { id: 'men-shirts', name: 'Shirts' },
            ],
          },
           { id: 'men-bottoms', name: 'Bottoms' },
        ],
      },
      { id: 'women', name: 'Women', children: [
          { id: 'women-tops', name: 'Tops' },
          { id: 'women-bottoms', name: 'Bottoms' },
      ] },
    ],
  },
  { id: 'furniture', name: 'Furniture' },
];
