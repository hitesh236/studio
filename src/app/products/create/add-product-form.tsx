

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, X, Sparkles, ChevronsUpDown, Check, Layers, Save, Barcode, Percent, Receipt, Calendar as CalendarIcon, Info } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { initialCategoriesData, type Category } from '@/lib/categories';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { initialSimpleUnits, initialCompoundUnits, type SimpleUnit, type CompoundUnit } from '@/lib/uom-data';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn, formatCurrency } from '@/lib/utils';
import type { Attribute } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { staticVendors } from '@/lib/customer-data';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Badge } from '@/components/ui/badge';

type Variant = {
  id: string;
  values: { [key: string]: string };
  sku: string;
  barcode: string;
  buyingPrice: number | '';
  price: { regular: number | ''; b2b: number | ''; b2c: number | '' };
  reorderPoint: number | '';
};

const invoiceItemSchema = z.object({
  productId: z.string().min(1, 'Item selection is required.'),
  itemName: z.string().min(1, 'Item name is required.'),
  hsnCode: z.string().optional(),
  quantity: z.coerce.number().min(0.01, 'Quantity must be positive.'),
  unit: z.string().optional(),
  rate: z.coerce.number().min(0, 'Rate cannot be negative.'),
  discount: z.coerce.number().min(0).max(100).optional().default(0),
  gstRate: z.coerce.number().min(0).max(100).default(18),
});

