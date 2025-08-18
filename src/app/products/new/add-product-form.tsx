
'use client';

import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  PlusCircle,
  Trash2,
  Save,
  Send,
  Loader2,
  Settings,
  ChevronsUpDown,
  Check,
  Info,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Tags,
  Barcode,
  Percent,
  X,
  Package
} from 'lucide-react';

import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { initialCategoriesData } from '@/lib/categories';
import { initialAttributes } from '@/lib/attributes';
import type { Category, Attribute } from '@/lib/types';
import { initialSimpleUnits, initialCompoundUnits, type SimpleUnit, type CompoundUnit } from '@/lib/uom-data';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { generateStockListData, type StockItem } from '@/app/stock-list/data';


const customAttributeSchema = z.object({
  attributeId: z.string(),
  value: z.any(),
});

const productFormSchema = z.object({
  // Core Information
  productName: z.string().min(1, "Product name is required."),
  alternateName: z.string().optional(),
  sku: z.string().min(1, "SKU is required."),
  categoryPath: z.array(z.string()).min(1, "Category is required."),
  productDescription: z.string().optional(),

  // Units & Stock
  uom: z.string().min(1, "Unit of Measurement is required."),
  secondaryUom: z.string().optional(),
  openingStock: z.coerce.number().min(0, "Opening stock must be non-negative.").default(0),
  location: z.string().optional(),
  minStockLevel: z.coerce.number().optional(),
  reorderQty: z.coerce.number().optional(),
  
  // Pricing & Taxation
  purchasePrice: z.coerce.number().min(0, "Purchase price must be non-negative."),
  sellingPriceIncludesGst: z.boolean().default(false),
  customerPrices: z.object({
    regular: z.coerce.number().min(0, "Price must be non-negative.").optional(),
    b2c: z.coerce.number().min(0, "Price must be non-negative.").optional(),
    b2b: z.coerce.number().min(0, "Price must be non-negative.").optional(),
  }),
  hsnCode: z.string().optional(),
  gstRate: z.coerce.number().min(0).max(100),
  
  // Organization
  brand: z.string().optional(),
  model: z.string().optional(),
  barcode: z.string().optional(),
  tags: z.array(z.string()).optional(),

  // Dynamic Attributes
  dynamicAttributes: z.array(customAttributeSchema).optional(),

  // Ecommerce Details
  isListedOnWebsite: z.boolean().default(false),
  productImages: z.array(z.any()).optional(),
  webShortDescription: z.string().optional(),
  webLongDescription: z.string().optional(),
  seoTitle: z.string().optional(),
  seoMetaDescription: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

// Helper function to get all parent categories
const getCategoryHierarchy = (categoryId: string, categories: Category[]): Category[] => {
    const path: Category[] = [];
    
    function findPath(currentCategory: Category, currentPath: Category[]): boolean {
        const newPath = [...currentPath, currentCategory];
        if (currentCategory.id === categoryId) {
            path.push(...newPath);
            return true;
        }
        if (currentCategory.children) {
            for (const child of currentCategory.children) {
                if (findPath(child, newPath)) {
                    return true;
                }
            }
        }
        return false;
    }

    for (const rootCategory of categories) {
        if (findPath(rootCategory, [])) {
            break;
        }
    }
    return path;
};

// Helper function to find all attributes for a category, including inherited ones
const getAttributesForCategory = (categoryId: string | null, categories: Category[], allAttributes: Attribute[]): Attribute[] => {
    if (!categoryId) return allAttributes.filter(a => a.isGlobal);
    
    const hierarchy = getCategoryHierarchy(categoryId, categories);
    const applicableAttributes = new Map<string, Attribute>();

    // Add global attributes first
    allAttributes.filter(a => a.isGlobal).forEach(attr => {
        applicableAttributes.set(attr.id, attr);
    });

    // Add attributes from the hierarchy, parents first
    hierarchy.forEach(categoryInHierarchy => {
        allAttributes
            .filter(attr => attr.assignedCategories.includes(categoryInHierarchy.id))
            .forEach(attr => {
                applicableAttributes.set(attr.id, attr);
            });
    });

    return Array.from(applicableAttributes.values());
};

const optionalSectionsConfig = {
    organization: 'Organization',
    ecommerce: 'E-commerce Details'
};

const predefinedTags = ['new-arrival', 'best-seller', 'featured', 'on-sale', 'clearance', 'eco-friendly', 'premium'];


export function AddProductForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [locations, setLocations] = React.useState(['Main Warehouse', 'Store', 'Shop']);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = React.useState(false);
  const [newLocation, setNewLocation] = React.useState('');

  const [simpleUnits, setSimpleUnits] = React.useState<SimpleUnit[]>(initialSimpleUnits);
  const [compoundUnits, setCompoundUnits] = React.useState<CompoundUnit[]>(initialCompoundUnits);
  const [isUomDialogOpen, setIsUomDialogOpen] = React.useState(false);
  const [newUom, setNewUom] = React.useState({ name: '', abbreviation: '' });
  const [targetUomField, setTargetUomField] = React.useState<'uom' | 'secondaryUom' | null>(null);

  const [visibleSections, setVisibleSections] = React.useState<Record<string, boolean>>({
    organization: false,
    ecommerce: false,
  });

  const [showSecondaryUom, setShowSecondaryUom] = React.useState(false);

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
        productName: '',
        alternateName: '',
        sku: '',
        categoryPath: ['grocery', 'staples-pulses', 'rice'], // Default category
        productDescription: '',
        uom: '',
        secondaryUom: '',
        openingStock: 0,
        location: '',
        minStockLevel: 0,
        reorderQty: 0,
        purchasePrice: 0,
        sellingPriceIncludesGst: false,
        customerPrices: { regular: 0, b2c: 0, b2b: 0 },
        hsnCode: '',
        gstRate: 18,
        brand: '',
        model: '',
        barcode: '',
        tags: [],
        dynamicAttributes: [],
        isListedOnWebsite: false,
        productImages: [],
        webShortDescription: '',
        webLongDescription: '',
        seoTitle: '',
        seoMetaDescription: '',
    },
  });
  
  const [categoryLevels, setCategoryLevels] = React.useState<Category[][]>([initialCategoriesData]);

  const activeSimpleUnits = React.useMemo(() => simpleUnits.filter(u => u.status !== 'disabled'), [simpleUnits]);

  const watchedCategoryPath = form.watch('categoryPath');
  const watchedPrimaryUom = form.watch('uom');
  const watchedSecondaryUom = form.watch('secondaryUom');
  const lastSelectedCategoryId = watchedCategoryPath.length > 0 ? watchedCategoryPath[watchedCategoryPath.length - 1] : null;

  const displayedAttributes = React.useMemo(
    () => getAttributesForCategory(lastSelectedCategoryId, initialCategoriesData, initialAttributes),
    [lastSelectedCategoryId]
  );
  
  const secondaryUomOptions = React.useMemo(() => {
    if (!watchedPrimaryUom) return [];
    return compoundUnits
        .filter(cu => cu.firstUnit.id === watchedPrimaryUom)
        .map(cu => cu.secondUnit);
  }, [watchedPrimaryUom, compoundUnits]);
  
  const conversionRate = React.useMemo(() => {
    if (!watchedPrimaryUom || !watchedSecondaryUom) return null;
    const compound = compoundUnits.find(cu => cu.firstUnit.id === watchedPrimaryUom && cu.secondUnit.id === watchedSecondaryUom);
    if (!compound) return null;
    return `1 ${compound.firstUnit.name} = ${compound.conversion} ${compound.secondUnit.name}`;
  }, [watchedPrimaryUom, watchedSecondaryUom, compoundUnits]);
  
  React.useEffect(() => {
    let currentCategories = initialCategoriesData;
    const newLevels: Category[][] = [currentCategories];
    for (const catId of watchedCategoryPath) {
      const foundCat = currentCategories.find(c => c.id === catId);
      if (foundCat && foundCat.children) {
        currentCategories = foundCat.children;
        newLevels.push(currentCategories);
      } else {
        break;
      }
    }
    setCategoryLevels(newLevels);
  }, [watchedCategoryPath]);
  
  const handleCategoryChange = (level: number, value: string) => {
    const newPath = watchedCategoryPath.slice(0, level);
    if (value) {
      newPath.push(value);
    }
    form.setValue('categoryPath', newPath, { shouldValidate: true });
  };


  // Sync form state with displayed attributes
  React.useEffect(() => {
    const existingAttributes = form.getValues('dynamicAttributes') || [];
    
    const newAttributes = displayedAttributes.map(attr => {
      const existing = existingAttributes.find(a => a.attributeId === attr.id);
      return existing || {
        attributeId: attr.id,
        value: attr.type === 'checkbox' ? false : ''
      };
    });

    // Only update if there's a change in the attributes themselves
    if (newAttributes.length !== existingAttributes.length || !newAttributes.every(attr => existingAttributes.some(e => e.attributeId === attr.attributeId))) {
        form.setValue('dynamicAttributes', newAttributes, { shouldValidate: true });
    }
  }, [displayedAttributes, form]);

  const { fields: dynamicAttributeFields } = useFieldArray({
    control: form.control,
    name: "dynamicAttributes",
  });
  
  const attributeMap = React.useMemo(
    () => new Map(initialAttributes.map(attr => [attr.id, attr])), 
    []
  );


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const currentFiles = form.getValues('productImages') || [];
      const newFiles = Array.from(files);
      const allFiles = [...currentFiles, ...newFiles];
      form.setValue('productImages', allFiles);

      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const currentFiles = form.getValues('productImages') || [];
    const updatedFiles = currentFiles.filter((_, i) => i !== index);
    form.setValue('productImages', updatedFiles);

    const updatedPreviews = [...imagePreviews];
    const removedUrl = updatedPreviews.splice(index, 1);
    URL.revokeObjectURL(removedUrl[0]); // Clean up memory
    setImagePreviews(updatedPreviews);
  };
  
  const handleAddLocation = () => {
    if (newLocation.trim()) {
        if (locations.some(loc => loc.toLowerCase() === newLocation.trim().toLowerCase())) {
            toast({ title: 'Location already exists.', variant: 'destructive' });
            return;
        }
        const updatedLocations = [...locations, newLocation.trim()];
        setLocations(updatedLocations);
        form.setValue('location', newLocation.trim());
        toast({ title: 'Location added successfully.' });
        setIsLocationDialogOpen(false);
        setNewLocation('');
    }
  };
  
  const handleAddUom = () => {
    if (newUom.name.trim() && newUom.abbreviation.trim()) {
        if (simpleUnits.some(u => u.name.toLowerCase() === newUom.name.toLowerCase() || u.abbreviation.toLowerCase() === newUom.abbreviation.toLowerCase())) {
            toast({ variant: 'destructive', title: 'Unit already exists.'});
            return;
        }
        const newUnit: SimpleUnit = { 
            id: newUom.abbreviation.toLowerCase(),
            name: newUom.name.trim(), 
            abbreviation: newUom.abbreviation.trim(),
            status: 'active',
        };
        setSimpleUnits(prev => [...prev, newUnit]);
        if(targetUomField) {
            form.setValue(targetUomField, newUnit.id);
        }
        toast({ title: 'UOM Added' });
        setIsUomDialogOpen(false);
        setNewUom({ name: '', abbreviation: '' });
    }
  };

  const generateSku = () => {
    const productName = form.getValues('productName');
    if (!productName) {
        toast({ title: 'Product Name required', description: 'Please enter a product name first to generate an SKU.', variant: 'destructive' });
        return;
    }
    // Generate SKU: First 4 letters of name, uppercase, plus random 4 digits
    const sku = `${productName.substring(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    form.setValue('sku', sku, { shouldValidate: true });
    toast({ title: 'SKU Generated!', description: `New SKU: ${sku}`});
  };

  async function onSubmit(data: ProductFormValues) {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('New Product Data:', data);
    toast({
      title: "Product Created",
      description: `${data.productName} has been successfully added to your inventory.`,
    });
    setIsSubmitting(false);
    form.reset();
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImagePreviews([]);
  }

  const TagsInput = ({ field }: { field: any }) => {
    const [inputValue, setInputValue] = React.useState('');
    const [open, setOpen] = React.useState(false);
    const inputRef = React.useRef<HTMLInputElement>(null);

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
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-xl text-primary font-semibold">Create New Product</h1>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                        <span className="sr-only">Toggle Optional Sections</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Show Sections</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {Object.entries(optionalSectionsConfig).map(([key, label]) => (
                         <DropdownMenuCheckboxItem
                            key={key}
                            checked={visibleSections[key]}
                            onCheckedChange={(checked) => setVisibleSections(prev => ({ ...prev, [key]: !!checked }))}
                        >
                            {label}
                        </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-[20px] text-secondary">Core Product Details</CardTitle>
                    <CardDescription>Enter the primary information for your product.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="productName" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g., Wireless Mouse" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="purchasePrice" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Purchase Price</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                     <FormField name="sku" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>SKU</FormLabel>
                            <div className="relative flex items-center">
                                <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <FormControl>
                                    <Input placeholder="Stock Keeping Unit" className="pl-10" {...field} />
                                </FormControl>
                                <Button type="button" variant="outline" onClick={generateSku} className="ml-2">
                                    Generate
                                </Button>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormItem>
                        <FormLabel>Category</FormLabel>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {categoryLevels.map((levelCategories, level) => (
                                <FormField
                                    key={level}
                                    control={form.control}
                                    name={`categoryPath.${level}`}
                                    render={({ field }) => (
                                        <FormItem>
                                            <Select
                                                onValueChange={(value) => handleCategoryChange(level, value)}
                                                value={field.value || ''}
                                            >
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={`Select Level ${level + 1}`} />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {levelCategories.map((cat) => (
                                                        <SelectItem key={cat.id} value={cat.id}>
                                                            {cat.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            ))}
                        </div>
                    </FormItem>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-4 mb-2">
                                <Label>Selling Prices</Label>
                                <FormField
                                    control={form.control}
                                    name="sellingPriceIncludesGst"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} id="include-gst" />
                                            </FormControl>
                                            <Label htmlFor="include-gst" className="text-sm font-normal">Including GST</Label>
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-4 border rounded-md">
                                <FormField name="customerPrices.regular" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel className="text-sm font-normal">Regular</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name="customerPrices.b2c" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel className="text-sm font-normal">B2C</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                                <FormField name="customerPrices.b2b" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel className="text-sm font-normal">B2B</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
                            </div>
                        </div>
                        <FormField name="hsnCode" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>HSN/SAC Code</FormLabel><FormControl><Input placeholder="e.g., 847160" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="gstRate" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>GST Rate (%)</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                                {[0, 5, 12, 18, 28].map(rate => <SelectItem key={rate} value={String(rate)}>{rate}%</SelectItem>)}
                            </SelectContent></Select><FormMessage /></FormItem>
                        )} />
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="text-[20px] text-secondary">Units & Stock</CardTitle>
                    <CardDescription>Manage measurement units and inventory levels.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <FormField name="uom" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Primary UOM</FormLabel>
                                <div className="flex items-center gap-2">
                                <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger></FormControl><SelectContent>
                                    {activeSimpleUnits.map(unit => <SelectItem key={unit.id} value={unit.id}>{unit.name} ({unit.abbreviation})</SelectItem>)}
                                </SelectContent></Select>
                                <Dialog open={isUomDialogOpen} onOpenChange={setIsUomDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button type="button" variant="outline" size="icon" onClick={() => { setTargetUomField('uom'); setIsUomDialogOpen(true); }}>
                                            <PlusCircle className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Unit of Measurement</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="uom-name">Unit Name</Label>
                                                <Input id="uom-name" value={newUom.name} onChange={e => setNewUom(u => ({...u, name: e.target.value}))} placeholder="e.g., Pieces"/>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="uom-abbr">Abbreviation</Label>
                                                <Input id="uom-abbr" value={newUom.abbreviation} onChange={e => setNewUom(u => ({...u, abbreviation: e.target.value}))} placeholder="e.g., pcs"/>
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button variant="outline" onClick={() => setIsUomDialogOpen(false)}>Cancel</Button>
                                            <Button onClick={handleAddUom}>Save Unit</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                                </div>
                            <FormMessage /></FormItem>
                        )} />
                        {showSecondaryUom ? (
                            <>
                                <FormField name="secondaryUom" control={form.control} render={({ field }) => (
                                    <FormItem>
                                        <div className="flex items-center gap-2">
                                            <Select onValueChange={field.onChange} value={field.value} disabled={secondaryUomOptions.length === 0}>
                                                <FormControl><SelectTrigger><SelectValue placeholder={secondaryUomOptions.length > 0 ? "Select secondary unit" : "No conversion found"} /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {secondaryUomOptions.map(unit => <SelectItem key={unit.id} value={unit.id}>{unit.name} ({unit.abbreviation})</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => { setShowSecondaryUom(false); form.setValue('secondaryUom', ''); }}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    <FormMessage />
                                    </FormItem>
                                )} />
                                {conversionRate && <p className="text-xs text-muted-foreground pt-1">{conversionRate}</p>}
                            </>
                        ) : (
                            watchedPrimaryUom && <Button type="button" variant="link" className="p-0 h-auto text-sm" onClick={() => setShowSecondaryUom(true)}>
                                + Add Secondary Unit
                            </Button>
                        )}
                    </div>
                    <FormField name="openingStock" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Opening Stock</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField
                        name="location"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Location/Warehouse</FormLabel>
                                <div className="flex items-center gap-2">
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select location" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {locations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                    <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
                                        <DialogTrigger asChild>
                                            <Button type="button" variant="outline" className="w-auto">Add New</Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add New Location</DialogTitle>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <Label htmlFor="location-name">Location Name</Label>
                                                <Input id="location-name" value={newLocation} onChange={e => setNewLocation(e.target.value)} />
                                            </div>
                                            <DialogFooter>
                                                <DialogClose asChild><Button variant="outline" type="button">Cancel</Button></DialogClose>
                                                <Button type="button" onClick={handleAddLocation}>Save Location</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField name="minStockLevel" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Min. Stock Level</FormLabel><FormControl><Input type="number" placeholder="e.g., 10" {...field} /></FormControl><FormDescription>Receive alerts when stock falls below this level.</FormDescription><FormMessage /></FormItem>
                    )} />
                    <FormField name="reorderQty" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Reorder Quantity</FormLabel><FormControl><Input type="number" placeholder="e.g., 50" {...field} /></FormControl><FormDescription>Default quantity for purchase orders.</FormDescription><FormMessage /></FormItem>
                    )} />
                </CardContent>
            </Card>

            {displayedAttributes.length > 0 && <Card>
                <CardHeader>
                    <CardTitle className="text-[20px] text-secondary">Attributes</CardTitle>
                    <CardDescription>Specify attributes for the selected category.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dynamicAttributeFields.map((field, index) => {
                    const attributeInfo = attributeMap.get(field.attributeId);
                    if (!attributeInfo || !displayedAttributes.some(a => a.id === attributeInfo.id)) return null;

                    return (
                        <FormField
                            key={field.id}
                            control={form.control}
                            name={`dynamicAttributes.${index}.value`}
                            render={({ field: itemField }) => {
                                if (attributeInfo.type === 'dropdown' && attributeInfo.options) {
                                    return (
                                        <FormItem>
                                            <FormLabel>{attributeInfo.name}</FormLabel>
                                            <Select onValueChange={itemField.onChange} defaultValue={itemField.value}>
                                                <FormControl><SelectTrigger><SelectValue placeholder={`Select ${attributeInfo.name}`} /></SelectTrigger></FormControl>
                                                <SelectContent>
                                                    {attributeInfo.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    );
                                }
                                if (attributeInfo.type === 'checkbox') {
                                    return (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <FormLabel>{attributeInfo.name}</FormLabel>
                                        <FormControl><Switch checked={itemField.value} onCheckedChange={itemField.onChange} /></FormControl>
                                    </FormItem>
                                    );
                                }
                                return (
                                    <FormItem>
                                        <FormLabel>{attributeInfo.name}</FormLabel>
                                        <FormControl><Input type={attributeInfo.type} {...itemField} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )
                            }}
                        />
                    );
                })}
                </CardContent>
            </Card>}

            {visibleSections.organization && (
                <Card>
                    <CardHeader><CardTitle className="text-[20px] text-secondary">Organization</CardTitle></CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="brand" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Brand</FormLabel><FormControl><Input placeholder="e.g., Logitech" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="model" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Model</FormLabel><FormControl><Input placeholder="e.g., MX Master 3S" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="barcode" control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormLabel>Barcode</FormLabel>
                                <div className="relative">
                                    <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <FormControl><Input placeholder="Scan or enter barcode" className="pl-10" {...field} /></FormControl>
                                </div>
                                <FormMessage />
                            </FormItem>
                        )} />
                        <FormField name="alternateName" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Alternate Name</FormLabel><FormControl><Input placeholder="Optional alternate name" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
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
            )}

            {visibleSections.ecommerce && <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="text-[20px] text-secondary">E-commerce Details</CardTitle>
                        <FormField
                            control={form.control}
                            name="isListedOnWebsite"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                                    <FormLabel>List on Website</FormLabel>
                                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                   <FormField name="productDescription" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Internal Product Description</FormLabel><FormControl><Textarea placeholder="Internal description for the product" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="productImages" control={form.control} render={() => (
                        <FormItem>
                            <FormLabel>Product Images</FormLabel>
                            <FormControl>
                                <div
                                    className="relative flex flex-col items-center justify-center w-full p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="h-10 w-10 text-muted-foreground" />
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        <span className="font-semibold">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                                    <Input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {imagePreviews.length > 0 && (
                        <div>
                            <Label>Image Gallery Preview</Label>
                            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {imagePreviews.map((src, index) => (
                                    <div key={index} className="relative group aspect-square">
                                        <img
                                            src={src}
                                            alt={`Preview ${index + 1}`}
                                            className="w-full h-full object-cover rounded-md"
                                            onLoad={() => {
                                                // Optional: Check if we still need to revoke this URL later
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => handleRemoveImage(index)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span className="sr-only">Remove image</span>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField name="webShortDescription" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Short Description</FormLabel><FormControl><Textarea placeholder="A catchy, brief description for product listings." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="webLongDescription" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Full Description</FormLabel><FormControl><Textarea placeholder="Detailed product description for the product page." rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="seoTitle" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>SEO Title</FormLabel><FormControl><Input placeholder="Title for search engine results" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="seoMetaDescription" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>SEO Meta Description</FormLabel><FormControl><Input placeholder="Description for search engine results" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    </div>
                </CardContent>
            </Card>}
            
            <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Product
                </Button>
            </div>
        </form>
        </Form>
    </div>
  );
}
