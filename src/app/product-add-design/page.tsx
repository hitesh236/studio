
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
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

type Category = {
  id: string;
  name: string;
  children?: Category[];
};

type AttributeType = 'text' | 'dropdown' | 'checkbox' | 'date';

type Attribute = {
    id: string;
    name: string;
    type: AttributeType;
    options?: string[];
    isGlobal: boolean;
    assignedCategories: string[]; // array of category IDs
};


const initialCategoriesData: Category[] = [
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

const initialAttributes: Attribute[] = [
    { id: 'attr-1', name: 'Color', type: 'dropdown', options: ['Red', 'Green', 'Blue'], isGlobal: true, assignedCategories: [] },
    { id: 'attr-2', name: 'Size', type: 'dropdown', options: ['S', 'M', 'L', 'XL'], isGlobal: false, assignedCategories: ['apparel', 'men', 'women', 'men-tops', 'men-tshirts', 'men-shirts'] },
    { id: 'attr-3', name: 'Screen Size', type: 'text', isGlobal: false, assignedCategories: ['electronics', 'mobile', 'laptops', 'smartphones'] },
    { id: 'attr-4', name: 'Material', type: 'dropdown', options: ['Cotton', 'Polyester', 'Wood', 'Metal'], isGlobal: false, assignedCategories: ['apparel', 'furniture'] },
];

// Dummy data for product counts
const productCounts: Record<string, number> = {
    'smartphones': 12,
    'laptops': 5,
    'men-tshirts': 25,
    'men-shirts': 18,
    'furniture': 7
};

const getCategoryProductCount = (category: Category): number => {
    let count = productCounts[category.id] || 0;
    if (category.children) {
        count += category.children.reduce((sum, child) => sum + getCategoryProductCount(child), 0);
    }
    return count;
};

const flattenCategories = (cats: Category[], level = 0): { value: string, label: string }[] => {
    let list: { value: string, label: string }[] = [];
    cats.forEach(cat => {
        list.push({ value: cat.id, label: `${'— '.repeat(level)}${cat.name}` });
        if (cat.children) {
            list = [...list, ...flattenCategories(cat.children, level + 1)];
        }
    });
    return list;
};

const getCategoryNameById = (categories: Category[], id: string): string | null => {
    for (const cat of categories) {
        if (cat.id === id) return cat.name;
        if (cat.children) {
            const foundName = getCategoryNameById(cat.children, id);
            if (foundName) return foundName;
        }
    }
    return null;
};


const CategoryNode = ({ category, level, onAdd, onEdit, onDelete, selectedCategory, onSelectCategory, productCount }: { category: Category; level: number; onAdd: (parentId: string) => void; onEdit: (category: Category) => void; onDelete: (category: Category) => void; selectedCategory: Category | null; onSelectCategory: (category: Category) => void; productCount: number; }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const hasChildren = category.children && category.children.length > 0;
  const isSelected = selectedCategory?.id === category.id;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1.5 py-1.5 px-2 rounded-md hover:bg-muted/50 group",
          isSelected && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-black"
        )}
        style={{ paddingLeft: `${level * 0.75 + 0.5}rem` }}
      >
        <div className="flex items-center gap-1.5 flex-1 cursor-pointer" onClick={() => onSelectCategory(category)}>
          <span className="w-4 h-4 cursor-pointer" onClick={(e) => { e.stopPropagation(); hasChildren && setIsOpen(!isOpen); }}>
            {hasChildren && (isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
          </span>
          <Folder className="h-4 w-4 text-amber-500" />
          <span className="text-[13px]">{category.name} ({productCount})</span>
        </div>
        <div className="hidden group-hover:flex items-center gap-1">
            {level < 2 && (
              <TooltipProvider><Tooltip>
                  <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onAdd(category.id)}><PlusCircle className="h-4 w-4" /></Button></TooltipTrigger>
                  <TooltipContent><p>Add Sub-category</p></TooltipContent>
              </Tooltip></TooltipProvider>
            )}
            <TooltipProvider><Tooltip>
                <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEdit(category)}><Edit2 className="h-4 w-4" /></Button></TooltipTrigger>
                <TooltipContent><p>Edit Category</p></TooltipContent>
            </Tooltip></TooltipProvider>
            {productCount === 0 && (
                <TooltipProvider><Tooltip>
                    <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => onDelete(category)}><Trash2 className="h-4 w-4" /></Button></TooltipTrigger>
                    <TooltipContent><p>Delete Category</p></TooltipContent>
                </Tooltip></TooltipProvider>
            )}
        </div>
      </div>
      {isOpen && hasChildren && (
        <div>
            {category.children?.map(child => (
                <CategoryNode key={child.id} category={child} level={level + 1} onAdd={onAdd} onEdit={onEdit} onDelete={onDelete} selectedCategory={selectedCategory} onSelectCategory={onSelectCategory} productCount={getCategoryProductCount(child)} />
            ))}
        </div>
      )}
    </div>
  );
};


