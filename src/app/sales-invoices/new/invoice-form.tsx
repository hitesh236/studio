
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  unit: z.string().optional(),
  rate: z.coerce.number().min(0, 'Rate cannot be negative.'),
  discount: z.coerce.number().min(0).max(100).optional().default(0),
  gstRate: z.coerce.number().min(0).max(100).default(18),
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
  const [columnVisibility, setColumnVisibility] = React.useState({
    unit: true,
    hsn: true,
    discount: true,
  });
  const [roundOff, setRoundOff] = React.useState<number>(0);

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
      items: [{ itemName: '', hsnCode: '', quantity: 1, rate: 0, discount: 0, gstRate: 18, unit: 'pcs' }],
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
    const gstSummary: { [key: number]: { taxable: number; gst: number } } = {};

    watchedItems.forEach(item => {
        const itemAmount = (item.quantity || 0) * (item.rate || 0);
        const itemDiscount = itemAmount * ((item.discount || 0) / 100);
        const taxableAmount = itemAmount - itemDiscount;
        const gstRate = item.gstRate || 0;
        const gstAmount = taxableAmount * (gstRate / 100);

        subtotal += itemAmount;
        totalDiscount += itemDiscount;

        if (!gstSummary[gstRate]) {
            gstSummary[gstRate] = { taxable: 0, gst: 0 };
        }
        gstSummary[gstRate].taxable += taxableAmount;
        gstSummary[gstRate].gst += gstAmount;
    });

    const totalTaxableValue = subtotal - totalDiscount;
    const totalGst = Object.values(gstSummary).reduce((acc, { gst }) => acc + gst, 0);
    const isIntraState = watchedPlaceOfSupply === sellerDetails.state;

    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    if (totalGst > 0) {
      if (isIntraState) {
          Object.values(gstSummary).forEach(({ gst }) => {
              totalCgst += gst / 2;
              totalSgst += gst / 2;
          });
      } else {
          Object.values(gstSummary).forEach(({ gst }) => {
              totalIgst += gst;
          });
      }
    }

    const grandTotal = totalTaxableValue + totalGst + roundOff;
    const singleGstRate = Object.keys(gstSummary).length === 1 ? Object.keys(gstSummary)[0] : null;

    return { subtotal, totalDiscount, totalTaxableValue, grandTotal, totalGst, isIntraState, totalCgst, totalSgst, totalIgst, singleGstRate };
  }, [watchedItems, watchedPlaceOfSupply, roundOff]);
  
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between p-4 pb-2">
            <div className="flex-1 space-y-1">
              <CardTitle className="text-2xl">New Invoice</CardTitle>
              <CardDescription>Fill out the details below to create a new sales invoice.</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                  <span className="sr-only">Toggle Columns</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Show/Hide Columns</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.unit}
                  onCheckedChange={(checked) =>
                    setColumnVisibility((prev) => ({ ...prev, unit: !!checked }))
                  }
                >
                  Unit
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.hsn}
                  onCheckedChange={(checked) =>
                    setColumnVisibility((prev) => ({ ...prev, hsn: !!checked }))
                  }
                >
                  HSN/SAC Code
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={columnVisibility.discount}
                  onCheckedChange={(checked) =>
                    setColumnVisibility((prev) => ({ ...prev, discount: !!checked }))
                  }
                >
                  Discount (%)
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="space-y-6 p-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="customerName"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Bill To</FormLabel>
                                <FormControl>
                                    <Input placeholder="Customer Name" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
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
                            name="billingAddress"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Billing Address</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Customer's Billing Address" {...field} rows={3} />
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
                                <Select onValueChange={field.onChange} value={field.value}>
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
                        <FormField
                            control={form.control}
                            name="isShippingSameAsBilling"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
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
                            <div className="mt-2">
                                <FormField
                                    control={form.control}
                                    name="shippingAddress"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Shipping Address</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Customer's Shipping Address" {...field} rows={2} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
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
                                            "w-full pl-3 text-left font-normal",
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
                                            "w-full pl-3 text-left font-normal",
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
                </div>

                <Separator />
                
                {/* Invoice Items Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Line Items</h3>
                  </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead className="w-[30%] min-w-[200px] h-12 p-2 text-xs whitespace-nowrap">Item</TableHead>
                                <TableHead className="text-right h-12 p-2 text-xs whitespace-nowrap">Qty</TableHead>
                                {columnVisibility.unit && <TableHead className="text-right h-12 p-2 text-xs whitespace-nowrap">Unit</TableHead>}
                                <TableHead className="text-right h-12 p-2 text-xs whitespace-nowrap">Rate</TableHead>
                                {columnVisibility.discount && <TableHead className="text-right h-12 p-2 text-xs whitespace-nowrap">Discount(%)</TableHead>}
                                <TableHead className="text-right h-12 p-2 text-xs whitespace-nowrap">GST(%)</TableHead>
                                <TableHead className="text-right h-12 p-2 text-xs whitespace-nowrap">Taxable Amt.</TableHead>
                                <TableHead className="text-right h-12 p-2 text-xs whitespace-nowrap">Total</TableHead>
                                <TableHead className="w-12 h-12 p-2 text-xs whitespace-nowrap"></TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {fields.map((field, index) => {
                                const item = watchedItems[index];
                                const itemAmount = (item.quantity || 0) * (item.rate || 0);
                                const itemDiscount = itemAmount * ((item.discount || 0) / 100);
                                const taxableAmount = itemAmount - itemDiscount;
                                const gstAmount = taxableAmount * ((item.gstRate || 0) / 100);
                                const totalAmount = taxableAmount + gstAmount;

                                return (
                                    <TableRow key={field.id} className="align-top">
                                    <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.itemName`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Item name and description"
                                                            {...field}
                                                            rows={1}
                                                            className="min-h-[38px]"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {columnVisibility.hsn && <FormField
                                            control={form.control}
                                            name={`items.${index}.hsnCode`}
                                            render={({ field }) => (
                                                <FormItem className="mt-1">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="HSN/SAC Code"
                                                            {...field}
                                                            className="h-8 text-xs"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />}
                                    </TableCell>
                                    <TableCell>
                                         <FormField
                                            control={form.control}
                                            name={`items.${index}.quantity`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" className="text-right min-w-[60px]" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    {columnVisibility.unit && <TableCell>
                                         <FormField
                                            control={form.control}
                                            name={`items.${index}.unit`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="pcs" className="text-right min-w-[70px]" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>}
                                    <TableCell>
                                         <FormField
                                            control={form.control}
                                            name={`items.${index}.rate`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" className="text-right min-w-[80px]" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    {columnVisibility.discount && <TableCell>
                                         <FormField
                                            control={form.control}
                                            name={`items.${index}.discount`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" className="text-right min-w-[70px]" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>}
                                    <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.gstRate`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                                                        <FormControl>
                                                            <SelectTrigger className="min-w-[80px]">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {[0, 5, 12, 18, 28].map(rate => (
                                                                <SelectItem key={rate} value={String(rate)}>{rate}%</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(taxableAmount, watchedCurrency)}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(totalAmount, watchedCurrency)}</TableCell>
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

                     {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {fields.map((field, index) => {
                            const item = watchedItems[index];
                            const itemAmount = (item.quantity || 0) * (item.rate || 0);
                            const itemDiscount = itemAmount * ((item.discount || 0) / 100);
                            const taxableAmount = itemAmount - itemDiscount;
                            const gstAmount = taxableAmount * ((item.gstRate || 0) / 100);
                            const totalAmount = taxableAmount + gstAmount;

                            return (
                                <Card key={field.id} className="p-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="font-semibold pt-1">Item #{index + 1}</h4>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive -mt-1 -mr-1 h-8 w-8"
                                            onClick={() => remove(index)}
                                            disabled={fields.length <= 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.itemName`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Item Name / Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="Item name..." {...field} rows={1} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                         {columnVisibility.hsn && <FormField
                                            control={form.control}
                                            name={`items.${index}.hsnCode`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>HSN/SAC Code</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="HSN/SAC Code" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />}
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.quantity`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Quantity</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {columnVisibility.unit && <FormField
                                                control={form.control}
                                                name={`items.${index}.unit`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Unit</FormLabel>
                                                        <FormControl><Input placeholder="pcs" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />}
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.rate`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Rate</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {columnVisibility.discount && <FormField
                                                control={form.control}
                                                name={`items.${index}.discount`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Discount (%)</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />}
                                             <FormField
                                                control={form.control}
                                                name={`items.${index}.gstRate`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>GST (%)</FormLabel>
                                                        <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                {[0, 5, 12, 18, 28].map(rate => (
                                                                    <SelectItem key={rate} value={String(rate)}>{rate}%</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <Separator/>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Taxable Amt.</span>
                                                <span className="font-mono">{formatCurrency(taxableAmount, watchedCurrency)}</span>
                                            </div>
                                            <div className="flex justify-between font-medium">
                                                <span>Total</span>
                                                <span className="font-mono">{formatCurrency(totalAmount, watchedCurrency)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => append({ itemName: '', hsnCode: '', quantity: 1, rate: 0, discount: 0, gstRate: 18, unit: 'pcs' })}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Another Item
                    </Button>
                </div>


                <Separator />
                
                {/* Totals Section */}
                <div className="flex justify-end pt-4">
                  <div className="w-full md:max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <Card>
                       <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base font-semibold">GST Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-2 text-sm">
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">CGST</span>
                            <span className="font-mono">{formatCurrency(totals.totalCgst, watchedCurrency)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">SGST</span>
                            <span className="font-mono">{formatCurrency(totals.totalSgst, watchedCurrency)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">IGST</span>
                            <span className="font-mono">{formatCurrency(totals.totalIgst, watchedCurrency)}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base font-semibold">Totals</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-mono">{formatCurrency(totals.subtotal, watchedCurrency)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Discount</span>
                          <span className="font-mono text-destructive">
                            - {formatCurrency(totals.totalDiscount, watchedCurrency)}
                          </span>
                        </div>
                        <Separator className="my-1" />
                        <div className="flex justify-between font-medium">
                          <span>Taxable Value</span>
                          <span className="font-mono">{formatCurrency(totals.totalTaxableValue, watchedCurrency)}</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-muted-foreground">
                              {totals.singleGstRate ? `GST (${totals.singleGstRate}%)` : 'Total GST'}
                            </span>
                          <span className="font-mono">{formatCurrency(totals.totalGst, watchedCurrency)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Round Off</span>
                          <Input
                            type="number"
                            step="0.01"
                            className="h-7 w-24 text-right font-mono p-1"
                            value={roundOff}
                            onChange={(e) => setRoundOff(parseFloat(e.target.value) || 0)}
                          />
                        </div>
                        <Separator className="my-1" />
                        <div className="flex justify-between text-base font-bold">
                          <span>Grand Total</span>
                          <span className="font-mono">{formatCurrency(totals.grandTotal, watchedCurrency)}</span>
                        </div>
                         <div className="flex justify-end text-xs text-muted-foreground mt-1">
                            <span>Base Currency (INR) {formatCurrency(totals.grandTotal * (form.getValues('exchangeRate') || 1), 'INR')}</span>
                        </div>
                      </CardContent>
                    </Card>
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
                                <Textarea placeholder="Any additional notes or payment terms." {...field} rows={2} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end gap-4">
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
