
'use client';

import * as React from 'react';
import { useForm, useFieldArray, useWatch, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  Save,
  Loader2,
  ChevronsUpDown,
  Check,
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
import { Textarea } from '@/components/ui/textarea';
import { DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { generateSalesInvoices, SalesInvoice } from '../sales-invoices/data';
import { generatePurchaseBills, PurchaseBill } from '../purchase/data';
import { staticCustomers } from '@/lib/customer-data';
import { staticVendors } from '@/lib/customer-data';

const paymentAllocationSchema = z.object({
  invoiceId: z.string(),
  invoiceNumber: z.string(),
  dueDate: z.date(),
  invoiceAmount: z.coerce.number(),
  amountDue: z.coerce.number(),
  allocatedAmount: z.coerce.number().optional(),
});

const paymentFormSchema = z.object({
  partyId: z.string().min(1, 'A party must be selected.'),
  paymentDate: z.date(),
  paymentMode: z.string().min(1, 'Payment mode is required.'),
  totalAmountReceived: z.coerce.number().min(0.01, 'Payment amount must be positive.'),
  allocations: z.array(paymentAllocationSchema),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;
type Allocation = z.infer<typeof paymentAllocationSchema>;

interface PaymentFormProps {
    type: 'receipt' | 'payment';
    onSuccess: (data: any) => void;
}

export function PaymentForm({ type, onSuccess }: PaymentFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const parties = type === 'receipt' ? staticCustomers : staticVendors;
  const allInvoices = React.useMemo(() => (type === 'receipt' ? generateSalesInvoices(50) : []), [type]);
  const allBills = React.useMemo(() => (type === 'payment' ? generatePurchaseBills(50) : []), [type]);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      partyId: '',
      paymentDate: new Date(),
      paymentMode: 'bank',
      totalAmountReceived: 0,
      allocations: [],
    },
  });
  
  const { fields, replace, update } = useFieldArray({
    control: form.control,
    name: 'allocations'
  });

  const partyId = form.watch('partyId');
  const watchedAllocations = form.watch('allocations');
  const totalAmountReceived = form.watch('totalAmountReceived');

  React.useEffect(() => {
    if (partyId) {
      const party = parties.find(p => p.id === partyId);
      if (!party) return;
      
      const outstandingDocuments = type === 'receipt' 
        ? allInvoices.filter(inv => inv.customerName === party.company && inv.paymentStatus !== 'Paid') 
        : allBills.filter(bill => bill.vendorName === party.company && bill.paymentStatus !== 'Paid');
      
      const sortedDocuments = outstandingDocuments.sort((a,b) => a.dueDate.getTime() - b.dueDate.getTime());

      const newAllocations = sortedDocuments.map(doc => ({
        invoiceId: doc.id,
        invoiceNumber: type === 'receipt' ? (doc as SalesInvoice).invoiceNumber : (doc as PurchaseBill).billNumber,
        dueDate: doc.dueDate,
        invoiceAmount: type === 'receipt' ? (doc as SalesInvoice).amountBase : (doc as PurchaseBill).amount,
        amountDue: doc.amountDue,
        allocatedAmount: 0,
      }));
      replace(newAllocations);
    } else {
      replace([]);
    }
  }, [partyId, type, parties, allInvoices, allBills, replace]);
  
  React.useEffect(() => {
    let remainingAmount = totalAmountReceived;
    const currentAllocations = form.getValues('allocations');
    
    const newAllocations = currentAllocations.map(alloc => {
      if (remainingAmount > 0) {
        const amountToAllocate = Math.min(remainingAmount, alloc.amountDue);
        remainingAmount -= amountToAllocate;
        return { ...alloc, allocatedAmount: amountToAllocate };
      }
      return { ...alloc, allocatedAmount: 0 };
    });
    
    // Check if allocations actually changed to prevent infinite loop
    const hasChanged = JSON.stringify(newAllocations) !== JSON.stringify(currentAllocations);
    if (hasChanged) {
        replace(newAllocations);
    }

  }, [totalAmountReceived, partyId]); // Re-run when total amount or party changes

  const unallocatedAmount = React.useMemo(() => {
    const totalAllocated = watchedAllocations.reduce((sum, alloc) => sum + (alloc.allocatedAmount || 0), 0);
    return totalAmountReceived - totalAllocated;
  }, [watchedAllocations, totalAmountReceived]);

  async function onSubmit(data: PaymentFormValues) {
    setIsSubmitting(true);
    console.log(data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({ title: "Success", description: `${type === 'receipt' ? 'Receipt' : 'Payment'} recorded successfully.` });
    onSuccess(data);
    setIsSubmitting(false);
  }

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '0') {
      e.target.value = '';
    }
  };

  const handleAmountBlur = (e: React.FocusEvent<HTMLInputElement>, index: number) => {
    const value = parseFloat(e.target.value);
    if(isNaN(value)) {
        update(index, { ...watchedAllocations[index], allocatedAmount: 0});
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>{type === 'receipt' ? 'New Receipt Voucher' : 'New Payment Voucher'}</DialogTitle>
          <DialogDescription>Record a payment and allocate it against outstanding invoices.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField control={form.control} name="partyId" render={({ field }) => (
                <FormItem><FormLabel>Select {type === 'receipt' ? 'Customer' : 'Vendor'}</FormLabel><Popover modal={false}><PopoverTrigger asChild><FormControl>
                    <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                        {field.value ? parties.find(p => p.id === field.value)?.company : `Select ${type === 'receipt' ? 'Customer' : 'Vendor'}`}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </FormControl></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Search party..." /><CommandList><CommandEmpty>No party found.</CommandEmpty><CommandGroup>
                    {parties.map(party => <CommandItem value={party.company} key={party.id} onSelect={() => form.setValue("partyId", party.id)}>
                        <Check className={cn("mr-2 h-4 w-4", party.id === field.value ? "opacity-100" : "opacity-0")}/>
                        {party.company}
                    </CommandItem>)}
                </CommandGroup></CommandList></Command></PopoverContent></Popover><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="paymentDate" render={({ field }) => (
                <FormItem><FormLabel>Date</FormLabel><Popover><PopoverTrigger asChild><FormControl>
                    <Button variant={"outline"} className={cn("w-full text-left font-normal", !field.value && "text-muted-foreground")}>
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
            )}/>
             <FormField control={form.control} name="paymentMode" render={({ field }) => (
                <FormItem><FormLabel>Mode</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select mode" /></SelectTrigger></FormControl><SelectContent>
                    <SelectItem value="bank">Bank Transfer</SelectItem><SelectItem value="cash">Cash</SelectItem><SelectItem value="upi">UPI</SelectItem><SelectItem value="cheque">Cheque</SelectItem>
                </SelectContent></Select><FormMessage /></FormItem>
            )}/>
        </div>
        <Separator />
        <div className="flex flex-col md:flex-row gap-4 items-end">
            <FormField control={form.control} name="totalAmountReceived" render={({ field }) => (
                <FormItem><FormLabel>Amount {type === 'receipt' ? 'Received' : 'Paid'}</FormLabel><FormControl>
                    <Input type="text" placeholder="0.00" {...field} onFocus={handleFocus} />
                </FormControl><FormMessage /></FormItem>
            )}/>
            <div className="p-2 border rounded-md bg-muted text-sm flex-1 w-full">
                <div className="flex justify-between">
                    <span className="text-muted-foreground">Unallocated Amount:</span>
                    <span className={cn("font-semibold", unallocatedAmount > 0 ? "text-green-600" : unallocatedAmount < 0 ? "text-destructive" : "")}>
                        {formatCurrency(unallocatedAmount, 'INR')}
                    </span>
                </div>
            </div>
        </div>
        <div className="h-64 overflow-y-auto border rounded-md">
            <Table>
                <TableHeader><TableRow><TableHead>Invoice No.</TableHead><TableHead>Due Date</TableHead><TableHead className="text-right">Amount Due</TableHead><TableHead className="w-48 text-right">Payment</TableHead></TableRow></TableHeader>
                <TableBody>{fields.map((field, index) => {
                    const isFullyPaid = (field.allocatedAmount || 0) >= field.amountDue;
                    return (
                        <TableRow key={field.id} className={cn(isFullyPaid && "bg-green-100 dark:bg-green-900/50")}>
                            <TableCell>{field.invoiceNumber}</TableCell>
                            <TableCell>{format(field.dueDate, 'dd-MMM-yy')}</TableCell>
                            <TableCell className="text-right">{formatCurrency(field.amountDue, 'INR')}</TableCell>
                            <TableCell>
                                <Controller
                                    control={form.control}
                                    name={`allocations.${index}.allocatedAmount`}
                                    render={({ field: controllerField }) => (
                                        <Input 
                                            type="text" 
                                            className="text-right" 
                                            {...controllerField}
                                            onFocus={handleFocus}
                                            onBlur={(e) => handleAmountBlur(e, index)}
                                            onChange={(e) => {
                                                const value = parseFloat(e.target.value) || 0;
                                                const amountToAllocate = Math.min(value, watchedAllocations[index].amountDue);
                                                controllerField.onChange(amountToAllocate);
                                            }}
                                        />
                                    )}
                                />
                            </TableCell>
                        </TableRow>
                    )
                })}</TableBody>
            </Table>
        </div>
        <FormField control={form.control} name="notes" render={({ field }) => (
            <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Optional notes for this transaction." {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <div className="flex justify-end pt-2"><Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save {type === 'receipt' ? 'Receipt' : 'Payment'}
        </Button></div>
      </form>
    </Form>
  );
}