const productFormSchema = z.object({
    productName: z.string().min(1, "Product name is required."),
    productCode: z.string().optional(),
    categoryPath: z.array(z.string()).min(1, "Category is required."),
    hsnCode: z.string().optional(),
    gstRate: z.coerce.number().min(0).max(100),
    uom: z.string().min(1, "Unit of Measurement is required."),
    secondaryUom: z.string().optional(),
    preferredSupplier: z.string().optional(),
    reorderPoint: z.coerce.number().optional(),
    tags: z.array(z.string()).optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

// Helper functions
const slug = (s: string) =>
  (s || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

const shortCode = (s: string) =>
  (s || '')
    .toString()
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 6) || 'X';

function cartesian(arrays: string[][]): string[][] {
  if (!arrays || arrays.length === 0) {
    return [[]];
  }
  return arrays.reduce(
    (acc, curr) => {
      const res: string[][] = [];
      acc.forEach(a => {
        (curr || []).forEach(b => res.push([...a, b]));
      });
      return res;
    },
    [[]] as string[][]
  );
}

function buildSku(baseCode: string, attrNames: string[], values: string[]) {
  const parts = [shortCode(baseCode)];
  values.forEach(val => {
    parts.push(shortCode(val));
  });
  return parts.filter(Boolean).join('-');
}

const PriceBreakdown = ({ sellingPrice, buyingPrice, gstRate, includesGst }: { sellingPrice?: number | ''; buyingPrice?: number | ''; gstRate: number; includesGst: boolean; }) => {
    const sp = Number(sellingPrice) || 0;
    const bp = Number(buyingPrice) || 0;

    if (sp === 0) return null;

    let basePrice: number;
    let gstAmount: number;

    if (includesGst) {
        basePrice = sp / (1 + gstRate / 100);
        gstAmount = sp - basePrice;
    } else {
        basePrice = sp;
        gstAmount = sp * (gstRate / 100);
    }

    const margin = basePrice - bp;
    const marginPercentage = bp > 0 ? (margin / bp) * 100 : 0;

    return (
        <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
            <p>Base: {formatCurrency(basePrice, 'INR')}</p>
            <p>GST: {formatCurrency(gstAmount, 'INR')}</p>
            {bp > 0 && (
                <p className={cn(margin > 0 ? 'text-green-600' : 'text-destructive')}>
                    Margin: {formatCurrency(margin, 'INR')} ({marginPercentage.toFixed(1)}%)
                </p>
            )}
        </div>
    );
};

export function AddProductForm() {
  const { toast } = useToast();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      productName: '',
      productCode: '',
      categoryPath: [],
      hsnCode: '',
      gstRate: 18,
      uom: '',
      secondaryUom: '',
      preferredSupplier: '',
      reorderPoint: 0,
      tags: [],
    },
  });

  // Core Product State
  const [sellingPriceIncludesGst, setSellingPriceIncludesGst] = React.useState(false);

  // Descriptive Attributes State
  const [descriptiveAttrs, setDescriptiveAttrs] = React.useState<{
    [key: string]: string;
  }>({});
  const [availableDescAttrs, setAvailableDescAttrs] = React.useState([
    'Material',
    'Storage',
    'Country of Origin',
    'Certifications',
  ]);
  const [customDescAttrName, setCustomDescAttrName] = React.useState('');
  const [selectedDescAttr, setSelectedDescAttr] = React.useState('');

  // Inventory-Driving Attributes State
  const [stockAttrs, setStockAttrs] = React.useState<Attribute[]>([]);
  const [customAttrName, setCustomAttrName] = React.useState('');

  // Variants State
  const [variants, setVariants] = React.useState<Variant[]>([]);

  // Category State
  const categoryPath = form.watch('categoryPath');
  const [categoryLevels, setCategoryLevels] = React.useState<Category[][]>([
    initialCategoriesData,
  ]);

  // UOM State
  const [simpleUnits, setSimpleUnits] = React.useState<SimpleUnit[]>(
    initialSimpleUnits
  );
  const [isUomDialogOpen, setIsUomDialogOpen] = React.useState(false);
  const [newUom, setNewUom] = React.useState({ name: '', abbreviation: '' });
  const [showSecondaryUom, setShowSecondaryUom] = React.useState(false);

  const activeSimpleUnits = React.useMemo(
    () => simpleUnits.filter((u) => u.status !== 'disabled'),
    [simpleUnits]
  );
  
  const uom = form.watch('uom');
  const secondaryUom = form.watch('secondaryUom');

  const secondaryUomOptions = React.useMemo(() => {
    if (!uom) return [];
    return initialCompoundUnits
      .filter((cu) => cu.firstUnit.id === uom)
      .map((cu) => cu.secondUnit);
  }, [uom]);

  const conversionRate = React.useMemo(() => {
    if (!uom || !secondaryUom) return null;
    const compound = initialCompoundUnits.find(
      (cu) => cu.firstUnit.id === uom && cu.secondUnit.id === secondaryUom
    );
    if (!compound) return null;
    return `1 ${compound.firstUnit.name} = ${compound.conversion} ${compound.secondUnit.name}`;
  }, [uom, secondaryUom]);

  React.useEffect(() => {
    let currentCategories = initialCategoriesData;
    const newLevels: Category[][] = [currentCategories];
    for (const catId of categoryPath) {
      const foundCat = currentCategories.find((c) => c.id === catId);
      if (foundCat && foundCat.children) {
        currentCategories = foundCat.children;
        newLevels.push(currentCategories);
      } else {
        break;
      }
    }
    setCategoryLevels(newLevels);
  }, [categoryPath]);

  const handleCategoryChange = (level: number, value: string) => {
    const newPath = categoryPath.slice(0, level);
    if (value) {
      newPath.push(value);
    }
    form.setValue('categoryPath', newPath);
  };

  const handleAddUom = () => {
    if (newUom.name.trim() && newUom.abbreviation.trim()) {
      if (
        simpleUnits.some(
          (u) =>
            u.name.toLowerCase() === newUom.name.toLowerCase() ||
            u.abbreviation.toLowerCase() === newUom.abbreviation.toLowerCase()
        )
      ) {
        toast({ variant: 'destructive', title: 'Unit already exists.' });
        return;
      }
      const newUnit: SimpleUnit = {
        id: newUom.abbreviation.toLowerCase(),
        name: newUom.name.trim(),
        abbreviation: newUom.abbreviation.trim(),
        status: 'active',
      };
      setSimpleUnits((prev) => [...prev, newUnit]);
      form.setValue('uom', newUnit.id);
      toast({ title: 'UOM Added' });
      setIsUomDialogOpen(false);
      setNewUom({ name: '', abbreviation: '' });
    }
  };

  const handleDescriptiveAttrChange = (key: string, value: string) => {
    setDescriptiveAttrs((prev) => ({ ...prev, [key]: value }));
  };
  
  const handleSelectDescAttr = (attrName: string) => {
    if (attrName && !descriptiveAttrs.hasOwnProperty(slug(attrName))) {
        setDescriptiveAttrs(prev => ({...prev, [slug(attrName)]: ''}));
    }
    setSelectedDescAttr('');
  }

  const handleAddCustomDescAttr = () => {
    if (
      customDescAttrName.trim() &&
      !availableDescAttrs.includes(customDescAttrName.trim())
    ) {
      const newAttrName = customDescAttrName.trim();
      setAvailableDescAttrs((prev) => [...prev, newAttrName]);
      handleSelectDescAttr(newAttrName);
      setCustomDescAttrName('');
    }
  };

  const handleRemoveDescriptiveAttr = (key: string) => {
    setDescriptiveAttrs(prev => {
        const newAttrs = {...prev};
        delete newAttrs[key];
        return newAttrs;
    });
  }

  const handleAddStockAttr = (name: string) => {
    if (!name.trim()) return;
    if (stockAttrs.some((a) => a.name.toLowerCase() === name.trim().toLowerCase())) {
      toast({ title: 'Attribute already exists.', variant: 'destructive' });
      return;
    }
    const defaults: Record<string, string[]> = {
      Brand: ['Amul', 'Mother Dairy', 'Nestle'],
      'Pack Size': ['200ml', '500ml', '1L', '2L'],
      Flavor: ['Plain', 'Vanilla', 'Strawberry', 'Chocolate'],
      'Fat %': ['Toned', 'Full Cream', 'Skimmed'],
      Color: ['Red', 'Green', 'Blue'],
    };
    setStockAttrs((prev) => [
      ...prev,
      {
        id: `attr-${Date.now()}`,
        name: name.trim(),
        values: defaults[name.trim()] || [],
        type: 'text',
        isGlobal: false,
        assignedCategories: [],
      },
    ]);
    setCustomAttrName('');
  };

  const handleRemoveStockAttr = (index: number) => {
    setStockAttrs((prev) => prev.filter((_, i) => i !== index));
    setVariants([]); // Clear variants when an attribute is removed
  };

  const handleStockAttrChange = (
    index: number,
    field: 'name' | 'values',
    value: string
  ) => {
    setStockAttrs((prev) => {
      const newAttrs = [...prev];
      const attr = newAttrs[index];
      if (field === 'name') {
        attr.name = value;
      } else {
        attr.values = value.split(',').map((s) => s.trim()).filter(Boolean);
      }
      return newAttrs;
    });
  };

  const handleGenerateVariants = () => {
    const attrsWithValues = stockAttrs.filter(
      (a) => a.values && a.values.length > 0
    );
    if (attrsWithValues.length === 0) {
      toast({
        title: 'Add attribute values',
        description:
          'Please add some values to at least one attribute to generate variants.',
        variant: 'destructive',
      });
      return;
    }

    const valueArrays = attrsWithValues.map((a) => a.values!);
    const combinations = cartesian(valueArrays);

    const baseCode = form.getValues('productCode') || form.getValues('productName') || 'PROD';
    const newVariants: Variant[] = combinations.map((combo, index) => {
      const valuesMap: { [key: string]: string } = {};
      attrsWithValues.forEach((attr, i) => {
        valuesMap[slug(attr.name)] = combo[i];
      });

      return {
        id: `var-${Date.now()}-${index}`,
        values: valuesMap,
        sku: buildSku(
          baseCode,
          attrsWithValues.map((a) => a.name),
          combo
        ),
        barcode: '',
        buyingPrice: '',
        price: { regular: '', b2b: '', b2c: '' },
        reorderPoint: form.getValues('reorderPoint') || 0,
      };
    });
    setVariants(newVariants);
  };

  const handleVariantChange = (
    id: string,
    field: keyof Omit<Variant, 'id' | 'values' | 'price'>,
    value: string | number
  ) => {
    setVariants((prev) =>
      prev.map((v) => (v.id === id ? { ...v, [field]: value } : v))
    );
  };
  
  const handlePriceChange = (
    id: string,
    priceType: 'regular' | 'b2b' | 'b2c',
    value: string | number
  ) => {
    setVariants(prev =>
      prev.map(v =>
        v.id === id
          ? { ...v, price: { ...v.price, [priceType]: value } }
          : v
      )
    );
  };

  const presetAttributes = ['Brand', 'Pack Size', 'Flavor', 'Fat %', 'Color'];
  const addedAttributeNames = new Set(stockAttrs.map((a) => a.name));

  const onSubmit = (data: ProductFormValues) => {
    console.log({
      product: data,
      descriptive: descriptiveAttrs,
      inventory: stockAttrs,
      variants: variants,
    });
    toast({
      title: 'Product Saved!',
      description: 'Check the console for the saved data structure.',
    });
  }

  const TagsInput = ({ field }: { field: any }) => {
    const [inputValue, setInputValue] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const predefinedTags = ['new-arrival', 'best-seller', 'featured', 'on-sale', 'clearance', 'eco-friendly', 'premium'];

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault();
        if (!field.value.includes(inputValue.trim())) {
          field.onChange([...field.value, inputValue.trim()]);
        }
        setInputValue('');
      } else if (e.key === 'Backspace' && !inputValue && field.value.length > 0) {
        field.onChange(field.value.slice(0, -1));
      }
    };

    const removeTag = (tagToRemove: string) => {
      field.onChange(field.value.filter((tag: string) => tag !== tagToRemove));
    };

    const filteredTags = predefinedTags.filter(
      (tag) => !field.value.includes(tag) && tag.toLowerCase().includes(inputValue.toLowerCase())
    );

    return (
      <FormItem>
        <Command>
            <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
                <div className="flex flex-wrap gap-1">
                    {field.value.map((tag: string) => (
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
                    <CommandInput
                        ref={inputRef}
                        placeholder="Add tags..."
                        value={inputValue}
                        onValueChange={setInputValue}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setOpen(true)}
                        onBlur={() => setOpen(false)}
                        className="ml-2 flex-1 bg-transparent p-0 outline-none placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 border-0 h-auto"
                    />
                </div>
            </div>
            {open && (filteredTags.length > 0 || (inputValue && !predefinedTags.includes(inputValue))) && (
                <div className="relative">
                    <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                        <CommandList className="max-h-40">
                            <CommandEmpty>No results found.</CommandEmpty>
                            <CommandGroup>
                                {filteredTags.map((tag) => (
                                    <CommandItem
                                        key={tag}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onSelect={() => {
                                            if (!field.value.includes(tag)) {
                                                field.onChange([...field.value, tag]);
                                            }
                                            setInputValue('');
                                        }}
                                    >
                                        {tag}
                                    </CommandItem>
                                ))}
                                {inputValue.trim() && !predefinedTags.includes(inputValue.trim()) && (
                                     <CommandItem
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onSelect={() => {
                                            if (!field.value.includes(inputValue.trim())) {
                                                field.onChange([...field.value, inputValue.trim()]);
                                            }
                                            setInputValue('');
                                        }}
                                    >
                                        Create "{inputValue}"
                                    </CommandItem>
                                )}
                            </CommandGroup>
                        </CommandList>
                    </div>
                </div>
            )}
        </Command>
        <div className="relative">
            <FormDescription>
                Type a tag and press Enter. Suggestions will appear as you type.
            </FormDescription>
        </div>
        <FormMessage />
      </FormItem>
    );
};
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[18px]">Core Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="productName"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Name *</FormLabel>
                    <FormControl><Input placeholder="e.g., Amul Milk" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="productCode"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product Code (for SKU prefix)</FormLabel>
                    <FormControl><Input placeholder="e.g., MLK-AMUL" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                name="categoryPath"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <div className="grid grid-cols-1 gap-2">
                      {categoryLevels.map((levelCategories, level) => (
                        <Select
                          key={level}
                          onValueChange={(value) => handleCategoryChange(level, value)}
                          value={field.value[level] || ''}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={`Select Level ${level + 1}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {levelCategories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <FormField
                  name="gstRate"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GST Rate (%)</FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0, 5, 12, 18, 28].map((rate) => (
                            <SelectItem key={rate} value={String(rate)}>
                              {rate}%
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="space-y-2">
                    <FormField
                      name="uom"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm flex items-center gap-2">
                              Base UOM
                              <TooltipProvider>
                                  <Tooltip>
                                      <TooltipTrigger asChild>
                                          <Button type="button" variant="ghost" size="icon" className="h-4 w-4" asChild><Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" /></Button>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                          <p>Unit of Measurements</p>
                                      </TooltipContent>
                                  </Tooltip>
                              </TooltipProvider>
                          </FormLabel>
                          <div className="relative flex items-center">
                              <Select onValueChange={field.onChange} value={field.value}>
                                  <SelectTrigger className="pr-12">
                                  <SelectValue placeholder="Select unit" />
                                  </SelectTrigger>
                                  <SelectContent>
                                  {activeSimpleUnits.map((unit) => (
                                      <SelectItem key={unit.id} value={unit.id}>
                                      {unit.name} ({unit.abbreviation})
                                      </SelectItem>
                                  ))}
                                  </SelectContent>
                              </Select>
                              <Dialog
                                  open={isUomDialogOpen}
                                  onOpenChange={setIsUomDialogOpen}
                              >
                                  <DialogTrigger asChild>
                                  <Button type="button" variant="outline" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7">
                                      <PlusCircle className="h-4 w-4" />
                                  </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                  <DialogHeader>
                                      <DialogTitle>Add New Unit</DialogTitle>
                                  </DialogHeader>
                                  <div className="grid gap-4 py-4">
                                      <div className="space-y-2">
                                      <Label htmlFor="uom-name">Unit Name</Label>
                                      <Input
                                          id="uom-name"
                                          value={newUom.name}
                                          onChange={(e) =>
                                          setNewUom((u) => ({ ...u, name: e.target.value }))
                                          }
                                          placeholder="e.g., Pieces"
                                      />
                                      </div>
                                      <div className="space-y-2">
                                      <Label htmlFor="uom-abbr">Abbreviation</Label>
                                      <Input
                                          id="uom-abbr"
                                          value={newUom.abbreviation}
                                          onChange={(e) =>
                                          setNewUom((u) => ({
                                              ...u,
                                              abbreviation: e.target.value,
                                          }))
                                          }
                                          placeholder="e.g., pcs"
                                      />
                                      </div>
                                  </div>
                                  <DialogFooter>
                                      <DialogClose asChild>
                                      <Button variant="outline" type="button">
                                          Cancel
                                      </Button>
                                      </DialogClose>
                                      <Button type="button" onClick={handleAddUom}>
                                      Save Unit
                                      </Button>
                                  </DialogFooter>
                                  </DialogContent>
                              </Dialog>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                     {showSecondaryUom ? (
                        <>
                          <FormField
                            name="secondaryUom"
                            control={form.control}
                            render={({ field }) => (
                              <FormItem>
                                <Label className="text-sm">Secondary UOM</Label>
                                <div className="flex items-center gap-2">
                                  <Select
                                      onValueChange={field.onChange}
                                      value={field.value}
                                      disabled={secondaryUomOptions.length === 0}
                                  >
                                      <SelectTrigger>
                                      <SelectValue
                                          placeholder={
                                          secondaryUomOptions.length > 0
                                              ? 'Select secondary unit'
                                              : 'No conversion found'
                                          }
                                      />
                                      </SelectTrigger>
                                      <SelectContent>
                                      {secondaryUomOptions.map((unit) => (
                                          <SelectItem key={unit.id} value={unit.id}>
                                          {unit.name} ({unit.abbreviation})
                                          </SelectItem>
                                      ))}
                                      </SelectContent>
                                  </Select>
                                  <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      className="text-destructive shrink-0"
                                      onClick={() => {
                                      setShowSecondaryUom(false);
                                      form.setValue('secondaryUom', '');
                                      }}
                                  >
                                      <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                {conversionRate && (
                                  <p className="text-xs text-muted-foreground pt-1">
                                      {conversionRate}
                                  </p>
                                )}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                    ) : (
                        uom && (
                        <div className="flex flex-col h-full justify-end">
                            <Button
                                type="button"
                                variant="link"
                                className="p-0 h-9 justify-start"
                                onClick={() => setShowSecondaryUom(true)}
                            >
                                + Add Secondary Unit
                            </Button>
                        </div>
                        )
                    )}
                </div>
                <FormField
                  name="preferredSupplier"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferred Supplier</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          {staticVendors.map((vendor) => (
                            <SelectItem key={vendor.id} value={vendor.id}>
                              {vendor.company}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  name="hsnCode"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>HSN/SAC Code</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 847160" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[18px]">Create Variants</CardTitle>
            <CardDescription>
              Add attributes that create different versions of this product, like size or color.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 rounded-md border p-4">
                <Label>1. Add Variant Attributes</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Common Attributes</p>
                        <div className="flex flex-wrap gap-2">
                        {presetAttributes.map((preset) => (
                            <Button
                            key={preset}
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddStockAttr(preset)}
                            disabled={addedAttributeNames.has(preset)}
                            >
                            <PlusCircle className="mr-2 h-4 w-4" /> {preset}
                            </Button>
                        ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Custom Attribute</p>
                        <div className="flex gap-2">
                        <Input
                            value={customAttrName}
                            onChange={(e) => setCustomAttrName(e.target.value)}
                            placeholder="e.g., Material"
                        />
                        <Button
                            type="button"
                            onClick={() => handleAddStockAttr(customAttrName)}
                        >
                            Add
                        </Button>
                        </div>
                    </div>
                </div>
            </div>

            {stockAttrs.length > 0 && (
              <div className="space-y-4 rounded-md border p-4">
                <Label>2. Define Attribute Values</Label>
                <div className="space-y-4">
                  {stockAttrs.map((attr, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-1 md:grid-cols-[1fr,2fr] gap-4 items-center"
                    >
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive h-8 w-8"
                          onClick={() => handleRemoveStockAttr(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Input
                          value={attr.name}
                          onChange={(e) =>
                            handleStockAttrChange(index, 'name', e.target.value)
                          }
                          className="font-semibold"
                          readOnly={presetAttributes.includes(attr.name)}
                        />
                      </div>
                      <Input
                        type="text"
                        value={attr.values?.join(', ')}
                        onChange={(e) =>
                          handleStockAttrChange(index, 'values', e.target.value)
                        }
                        placeholder="Enter comma-separated values (e.g., 500ml, 1L)"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4 border-t">
              <Button type="button" onClick={handleGenerateVariants}>
                <Sparkles className="mr-2 h-4 w-4" /> Generate Variants
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setVariants([])}
              >
                Clear Variants
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-bold text-[18px]">Variants (SKUs) & Pricing</CardTitle>
               <div className="flex items-center space-x-2">
                <Switch
                  id="include-gst"
                  checked={sellingPriceIncludesGst}
                  onCheckedChange={setSellingPriceIncludesGst}
                />
                <Label htmlFor="include-gst">Selling Prices Including GST</Label>
              </div>
            </div>
            <CardDescription>
              Set pricing and identifiers for each generated product variant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {stockAttrs.map((attr) => (
                      <TableHead key={slug(attr.name)}>{attr.name}</TableHead>
                    ))}
                    <TableHead>SKU</TableHead>
                    <TableHead>Buying Price</TableHead>
                    <TableHead className="min-w-[150px]">Selling Prices</TableHead>
                    <TableHead className="text-right">Reorder Point</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.length > 0 ? (
                    variants.map((variant) => {
                      const isLowStock = false; // Stock management removed for now
                      return (
                        <TableRow
                          key={variant.id}
                          className={cn(isLowStock && 'bg-destructive/10')}
                        >
                          {stockAttrs.map((attr) => (
                            <TableCell key={slug(attr.name)}>
                              {variant.values[slug(attr.name)]}
                            </TableCell>
                          ))}
                          <TableCell>
                            <div className="space-y-1">
                                <Input
                                className="min-w-[120px]"
                                value={variant.sku}
                                onChange={(e) =>
                                    handleVariantChange(
                                    variant.id,
                                    'sku',
                                    e.target.value
                                    )
                                }
                                />
                                <div className="relative">
                                    <Barcode className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        className="min-w-[120px] pl-8"
                                        placeholder="Barcode"
                                        value={variant.barcode}
                                        onChange={(e) =>
                                            handleVariantChange(
                                            variant.id,
                                            'barcode',
                                            e.target.value
                                            )
                                        }
                                    />
                                </div>
                            </div>
                          </TableCell>
                          <TableCell>
                             <Input
                                type="text"
                                className="text-right min-w-[90px]"
                                placeholder="0.00"
                                value={variant.buyingPrice}
                                onChange={(e) => handleVariantChange(variant.id, 'buyingPrice', e.target.value)}
                              />
                          </TableCell>
                           <TableCell>
                                <div className="space-y-1">
                                    <Input
                                    type="text"
                                    placeholder="Regular Price"
                                    className="h-7 text-xs"
                                    value={variant.price.regular}
                                    onChange={(e) => handlePriceChange(variant.id, 'regular', e.target.value)}
                                    />
                                    <PriceBreakdown sellingPrice={variant.price.regular} buyingPrice={variant.buyingPrice} gstRate={form.getValues('gstRate')} includesGst={sellingPriceIncludesGst} />
                                    <Input
                                    type="text"
                                    placeholder="B2B Price"
                                    className="h-7 text-xs mt-2"
                                    value={variant.price.b2b}
                                    onChange={(e) => handlePriceChange(variant.id, 'b2b', e.target.value)}
                                    />
                                     <PriceBreakdown sellingPrice={variant.price.b2b} buyingPrice={variant.buyingPrice} gstRate={form.getValues('gstRate')} includesGst={sellingPriceIncludesGst} />
                                    <Input
                                    type="text"
                                    placeholder="B2C Price"
                                    className="h-7 text-xs mt-2"
                                    value={variant.price.b2c}
                                    onChange={(e) => handlePriceChange(variant.id, 'b2c', e.target.value)}
                                    />
                                     <PriceBreakdown sellingPrice={variant.price.b2c} buyingPrice={variant.buyingPrice} gstRate={form.getValues('gstRate')} includesGst={sellingPriceIncludesGst} />
                                </div>
                            </TableCell>
                          <TableCell>
                            <FormField
                                name="reorderPoint"
                                control={form.control}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                            type="number"
                                            className="text-right min-w-[70px]"
                                            placeholder="0"
                                            {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={stockAttrs.length + 5}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No variants generated.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[18px]">Descriptive Attributes</CardTitle>
            <CardDescription>
              Use these for search/filter. They won’t multiply SKUs or stock
              tracking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.keys(descriptiveAttrs).map(key => {
                    const attrName = availableDescAttrs.find(a => slug(a) === key) || key;
                    return (
                      <div key={key} className="grid grid-cols-[1fr_auto] items-end gap-2">
                        <div className="flex-1">
                          <Label htmlFor={`desc-${key}`}>{attrName}</Label>
                          <Input
                            id={`desc-${key}`}
                            name={key}
                            value={descriptiveAttrs[key] || ''}
                            onChange={(e) => handleDescriptiveAttrChange(key, e.target.value)}
                            placeholder={`Enter ${attrName}`}
                          />
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveDescriptiveAttr(key)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )
                })}
            </div>
            <div className="pt-4 border-t">
              <Label>Add another descriptive attribute</Label>
              <div className="flex gap-2 mt-2">
                 <Select onValueChange={handleSelectDescAttr} value={selectedDescAttr}>
                    <SelectTrigger className="max-w-[50%]">
                        <SelectValue placeholder="Select an attribute" />
                    </SelectTrigger>
                    <SelectContent>
                        {availableDescAttrs.filter(attr => !descriptiveAttrs.hasOwnProperty(slug(attr))).map(attr => (
                            <SelectItem key={attr} value={attr}>{attr}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <div className="flex-1 flex gap-2">
                    <Input
                        value={customDescAttrName}
                        onChange={(e) => setCustomDescAttrName(e.target.value)}
                        placeholder="Or type a new one..."
                    />
                    <Button type="button" onClick={handleAddCustomDescAttr}>
                        Add
                    </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle className="text-lg font-bold text-[18px]">Organization</CardTitle>
            </CardHeader>
             <CardContent>
                <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                    <div className="md:col-span-2">
                        <FormLabel>Tags/Keywords</FormLabel>
                        <TagsInput field={field} />
                    </div>
                    )}
                />
            </CardContent>
        </Card>
        
        <div className="flex justify-end gap-4">
            <Button variant="outline">Save Draft</Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" /> Save Product
            </Button>
        </div>
      </div>
    </form>
    </Form>
  );
}
