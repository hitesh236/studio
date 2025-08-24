

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
  Printer,
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import type { SalesInvoice } from '@/app/sales-invoices/data';
import { generateSalesInvoices } from '@/app/sales-invoices/data';


import { cn, formatCurrency, numberToWords } from '@/lib/utils';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

const sellerDetails = {
    state: 'Maharashtra',
};

const creditNoteItemSchema = z.object({
  originalItemId: z.number(),
  itemName: z.string().min(1, 'Item name is required.'),
  quantity: z.coerce.number().min(0, 'Quantity cannot be negative.'),
  purchasedQty: z.coerce.number().optional(),
  rate: z.coerce.number().min(0, 'Rate cannot be negative.'),
  gstRate: z.coerce.number().min(0).max(100).default(18),
}).refine(data => data.quantity <= (data.purchasedQty || 0), {
    message: 'Cannot return more than purchased quantity.',
    path: ['quantity'],
});


const creditNoteFormSchema = z.object({
  originalInvoiceId: z.string().min(1, 'Original invoice must be selected.'),
  originalInvoiceNumber: z.string().optional(),
  customerName: z.string(),
  placeOfSupply: z.string(),
  creditNoteNumber: z.string().min(1, 'Credit Note number is required.'),
  creditNoteDate: z.date(),
  reasonForReturn: z.string().min(1, 'Reason for return is required.'),
  items: z.array(creditNoteItemSchema).min(1, 'At least one item is required.'),
});

type CreditNoteFormValues = z.infer<typeof creditNoteFormSchema>;

let allInvoices: SalesInvoice[] = [];

