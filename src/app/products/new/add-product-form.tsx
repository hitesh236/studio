
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Settings, Upload, Image as ImageIcon, Tags, Barcode, Percent } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils';
import { Label } from '@/components/ui/label';


const productFormSchema = z.object({
  // Core Information
  productName: z.string().min(1, "Product name is required."),
  sku: z.string().min(1, "SKU is required."),
  category: z.string().min(1, "Category is required."),
  uom: z.string().min(1, "Unit of Measurement is required."),
  secondaryUom: z.string().optional(),
  purchasePrice: z.coerce.number().min(0, "Purchase price must be non-negative."),
  sellingPrice: z.coerce.number().min(0, "Selling price must be non-negative."),
  discount: z.coerce.number().min(0, "Discount must be non-negative.").optional().default(0),
  openingStock: z.coerce.number().min(0, "Opening stock must be non-negative.").default(0),
  hsnCode: z.string().optional(),
  gstRate: z.coerce.number().min(0).max(100),

  // Additional Details
  productDescription: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  barcode: z.string().optional(),
  minStockLevel: z.coerce.number().optional(),
  reorderQty: z.coerce.number().optional(),
  warehouseLocation: z.string().optional(),
  
  // Ecommerce Details
  isListedOnWebsite: z.boolean().default(false),
  productImage: z.any().optional(),
  webShortDescription: z.string().optional(),
  webLongDescription: z.string().optional(),
  seoTitle: z.string().optional(),
  seoMetaDescription: z.string().optional(),
  tags: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

const optionalSectionsConfig = {
    additionalDetails: 'Additional Details',
    ecommerce: 'E-commerce Details'
};


export function AddProductForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);

  const [visibleSections, setVisibleSections] = React.useState<Record<string, boolean>>({
    additionalDetails: true,
    ecommerce: true,
  });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
        productName: '',
        sku: '',
        category: '',
        uom: '',
        secondaryUom: '',
        purchasePrice: 0,
        sellingPrice: 0,
        discount: 0,
        openingStock: 0,
        gstRate: 18,
    },
  });
  
  const watchedSellingPrice = form.watch('sellingPrice');
  const watchedDiscount = form.watch('discount');
  
  const priceAfterDiscount = React.useMemo(() => {
    const price = watchedSellingPrice || 0;
    const discount = watchedDiscount || 0;
    return price - (price * (discount / 100));
  }, [watchedSellingPrice, watchedDiscount]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(URL.createObjectURL(file));
      form.setValue('productImage', file);
    } else {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
      form.setValue('productImage', null);
    }
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
    setImagePreview(null);
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Add New Product</CardTitle>
                <CardDescription>Fill in the details to add a new product to your inventory.</CardDescription>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                        <span className="sr-only">Toggle Optional Sections</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Show/Hide Sections</DropdownMenuLabel>
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
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Core Information Section */}
            <section>
                <h3 className="text-lg font-medium mb-2">Core Information</h3>
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name="productName" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Product Name</FormLabel><FormControl><Input placeholder="e.g., Wireless Mouse" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="sku" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>SKU</FormLabel><FormControl><Input placeholder="Stock Keeping Unit" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField name="category" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl><SelectContent>
                            <SelectItem value="electronics">Electronics</SelectItem><SelectItem value="accessories">Accessories</SelectItem>
                        </SelectContent></Select><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-2">
                        <FormField name="uom" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Primary UOM</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger></FormControl><SelectContent>
                                <SelectItem value="pcs">Pieces (pcs)</SelectItem><SelectItem value="box">Box</SelectItem><SelectItem value="kg">Kilogram (kg)</SelectItem>
                            </SelectContent></Select><FormMessage /></FormItem>
                        )} />
                        <FormField name="secondaryUom" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Secondary UOM</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger></FormControl><SelectContent>
                                <SelectItem value="pcs">Pieces (pcs)</SelectItem><SelectItem value="box">Box</SelectItem><SelectItem value="g">Gram (g)</SelectItem>
                            </SelectContent></Select><FormMessage /></FormItem>
                        )} />
                    </div>
                     <FormField name="purchasePrice" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Purchase Price</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-2">
                         <FormField name="sellingPrice" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Selling Price</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="discount" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Discount (%)</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <div className="md:col-span-2">
                            <Label>Price After Discount</Label>
                            <Input value={formatCurrency(priceAfterDiscount, 'INR')} readOnly className="font-semibold bg-muted" />
                        </div>
                    </div>
                    <FormField name="openingStock" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Opening Stock</FormLabel><FormControl><Input type="number" placeholder="0" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="gstRate" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>GST Rate (%)</FormLabel><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                            {[0, 5, 12, 18, 28].map(rate => <SelectItem key={rate} value={String(rate)}>{rate}%</SelectItem>)}
                        </SelectContent></Select><FormMessage /></FormItem>
                    )} />
                     <FormField name="hsnCode" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>HSN/SAC Code</FormLabel><FormControl><Input placeholder="e.g., 847160" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
            </section>
            
            {/* Additional Details Section */}
            {visibleSections.additionalDetails && <section>
                <h3 className="text-lg font-medium mb-2">Additional Details</h3>
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField name="productDescription" control={form.control} render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Product Description</FormLabel><FormControl><Textarea placeholder="Internal description for the product" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="brand" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Brand</FormLabel><FormControl><Input placeholder="e.g., Logitech" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="model" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Model</FormLabel><FormControl><Input placeholder="e.g., MX Master 3S" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="minStockLevel" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Min. Stock Level</FormLabel><FormControl><Input type="number" placeholder="e.g., 10" {...field} /></FormControl><FormDescription>Receive alerts when stock falls below this level.</FormDescription><FormMessage /></FormItem>
                    )} />
                    <FormField name="reorderQty" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Reorder Quantity</FormLabel><FormControl><Input type="number" placeholder="e.g., 50" {...field} /></FormControl><FormDescription>Default quantity for purchase orders.</FormDescription><FormMessage /></FormItem>
                    )} />
                    <FormField name="warehouseLocation" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Warehouse/Location</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select warehouse" /></SelectTrigger></FormControl><SelectContent>
                            <SelectItem value="mumbai-wh">Mumbai Warehouse</SelectItem>
                            <SelectItem value="delhi-wh">Delhi Warehouse</SelectItem>
                            <SelectItem value="main-store">Main Storefront</SelectItem>
                        </SelectContent></Select><FormMessage /></FormItem>
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
                </div>
            </section>}

             {/* E-commerce Section */}
             {visibleSections.ecommerce && <section>
                <h3 className="text-lg font-medium mb-2">E-commerce Details</h3>
                <Separator className="mb-4" />
                <FormField
                    control={form.control}
                    name="isListedOnWebsite"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 mb-6">
                            <div className="space-y-0.5">
                                <FormLabel className="text-base">List on Website</FormLabel>
                                <FormDescription>Make this product visible and purchasable on your e-commerce website.</FormDescription>
                            </div>
                            <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField name="productImage" control={form.control} render={() => (
                        <FormItem className="md:col-span-2"><FormLabel>Product Image</FormLabel><div className="flex items-center gap-4">
                            <Avatar className="h-24 w-24 rounded-md">
                                <AvatarImage src={imagePreview ?? undefined} alt="Product image preview" className="object-cover" />
                                <AvatarFallback className="rounded-md"><ImageIcon className="h-10 w-10 text-muted-foreground"/></AvatarFallback>
                            </Avatar>
                            <FormControl><Input type="file" accept="image/*" className="flex-1" onChange={handleImageChange} /></FormControl>
                        </div><FormMessage /></FormItem>
                    )} />
                    <FormField name="webShortDescription" control={form.control} render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Short Description</FormLabel><FormControl><Textarea placeholder="A catchy, brief description for product listings." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField name="webLongDescription" control={form.control} render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Full Description</FormLabel><FormControl><Textarea placeholder="Detailed product description for the product page." rows={5} {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField name="seoTitle" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>SEO Title</FormLabel><FormControl><Input placeholder="Title for search engine results" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField name="seoMetaDescription" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>SEO Meta Description</FormLabel><FormControl><Input placeholder="Description for search engine results" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField name="tags" control={form.control} render={({ field }) => (
                        <FormItem className="md:col-span-2">
                           <FormLabel>Tags/Keywords</FormLabel>
                            <div className="relative">
                                <Tags className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <FormControl><Input placeholder="e.g., wireless, bluetooth, ergonomic" className="pl-10" {...field} /></FormControl>
                            </div>
                            <FormDescription>Comma-separated values.</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
             </section>}
            
            <CardFooter className="px-0 pt-6 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Product
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
