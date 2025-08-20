
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
  ChevronsUpDown,
  Check,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import type { SalesInvoice, SalesInvoiceItem } from '@/app/sales-invoices/data';
import { generateSalesInvoices } from '@/app/sales-invoices/data';


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
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
  } from '@/components/ui/command';
import { Label } from '@/components/ui/label';

const sellerDetails = {
    state: 'Maharashtra',
};

const creditNoteItemSchema = z.object({
  originalItemId: z.number(),
  itemName: z.string().min(1, 'Item name is required.'),
  quantity: z.coerce.number().min(0.01, 'Quantity must be positive.'),
  rate: z.coerce.number().min(0, 'Rate cannot be negative.'),
  gstRate: z.coerce.number().min(0).max(100).default(18),
});

const creditNoteFormSchema = z.object({
  originalInvoiceId: z.string().min(1, 'Original invoice must be selected.'),
  customerName: z.string(),
  placeOfSupply: z.string(),
  creditNoteNumber: z.string().min(1, 'Credit Note number is required.'),
  creditNoteDate: z.date(),
  reasonForReturn: z.string().min(1, 'Reason for return is required.'),
  items: z.array(creditNoteItemSchema).min(1, 'At least one item is required.'),
});

type CreditNoteFormValues = z.infer<typeof creditNoteFormSchema>;

export function CreditNoteForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [allInvoices, setAllInvoices] = React.useState<SalesInvoice[]>([]);

  React.useEffect(() => {
    // In a real app, you'd fetch this. For now, we generate it.
    setAllInvoices(generateSalesInvoices(50));
  }, []);

  const form = useForm<CreditNoteFormValues>({
    resolver: zodResolver(creditNoteFormSchema),
    defaultValues: {
      originalInvoiceId: '',
      customerName: '',
      placeOfSupply: '',
      creditNoteNumber: `CN-${Math.floor(Math.random() * 9000) + 1000}`,
      creditNoteDate: new Date(),
      reasonForReturn: '',
      items: [],
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const onInvoiceSelect = (invoiceId: string) => {
    const invoice = allInvoices.find(inv => inv.id === invoiceId);
    if (invoice) {
        form.setValue('originalInvoiceId', invoice.id, { shouldValidate: true });
        form.setValue('customerName', invoice.customerName);
        form.setValue('placeOfSupply', invoice.placeOfSupply);
        
        const returnItems = invoice.items.map(item => ({
            originalItemId: item.id,
            itemName: item.name,
            quantity: item.quantity,
            rate: item.rate,
            gstRate: 18, // Assuming a standard GST rate for simplicity
        }));
        replace(returnItems);
    }
  }
  
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
            <CardDescription>Select an original invoice to create a return against it.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Invoice and General Details */}
              <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="originalInvoiceId"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Original Invoice</FormLabel>
                        <Popover>
                        <PopoverTrigger asChild>
                            <FormControl>
                            <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                "justify-between",
                                !field.value && "text-muted-foreground"
                                )}
                            >
                                {field.value
                                ? allInvoices.find(
                                    (invoice) => invoice.id === field.value
                                )?.invoiceNumber
                                : "Select an invoice"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                            </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                            <Command>
                            <CommandInput placeholder="Search invoice..." />
                            <CommandEmpty>No invoice found.</CommandEmpty>
                            <CommandGroup>
                                {allInvoices.map((invoice) => (
                                <CommandItem
                                    value={invoice.invoiceNumber}
                                    key={invoice.id}
                                    onSelect={() => onInvoiceSelect(invoice.id)}
                                >
                                    <Check
                                    className={cn(
                                        "mr-2 h-4 w-4",
                                        invoice.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                    />
                                    <div className="flex flex-col">
                                      <span>{invoice.invoiceNumber} - {invoice.customerName}</span>
                                      <span className="text-xs text-muted-foreground">{format(invoice.invoiceDate, "dd-MMM-yy")} | {formatCurrency(invoice.amount, 'INR')}</span>
                                    </div>
                                </CommandItem>
                                ))}
                            </CommandGroup>
                            </Command>
                        </PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <div>
                    <Label>Customer</Label>
                    <Input readOnly value={form.getValues('customerName') || 'N/A'} className="mt-2 bg-muted/50" />
                </div>
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

            <Separator />

            {/* Items Table */}
            <div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3">Item</TableHead>
                    <TableHead className="text-right">Return Qty</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">GST%</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                          <Input value={field.itemName} readOnly className="bg-muted/50" />
                      </TableCell>
                      <TableCell><FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => <Input type="number" className="text-right" {...field} />} /></TableCell>
                      <TableCell><FormField control={form.control} name={`items.${index}.rate`} render={({ field }) => <Input type="number" className="text-right bg-muted/50" {...field} readOnly />} /></TableCell>
                      <TableCell><FormField control={form.control} name={`items.${index}.gstRate`} render={({ field }) => <Input type="number" className="text-right bg-muted/50" {...field} readOnly />} /></TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.rate || 0), 'INR')}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
