
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
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
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Trash2, PlusCircle, ChevronsUpDown, Check } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { generateStockListData, type StockItem } from '@/app/stock-list/data';

const adjustmentItemSchema = z.object({
  productId: z.string().min(1, 'Product is required.'),
  productName: z.string(),
  adjustmentType: z.enum(['addition', 'reduction']),
  quantity: z.coerce.number().min(0.01, 'Quantity must be positive.'),
  currentStock: z.number(),
  notes: z.string().optional(),
});

const stockAdjustmentSchema = z.object({
  date: z.date(),
  reason: z.string().min(1, 'Reason is required.'),
  items: z.array(adjustmentItemSchema).min(1, 'At least one item is required.'),
});

type StockAdjustmentValues = z.infer<typeof stockAdjustmentSchema>;

export function StockAdjustmentForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [products, setProducts] = React.useState<StockItem[]>([]);

  React.useEffect(() => {
    setProducts(generateStockListData(50));
  }, []);

  const form = useForm<StockAdjustmentValues>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      date: new Date(),
      reason: '',
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  async function onSubmit(data: StockAdjustmentValues) {
    setIsSubmitting(true);
    console.log('Stock Adjustment Data:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Stock Adjusted",
      description: `Successfully processed ${data.items.length} stock adjustments.`,
    });
    form.reset({
      date: new Date(),
      reason: '',
      items: [],
    });
    setIsSubmitting(false);
  }

  const ProductCombobox = ({ index, onProductSelect }: { index: number, onProductSelect: (product: StockItem, index: number) => void }) => {
    const [open, setOpen] = React.useState(false);
    const value = form.watch(`items.${index}.productId`);

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button variant="outline" role="combobox" className={cn("w-full justify-between", !value && "text-muted-foreground")}>
              {value ? products.find(product => product.id === value)?.productName : "Select item"}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
          <Command filter={(value, search) => {
            const product = products.find(p => p.id === value);
            if (product?.productName.toLowerCase().includes(search.toLowerCase()) || product?.sku.toLowerCase().includes(search)) return 1;
            return 0;
          }}>
            <CommandInput placeholder="Search items..." />
            <CommandList>
              <CommandEmpty>No item found.</CommandEmpty>
              <CommandGroup>
                {products.map(product => (
                  <CommandItem value={product.id} key={product.id} onSelect={() => { 
                    onProductSelect(product, index);
                    setOpen(false); 
                  }}>
                    <Check className={cn("mr-2 h-4 w-4", product.id === value ? "opacity-100" : "opacity-0")} />
                    {product.productName}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    );
  };

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>New Stock Adjustment</CardTitle>
        <CardDescription>Record changes to stock levels due to damage, internal use, or counts.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField name="date" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Adjustment Date</FormLabel><Input type="date" {...field} value={format(field.value, 'yyyy-MM-dd')} onChange={(e) => field.onChange(new Date(e.target.value))} /></FormItem>
              )} />
              <FormField name="reason" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Reason</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Select a reason" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="stock_take">Stock Take Discrepancy</SelectItem>
                    <SelectItem value="damaged">Damaged Goods</SelectItem>
                    <SelectItem value="internal_use">Internal Consumption</SelectItem>
                    <SelectItem value="opening_stock">Opening Stock Entry</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage /></FormItem>
              )} />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Items to Adjust</h3>
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-[1fr_100px_100px_100px_auto] gap-2 items-start border p-2 rounded-md">
                   <FormField name={`items.${index}.productId`} control={form.control} render={({ field }) => (
                      <FormItem>
                         <ProductCombobox index={index} onProductSelect={(product, idx) => {
                            form.setValue(`items.${idx}.productId`, product.id);
                            form.setValue(`items.${idx}.productName`, product.productName);
                            form.setValue(`items.${idx}.currentStock`, product.stockInHand);
                         }} />
                        <FormMessage />
                      </FormItem>
                   )} />
                   <div>
                    <Input value={form.watch(`items.${index}.currentStock`) || 'N/A'} readOnly disabled />
                   </div>
                   <FormField name={`items.${index}.adjustmentType`} control={form.control} render={({ field }) => (
                     <FormItem><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger></FormControl><SelectContent>
                        <SelectItem value="addition">Add (+)</SelectItem>
                        <SelectItem value="reduction">Reduce (-)</SelectItem>
                    </SelectContent></Select></FormItem>
                   )} />
                   <FormField name={`items.${index}.quantity`} control={form.control} render={({ field }) => (
                     <FormItem><FormControl><Input type="number" placeholder="Qty" {...field} /></FormControl><FormMessage /></FormItem>
                   )} />
                   <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => append({ productId: '', productName: '', adjustmentType: 'reduction', quantity: 0, currentStock: 0, notes: '' })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Adjustment
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
