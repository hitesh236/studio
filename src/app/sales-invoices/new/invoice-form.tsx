
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
} from 'lucide-react';

import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya',
  'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim',
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand',
  'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir',
  'Ladakh', 'Lakshadweep', 'Puducherry',
];

const sellerDetails = {
    name: 'Hicks Inc.',
    address: '123 Business Rd, Financial District',
    cityStateZip: 'Mumbai, Maharashtra, 400001',
    gstin: '27ABCDE1234F1Z5',
    state: 'Maharashtra',
};

const invoiceItemSchema = z.object({
  itemName: z.string().min(1, 'Item name is required.'),
  hsnCode: z.string().optional(),
  quantity: z.coerce.number().min(0.01, 'Quantity must be positive.'),
  rate: z.coerce.number().min(0, 'Rate cannot be negative.'),
  discount: z.coerce.number().min(0).max(100).optional().default(0),
});

const invoiceFormSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required.'),
  customerGstin: z.string().optional(),
  billingAddress: z.string().min(1, 'Billing address is required.'),
  placeOfSupply: z.string().min(1, 'Place of supply is required.'),
  isShippingSameAsBilling: z.boolean().default(true),
  shippingAddress: z.string().optional(),
  invoiceNumber: z.string().min(1, 'Invoice number is required.'),
  invoiceDate: z.date(),
  dueDate: z.date(),
  currency: z.enum(['INR', 'USD', 'EUR']).default('INR'),
  exchangeRate: z.coerce.number().min(0.01, 'Exchange rate must be positive.').default(1),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required.'),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export function InvoiceForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customerName: '',
      billingAddress: '',
      isShippingSameAsBilling: true,
      invoiceNumber: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
      invoiceDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      currency: 'INR',
      exchangeRate: 1,
      items: [{ itemName: '', quantity: 1, rate: 0, discount: 0 }],
      notes: 'Thank you for your business. All payments are due within 30 days.',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchedItems = form.watch('items');
  const watchedPlaceOfSupply = form.watch('placeOfSupply');
  const watchedCurrency = form.watch('currency');

  const totals = React.useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTaxableValue = 0;
    
    watchedItems.forEach(item => {
        const itemAmount = (item.quantity || 0) * (item.rate || 0);
        const itemDiscount = itemAmount * ((item.discount || 0) / 100);
        subtotal += itemAmount;
        totalDiscount += itemDiscount;
    });

    totalTaxableValue = subtotal - totalDiscount;

    // Simple GST calculation for now. Let's assume a flat 18% rate.
    const gstRate = 0.18;
    const isIntraState = watchedPlaceOfSupply === sellerDetails.state;
    
    const totalGst = totalTaxableValue * gstRate;
    const cgst = isIntraState ? totalGst / 2 : 0;
    const sgst = isIntraState ? totalGst / 2 : 0;
    const igst = !isIntraState ? totalGst : 0;

    const grandTotal = totalTaxableValue + totalGst;

    return { subtotal, totalDiscount, totalTaxableValue, cgst, sgst, igst, grandTotal, totalGst };
  }, [watchedItems, watchedPlaceOfSupply]);

  async function onSubmit(data: InvoiceFormValues) {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Form Submitted', { data, totals });
    toast({
      title: "Invoice Created",
      description: `Invoice ${data.invoiceNumber} has been successfully created.`,
    });
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle>Create New Invoice</CardTitle>
                <CardDescription>Fill out the form below to create a new sales invoice.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Seller & Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Seller Details */}
                    <div className="space-y-2 text-sm">
                        <h3 className="font-semibold text-base">From:</h3>
                        <p className="font-bold text-primary">{sellerDetails.name}</p>
                        <p>{sellerDetails.address}</p>
                        <p>{sellerDetails.cityStateZip}</p>
                        <p><span className="font-medium text-muted-foreground">GSTIN:</span> {sellerDetails.gstin}</p>
                    </div>

                    {/* Customer Details */}
                    <div className="space-y-4">
                         <FormField
                            control={form.control}
                            name="customerName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Bill To</FormLabel>
                                <FormControl>
                                    <Input placeholder="Customer's Full Name or Company" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="billingAddress"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Billing Address</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Customer's Billing Address" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                             <FormField
                                control={form.control}
                                name="customerGstin"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Customer GSTIN</FormLabel>
                                    <FormControl>
                                        <Input placeholder="15-digit GSTIN (Optional)" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="placeOfSupply"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Place of Supply</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select state" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {indianStates.map(state => (
                                            <SelectItem key={state} value={state}>{state}</SelectItem>
                                        ))}
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                         </div>
                    </div>
                </div>

                <Separator />
                
                {/* Shipping Details */}
                <div>
                     <FormField
                        control={form.control}
                        name="isShippingSameAsBilling"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                Shipping address is the same as billing address
                                </FormLabel>
                            </div>
                            </FormItem>
                        )}
                    />
                    {!form.watch('isShippingSameAsBilling') && (
                         <div className="mt-4">
                             <FormField
                                control={form.control}
                                name="shippingAddress"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>Shipping Address</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Customer's Shipping Address" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                         </div>
                    )}
                </div>

                <Separator />
                
                {/* Invoice Meta */}
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <FormField
                        control={form.control}
                        name="invoiceNumber"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Invoice Number</FormLabel>
                            <FormControl>
                                <Input {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="invoiceDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Invoice Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value ? (
                                        format(field.value, "PPP")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="dueDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Due Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value ? (
                                        format(field.value, "PPP")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                        control={form.control}
                        name="currency"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <Select onValueChange={(value) => {
                                field.onChange(value);
                                form.setValue('exchangeRate', value === 'INR' ? 1 : 83.50);
                            }} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                <SelectItem value="INR">INR (Indian Rupee)</SelectItem>
                                <SelectItem value="USD">USD (United States Dollar)</SelectItem>
                                <SelectItem value="EUR">EUR (Euro)</SelectItem>
                            </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    {watchedCurrency !== 'INR' && (
                        <FormField
                            control={form.control}
                            name="exchangeRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Exchange Rate (1 {watchedCurrency} to INR)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                <Separator />
                
                {/* Invoice Items Table */}
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40%]">Item Description</TableHead>
                            <TableHead>HSN Code</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Rate</TableHead>
                            <TableHead className="text-right">Discount (%)</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="w-12"></TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {fields.map((field, index) => {
                            const item = watchedItems[index];
                            const amount = (item.quantity || 0) * (item.rate || 0);
                            const finalAmount = amount * (1 - (item.discount || 0) / 100);
                            return (
                                <TableRow key={field.id}>
                                <TableCell>
                                     <FormField
                                        control={form.control}
                                        name={`items.${index}.itemName`}
                                        render={({ field }) => <Input placeholder="Item name" {...field} />}
                                    />
                                </TableCell>
                                <TableCell>
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.hsnCode`}
                                        render={({ field }) => <Input placeholder="e.g. 998314" {...field} />}
                                    />
                                </TableCell>
                                <TableCell>
                                     <FormField
                                        control={form.control}
                                        name={`items.${index}.quantity`}
                                        render={({ field }) => <Input type="number" className="text-right" {...field} />}
                                    />
                                </TableCell>
                                <TableCell>
                                     <FormField
                                        control={form.control}
                                        name={`items.${index}.rate`}
                                        render={({ field }) => <Input type="number" className="text-right" {...field} />}
                                    />
                                </TableCell>
                                <TableCell>
                                     <FormField
                                        control={form.control}
                                        name={`items.${index}.discount`}
                                        render={({ field }) => <Input type="number" className="text-right" {...field} />}
                                    />
                                </TableCell>
                                <TableCell className="text-right font-mono">{formatCurrency(finalAmount, watchedCurrency)}</TableCell>
                                <TableCell>
                                    <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:text-destructive"
                                    onClick={() => remove(index)}
                                    disabled={fields.length <= 1}
                                    >
                                    <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                                </TableRow>
                            );
                        })}
                        </TableBody>
                    </Table>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ itemName: '', quantity: 1, rate: 0, discount: 0 })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Another Item
                </Button>

                <Separator />
                
                {/* Totals Section */}
                <div className="flex justify-end">
                    <div className="w-full max-w-sm space-y-3">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-mono">{formatCurrency(totals.subtotal, watchedCurrency)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Discount</span>
                            <span className="font-mono text-destructive">- {formatCurrency(totals.totalDiscount, watchedCurrency)}</span>
                        </div>
                        <Separator />
                         <div className="flex justify-between font-medium">
                            <span>Taxable Value</span>
                            <span className="font-mono">{formatCurrency(totals.totalTaxableValue, watchedCurrency)}</span>
                        </div>
                        {totals.cgst > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">CGST (9%)</span>
                                <span className="font-mono">{formatCurrency(totals.cgst, watchedCurrency)}</span>
                            </div>
                        )}
                        {totals.sgst > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">SGST (9%)</span>
                                <span className="font-mono">{formatCurrency(totals.sgst, watchedCurrency)}</span>
                            </div>
                        )}
                        {totals.igst > 0 && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">IGST (18%)</span>
                                <span className="font-mono">{formatCurrency(totals.igst, watchedCurrency)}</span>
                            </div>
                        )}
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                            <span>Grand Total ({watchedCurrency})</span>
                            <span className="font-mono">{formatCurrency(totals.grandTotal, watchedCurrency)}</span>
                        </div>
                        {watchedCurrency !== 'INR' && (
                             <div className="flex justify-between text-sm text-muted-foreground text-right">
                                <span>(Total in INR: {formatCurrency(totals.grandTotal * form.getValues('exchangeRate'), 'INR')})</span>
                            </div>
                        )}
                    </div>
                </div>

                <Separator />

                {/* Notes and Actions */}
                <div className="space-y-4">
                     <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Notes / Terms & Conditions</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Any additional notes or payment terms." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" /> Save as Draft
            </Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {isSubmitting ? 'Creating...' : 'Save & Send Invoice'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
