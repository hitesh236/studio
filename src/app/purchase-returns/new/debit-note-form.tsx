
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Save, Loader2, ChevronsUpDown, Check, Trash2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import type { PurchaseBill } from '@/app/purchase/data';
import { generatePurchaseBills } from '@/app/purchase/data';
import { generateStockListData, type StockItem } from '@/app/stock-list/data';

import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';

const debitNoteItemSchema = z.object({
  originalItemId: z.number(),
  itemName: z.string().min(1, 'Item name is required.'),
  quantity: z.coerce.number().min(0.01, 'Quantity must be positive.'),
  rate: z.coerce.number().min(0, 'Rate cannot be negative.'),
  gstRate: z.coerce.number().min(0).max(100).default(18),
  purchasedQty: z.coerce.number().optional(),
});

const debitNoteFormSchema = z.object({
  originalBillId: z.string().min(1, 'Original bill must be selected.'),
  vendorName: z.string(),
  debitNoteNumber: z.string().min(1, 'Debit Note number is required.'),
  debitNoteDate: z.date(),
  reasonForReturn: z.string().min(1, 'Reason for return is required.'),
  items: z.array(debitNoteItemSchema).min(1, 'At least one item is required.'),
});

type DebitNoteFormValues = z.infer<typeof debitNoteFormSchema>;

