
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
  Loader2,
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
    state: 'Maharashtra',
};

const creditNoteItemSchema = z.object({
  itemName: z.string().min(1, 'Item name is required.'),
  hsnCode: z.string().optional(),
  quantity: z.coerce.number().min(0.01, 'Quantity must be positive.'),
  rate: z.coerce.number().min(0, 'Rate cannot be negative.'),
  gstRate: z.coerce.number().min(0).max(100).default(18),
});

const creditNoteFormSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required.'),
  placeOfSupply: z.string().min(1, 'Place of supply is required.'),
  creditNoteNumber: z.string().min(1, 'Credit Note number is required.'),
  creditNoteDate: z.date(),
  originalInvoiceNumber: z.string().optional(),
  originalInvoiceDate: z.date().optional(),
  reasonForReturn: z.string().min(1, 'Reason for return is required.'),
  items: z.array(creditNoteItemSchema).min(1, 'At least one item is required.'),
});

type CreditNoteFormValues = z.infer<typeof creditNoteFormSchema>;

export function CreditNoteForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const customers = [
    { id: 'cust1', name: 'Innovate Inc.', gstin: '27ABCDE1234F1Z5', address: '123 Tech Park, Mumbai, Maharashtra' },
    { id: 'cust2', name: 'Solutions Corp.', gstin: '29AABCS1234A1Z5', address: '456 Business Hub, Bengaluru, Karnataka' },
    { id: 'cust3', name: 'Quantum Tech', gstin: '36AAAAA0000A1Z0', address: '789 Science City, Hyderabad, Telangana' },
  ];

  const form = useForm<CreditNoteFormValues>({
    resolver: zodResolver(creditNoteFormSchema),
    defaultValues: {
      customerName: '',
      placeOfSupply: '',
      creditNoteNumber: '',
      creditNoteDate: new Date(),
      originalInvoiceNumber: '',
      originalInvoiceDate: undefined,
      reasonForReturn: '',
      items: [{ itemName: '', hsnCode: '', quantity: 1, rate: 0, gstRate: 18 }],
    },
  });

  React.useEffect(() => {
    form.setValue('creditNoteNumber', `CN-${Math.floor(Math.random() * 9000) + 1000}`);
  }, [form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const watchedItems = form.watch('items');
  const watchedPlaceOfSupply = form.watch('placeOfSupply');
  
  const totals = React.useMemo(() => {
    let subtotal = 0;
    
    watchedItems.forEach(item => {
        const itemAmount = (item.quantity || 0) * (item.rate || 0);
        subtotal += itemAmount;
    });

    const gstRate = watchedItems.length > 0 ? watchedItems[0].gstRate : 0; // simplified
    const totalGst = subtotal * (gstRate / 100);
    const isIntraState = watchedPlaceOfSupply === sellerDetails.state;

    const totalCgst = isIntraState ? totalGst / 2 : 0;
    const totalSgst = isIntraState ? totalGst / 2 : 0;
    const totalIgst = !isIntraState ? totalGst : 0;

    const grandTotal = subtotal + totalGst;

    return { subtotal, grandTotal, totalGst, totalCgst, totalSgst, totalIgst };
  }, [watchedItems, watchedPlaceOfSupply]);
  
  async function onSubmit(data: CreditNoteFormValues) {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Form Submitted', { data, totals });
    toast({
      title: "Credit Note Created",
      description: `Credit Note ${data.creditNoteNumber} has been successfully created.`,
    });
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">New Sales Return (Credit Note)</CardTitle>
            <CardDescription>Fill out the details for the sales return.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Customer and General Details */}
              <div className="space-y-4">
                 <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Customer</FormLabel>
                            <Select
                                onValueChange={(value) => {
                                    const selectedCustomer = customers.find(c => c.name === value);
                                    if (selectedCustomer) {
                                        field.onChange(value);
                                        const stateMatch = indianStates.find(state => selectedCustomer.address.toLowerCase().includes(state.toLowerCase()));
                                        if(stateMatch) {
                                            form.setValue('placeOfSupply', stateMatch);
                                        }
                                    }
                                }}
                                value={field.value}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a customer" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {customers.map(customer => (
                                        <SelectItem key={customer.id} value={customer.name}>
                                            {customer.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField control={form.control} name="placeOfSupply" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Place of Supply</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger></FormControl>
                        <SelectContent>{indianStates.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent>
                        </Select><FormMessage />
                    </FormItem>
                )} />
                 <FormField control={form.control} name="reasonForReturn" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Reason for Return</FormLabel>
                        <FormControl><Input placeholder="e.g., Damaged goods" {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
              </div>
              {/* Credit Note Details */}
              <div className="space-y-4">
                <FormField control={form.control} name="creditNoteNumber" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Credit Note Number</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="creditNoteDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Credit Note Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild><FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl></PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )} />
                <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="originalInvoiceNumber" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Original Invoice No.</FormLabel>
                            <FormControl><Input placeholder="e.g., INV-001" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="originalInvoiceDate" render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Original Invoice Date</FormLabel>
                            <Popover><PopoverTrigger asChild><FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                            <FormMessage />
                        </FormItem>
                    )} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Items Table */}
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Item</TableHead>
                    <TableHead>HSN/SAC</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">GST%</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell><FormField control={form.control} name={`items.${index}.itemName`} render={({ field }) => <Input placeholder="Item name" {...field} />} /></TableCell>
                      <TableCell><FormField control={form.control} name={`items.${index}.hsnCode`} render={({ field }) => <Input placeholder="HSN Code" {...field} />} /></TableCell>
                      <TableCell><FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => <Input type="number" className="text-right" {...field} />} /></TableCell>
                      <TableCell><FormField control={form.control} name={`items.${index}.rate`} render={({ field }) => <Input type="number" className="text-right" {...field} />} /></TableCell>
                      <TableCell><FormField control={form.control} name={`items.${index}.gstRate`} render={({ field }) => <Input type="number" className="text-right" {...field} />} /></TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.rate || 0), 'INR')}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button type="button" variant="outline" className="mt-4" onClick={() => append({ itemName: '', hsnCode: '', quantity: 1, rate: 0, gstRate: 18 })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
              </Button>
            </div>

            <Separator />
            
            {/* Totals Section */}
            <div className="flex justify-end">
              <div className="w-full max-w-sm space-y-2">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">{formatCurrency(totals.subtotal, 'INR')}</span></div>
                <div className="flex justify-between"><span>CGST</span><span className="font-mono">{formatCurrency(totals.totalCgst, 'INR')}</span></div>
                <div className="flex justify-between"><span>SGST</span><span className="font-mono">{formatCurrency(totals.totalSgst, 'INR')}</span></div>
                <div className="flex justify-between"><span>IGST</span><span className="font-mono">{formatCurrency(totals.totalIgst, 'INR')}</span></div>
                <Separator/>
                <div className="flex justify-between font-bold text-lg"><span>Total Credit Amount</span><span className="font-mono">{formatCurrency(totals.grandTotal, 'INR')}</span></div>
              </div>
            </div>

          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Credit Note
          </Button>
        </div>
      </form>
    </Form>
  );
}
