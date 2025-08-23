
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, X, Sparkles, ChevronsUpDown, Check, Layers } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { initialCategoriesData, type Category } from '@/lib/categories';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { initialSimpleUnits, initialCompoundUnits, type SimpleUnit, type CompoundUnit } from '@/lib/uom-data';

type Attribute = {
  name: string;
  values: string[];
};

type Variant = {
  id: string;
  values: { [key: string]: string };
  sku: string;
  barcode: string;
  price: number | '';
  stock: number | '';
  allocated: number | '';
  reorderPoint: number | '';
};

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

export default function CreateProductPage() {
  const { toast } = useToast();

  // Core Product State
  const [productName, setProductName] = React.useState('');
  const [productCode, setProductCode] = React.useState('');

  // Descriptive Attributes State
  const [descriptiveAttrs, setDescriptiveAttrs] = React.useState({
    material: '',
    storage: '',
    origin: '',
    certifications: '',
    tags: '',
  });

  // Inventory-Driving Attributes State
  const [stockAttrs, setStockAttrs] = React.useState<Attribute[]>([]);
  const [customAttrName, setCustomAttrName] = React.useState('');

  // Variants State
  const [variants, setVariants] = React.useState<Variant[]>([]);

  // Category State
  const [categoryPath, setCategoryPath] = React.useState<string[]>([]);
  const [categoryLevels, setCategoryLevels] = React.useState<Category[][]>([initialCategoriesData]);

  // UOM State
  const [uom, setUom] = React.useState('');
  const [secondaryUom, setSecondaryUom] = React.useState('');
  const [simpleUnits, setSimpleUnits] = React.useState<SimpleUnit[]>(initialSimpleUnits);
  const [isUomDialogOpen, setIsUomDialogOpen] = React.useState(false);
  const [newUom, setNewUom] = React.useState({ name: '', abbreviation: '' });
  const [showSecondaryUom, setShowSecondaryUom] = React.useState(false);
  
  const activeSimpleUnits = React.useMemo(() => simpleUnits.filter(u => u.status !== 'disabled'), [simpleUnits]);
  
  const secondaryUomOptions = React.useMemo(() => {
    if (!uom) return [];
    return initialCompoundUnits
        .filter(cu => cu.firstUnit.id === uom)
        .map(cu => cu.secondUnit);
  }, [uom]);

  const conversionRate = React.useMemo(() => {
    if (!uom || !secondaryUom) return null;
    const compound = initialCompoundUnits.find(cu => cu.firstUnit.id === uom && cu.secondUnit.id === secondaryUom);
    if (!compound) return null;
    return `1 ${compound.firstUnit.name} = ${compound.conversion} ${compound.secondUnit.name}`;
  }, [uom, secondaryUom]);

  React.useEffect(() => {
    let currentCategories = initialCategoriesData;
    const newLevels: Category[][] = [currentCategories];
    for (const catId of categoryPath) {
      const foundCat = currentCategories.find(c => c.id === catId);
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
    setCategoryPath(newPath);
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
        setUom(newUnit.id);
        toast({ title: 'UOM Added' });
        setIsUomDialogOpen(false);
        setNewUom({ name: '', abbreviation: '' });
    }
  };


  const handleDescriptiveAttrChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setDescriptiveAttrs(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleAddStockAttr = (name: string) => {
    if (!name.trim()) return;
    if (stockAttrs.some(a => a.name.toLowerCase() === name.trim().toLowerCase())) {
        toast({ title: 'Attribute already exists.', variant: 'destructive'});
        return;
    }
    const defaults: Record<string, string[]> = {
      "Brand": ["Amul","Mother Dairy","Nestle"],
      "Pack Size": ["200ml","500ml","1L","2L"],
      "Flavor": ["Plain","Vanilla","Strawberry","Chocolate"],
      "Fat %": ["Toned","Full Cream","Skimmed"],
      "Color": ["Red","Green","Blue"]
    };
    setStockAttrs(prev => [...prev, { name: name.trim(), values: defaults[name.trim()] || [] }]);
    setCustomAttrName('');
  };

  const handleRemoveStockAttr = (index: number) => {
    setStockAttrs(prev => prev.filter((_, i) => i !== index));
    setVariants([]); // Clear variants when an attribute is removed
  };

  const handleStockAttrChange = (index: number, field: 'name' | 'values', value: string) => {
      setStockAttrs(prev => {
          const newAttrs = [...prev];
          const attr = newAttrs[index];
          if (field === 'name') {
              attr.name = value;
          } else {
              attr.values = value.split(',').map(s => s.trim()).filter(Boolean);
          }
          return newAttrs;
      });
  };

  const handleGenerateVariants = () => {
    const attrsWithValues = stockAttrs.filter(a => a.values.length > 0);
    if (attrsWithValues.length === 0) {
        toast({ title: 'Add attribute values', description: 'Please add some values to at least one attribute to generate variants.', variant: 'destructive'});
        return;
    }

    const valueArrays = attrsWithValues.map(a => a.values);
    const combinations = cartesian(valueArrays);

    const baseCode = productCode || productName || 'PROD';
    const newVariants: Variant[] = combinations.map((combo, index) => {
        const valuesMap: {[key: string]: string} = {};
        attrsWithValues.forEach((attr, i) => {
            valuesMap[slug(attr.name)] = combo[i];
        });

        return {
            id: `var-${Date.now()}-${index}`,
            values: valuesMap,
            sku: buildSku(baseCode, attrsWithValues.map(a => a.name), combo),
            barcode: '',
            price: '',
            stock: 0,
            allocated: 0,
            reorderPoint: 0
        };
    });
    setVariants(newVariants);
  };
  
  const handleVariantChange = (id: string, field: keyof Omit<Variant, 'id' | 'values'>, value: string | number) => {
    setVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };
  
  const handleSaveProduct = () => {
    console.log({
        product: { productName, productCode, categoryPath, uom, secondaryUom },
        descriptive: descriptiveAttrs,
        inventory: stockAttrs,
        variants: variants
    });
    toast({ title: "Product Saved!", description: "Check the console for the saved data structure."});
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <h1 className="font-bold text-[20px]">Add Product</h1>

      <div className="space-y-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-[18px]">Core Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="productName">Product Name *</Label><Input id="productName" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g., Amul Milk" /></div>
                <div><Label htmlFor="productCode">Product Code (for SKU prefix)</Label><Input id="productCode" value={productCode} onChange={(e) => setProductCode(e.target.value)} placeholder="e.g., MLK-AMUL" /></div>
            </div>
            <div>
                <Label>Category</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {categoryLevels.map((levelCategories, level) => (
                        <Select
                            key={level}
                            onValueChange={(value) => handleCategoryChange(level, value)}
                            value={categoryPath[level] || ''}
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
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="uom">Base UOM</Label>
                    <div className="relative flex items-center">
                        <Select onValueChange={setUom} value={uom}>
                            <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                            <SelectContent>
                                {activeSimpleUnits.map(unit => <SelectItem key={unit.id} value={unit.id}>{unit.name} ({unit.abbreviation})</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Dialog open={isUomDialogOpen} onOpenChange={setIsUomDialogOpen}>
                            <DialogTrigger asChild>
                                <Button type="button" variant="outline" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-auto px-3">
                                    Add New
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Add New Unit</DialogTitle>
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
                                    <DialogClose asChild><Button variant="outline" type="button">Cancel</Button></DialogClose>
                                    <Button type="button" onClick={handleAddUom}>Save Unit</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
                <div>
                    <Label>Secondary UOM</Label>
                     <div className="flex items-center gap-2">
                        {showSecondaryUom ? (
                            <>
                                <Select onValueChange={setSecondaryUom} value={secondaryUom} disabled={secondaryUomOptions.length === 0}>
                                    <SelectTrigger><SelectValue placeholder={secondaryUomOptions.length > 0 ? "Select secondary unit" : "No conversion found"} /></SelectTrigger>
                                    <SelectContent>
                                        {secondaryUomOptions.map(unit => <SelectItem key={unit.id} value={unit.id}>{unit.name} ({unit.abbreviation})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => { setShowSecondaryUom(false); setSecondaryUom(''); }}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </>
                        ) : (
                           uom && <Button type="button" variant="link" className="p-0 h-9" onClick={() => setShowSecondaryUom(true)}>
                                + Add Secondary Unit
                            </Button>
                        )}
                    </div>
                    {conversionRate && <p className="text-xs text-muted-foreground pt-1">{conversionRate}</p>}
                </div>
            </div>
            <p className="text-xs text-muted-foreground">This does not create SKUs. SKUs are created below from inventory-driving attributes only.</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-[18px]">Descriptive Attributes</CardTitle>
            <CardDescription>Use these for search/filter. They won’t multiply SKUs or stock tracking.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="material">Material / Ingredients</Label><Input id="material" name="material" value={descriptiveAttrs.material} onChange={handleDescriptiveAttrChange} placeholder="e.g., Cow milk" /></div>
                <div><Label htmlFor="storage">Storage / Handling</Label><Input id="storage" name="storage" value={descriptiveAttrs.storage} onChange={handleDescriptiveAttrChange} placeholder="e.g., Keep refrigerated" /></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="origin">Country of Origin</Label><Input id="origin" name="origin" value={descriptiveAttrs.origin} onChange={handleDescriptiveAttrChange} placeholder="e.g., India" /></div>
                <div><Label htmlFor="certifications">Certifications</Label><Input id="certifications" name="certifications" value={descriptiveAttrs.certifications} onChange={handleDescriptiveAttrChange} placeholder="e.g., FSSAI" /></div>
            </div>
            <div><Label htmlFor="tags">Tags (comma separated)</Label><Input id="tags" name="tags" value={descriptiveAttrs.tags} onChange={handleDescriptiveAttrChange} placeholder="e.g., dairy, breakfast, protein" /></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[18px]">Create Stock</CardTitle>
          <CardDescription>Only add attributes you truly stock and reorder by. Fewer attributes → fewer SKUs.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <Label>Common grocery attributes</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {['Brand', 'Pack Size', 'Flavor', 'Fat %', 'Color'].map(preset => (
                            <Button key={preset} type="button" variant="outline" size="sm" onClick={() => handleAddStockAttr(preset)}>
                                <PlusCircle className="mr-2 h-4 w-4" /> {preset}
                            </Button>
                        ))}
                    </div>
                    <Separator className="my-4" />
                    <Label>Add custom attribute</Label>
                    <div className="flex gap-2 mt-2">
                        <Input value={customAttrName} onChange={e => setCustomAttrName(e.target.value)} placeholder="e.g., Region, Plug Type" />
                        <Button type="button" onClick={() => handleAddStockAttr(customAttrName)}>Add Attribute</Button>
                    </div>
                </div>
                <div>
                    <Label>Selected attributes</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {stockAttrs.length > 0 ? stockAttrs.map((attr, index) => (
                            <Badge key={index} variant="secondary" className="text-base py-1 px-3">
                                {attr.name}
                                <button type="button" className="ml-2 rounded-full hover:bg-destructive/20" onClick={() => handleRemoveStockAttr(index)}>
                                    <X className="h-4 w-4" />
                                </button>
                            </Badge>
                        )) : <p className="text-sm text-muted-foreground">None yet. Add attributes to generate variants.</p>}
                    </div>
                </div>
            </div>
            
            {stockAttrs.length > 0 && <div className="space-y-4 pt-4 border-t">
                <Label>Attribute Values</Label>
                <div className="grid md:grid-cols-2 gap-4">
                    {stockAttrs.map((attr, index) => (
                        <div key={index}>
                            <Label htmlFor={`attr-values-${index}`}>{attr.name} (comma separated)</Label>
                            <Input 
                                id={`attr-values-${index}`}
                                value={attr.values.join(', ')} 
                                onChange={e => handleStockAttrChange(index, 'values', e.target.value)}
                                placeholder="e.g., 500ml, 1L, 2L"
                            />
                        </div>
                    ))}
                </div>
            </div>}
            
            <div className="flex gap-4">
                <Button type="button" onClick={handleGenerateVariants}>
                    <Sparkles className="mr-2 h-4 w-4" /> Generate Variants
                </Button>
                <Button type="button" variant="ghost" onClick={() => setVariants([])}>Clear Variants</Button>
            </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>4) Variants (SKUs) & Inventory</CardTitle>
          <CardDescription>Low stock items (Available ≤ Reorder Point) are highlighted in red.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            {stockAttrs.map(attr => <TableHead key={slug(attr.name)}>{attr.name}</TableHead>)}
                            <TableHead>SKU</TableHead>
                            <TableHead>Barcode</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead className="text-right">Allocated</TableHead>
                            <TableHead className="text-right">Available</TableHead>
                            <TableHead className="text-right">Reorder Point</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {variants.length > 0 ? variants.map(variant => {
                            const available = Number(variant.stock || 0) - Number(variant.allocated || 0);
                            const isLowStock = available <= Number(variant.reorderPoint || 0);
                            return (
                                <TableRow key={variant.id} className={cn(isLowStock && 'bg-destructive/10')}>
                                    {stockAttrs.map(attr => (
                                        <TableCell key={slug(attr.name)}>{variant.values[slug(attr.name)]}</TableCell>
                                    ))}
                                    <TableCell><Input className="min-w-[120px]" value={variant.sku} onChange={e => handleVariantChange(variant.id, 'sku', e.target.value)} /></TableCell>
                                    <TableCell><Input className="min-w-[120px]" placeholder="Barcode" value={variant.barcode} onChange={e => handleVariantChange(variant.id, 'barcode', e.target.value)} /></TableCell>
                                    <TableCell><Input type="number" className="text-right min-w-[80px]" placeholder="0.00" value={variant.price} onChange={e => handleVariantChange(variant.id, 'price', e.target.value)} /></TableCell>
                                    <TableCell><Input type="number" className="text-right min-w-[70px]" placeholder="0" value={variant.stock} onChange={e => handleVariantChange(variant.id, 'stock', e.target.value)} /></TableCell>
                                    <TableCell><Input type="number" className="text-right min-w-[70px]" placeholder="0" value={variant.allocated} onChange={e => handleVariantChange(variant.id, 'allocated', e.target.value)} /></TableCell>
                                    <TableCell className="text-right font-mono">{available}</TableCell>
                                    <TableCell><Input type="number" className="text-right min-w-[70px]" placeholder="0" value={variant.reorderPoint} onChange={e => handleVariantChange(variant.id, 'reorderPoint', e.target.value)} /></TableCell>
                                </TableRow>
                            )
                        }) : (
                            <TableRow>
                                <TableCell colSpan={stockAttrs.length + 7} className="h-24 text-center text-muted-foreground">
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
          <CardTitle>5) Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
            <Button variant="outline">Save Draft</Button>
            <Button onClick={handleSaveProduct}>Save Product</Button>
        </CardContent>
      </Card>
    </div>
  );
}