const PrintableCreditNote = React.forwardRef<HTMLDivElement, { note: CreditNoteFormValues; totals: any; originalInvoiceNumber: string }>(({ note, totals, originalInvoiceNumber }, ref) => {
    return (
      <div ref={ref} className="p-4 font-sans text-sm text-black bg-white">
        <div className="text-center space-y-1 mb-4">
          <h2 className="text-lg font-bold">Credit Note</h2>
          <p className="text-xs">Original Invoice: {originalInvoiceNumber}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs mb-4">
          <div><strong>Credit Note No:</strong> {note.creditNoteNumber}</div>
          <div className="text-right"><strong>Date:</strong> {format(note.creditNoteDate, 'dd-MMM-yyyy')}</div>
          <div className="col-span-2"><strong>To:</strong> {note.customerName}</div>
        </div>
        <Separator className="my-2 border-black" />
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="h-auto p-1 text-black">Item</TableHead>
              <TableHead className="h-auto p-1 text-black text-right">Qty</TableHead>
              <TableHead className="h-auto p-1 text-black text-right">Rate</TableHead>
              <TableHead className="h-auto p-1 text-black text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {note.items.map(item => (
              <TableRow key={item.originalItemId}>
                <TableCell className="p-1">{item.itemName}</TableCell>
                <TableCell className="p-1 text-right">{item.quantity}</TableCell>
                <TableCell className="p-1 text-right">{item.rate.toFixed(2)}</TableCell>
                <TableCell className="p-1 text-right">{(item.quantity * item.rate).toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Separator className="my-2 border-black border-dashed" />
        <div className="flex justify-end">
            <div className="w-48 text-xs">
                <div className="flex justify-between"><span>Subtotal:</span><span>{totals.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>GST:</span><span>{totals.totalGst.toFixed(2)}</span></div>
                <Separator className="my-1 border-black" />
                <div className="flex justify-between font-bold"><span>Total:</span><span>{totals.grandTotal.toFixed(2)}</span></div>
            </div>
        </div>
         <div className="text-xs mt-4">
            <p><strong>Amount in Words:</strong> {numberToWords(totals.grandTotal)}.</p>
            <p className="mt-2"><strong>Reason:</strong> {note.reasonForReturn}</p>
        </div>
      </div>
    );
});
PrintableCreditNote.displayName = "PrintableCreditNote";


export function CreditNoteForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [noteToPrint, setNoteToPrint] = React.useState<CreditNoteFormValues | null>(null);
  const printRef = React.useRef<HTMLDivElement>(null);

  const form = useForm<CreditNoteFormValues>({
    resolver: zodResolver(creditNoteFormSchema),
    defaultValues: {
      originalInvoiceId: '',
      originalInvoiceNumber: '',
      customerName: '',
      placeOfSupply: '',
      creditNoteNumber: `CN-${Math.floor(Math.random() * 9000) + 1000}`,
      creditNoteDate: new Date(),
      reasonForReturn: '',
      items: [],
    },
    mode: 'onChange',
  });

  const { fields, remove, replace } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const onInvoiceSelect = React.useCallback((invoiceId: string, invoiceList: SalesInvoice[]) => {
    const invoice = invoiceList.find(inv => inv.id === invoiceId);
    if (invoice) {
        form.reset({
            originalInvoiceId: invoice.id,
            originalInvoiceNumber: invoice.invoiceNumber,
            customerName: invoice.customerName,
            placeOfSupply: invoice.placeOfSupply,
            creditNoteNumber: `CN-${invoice.invoiceNumber.split('-')[1]}`,
            creditNoteDate: new Date(),
            reasonForReturn: '',
            items: invoice.items.map(item => ({
                originalItemId: item.id,
                itemName: item.name,
                quantity: 0,
                purchasedQty: item.quantity,
                rate: item.rate,
                gstRate: 18, 
            })),
        })
    }
  }, [form]);

  // Populate form if invoice data is in URL
  React.useEffect(() => {
    const generatedInvoices = generateSalesInvoices(50);
    allInvoices = generatedInvoices;
    const invoiceDataString = searchParams.get('invoiceData');
    if (invoiceDataString) {
      try {
        const invoiceData: SalesInvoice = JSON.parse(decodeURIComponent(invoiceDataString));
        onInvoiceSelect(invoiceData.id, [invoiceData, ...allInvoices]);
      } catch (error) {
        console.error("Failed to parse invoice data from URL", error);
      }
    }
  }, [searchParams, onInvoiceSelect]);
  
  const watchedFormValues = form.watch();
  
  const totals = React.useMemo(() => {
    let subtotal = 0;
    
    watchedFormValues.items.forEach(item => {
        const itemAmount = (item.quantity || 0) * (item.rate || 0);
        subtotal += itemAmount;
    });

    const gstRate = (watchedFormValues.items.length > 0 && watchedFormValues.items[0]?.gstRate) ? watchedFormValues.items[0].gstRate : 18; // simplified
    const totalGst = subtotal * (gstRate / 100);
    const isIntraState = watchedFormValues.placeOfSupply === sellerDetails.state;

    const totalCgst = isIntraState ? totalGst / 2 : 0;
    const totalSgst = isIntraState ? totalGst / 2 : 0;
    const totalIgst = !isIntraState ? totalGst : 0;

    const grandTotal = subtotal + totalGst;

    return { subtotal, grandTotal, totalGst, totalCgst, totalSgst, totalIgst };
  }, [watchedFormValues]);
  
  const handlePrint = () => {
    const printContent = printRef.current;
    if (printContent) {
        const originalContents = document.body.innerHTML;
        const printContentsHTML = printContent.outerHTML;
        document.body.innerHTML = `<html><head><title>Print Credit Note</title><style>@media print { body { -webkit-print-color-adjust: exact; } }</style></head><body>${printContentsHTML}</body></html>`;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload();
    }
  };

  async function onSubmit(data: CreditNoteFormValues) {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Form Submitted', { data, totals });
    toast({
      title: "Credit Note Created",
      description: `Credit Note ${data.creditNoteNumber} has been successfully created.`,
    });
    setNoteToPrint(data);
    setIsSubmitting(false);
  }

  return (
    <>
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
                        <Popover><PopoverTrigger asChild><FormControl>
                            <Button
                                variant="outline"
                                role="combobox"
                                className={cn("justify-between", !field.value && "text-muted-foreground")}
                            >
                                {(field.value && allInvoices.length > 0) ? allInvoices.find( (invoice) => invoice.id === field.value )?.invoiceNumber : "Select an invoice"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </FormControl></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command filter={(value, search) => {
                                const invoice = allInvoices.find(inv => inv.id === value);
                                if (invoice?.invoiceNumber.toLowerCase().includes(search.toLowerCase()) || invoice?.customerName.toLowerCase().includes(search.toLowerCase())) return 1;
                                return 0;
                            }}>
                                <CommandInput placeholder="Search invoice..." />
                                <CommandList><CommandEmpty>No invoice found.</CommandEmpty><CommandGroup>
                                    {allInvoices.map((invoice) => (
                                    <CommandItem
                                        value={invoice.id}
                                        key={invoice.id}
                                        onSelect={() => onInvoiceSelect(invoice.id, allInvoices)}
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
                                        <span className="text-xs text-muted-foreground">{format(new Date(invoice.invoiceDate), "dd-MMM-yy")} | {formatCurrency(invoice.amountBase, 'INR')}</span>
                                        </div>
                                    </CommandItem>
                                    ))}
                                </CommandGroup></CommandList>
                            </Command></PopoverContent></Popover>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <div>
                    <Label>Customer</Label>
                    <Input readOnly disabled value={form.getValues('customerName') || 'N/A'} className="mt-2 cursor-not-allowed focus-visible:ring-0 focus-visible:ring-offset-0" />
                </div>
              </div>
              {/* Credit Note Details */}
              <div className="space-y-4">
                 <div>
                    <Label>Original Invoice No.</Label>
                    <Input readOnly disabled value={form.getValues('originalInvoiceNumber') || 'N/A'} className="mt-2 cursor-not-allowed focus-visible:ring-0 focus-visible:ring-offset-0" />
                </div>
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
                <FormField control={form.control} name="reasonForReturn" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Reason for Return</FormLabel>
                        <FormControl><Input placeholder="e.g., Damaged goods" {...field} /></FormControl>
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
                    <TableHead className="w-1/3 min-w-[200px]">Item</TableHead>
                    <TableHead className="text-right min-w-[120px]">Purchased Qty</TableHead>
                    <TableHead className="text-right min-w-[120px]">Return Qty</TableHead>
                    <TableHead className="text-right min-w-[120px]">Rate</TableHead>
                    <TableHead className="text-right min-w-[120px]">Amount</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell><Input value={field.itemName} disabled className="cursor-not-allowed focus-visible:ring-0 focus-visible:ring-offset-0" /></TableCell>
                      <TableCell><Input type="text" className="text-right cursor-not-allowed focus-visible:ring-0 focus-visible:ring-offset-0" value={field.purchasedQty} disabled /></TableCell>
                       <TableCell>
                         <FormField 
                           control={form.control}
                           name={`items.${index}.quantity`} 
                           render={({ field: qtyField }) => (
                            <FormItem>
                              <FormControl>
                                <Input type="text" className="text-right" {...qtyField} />
                              </FormControl>
                              <FormMessage />
                             </FormItem>
                           )}
                         />
                      </TableCell>
                      <TableCell><FormField control={form.control} name={`items.${index}.rate`} render={({ field: rateField }) => <Input type="text" className="text-right cursor-not-allowed focus-visible:ring-0 focus-visible:ring-offset-0" {...rateField} disabled />} /></TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency((watchedFormValues.items[index]?.quantity || 0) * (watchedFormValues.items[index]?.rate || 0), 'INR')}</TableCell>
                      <TableCell><Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
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

    <Dialog open={!!noteToPrint} onOpenChange={(open) => !open && setNoteToPrint(null)}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Credit Note Created</DialogTitle>
                <DialogDescription>
                    The credit note has been saved. You can now print it.
                </DialogDescription>
            </DialogHeader>
            <PrintableCreditNote ref={printRef} note={noteToPrint!} totals={totals} originalInvoiceNumber={watchedFormValues.originalInvoiceNumber || ''} />
            <DialogFooter className="sm:justify-between">
                 <DialogClose asChild>
                    <Button type="button" variant="secondary">Close</Button>
                 </DialogClose>
                 <Button type="button" onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" /> Print
                 </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
    </>
  );
}
