
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, addMonths, addWeeks, addDays, addYears } from 'date-fns';
import {
  Calendar as CalendarIcon,
  PlusCircle,
  Trash2,
  Save,
  Loader2,
  ChevronsUpDown,
  Check,
  RefreshCcw,
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { generateStockListData, type StockItem } from '@/app/stock-list/data';
import { staticCustomers } from '@/lib/customer-data';

const recurringInvoiceItemSchema = z.object({
  itemName: z.string().min(1, 'Item name is required.'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1.'),
  rate: z.coerce.number().min(0, 'Rate cannot be negative.'),
});

const recurringInvoiceFormSchema = z.object({
  customerName: z.string().min(1, 'Customer is required.'),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'yearly']),
  startDate: z.date(),
  endDate: z.date().optional(),
  items: z.array(recurringInvoiceItemSchema).min(1, 'At least one item is required.'),
  notes: z.string().optional(),
});

type RecurringInvoiceFormValues = z.infer<typeof recurringInvoiceFormSchema>;


const generateSchedule = (data: RecurringInvoiceFormValues, count: number = 12): Date[] => {
    const schedule: Date[] = [];
    let currentDate = new Date(data.startDate);

    const incrementDate = (date: Date): Date => {
        switch (data.frequency) {
            case 'daily': return addDays(date, 1);
            case 'weekly': return addWeeks(date, 1);
            case 'monthly': return addMonths(date, 1);
            case 'yearly': return addYears(date, 1);
            default: return date;
        }
    }

    while (schedule.length < count && (!data.endDate || currentDate <= data.endDate)) {
        schedule.push(new Date(currentDate));
        currentDate = incrementDate(currentDate);
    }
    return schedule;
};


export function RecurringInvoiceForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [savedInvoice, setSavedInvoice] = React.useState<RecurringInvoiceFormValues | null>(null);
  const [schedule, setSchedule] = React.useState<Date[]>([]);

  const form = useForm<RecurringInvoiceFormValues>({
    resolver: zodResolver(recurringInvoiceFormSchema),
    defaultValues: {
      customerName: '',
      frequency: 'monthly',
      startDate: new Date(),
      items: [{ itemName: '', quantity: 1, rate: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const watchedItems = form.watch('items');

  const totalAmount = React.useMemo(() => {
    return watchedItems.reduce((acc, item) => acc + (item.quantity || 0) * (item.rate || 0), 0);
  }, [watchedItems]);

  async function onSubmit(data: RecurringInvoiceFormValues) {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setSavedInvoice(data);
    const generated = generateSchedule(data);
    setSchedule(generated);
    
    toast({
      title: "Template Saved",
      description: `Recurring invoice for ${data.customerName} has been saved.`,
    });
    setIsSubmitting(false);
  }

  const handleCreateNew = () => {
    form.reset({
        customerName: '',
        frequency: 'monthly',
        startDate: new Date(),
        items: [{ itemName: '', quantity: 1, rate: 0 }],
    });
    setSavedInvoice(null);
    setSchedule([]);
  }

  return (
    <div className="space-y-6">
        <Card className="max-w-4xl mx-auto">
        <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle>New Recurring Invoice</CardTitle>
                    <CardDescription>Set up an invoice that will be generated automatically on a schedule.</CardDescription>
                </div>
                {savedInvoice && (
                    <Button variant="outline" onClick={handleCreateNew}>
                        <RefreshCcw className="mr-2 h-4 w-4" />
                        Create New Template
                    </Button>
                )}
            </div>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <fieldset disabled={!!savedInvoice}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Customer</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                    {field.value || "Select customer"}
                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                <Command>
                                    <CommandInput placeholder="Search customer..." />
                                    <CommandList>
                                    <CommandEmpty>No customer found.</CommandEmpty>
                                    <CommandGroup>
                                        {staticCustomers.map(customer => (
                                        <CommandItem key={customer.id} value={customer.company} onSelect={() => form.setValue('customerName', customer.company)}>
                                            <Check className={cn("mr-2 h-4 w-4", field.value === customer.company ? "opacity-100" : "opacity-0")} />
                                            {customer.company}
                                        </CommandItem>
                                        ))}
                                    </CommandGroup>
                                    </CommandList>
                                </Command>
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="frequency"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Frequency</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select frequency" /></SelectTrigger></FormControl>
                                <SelectContent>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                                <SelectItem value="monthly">Monthly</SelectItem>
                                <SelectItem value="yearly">Yearly</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>Start Date</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a start date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem className="flex flex-col">
                            <FormLabel>End Date (Optional)</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Never expires</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                    
                    <Separator />

                    <div>
                        <h3 className="text-lg font-medium mb-2">Invoice Items</h3>
                        <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead className="w-1/2">Description</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Rate</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.map((field, index) => (
                            <TableRow key={field.id}>
                                <TableCell>
                                <FormField name={`items.${index}.itemName`} control={form.control} render={({ field }) => (
                                    <Input placeholder="e.g., Monthly Subscription" {...field} />
                                )} />
                                </TableCell>
                                <TableCell>
                                <FormField name={`items.${index}.quantity`} control={form.control} render={({ field }) => (
                                    <Input type="number" className="text-right" {...field} />
                                )} />
                                </TableCell>
                                <TableCell>
                                <FormField name={`items.${index}.rate`} control={form.control} render={({ field }) => (
                                    <Input type="number" className="text-right" {...field} />
                                )} />
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                {formatCurrency((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.rate || 0), 'INR')}
                                </TableCell>
                                <TableCell>
                                <Button variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                                </TableCell>
                            </TableRow>
                            ))}
                        </TableBody>
                        </Table>
                        <Button type="button" variant="outline" className="mt-4" onClick={() => append({ itemName: '', quantity: 1, rate: 0 })}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-end">
                        <div className="w-full max-w-xs space-y-2">
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total Amount</span>
                            <span className="font-mono">{formatCurrency(totalAmount, 'INR')}</span>
                        </div>
                        </div>
                    </div>

                    <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Notes (Optional)</FormLabel>
                            <FormControl>
                            <Textarea placeholder="Internal notes for this recurring invoice." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </fieldset>
                
                {!savedInvoice && <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Template
                    </Button>
                </div>}
            </form>
            </Form>
        </CardContent>
        </Card>
        {savedInvoice && (
            <Card className="max-w-4xl mx-auto mt-6">
                <CardHeader>
                    <CardTitle>Generated Invoice Schedule</CardTitle>
                    <CardDescription>
                        Showing the next {schedule.length} upcoming invoices for {savedInvoice.customerName}.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>#</TableHead>
                                    <TableHead>Invoice Date</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schedule.map((date, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>{format(date, 'PPP')}</TableCell>
                                        <TableCell>Pending</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>
        )}
    </div>
  );
}
