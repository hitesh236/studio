
export type Category = {
  id: string;
  name: string;
  children?: Category[];
};

export type AttributeType = 'text' | 'dropdown' | 'checkbox' | 'date';

export type Attribute = {
    id: string;
    name: string;
    type: AttributeType;
    options?: string[];
    isGlobal: boolean;
    assignedCategories: string[]; // array of category IDs
};