export function DebitNoteForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [allBills, setAllBills] = React.useState<PurchaseBill[]>([]);
  const [stockList, setStockList] = React.useState<StockItem[]>([]);

  const form = useForm<DebitNoteFormValues>({
    resolver: zodResolver(debitNoteFormSchema),
    defaultValues: {
      originalBillId: '',
      vendorName: '',
      debitNoteNumber: `DN-${Math.floor(Math.random() * 9000) + 1000}`,
      debitNoteDate: new Date(),
      reasonForReturn: '',
      items: [],
    },
  });

  const { fields, remove, replace } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const onBillSelect = React.useCallback((billId: string, billList: PurchaseBill[], currentStock: StockItem[]) => {
    const bill = billList.find(b => b.id === billId);
    if (bill) {
        const availableItems = bill.items.filter(item => 
            currentStock.some(stockItem => stockItem.productName === item.name)
        );

        form.reset({
            originalBillId: bill.id,
            vendorName: bill.vendorName,
            debitNoteNumber: `DN-${bill.billNumber.split('-')[2]}`,
            debitNoteDate: new Date(),
            reasonForReturn: '',
            items: availableItems.map(item => ({
                originalItemId: item.id,
                itemName: item.name,
                quantity: item.quantity,
                purchasedQty: item.quantity,
                rate: item.rate,
                gstRate: 18, 
            })),
        })
    }
  }, [form]);

  React.useEffect(() => {
    const stockData = generateStockListData();
    setStockList(stockData);
    const billDataString = searchParams.get('billData');
    if (billDataString) {
      try {
        const billData: PurchaseBill = JSON.parse(decodeURIComponent(billDataString));
        onBillSelect(billData.id, [billData], stockData);
        setAllBills(prev => {
            if (prev.find(b => b.id === billData.id)) return prev;
            return [...prev, billData];
        });
      } catch (error) {
        console.error("Failed to parse bill data from URL", error);
      }
    }
  }, [searchParams, onBillSelect]);

  React.useEffect(() => {
    if (!searchParams.get('billData')) {
        setAllBills(generatePurchaseBills(50));
    }
  }, [searchParams]);

  const watchedItems = form.watch('items');
  const originalBill = allBills.find(b => b.id === form.getValues('originalBillId'));

  const totals = React.useMemo(() => {
    const subtotal = watchedItems.reduce((acc, item) => acc + (item.quantity || 0) * (item.rate || 0), 0);
    const gstRate = watchedItems.length > 0 ? watchedItems[0].gstRate : 18;
    const totalGst = subtotal * (gstRate / 100);
    const grandTotal = subtotal + totalGst;
    return { subtotal, grandTotal };
  }, [watchedItems]);

  async function onSubmit(data: DebitNoteFormValues) {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Form Submitted', { data, totals });
    toast({
      title: "Debit Note Created",
      description: `Debit Note ${data.debitNoteNumber} has been successfully created.`,
    });
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">New Purchase Return (Debit Note)</CardTitle>
            <CardDescription>Select an original purchase bill to create a return against it.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="originalBillId"
                    render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Original Bill</FormLabel>
                        <Popover><PopoverTrigger asChild><FormControl>
                            <Button variant="outline" role="combobox" className={cn("justify-between", !field.value && "text-muted-foreground")}>
                                {field.value && allBills.length > 0 ? allBills.find(b => b.id === field.value)?.billNumber : "Select a bill"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </FormControl></PopoverTrigger><PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command>
                            <CommandInput placeholder="Search bill..." />
                            <CommandList><CommandEmpty>No bill found.</CommandEmpty><CommandGroup>
                                {allBills.map((bill) => (
                                    <CommandItem value={bill.id} key={bill.id} onSelect={() => onBillSelect(bill.id, allBills, stockList)}>
                                        <Check className={cn("mr-2 h-4 w-4", bill.id === field.value ? "opacity-100" : "opacity-0")} />
                                        <span>{bill.billNumber} - {bill.vendorName}</span>
                                    </CommandItem>
                                ))}
                            </CommandGroup></CommandList>
                        </Command></PopoverContent></Popover>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                 <div>
                    <Label>Vendor</Label>
                    <Input readOnly value={form.getValues('vendorName') || 'N/A'} className="mt-2 bg-muted/50" />
                </div>
                 <div>
                    <Label>Original Invoice No.</Label>
                    <Input readOnly value={originalBill?.billNumber || 'N/A'} className="mt-2 bg-muted/50" />
                </div>
              </div>
              <div className="space-y-4">
                <FormField control={form.control} name="debitNoteNumber" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Debit Note Number</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="debitNoteDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Debit Note Date</FormLabel>
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3 min-w-[250px]">Item</TableHead>
                    <TableHead className="text-right min-w-[120px]">Purchased Qty</TableHead>
                    <TableHead className="text-right min-w-[120px]">Returnable Qty</TableHead>
                    <TableHead className="text-right min-w-[120px]">Return Qty</TableHead>
                    <TableHead className="text-right min-w-[120px]">Rate</TableHead>
                    <TableHead className="text-right min-w-[120px]">Amount</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell><Input value={field.itemName} readOnly className="bg-muted/50" /></TableCell>
                      <TableCell><Input type="number" className="text-right bg-muted/50" value={field.purchasedQty} readOnly /></TableCell>
                      <TableCell><Input type="number" className="text-right bg-muted/50" value={field.purchasedQty} readOnly /></TableCell>
                      <TableCell><FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => <Input type="number" className="text-right" {...field} />} /></TableCell>
                      <TableCell><FormField control={form.control} name={`items.${index}.rate`} render={({ field }) => <Input type="number" className="text-right bg-muted/50" {...field} readOnly />} /></TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.rate || 0), 'INR')}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <Separator />
            <div className="flex justify-end">
              <div className="w-full max-w-sm space-y-2">
                <div className="flex justify-between"><span>Subtotal</span><span className="font-mono">{formatCurrency(totals.subtotal, 'INR')}</span></div>
                <div className="flex justify-between"><span>GST ({watchedItems[0]?.gstRate || 18}%)</span><span className="font-mono">{formatCurrency(totals.grandTotal - totals.subtotal, 'INR')}</span></div>
                <Separator/>
                <div className="flex justify-between font-bold text-lg"><span>Total Debit Amount</span><span className="font-mono">{formatCurrency(totals.grandTotal, 'INR')}</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Debit Note
          </Button>
        </div>
      </form>
    </Form>
  );
}
