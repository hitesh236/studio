
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { AttributesTable } from './attributes-form';
import { PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

const initialCategories = [
  { id: 'apparel', name: 'Apparel' },
  { id: 'motor-parts', name: 'Motor Parts' },
  { id: 'cosmetics', name: 'Cosmetics' },
];

const AddCategoryDialog = ({ onAdd }: { onAdd: (name: string) => void }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState('');

  const handleAdd = () => {
    if (name.trim()) {
      onAdd(name.trim());
      setIsOpen(false);
      setName('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start mt-2">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Enter a name for the new product category.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category-name" className="text-right">Name</Label>
            <Input
              id="category-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Electronics"
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={handleAdd}>Save Category</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function AttributesPage() {
  const { toast } = useToast();
  const [categories, setCategories] = React.useState(initialCategories);
  const [selectedCategory, setSelectedCategory] = React.useState(categories[0]);

  const handleAddCategory = (name: string) => {
    const newCategory = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name: name,
    };
    if (categories.some(cat => cat.id === newCategory.id)) {
        toast({ variant: 'destructive', title: 'Category already exists.'});
        return;
    }
    setCategories(prev => [...prev, newCategory]);
    setSelectedCategory(newCategory);
    toast({ title: 'Category Added', description: `Successfully added "${name}".`});
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-theme(spacing.14))]">
      <aside className="bg-slate-50 dark:bg-slate-800/20 border-r flex flex-col p-4 w-64 mb-2 ml-2 mt-1 rounded-sm">
        <h2 className="text-lg font-semibold mb-4">Categories</h2>
        <div className="space-y-2 flex-1">
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
        <Separator className="my-2" />
        <AddCategoryDialog onAdd={handleAddCategory} />
      </aside>
      <main className="flex-1 p-6">
        <AttributesTable key={selectedCategory.id} category={selectedCategory} />
      </main>
    </div>
  );
}
