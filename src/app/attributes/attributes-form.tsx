
'use client';

import * as React from 'react';
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
import { PlusCircle, Trash2, Edit, X, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { Attribute, AttributeType, Category } from '@/lib/types';


const TagInput = ({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) => {
    const [inputValue, setInputValue] = React.useState('');
    const inputRef = React.useRef<HTMLInputElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault();
        if (!value.includes(inputValue.trim())) {
          onChange([...value, inputValue.trim()]);
        }
        setInputValue('');
      } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
        onChange(value.slice(0, -1));
      }
    };

    const removeTag = (tagToRemove: string) => {
      onChange(value.filter((tag: string) => tag !== tagToRemove));
    };

    return (
        <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
            <div className="flex flex-wrap gap-1">
                {value.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                        {tag}
                        <button
                            type="button"
                            className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            onClick={() => removeTag(tag)}
                        >
                            <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                        </button>
                    </Badge>
                ))}
                <Input
                    ref={inputRef}
                    placeholder="Add options..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="ml-2 flex-1 bg-transparent p-0 outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 border-0 h-auto"
                />
            </div>
        </div>
    );
};


const AttributeDialog = ({
  attribute,
  onSave,
  children,
}: {
  attribute?: Attribute | null;
  onSave: (attr: Omit<Attribute, 'id'>) => void;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState(attribute?.name || '');
  const [dataType, setDataType] = React.useState<AttributeType>(attribute?.type || 'text');
  const [isSearchable, setIsSearchable] = React.useState(false); // Placeholder
  const [isFilterable, setIsFilterable] = React.useState(false); // Placeholder
  const [options, setOptions] = React.useState<string[]>(attribute?.options || []);

  React.useEffect(() => {
    if (isOpen) {
      setName(attribute?.name || '');
      setDataType(attribute?.type || 'text');
      setIsSearchable(false);
      setIsFilterable(false);
      setOptions(attribute?.options || []);
    }
  }, [isOpen, attribute]);
  
   React.useEffect(() => {
    if (dataType !== 'dropdown') {
      setOptions([]);
    }
  }, [dataType]);

  const handleSave = () => {
    onSave({ 
        name, 
        type: dataType, 
        options,
        // These fields are not in the provided Attribute type, but are in the form
        // For now, we will just use some placeholder logic.
        isGlobal: false, 
        assignedCategories: [] 
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <TooltipProvider>
            <DialogHeader>
            <DialogTitle>{attribute ? 'Edit' : 'Add'} Attribute</DialogTitle>
            <DialogDescription>
                {attribute ? 'Edit the details of this attribute.' : 'Define a new attribute for this category.'}
            </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">Name</Label>
                <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="data-type" className="text-right">Data Type</Label>
                <Select value={dataType} onValueChange={(value: AttributeType) => setDataType(value)}>
                    <SelectTrigger id="data-type" className="col-span-3"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="dropdown">Dropdown</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            {dataType === 'dropdown' && (
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="options" className="text-right pt-2">Options</Label>
                    <div className="col-span-3 space-y-2">
                        <TagInput value={options} onChange={setOptions} />
                        <p className="text-xs text-muted-foreground">Type an option and press Enter to add it.</p>
                    </div>
                </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
                <div className="flex items-center justify-end gap-1 col-start-1">
                    <Label className="text-right">Searchable</Label>
                    <Tooltip>
                        <TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                        <TooltipContent><p>Allows this attribute to be used in product search.</p></TooltipContent>
                    </Tooltip>
                </div>
                <Switch checked={isSearchable} onCheckedChange={setIsSearchable} />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <div className="flex items-center justify-end gap-1 col-start-1">
                     <Label className="text-right">Filterable</Label>
                     <Tooltip>
                        <TooltipTrigger asChild><Info className="h-4 w-4 text-muted-foreground" /></TooltipTrigger>
                        <TooltipContent><p>Allows filtering products by this attribute.</p></TooltipContent>
                    </Tooltip>
                </div>
                <Switch checked={isFilterable} onCheckedChange={setIsFilterable} />
            </div>
            </div>
            <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleSave}>Save</Button>
            </DialogFooter>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
};


export function AttributesTable({ category, attributes, onAttributeUpdate, categories }: { category: Category, attributes: Attribute[], onAttributeUpdate: (attributes: Attribute[]) => void, categories: Category[] }) {
  const { toast } = useToast();

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

  const handleAddAttribute = (newAttrData: Omit<Attribute, 'id'>) => {
    if (!newAttrData.name.trim()) {
        toast({ variant: 'destructive', title: 'Attribute name is required.' });
        return;
    }
    const newAttribute: Attribute = { 
        ...newAttrData, 
        id: `attr-${Date.now()}`,
        assignedCategories: [category.id] // Assign to current category
    };
    onAttributeUpdate([...attributes, newAttribute]);
    toast({ title: 'Attribute Added', description: `Successfully added "${newAttribute.name}".` });
  };

  const handleEditAttribute = (id: string) => (updatedAttrData: Omit<Attribute, 'id'>) => {
    if (!updatedAttrData.name.trim()) {
        toast({ variant: 'destructive', title: 'Attribute name is required.' });
        return;
    }
    onAttributeUpdate(attributes.map(attr => attr.id === id ? { ...attr, ...updatedAttrData } : attr));
    toast({ title: 'Attribute Updated', description: `Successfully updated "${updatedAttrData.name}".` });
  };

  const handleDeleteAttribute = (id: string) => {
    onAttributeUpdate(attributes.filter(attr => attr.id !== id));
    toast({ title: 'Attribute Removed' });
  };

  const displayedAttributes = React.useMemo(() => {
    return attributes.filter(attr => attr.isGlobal || attr.assignedCategories.includes(category.id));
  }, [attributes, category]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold">
          Attributes for: <span className="text-primary">{category.name}</span>
        </h2>
        <AttributeDialog onSave={handleAddAttribute}>
             <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Attribute
            </Button>
        </AttributeDialog>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="p-2 h-10 font-normal">Attribute Name</TableHead>
              <TableHead className="p-2 h-10 font-normal">Data Type</TableHead>
              <TableHead className="p-2 h-10 font-normal">Assigned To</TableHead>
              <TableHead className="text-center p-2 h-10 font-normal">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedAttributes.length > 0 ? displayedAttributes.map(attr => (
              <TableRow key={attr.id}>
                <TableCell className="font-medium p-2">{attr.name}</TableCell>
                <TableCell className="p-2 align-top">
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
                <TableCell className="text-center space-x-1 p-2">
                  <AttributeDialog attribute={attr} onSave={handleEditAttribute(attr.id)}>
                    <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </AttributeDialog>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteAttribute(attr.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center p-2">No attributes found for this category.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
