
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
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
import { Loader2, Save, Trash2, PlusCircle, ChevronsUpDown, Check, CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { generateStockListData, type StockItem } from '@/app/stock-list/data';
import { useSearchParams } from 'next/navigation';
import { Calendar } from '@/components/ui/calendar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const transferItemSchema = z.object({
  productId: z.string().min(1, 'Product is required.'),
  productName: z.string(),
  quantity: z.coerce.number().min(0.01, 'Quantity must be positive.'),
  availableStock: z.number(),
});

const stockTransferSchema = z.object({
  date: z.date(),
  fromLocation: z.string().min(1, 'Source location is required.'),
  toLocation: z.string().min(1, 'Destination location is required.'),
  items: z.array(transferItemSchema).min(1, 'At least one item is required.'),
  notes: z.string().optional(),
}).refine((data) => data.fromLocation !== data.toLocation, {
    message: "Source and destination locations cannot be the same.",
    path: ["toLocation"],
});

type StockTransferValues = z.infer<typeof stockTransferSchema>;

const locations = ['Main Warehouse', 'Store', 'Shop A', 'Shop B'];

export function StockTransferForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [products, setProducts] = React.useState<StockItem[]>([]);

  React.useEffect(() => {
    setProducts(generateStockListData(50));
  }, []);

  const form = useForm<StockTransferValues>({
    resolver: zodResolver(stockTransferSchema),
    defaultValues: {
      date: new Date(),
      fromLocation: '',
      toLocation: '',
      items: [],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  React.useEffect(() => {
    const dataString = searchParams.get('data');
    if (dataString) {
        try {
            const data = JSON.parse(decodeURIComponent(dataString));
            form.reset({
                ...data,
                date: new Date(data.date),
                items: data.items.map((item: any) => ({
                    ...item,
                    availableStock: products.find(p => p.id === item.productId)?.stockInHand || 0,
                }))
            });
        } catch (error) {
            console.error("Failed to parse adjustment data from URL", error);
        }
    }
  }, [searchParams, form, products]);


  async function onSubmit(data: StockTransferValues) {
    setIsSubmitting(true);
    console.log('Stock Transfer Data:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Stock Transfer Initiated",
      description: `Transfer from ${data.fromLocation} to ${data.toLocation} has been recorded.`,
    });
    form.reset({
      date: new Date(),
      fromLocation: '',
      toLocation: '',
      items: [],
      notes: '',
    });
    setIsSubmitting(false);
  }

  const ProductCombobox = ({ index }: { index: number }) => {
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
                    form.setValue(`items.${index}.productId`, product.id);
                    form.setValue(`items.${index}.productName`, product.productName);
                    form.setValue(`items.${index}.availableStock`, product.stockInHand);
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
        <CardTitle>New Stock Transfer</CardTitle>
        <CardDescription>Move stock items from one location to another.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
               <FormField name="date" control={form.control} render={({ field }) => (
                <FormItem className="flex flex-col"><FormLabel>Transfer Date</FormLabel><Popover><PopoverTrigger asChild><FormControl>
                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
              )} />
              <FormField name="fromLocation" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>From Location</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger></FormControl><SelectContent>
                    {locations.map(loc => <SelectItem key={`from-${loc}`} value={loc}>{loc}</SelectItem>)}
                </SelectContent></Select><FormMessage /></FormItem>
              )} />
              <FormField name="toLocation" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>To Location</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger></FormControl><SelectContent>
                     {locations.map(loc => <SelectItem key={`to-${loc}`} value={loc}>{loc}</SelectItem>)}
                </SelectContent></Select><FormMessage /></FormItem>
              )} />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Items to Transfer</h3>
               <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-1/2">Product</TableHead>
                        <TableHead className="text-right">Available Stock</TableHead>
                        <TableHead className="text-right">Transfer Quantity</TableHead>
                        <TableHead className="w-12"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                     {fields.map((field, index) => (
                         <TableRow key={field.id} className="align-top">
                            <TableCell>
                                <FormField name={`items.${index}.productId`} control={form.control} render={() => (
                                    <FormItem><ProductCombobox index={index} /><FormMessage /></FormItem>
                                )} />
                            </TableCell>
                            <TableCell>
                                <Input value={form.watch(`items.${index}.availableStock`) || 'N/A'} readOnly disabled className="text-right" />
                            </TableCell>
                             <TableCell>
                                <FormField name={`items.${index}.quantity`} control={form.control} render={({ field }) => (
                                    <FormItem><FormControl><Input type="text" placeholder="Qty" {...field} className="text-right" /></FormControl><FormMessage /></FormItem>
                                )} />
                             </TableCell>
                             <TableCell>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                             </TableCell>
                         </TableRow>
                    ))}
                </TableBody>
               </Table>
              <Button type="button" variant="outline" onClick={() => append({ productId: '', productName: '', quantity: 0, availableStock: 0 })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>
            
            <FormField name="notes" control={form.control} render={({ field }) => (
                <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Optional: add any notes about this transfer" {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Transfer
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