const CategoryDialog = ({ open, onOpenChange, onSave, categories, editingCategory, parentId }: { open: boolean; onOpenChange: (open: boolean) => void; onSave: (name: string, parentId: string | null) => void; categories: Category[]; editingCategory?: Category | null; parentId?: string | null }) => {
    const [name, setName] = React.useState('');
    const [selectedParent, setSelectedParent] = React.useState<string | null>(null);

    React.useEffect(() => {
        if (open) {
            if (editingCategory) {
                const parent = findParent(categories, editingCategory.id);
                setName(editingCategory.name);
                setSelectedParent(parent ? parent.id : null);
            } else {
                setName('');
                setSelectedParent(parentId || null);
            }
        }
    }, [open, editingCategory, parentId, categories]);

    const findParent = (cats: Category[], childId: string): Category | null => {
        for (const cat of cats) {
            if (cat.children?.some(c => c.id === childId)) return cat;
            if (cat.children) {
                const found = findParent(cat.children, childId);
                if (found) return found;
            }
        }
        return null;
    }

    const flattenedCategories = React.useMemo(() => flattenCategories(categories), [categories]);

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim(), selectedParent);
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{editingCategory ? 'Edit' : 'Add'} Category</DialogTitle>
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
                                                 <CommandItem value="no-parent" onSelect={() => setSelectedParent(null)}>
                                                    <Check className={cn('mr-2 h-4 w-4', !selectedParent ? 'opacity-100' : 'opacity-0')} />
                                                    (No Parent)
                                                </CommandItem>
                                                {flattenedCategories.map((cat) => (
                                                    <CommandItem key={cat.value} value={cat.value} onSelect={(currentValue) => setSelectedParent(currentValue === selectedParent ? null : currentValue)}>
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
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const AttributeDialog = ({
  open,
  onOpenChange,
  onSave,
  editingAttribute,
  categories,
  selectedCategory,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (attr: Omit<Attribute, 'id'>, id?: string) => void;
  editingAttribute?: Attribute | null;
  categories: Category[];
  selectedCategory: Category | null;
}) => {
  const [name, setName] = React.useState('');
  const [type, setType] = React.useState<AttributeType>('text');
  const [options, setOptions] = React.useState('');
  const [isGlobal, setIsGlobal] = React.useState(false);
  const [assigned, setAssigned] = React.useState<string[]>([]);
  const [blocked, setBlocked] = React.useState<string[]>([]);

  React.useEffect(() => {
    if (open) {
      if (editingAttribute) {
        setName(editingAttribute.name);
        setType(editingAttribute.type);
        setOptions(editingAttribute.options?.join(', ') || '');
        setIsGlobal(editingAttribute.isGlobal);
        setAssigned(editingAttribute.assignedCategories);
      } else {
        setName('');
        setType('text');
        setOptions('');
        setIsGlobal(false);
        setAssigned(selectedCategory ? [selectedCategory.id] : []);
      }
    }
  }, [open, editingAttribute, selectedCategory]);

  const handleSave = () => {
    onSave(
      {
        name,
        type,
        options: type === 'dropdown' ? options.split(',').map(o => o.trim()).filter(Boolean) : undefined,
        isGlobal,
        assignedCategories: isGlobal ? [] : assigned,
      },
      editingAttribute?.id
    );
    onOpenChange(false);
  };
  
  const flattenedCategories = React.useMemo(() => flattenCategories(categories), [categories]);
  
  const dialogTitle = editingAttribute 
    ? 'Edit Attribute' 
    : `Add Attribute to: ${selectedCategory ? getCategoryNameById(categories, selectedCategory.id) : 'Global'}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="attr-name">Attribute Name</Label>
            <Input id="attr-name" placeholder="e.g., Color" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="attr-type">Attribute Type</Label>
            <Select value={type} onValueChange={(v: AttributeType) => setType(v)}>
              <SelectTrigger id="attr-type"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="text">Text</SelectItem>
                <SelectItem value="dropdown">Dropdown</SelectItem>
                <SelectItem value="checkbox">Checkbox</SelectItem>
                <SelectItem value="date">Date</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {type === 'dropdown' && (
            <div className="space-y-2">
              <Label htmlFor="attr-options">Options</Label>
              <Input id="attr-options" placeholder="Enter comma-separated values" value={options} onChange={e => setOptions(e.target.value)} />
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
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={handleSave}>Save Attribute</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export default function ProductAddDesignPage() {
  const { toast } = useToast();
  const [categories, setCategories] = React.useState<Category[]>(initialCategoriesData);
  const [attributes, setAttributes] = React.useState<Attribute[]>(initialAttributes);
  
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(initialCategoriesData[0]);

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [parentCategoryId, setParentCategoryId] = React.useState<string | null>(null);

  const [isAttributeDialogOpen, setIsAttributeDialogOpen] = React.useState(false);
  const [editingAttribute, setEditingAttribute] = React.useState<Attribute | null>(null);

  const displayedAttributes = React.useMemo(() => {
    if (!selectedCategory) return attributes.filter(attr => attr.isGlobal);
    // This logic needs to be more complex to handle inheritance.
    // For now, it's a direct match or global.
    return attributes.filter(attr => attr.isGlobal || attr.assignedCategories.includes(selectedCategory.id));
  }, [attributes, selectedCategory]);


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
          if (cat.id === pId) return { ...cat, children: [...(cat.children || []), newCategory] };
          if (cat.children) return { ...cat, children: addCategoryToParent(cat.children, pId) };
          return cat;
        });
      };
      setCategories(prev => addCategoryToParent(prev, parentId));
    }
    toast({ title: "Category Added" });
  };
  
  const handleEditCategory = (name: string, parentId: string | null) => {
    if (!editingCategory) return;
    const removeNode = (nodes: Category[], nodeId: string): [Category[], Category | null] => {
        let foundNode: Category | null = null;
        const filteredNodes = nodes.filter(node => {
            if (node.id === nodeId) {
                foundNode = node;
                return false;
            }
            if (node.children) {
                const [newChildren, childFound] = removeNode(node.children, nodeId);
                node.children = newChildren;
                if (childFound) foundNode = childFound;
            }
            return true;
        });
        return [filteredNodes, foundNode];
    }
    const [catsWithoutOld, movedNode] = removeNode(categories, editingCategory.id);
    if (!movedNode) return;
    movedNode.name = name;
    if (parentId === null) {
        setCategories([...catsWithoutOld, movedNode]);
    } else {
        const addNodeToParent = (nodes: Category[], pId: string): Category[] => {
            return nodes.map(node => {
                if (node.id === pId) return { ...node, children: [...(node.children || []), movedNode] };
                if (node.children) return { ...node, children: addNodeToParent(node.children, pId) };
                return node;
            });
        };
        setCategories(addNodeToParent(catsWithoutOld, parentId));
    }
    toast({ title: "Category Updated" });
  };

  const handleSaveAttribute = (attrData: Omit<Attribute, 'id'>, id?: string) => {
    if (id) {
      setAttributes(prev => prev.map(attr => attr.id === id ? { ...attr, ...attrData } : attr));
      toast({ title: 'Attribute Updated' });
    } else {
      const newAttribute = { ...attrData, id: `attr-${Date.now()}` };
      setAttributes(prev => [...prev, newAttribute]);
      toast({ title: 'Attribute Added' });
    }
  };

  const handleDeleteAttribute = (id: string) => {
    setAttributes(prev => prev.filter(attr => attr.id !== id));
    toast({ title: 'Attribute Deleted' });
  };

  return (
    <div className="p-2.5 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Category and Attribute Management</h1>
        <p className="text-muted-foreground">An interactive UI for managing hierarchical data structures.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Categories Management */}
        <aside className="w-full lg:w-64 shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-[20px]">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {categories.map(cat => (
                  <CategoryNode
                    key={cat.id}
                    category={cat}
                    level={0}
                    onAdd={(parentId) => { setEditingCategory(null); setParentCategoryId(parentId); setIsCategoryDialogOpen(true); }}
                    onEdit={(category) => { setEditingCategory(category); setIsCategoryDialogOpen(true); }}
                    onDelete={(category) => { /* Implement delete logic */ }}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    productCount={getCategoryProductCount(cat)}
                  />
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={() => { setEditingCategory(null); setParentCategoryId(null); setIsCategoryDialogOpen(true); }}><PlusCircle className="mr-2 h-4 w-4" /> Add Category</Button>
              </div>
              <CategoryDialog
                open={isCategoryDialogOpen}
                onOpenChange={setIsCategoryDialogOpen}
                onSave={(name, parentId) => editingCategory ? handleEditCategory(name, parentId) : handleAddCategory(name, parentId)}
                categories={categories}
                editingCategory={editingCategory}
                parentId={parentCategoryId}
              />
            </CardContent>
          </Card>
        </aside>

        {/* Attributes Management */}
        <main className="flex-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Attributes for: <span className="text-primary">{selectedCategory?.name || 'Global'}</span></CardTitle>
                    <CardDescription>A table displaying attributes for the selected category.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Attribute Name</TableHead>
                                    <TableHead>Data Type</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {displayedAttributes.map(attr => (
                                    <TableRow key={attr.id}>
                                        <TableCell className="font-medium">{attr.name}</TableCell>
                                        <TableCell className="capitalize align-top">
                                            <div>
                                                <span>{attr.type}</span>
                                                {attr.type === 'dropdown' && attr.options && attr.options.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 mt-1">
                                                        {attr.options.map(option => (
                                                        <Badge key={option} variant="secondary" className="font-normal">{option}</Badge>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {attr.isGlobal ? (
                                                <Badge variant="secondary">Global</Badge>
                                            ) : (
                                                <div className="flex flex-wrap gap-1">
                                                   {attr.assignedCategories.map(catId => (
                                                        <Badge key={catId}>{getCategoryNameById(categories, catId) || catId}</Badge>
                                                   ))}
                                                </div>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingAttribute(attr); setIsAttributeDialogOpen(true); }}>
                                                <Edit2 className="h-4 w-4"/>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteAttribute(attr.id)}>
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <AttributeDialog
                open={isAttributeDialogOpen}
                onOpenChange={setIsAttributeDialogOpen}
                onSave={handleSaveAttribute}
                editingAttribute={editingAttribute}
                categories={categories}
                selectedCategory={selectedCategory}
            />
        </main>
      </div>
        
        <div className="fixed bottom-8 right-8 z-50">
            <Button className="rounded-full shadow-lg h-14" onClick={() => { setEditingAttribute(null); setIsAttributeDialogOpen(true); }}>
                <PlusCircle className="h-6 w-6 mr-2" />
                <span className="sr-only sm:not-sr-only">Add Attribute</span>
            </Button>
        </div>
    </div>
  );
}
