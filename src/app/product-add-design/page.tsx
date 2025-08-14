
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Folder,
  Tag,
  PlusCircle,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Info,
  ChevronsUpDown,
  Check,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';

type Category = {
  id: string;
  name: string;
  children?: Category[];
};

const initialCategories: Category[] = [
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
        ],
      },
      { id: 'women', name: 'Women' },
    ],
  },
  { id: 'furniture', name: 'Furniture' },
];

const CategoryNode = ({ category, level }: { category: Category; level: number }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 group"
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
      >
        <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => hasChildren && setIsOpen(!isOpen)}>
          <span className="w-4 h-4">
            {hasChildren && (isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
          </span>
          <Folder className="h-4 w-4 text-amber-500" />
          <span>{category.name}</span>
        </div>
        <div className="hidden group-hover:flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7"><PlusCircle className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7"><Edit2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
      {isOpen && hasChildren && (
        <div>
            {category.children?.map(child => (
                <CategoryNode key={child.id} category={child} level={level + 1} />
            ))}
        </div>
      )}
    </div>
  );
};

const AddCategoryDialog = ({ onAdd, categories }: { onAdd: (name: string, parentId: string | null) => void; categories: Category[] }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [name, setName] = React.useState('');
    const [selectedParent, setSelectedParent] = React.useState<string | null>(null);

    const flattenedCategories = React.useMemo(() => {
        const flatten = (cats: Category[], level = 0): { value: string, label: string }[] => {
            let list: { value: string, label: string }[] = [];
            cats.forEach(cat => {
                list.push({ value: cat.id, label: `${'— '.repeat(level)}${cat.name}` });
                if (cat.children) {
                    list = [...list, ...flatten(cat.children, level + 1)];
                }
            });
            return list;
        }
        return flatten(categories);
    }, [categories]);
    
    const handleAdd = () => {
        if (name.trim()) {
            onAdd(name.trim(), selectedParent);
            setIsOpen(false);
            setName('');
            setSelectedParent(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Category</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Category</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category-name" className="text-right">Name</Label>
                        <Input id="category-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="parent-category" className="text-right">Parent</Label>
                        <div className="col-span-3">
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" role="combobox" className="w-full justify-between">
                                        {selectedParent ? flattenedCategories.find(cat => cat.value === selectedParent)?.label.replace(/— /g, '') : "Select parent..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                    <Command>
                                        <CommandInput placeholder="Search category..." />
                                        <CommandList>
                                            <CommandEmpty>No category found.</CommandEmpty>
                                            <CommandGroup>
                                                 <CommandItem onSelect={() => setSelectedParent(null)}>
                                                    <Check className={cn('mr-2 h-4 w-4', !selectedParent ? 'opacity-100' : 'opacity-0')} />
                                                    (No Parent)
                                                </CommandItem>
                                                {flattenedCategories.map((cat) => (
                                                    <CommandItem key={cat.value} value={cat.value} onSelect={(currentValue) => {
                                                        setSelectedParent(currentValue === selectedParent ? null : currentValue);
                                                    }}>
                                                        <Check className={cn('mr-2 h-4 w-4', selectedParent === cat.value ? 'opacity-100' : 'opacity-0')} />
                                                        {cat.label}
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleAdd}>Add</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function ProductAddDesignPage() {
  const { toast } = useToast();
  const [isGlobal, setIsGlobal] = React.useState(false);
  const [attributeType, setAttributeType] = React.useState('text');
  const [categories, setCategories] = React.useState<Category[]>(initialCategories);

  const handleAddCategory = (name: string, parentId: string | null) => {
    const newCategory: Category = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name: name,
    };

    if (parentId === null) {
      setCategories(prev => [...prev, newCategory]);
    } else {
      const addCategoryToParent = (cats: Category[], pId: string): Category[] => {
        return cats.map(cat => {
          if (cat.id === pId) {
            return { ...cat, children: [...(cat.children || []), newCategory] };
          }
          if (cat.children) {
            return { ...cat, children: addCategoryToParent(cat.children, pId) };
          }
          return cat;
        });
      };
      setCategories(prev => addCategoryToParent(prev, parentId));
    }
    toast({ title: "Category Added", description: `"${name}" has been successfully added.` });
  };


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="text-center">
            <h1 className="text-3xl font-bold">Category and Attribute Management UI</h1>
            <p className="text-muted-foreground">A UI/UX design for managing hierarchical data structures.</p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Categories Management */}
        <Card>
          <CardHeader>
            <CardTitle>Categories Management</CardTitle>
            <CardDescription>A tree view for hierarchical category relationships.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-2 border rounded-md min-h-[300px]">
                {categories.map(cat => (
                    <CategoryNode key={cat.id} category={cat} level={0} />
                ))}
            </div>
             <div className="mt-4 flex justify-end">
                <AddCategoryDialog onAdd={handleAddCategory} categories={categories} />
            </div>
          </CardContent>
        </Card>

        {/* Attributes Management */}
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Attributes Management</CardTitle>
                    <CardDescription>A table displaying all attributes and their assignments.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Attribute Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">Color</TableCell>
                                    <TableCell>Dropdown</TableCell>
                                    <TableCell><Badge variant="secondary">Global</Badge></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Size</TableCell>
                                    <TableCell>Dropdown</TableCell>
                                    <TableCell><Badge>Apparel</Badge></TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell className="font-medium">Screen Size</TableCell>
                                    <TableCell>Text</TableCell>
                                    <TableCell><Badge>Electronics</Badge></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Attribute Form</CardTitle>
                    <CardDescription>Form for creating or editing an attribute.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="attr-name">Attribute Name</Label>
                        <Input id="attr-name" placeholder="e.g., Color" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="attr-type">Attribute Type</Label>
                        <Select value={attributeType} onValueChange={setAttributeType}>
                            <SelectTrigger id="attr-type"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="dropdown">Dropdown</SelectItem>
                                <SelectItem value="checkbox">Checkbox</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {attributeType === 'dropdown' && (
                         <div className="space-y-2">
                            <Label htmlFor="attr-options">Options</Label>
                            <Input id="attr-options" placeholder="Enter comma-separated values (e.g., Red, Green, Blue)" />
                         </div>
                    )}

                    <Separator />
                    
                    <div className="space-y-4">
                        <h4 className="font-medium">Assignment</h4>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <Label htmlFor="global-toggle">Global Attribute</Label>
                                <p className="text-xs text-muted-foreground">Apply this attribute to all categories.</p>
                            </div>
                            <Switch id="global-toggle" checked={isGlobal} onCheckedChange={setIsGlobal} />
                        </div>

                        {!isGlobal && (
                            <div className="space-y-2">
                                <Label>Assign to Specific Categories</Label>
                                <Input disabled placeholder="Multi-select dropdown would be here" />
                            </div>
                        )}
                         <div className="space-y-2">
                            <Label>Block Inheritance from Categories (Optional)</Label>
                            <Input disabled placeholder="Multi-select for categories to block" />
                             <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Info className="h-3 w-3" /> Child categories will not inherit this attribute if their parent is selected here.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Empty State Showcase */}
        <Card>
            <CardHeader>
                <CardTitle>Empty States</CardTitle>
                <CardDescription>Visuals for when no data is present.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-8 border rounded-lg flex flex-col items-center justify-center">
                    <img src="https://placehold.co/200x150.png" data-ai-hint="empty state illustration" alt="No Categories" className="mb-4" />
                    <h3 className="font-semibold">No Categories Yet</h3>
                    <p className="text-sm text-muted-foreground">Start by adding a root category.</p>
                    <Button size="sm" className="mt-4">Add Category</Button>
                </div>
                <div className="text-center p-8 border rounded-lg flex flex-col items-center justify-center">
                     <img src="https://placehold.co/200x150.png" data-ai-hint="empty state illustration" alt="No Attributes" className="mb-4" />
                    <h3 className="font-semibold">No Attributes Found</h3>
                    <p className="text-sm text-muted-foreground">Create your first attribute to begin.</p>
                    <Button size="sm" className="mt-4">Add Attribute</Button>
                </div>
            </CardContent>
        </Card>
        
         <div className="fixed bottom-8 right-8 z-50">
            <Button className="rounded-full shadow-lg h-14 w-14">
                <PlusCircle className="h-6 w-6" />
                 <span className="sr-only">Add Attribute</span>
            </Button>
        </div>
      </div>
    </div>
  );
}
