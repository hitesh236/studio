
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
  ListFilter,
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
import type { Category, Attribute, AttributeType } from '@/lib/types';
import { initialCategoriesData } from '@/lib/categories';
import { initialAttributes } from '@/lib/attributes';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


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
    <div className={cn(level === 0 && "mt-2 pt-2 border-t")}>
      <div
        className={cn(
          "flex items-center gap-1.5 py-1.5 px-2 rounded-md hover:bg-muted/50 group",
          isSelected && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-black"
        )}
        style={{ paddingLeft: `${level * 0.75 + 0.5}rem` }}
      >
        <div className="flex items-center gap-1.5 flex-1 cursor-pointer truncate" onClick={() => onSelectCategory(category)}>
          <span className="w-4 h-4 cursor-pointer" onClick={(e) => { e.stopPropagation(); hasChildren && setIsOpen(!isOpen); }}>
            {hasChildren && (isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
          </span>
          <Folder className="h-4 w-4 text-amber-500 shrink-0" />
          <span className={cn("text-sm truncate", level === 0 && "font-semibold")}>{category.name} ({productCount})</span>
        </div>
        <div className="hidden group-hover:flex items-center gap-1">
            <TooltipProvider><Tooltip>
                <TooltipTrigger asChild><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onAdd(category.id)}><PlusCircle className="h-4 w-4" /></Button></TooltipTrigger>
                <TooltipContent><p>Add Sub-category</p></TooltipContent>
            </Tooltip></TooltipProvider>
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

const AddIndustryDialog = ({ open, onOpenChange, onSave }: { open: boolean, onOpenChange: (open: boolean) => void, onSave: (name: string) => void }) => {
    const [name, setName] = React.useState('');
    
    React.useEffect(() => {
        if (!open) setName('');
    }, [open]);

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
            onOpenChange(false);
        }
    };
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader><DialogTitle>Add New Industry</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                    <Label htmlFor="industry-name">Industry Name</Label>
                    <Input id="industry-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Fashion" />
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Industry</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
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
                                        {selectedParent ? flattenedCategories.find(cat => cat.value === selectedParent)?.label.replace(/— /g, '') : "(No Parent)"}
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
  
  const [industries, setIndustries] = React.useState(() => initialCategoriesData.map(cat => ({id: cat.id, name: cat.name})));
  const [selectedIndustries, setSelectedIndustries] = React.useState<string[]>(industries.map(i => i.id));
  
  const [selectedCategory, setSelectedCategory] = React.useState<Category | null>(null);

  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<Category | null>(null);
  const [parentCategoryId, setParentCategoryId] = React.useState<string | null>(null);

  const [isAttributeDialogOpen, setIsAttributeDialogOpen] = React.useState(false);
  const [editingAttribute, setEditingAttribute] = React.useState<Attribute | null>(null);

  const [isIndustryDialogOpen, setIsIndustryDialogOpen] = React.useState(false);


  const displayedCategories = React.useMemo(() => {
    return categories.filter(cat => selectedIndustries.includes(cat.id));
  }, [categories, selectedIndustries]);

  const displayedAttributes = React.useMemo(() => {
    if (!selectedCategory) return attributes.filter(attr => attr.isGlobal);
    // This logic needs to be more complex to handle inheritance.
    // For now, it's a direct match or global.
    return attributes.filter(attr => attr.isGlobal || attr.assignedCategories.includes(selectedCategory.id));
  }, [attributes, selectedCategory]);

  const handleToggleIndustry = (industryId: string) => {
    setSelectedIndustries(prev => {
        const newSet = new Set(prev);
        if (newSet.has(industryId)) {
            newSet.delete(industryId);
        } else {
            newSet.add(industryId);
        }
        // If the currently selected category is part of the unchecked industry, reset it.
        const selectedCategoryIndustry = findRootParent(categories, selectedCategory?.id || '');
        if (selectedCategoryIndustry && selectedCategoryIndustry.id === industryId && !newSet.has(industryId)) {
            setSelectedCategory(null);
        }
        return Array.from(newSet);
    });
  };
  
  const findRootParent = (categories: Category[], childId: string): Category | null => {
      for (const cat of categories) {
        if (cat.id === childId) return cat; // It's a root itself
        let found = false;
        const findInChildren = (current: Category): boolean => {
            if (current.id === childId) return true;
            if (current.children) {
                for (const child of current.children) {
                    if (findInChildren(child)) return true;
                }
            }
            return false;
        };
        if (cat.children && findInChildren(cat)) {
            return cat;
        }
    }
    return null;
  }
  
  const handleAddIndustry = (name: string) => {
    const newIndustry: Category = {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name: name,
        children: [],
    };
    setCategories(prev => [...prev, newIndustry]);
    setIndustries(prev => [...prev, { id: newIndustry.id, name: newIndustry.name }]);
    setSelectedIndustries(prev => [...prev, newIndustry.id]);
    toast({ title: 'Industry Added' });
  };


  const handleSaveCategory = (name: string, parentId: string | null) => {
    const newCategory: Category = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name: name,
      children: [],
    };

    if (editingCategory) {
        // Edit logic
        setCategories(prev => {
            // Remove the old category first
            const withoutOld = JSON.parse(JSON.stringify(prev));
            let categoryToMove: Category | null = null;
            
            const findAndRemove = (cats: Category[]): Category[] => {
                return cats.filter(c => {
                    if (c.id === editingCategory.id) {
                        categoryToMove = c;
                        return false;
                    }
                    if (c.children) {
                        c.children = findAndRemove(c.children);
                    }
                    return true;
                });
            }
            const updatedCategories = findAndRemove(withoutOld);

            if (!categoryToMove) return prev; // Should not happen
            
            // Update the category details
            categoryToMove.name = name;
            categoryToMove.id = name.toLowerCase().replace(/\s+/g, '-');
            
            // Add it to the new parent
            if (!parentId) {
                updatedCategories.push(categoryToMove);
            } else {
                 const addToParent = (cats: Category[]): boolean => {
                    for (let cat of cats) {
                        if (cat.id === parentId) {
                            cat.children = [...(cat.children || []), categoryToMove as Category];
                            return true;
                        }
                        if (cat.children && addToParent(cat.children)) {
                            return true;
                        }
                    }
                    return false;
                }
                addToParent(updatedCategories);
            }
            return updatedCategories;
        });
        toast({ title: 'Category Updated' });
    } else {
        // Add logic
        if (!parentId) {
            if (selectedIndustries.length !== 1) {
                toast({ variant: 'destructive', title: 'Please select one industry to add a top-level category to.'});
                return;
            }
            const industryId = selectedIndustries[0];
             setCategories(prev => prev.map(ind => {
                if (ind.id === industryId) {
                    return { ...ind, children: [...(ind.children || []), newCategory] };
                }
                return ind;
            }));

        } else {
            const addRecursive = (cats: Category[]): Category[] => {
                return cats.map(cat => {
                    if (cat.id === parentId) {
                        return { ...cat, children: [...(cat.children || []), newCategory] };
                    }
                    if (cat.children) {
                        return { ...cat, children: addRecursive(cat.children) };
                    }
                    return cat;
                });
            }
            setCategories(prev => addRecursive(prev));
        }
        toast({ title: 'Category Added' });
    }
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
            <h1 className="text-2xl font-bold">Category and Attribute Management</h1>
            <p className="text-muted-foreground">Select industries to filter categories and manage their attributes.</p>
        </div>
        <div className="flex items-center gap-2">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                        <ListFilter className="mr-2 h-4 w-4" />
                        Filter Industries ({selectedIndustries.length})
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" onPointerDownOutside={(e) => e.preventDefault()}>
                    <DropdownMenuLabel>Show Industries</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {industries.map(industry => (
                        <DropdownMenuCheckboxItem
                            key={industry.id}
                            checked={selectedIndustries.includes(industry.id)}
                            onCheckedChange={() => handleToggleIndustry(industry.id)}
                        >
                            {industry.name}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
             <Button onClick={() => setIsIndustryDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Industry
            </Button>
            <AddIndustryDialog open={isIndustryDialogOpen} onOpenChange={setIsIndustryDialogOpen} onSave={handleAddIndustry} />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <aside className="w-full lg:w-72 shrink-0">
          <Card>
            <CardHeader>
              <CardTitle className="text-[20px]">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {displayedCategories.map(cat => (
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
                onSave={handleSaveCategory}
                categories={categories}
                editingCategory={editingCategory}
                parentId={parentCategoryId}
              />
            </CardContent>
          </Card>
        </aside>

        <main className="flex-1 space-y-8 w-full">
            <Card>
                <CardHeader>
                    <CardTitle>Attributes for: <span className="text-primary">{selectedCategory?.name || '...'}</span></CardTitle>
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
                                {displayedAttributes.length > 0 ? displayedAttributes.map(attr => (
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
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingAttribute(attr); setIsAttributeDialogOpen(true); }}>
                                                <Edit2 className="h-4 w-4"/>
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteAttribute(attr.id)}>
                                                <Trash2 className="h-4 w-4"/>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                )) : (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-24 text-center">
                                            {selectedCategory ? 'No attributes assigned. Add one below.' : 'Select a category to see its attributes.'}
                                        </TableCell>
                                    </TableRow>
                                )}
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
                <PlusCircle className="h-6 w-6" />
                <span className="sr-only sm:not-sr-only sm:ml-2">Add Attribute</span>
            </Button>
        </div>
    </div>
  );
}
