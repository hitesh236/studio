
'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Trash2, X, Sparkles, ChevronsUpDown, Check, Layers, Save, Barcode } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { initialCategoriesData, type Category } from '@/lib/categories';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { initialSimpleUnits, initialCompoundUnits, type SimpleUnit, type CompoundUnit } from '@/lib/uom-data';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn, formatCurrency } from '@/lib/utils';
import type { Attribute } from '@/lib/types';
import { FormControl, FormField } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';

type Variant = {
  id: string;
  values: { [key: string]: string };
  sku: string;
  barcode: string;
  buyingPrice: number | '';
  price: { regular: number | ''; b2b: number | ''; b2c: number | '' };
  stock: number | '';
  stockValue: number | '';
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

export default function CreateProductPage() {
  const { toast } = useToast();

  // Core Product State
  const [productName, setProductName] = React.useState('');
  const [productCode, setProductCode] = React.useState('');
  const [gstRate, setGstRate] = React.useState<number>(18);
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
    'Tags',
  ]);
  const [customDescAttrName, setCustomDescAttrName] = React.useState('');
  const [selectedDescAttr, setSelectedDescAttr] = React.useState('');

  // Inventory-Driving Attributes State
  const [stockAttrs, setStockAttrs] = React.useState<Attribute[]>([]);
  const [customAttrName, setCustomAttrName] = React.useState('');

  // Variants State
  const [variants, setVariants] = React.useState<Variant[]>([]);

  // Category State
  const [categoryPath, setCategoryPath] = React.useState<string[]>([]);
  const [categoryLevels, setCategoryLevels] = React.useState<Category[][]>([
    initialCategoriesData,
  ]);

  // UOM State
  const [uom, setUom] = React.useState('');
  const [secondaryUom, setSecondaryUom] = React.useState('');
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
    setCategoryPath(newPath);
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
      setUom(newUnit.id);
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

    const baseCode = productCode || productName || 'PROD';
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
        stock: 0,
        stockValue: '',
        reorderPoint: 0,
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

  const handleSaveProduct = () => {
    console.log({
      product: { productName, productCode, categoryPath, uom, secondaryUom },
      descriptive: descriptiveAttrs,
      inventory: stockAttrs,
      variants: variants,
    });
    toast({
      title: 'Product Saved!',
      description: 'Check the console for the saved data structure.',
    });
  };

  const presetAttributes = ['Brand', 'Pack Size', 'Flavor', 'Fat %', 'Color'];
  const addedAttributeNames = new Set(stockAttrs.map((a) => a.name));
  
  return (
    <div className="space-y-6 p-4 md:p-2.5">
      <h1 className="font-bold text-[20px]">Add Product</h1>

      <div className="space-y-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[18px]">Core Product</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="productName">Product Name *</Label>
                <Input
                  id="productName"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g., Amul Milk"
                />
              </div>
              <div>
                <Label htmlFor="productCode">
                  Product Code (for SKU prefix)
                </Label>
                <Input
                  id="productCode"
                  value={productCode}
                  onChange={(e) => setProductCode(e.target.value)}
                  placeholder="e.g., MLK-AMUL"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <div className="grid grid-cols-1 gap-2">
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
              <div>
                  <Label>GST Rate (%)</Label>
                  <Select onValueChange={(v) => setGstRate(Number(v))} value={String(gstRate)}>
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
              </div>
            </div>
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="uom" className="text-sm">Base UOM</Label>
                    <div className="flex items-center gap-2">
                      <Select onValueChange={setUom} value={uom}>
                          <SelectTrigger>
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
                          <Button type="button" variant="outline" className="shrink-0">
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
                </div>
                <div className="space-y-2">
                    {showSecondaryUom ? (
                        <>
                          <Label className="text-sm">Secondary UOM</Label>
                          <div className="flex items-center gap-2">
                            <Select
                                onValueChange={setSecondaryUom}
                                value={secondaryUom}
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
                                setSecondaryUom('');
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
                        </>
                    ) : (
                        uom && (
                        <Button
                            type="button"
                            variant="link"
                            className="p-0 h-9"
                            onClick={() => setShowSecondaryUom(true)}
                        >
                            + Add Secondary Unit
                        </Button>
                        )
                    )}
                </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold text-[18px]">Create Stock</CardTitle>
            <CardDescription>
              Add attributes that you stock and reorder by. Fewer attributes lead to fewer SKUs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
               <div className="w-full">
                <Label>Common grocery attributes</Label>
                <div className="flex flex-wrap gap-2 mt-2">
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
              <div className="w-full">
                <Label>Add custom attribute</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={customAttrName}
                    onChange={(e) => setCustomAttrName(e.target.value)}
                    placeholder="e.g., Region, Plug Type"
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddStockAttr(customAttrName)}
                  >
                    Add Attribute
                  </Button>
                </div>
              </div>
            </div>

            {stockAttrs.length > 0 && (
              <div className="space-y-4 pt-4 border-t">
                <Label>Selected Attributes & Values</Label>
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

            <div className="flex gap-4">
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
              <CardTitle className="text-lg font-bold text-[18px]">Variants (SKUs) & Stock</CardTitle>
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
              Low stock items (Available ≤ Reorder Point) are highlighted in red.
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
                    <TableHead className="text-right">Opening Stock</TableHead>
                    <TableHead className="text-right">Stock Value</TableHead>
                    <TableHead className="text-right">Reorder Point</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {variants.length > 0 ? (
                    variants.map((variant) => {
                      const isLowStock =
                        Number(variant.stock || 0) <= Number(variant.reorderPoint || 0);
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
                                    <PriceBreakdown sellingPrice={variant.price.regular} buyingPrice={variant.buyingPrice} gstRate={gstRate} includesGst={sellingPriceIncludesGst} />
                                    <Input
                                    type="text"
                                    placeholder="B2B Price"
                                    className="h-7 text-xs mt-2"
                                    value={variant.price.b2b}
                                    onChange={(e) => handlePriceChange(variant.id, 'b2b', e.target.value)}
                                    />
                                     <PriceBreakdown sellingPrice={variant.price.b2b} buyingPrice={variant.buyingPrice} gstRate={gstRate} includesGst={sellingPriceIncludesGst} />
                                    <Input
                                    type="text"
                                    placeholder="B2C Price"
                                    className="h-7 text-xs mt-2"
                                    value={variant.price.b2c}
                                    onChange={(e) => handlePriceChange(variant.id, 'b2c', e.target.value)}
                                    />
                                     <PriceBreakdown sellingPrice={variant.price.b2c} buyingPrice={variant.buyingPrice} gstRate={gstRate} includesGst={sellingPriceIncludesGst} />
                                </div>
                            </TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              className="text-right min-w-[70px]"
                              placeholder="0"
                              value={variant.stock}
                              onChange={(e) =>
                                handleVariantChange(
                                  variant.id,
                                  'stock',
                                  e.target.value
                                )
                              }
                            />
                          </TableCell>
                           <TableCell>
                            <Input
                              type="text"
                              className="text-right min-w-[80px]"
                              placeholder="0.00"
                              value={variant.stockValue}
                              onChange={(e) =>
                                handleVariantChange(
                                  variant.id,
                                  'stockValue',
                                  e.target.value
                                )
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="text"
                              className="text-right min-w-[70px]"
                              placeholder="0"
                              value={variant.reorderPoint}
                              onChange={(e) =>
                                handleVariantChange(
                                  variant.id,
                                  'reorderPoint',
                                  e.target.value
                                )
                              }
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={stockAttrs.length + 7}
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
        
        <div className="flex justify-end gap-4">
            <Button variant="outline">Save Draft</Button>
            <Button onClick={handleSaveProduct}>
              <Save className="mr-2 h-4 w-4" /> Save Product
            </Button>
        </div>
      </div>
    </div>
  );
}

    