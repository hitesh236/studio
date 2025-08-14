
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AttributesTable } from './attributes-form';

const categories = [
  { id: 'apparel', name: 'Apparel' },
  { id: 'motor-parts', name: 'Motor Parts' },
  { id: 'cosmetics', name: 'Cosmetics' },
];

export default function AttributesPage() {
  const [selectedCategory, setSelectedCategory] = React.useState(categories[2]); // Default to Cosmetics

  return (
    <div className="flex h-full min-h-[calc(100vh-theme(spacing.14))]">
      <aside className="w-64 border-r p-4">
        <h2 className="text-lg font-semibold mb-4">Categories</h2>
        <div className="space-y-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory.id === category.id ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setSelectedCategory(category)}
            >
              {category.name}
            </Button>
          ))}
        </div>
      </aside>
      <main className="flex-1 p-6">
        <AttributesTable key={selectedCategory.id} category={selectedCategory} />
      </main>
    </div>
  );
}
