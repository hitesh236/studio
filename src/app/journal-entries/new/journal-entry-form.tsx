
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  X,
  Save,
  Loader2,
  ChevronsUpDown,
  Check,
  Info,
  AlertTriangle,
} from 'lucide-react';

import { cn, numberToWords } from '@/lib/utils';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const debitCreditLineSchema = z.object({
  accountId: z.string().min(1, { message: "Account is required" }),
  amount: z.coerce.number().min(0.01, { message: "Amount must be positive" }),
});

const journalEntryFormSchema = z.object({
  date: z.date(),
  voucherType: z.string().min(1, { message: 'Voucher type is required' }),
  description: z.string().min(3, "Description is required."),
  debitLines: z.array(debitCreditLineSchema).min(1, "At least one debit line is required."),
  creditLines: z.array(debitCreditLineSchema).min(1, "At least one credit line is required."),
  autoApprove: z.boolean().default(false),
}).refine(data => {
  const totalDebits = data.debitLines.reduce((acc, line) => acc + (line.amount || 0), 0);
  const totalCredits = data.creditLines.reduce((acc, line) => acc + (line.amount || 0), 0);
  return Math.abs(totalDebits - totalCredits) < 0.01;
}, {
  message: "Sum of debits must be equal to sum of credits.",
  path: ['creditLines'],
});

type JournalEntryFormValues = z.infer<typeof journalEntryFormSchema>;

const chartOfAccounts = [
    { value: '1010-cash', label: 'Cash Book - Cash Book (Asset)' },
    { value: '1010-bank', label: 'Bank Book - Bank Book (Asset)' },
    { value: '1200', label: 'Accounts Receivable' },
    { value: '1510', label: 'Inventory' },
    { value: '2010', label: 'Accounts Payable' },
    { value: '3010', label: "Capital - Capital (Equity)" },
    { value: '4010', label: 'Sales Revenue' },
    { value: '5010', label: 'Rent Expense' },
    { value: '5020', label: 'Salaries Expense' },
];

const voucherTypes = [
    'Sales Voucher', 'Purchase Voucher', 'Journal Voucher', 'Payment Voucher', 'Receipt Voucher'
];

export function JournalEntryForm() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
  
    const form = useForm<JournalEntryFormValues>({
      resolver: zodResolver(journalEntryFormSchema),
      defaultValues: {
        date: new Date(),
        voucherType: 'Sales Voucher',
        description: '',
        debitLines: [{ accountId: '', amount: 0 }],
        creditLines: [{ accountId: '', amount: 0 }],
        autoApprove: false,
      },
      mode: 'onChange',
    });

    const { fields: debitFields, append: appendDebit, remove: removeDebit } = useFieldArray({
        control: form.control,
        name: "debitLines",
    });

    const { fields: creditFields, append: appendCredit, remove: removeCredit } = useFieldArray({
        control: form.control,
        name: "creditLines",
    });

    const watchedDebitLines = form.watch('debitLines');
    const watchedCreditLines = form.watch('creditLines');

    const totals = React.useMemo(() => {
        const totalDebits = watchedDebitLines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
        const totalCredits = watchedCreditLines.reduce((sum, line) => sum + (Number(line.amount) || 0), 0);
        return { totalDebits, totalCredits, difference: totalDebits - totalCredits };
    }, [watchedDebitLines, watchedCreditLines]);

    const handleFormReset = () => {
        form.reset({
            date: new Date(),
            voucherType: 'Sales Voucher',
            description: '',
            debitLines: [{ accountId: '', amount: 0 }],
            creditLines: [{ accountId: '', amount: 0 }],
            autoApprove: false,
        });
    }

    async function onSubmit(data: JournalEntryFormValues) {
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('New Journal Entry Data:', data);
        toast({
          title: "Journal Entry Created",
          description: `Entry for "${data.description}" has been successfully recorded.`,
        });
        setIsSubmitting(false);
        handleFormReset();
    }
    
    return (
        <Card className="max-w-5xl mx-auto">
            <CardHeader>
                <CardTitle>New Journal Entry</CardTitle>
            </CardHeader>
            <CardContent>
                <TooltipProvider>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex items-center gap-4">
                                        <FormLabel className="w-24 pt-2 text-right">Date *</FormLabel>
                                        <div className="w-full max-w-sm">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn("w-full justify-between text-left font-normal", !field.value && "text-muted-foreground")}
                                                    >
                                                        {field.value ? format(field.value, "dd/MM/yyyy") : <span>Pick a date</span>}
                                                        <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                                                    </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-2">
                                {debitFields.map((field, index) => (
                                    <div key={field.id} className="flex items-start gap-4">
                                        <FormLabel className="w-24 pt-2 text-right">
                                            {index === 0 ? 'Debit *' : ''}
                                        </FormLabel>
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-4 items-start">
                                            <FormField
                                                control={form.control}
                                                name={`debitLines.${index}.accountId`}
                                                render={({ field: accountField }) => (
                                                    <FormItem>
                                                        <Popover>
                                                            <PopoverTrigger asChild><FormControl>
                                                                <Button variant="outline" role="combobox" className={cn("w-full justify-between", !accountField.value && "text-muted-foreground")}>
                                                                {accountField.value ? chartOfAccounts.find(acc => acc.value === accountField.value)?.label : "Select account"}
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                </Button>
                                                            </FormControl></PopoverTrigger>
                                                            <PopoverContent className="w-[300px] p-0"><Command>
                                                                <CommandInput placeholder="Search accounts..." />
                                                                <CommandList><CommandEmpty>No account found.</CommandEmpty><CommandGroup>
                                                                {chartOfAccounts.map(acc => (
                                                                    <CommandItem value={acc.label} key={acc.value} onSelect={() => { form.setValue(`debitLines.${index}.accountId`, acc.value); }}>
                                                                        <Check className={cn("mr-2 h-4 w-4", acc.value === accountField.value ? "opacity-100" : "opacity-0")} />
                                                                        {acc.label}
                                                                    </CommandItem>
                                                                ))}
                                                                </CommandGroup></CommandList>
                                                            </Command></PopoverContent>
                                                        </Popover>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`debitLines.${index}.amount`}
                                                render={({ field: amountField }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input type="number" className="text-right" placeholder="0.00" {...amountField} onChange={(e) => amountField.onChange(parseFloat(e.target.value) || 0)} />
                                                        </FormControl>
                                                        {(form.watch(`debitLines.${index}.amount`) || 0) > 0 && <FormDescription className="text-right text-destructive text-xs">{numberToWords(form.watch(`debitLines.${index}.amount`))}</FormDescription>}
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" className="text-primary hover:text-primary mt-1" onClick={() => removeDebit(index)}>
                                            <X className="h-5 w-5" />
                                        </Button>
                                    </div>
                                ))}
                                <div className="flex justify-end pr-16">
                                    <Button type="button" variant="link" onClick={() => appendDebit({ accountId: '', amount: 0 })}>
                                        + ADD DEBIT AMOUNT
                                    </Button>
                                </div>
                            </div>
                            
                             <div className="space-y-2">
                                {creditFields.map((field, index) => (
                                    <div key={field.id} className="flex items-start gap-4">
                                        <FormLabel className="w-24 pt-2 text-right">
                                            {index === 0 ? 'Credit *' : ''}
                                        </FormLabel>
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-4 items-start">
                                            <FormField
                                                control={form.control}
                                                name={`creditLines.${index}.accountId`}
                                                render={({ field: accountField }) => (
                                                    <FormItem>
                                                        <Popover>
                                                            <PopoverTrigger asChild><FormControl>
                                                                <Button variant="outline" role="combobox" className={cn("w-full justify-between", !accountField.value && "text-muted-foreground")}>
                                                                {accountField.value ? chartOfAccounts.find(acc => acc.value === accountField.value)?.label : "Select account"}
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                                </Button>
                                                            </FormControl></PopoverTrigger>
                                                            <PopoverContent className="w-[300px] p-0"><Command>
                                                                <CommandInput placeholder="Search accounts..." />
                                                                <CommandList><CommandEmpty>No account found.</CommandEmpty><CommandGroup>
                                                                {chartOfAccounts.map(acc => (
                                                                    <CommandItem value={acc.label} key={acc.value} onSelect={() => { form.setValue(`creditLines.${index}.accountId`, acc.value); }}>
                                                                        <Check className={cn("mr-2 h-4 w-4", acc.value === accountField.value ? "opacity-100" : "opacity-0")} />
                                                                        {acc.label}
                                                                    </CommandItem>
                                                                ))}
                                                                </CommandGroup></CommandList>
                                                            </Command></PopoverContent>
                                                        </Popover>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`creditLines.${index}.amount`}
                                                render={({ field: amountField }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input type="number" className="text-right" placeholder="0.00" {...amountField} onChange={(e) => amountField.onChange(parseFloat(e.target.value) || 0)} />
                                                        </FormControl>
                                                         {(form.watch(`creditLines.${index}.amount`) || 0) > 0 && <FormDescription className="text-right text-destructive text-xs">{numberToWords(form.watch(`creditLines.${index}.amount`))}</FormDescription>}
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" className="text-primary hover:text-primary mt-1" onClick={() => removeCredit(index)}>
                                            <X className="h-5 w-5" />
                                        </Button>
                                    </div>
                                ))}
                                <div className="flex justify-end pr-16">
                                    <Button type="button" variant="link" onClick={() => appendCredit({ accountId: '', amount: 0 })}>
                                        + ADD CREDIT AMOUNT
                                    </Button>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <Label className="w-24 pt-2 text-right">Description *</Label>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                                    <FormField
                                        control={form.control}
                                        name="description"
                                        render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Textarea placeholder="e.g. Inventory purchased on credit. XYZ Capital Introduce. Max length 254 characters" {...field} rows={4}/>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="voucherType"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Voucher Type *</FormLabel>
                                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {voucherTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-12">
                                <FormField
                                    control={form.control}
                                    name="autoApprove"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-start space-x-2 space-y-0">
                                            <Label>Auto Approve</Label>
                                             <Tooltip><TooltipTrigger asChild>
                                                <button type="button"><Info className="h-4 w-4 text-muted-foreground" /></button>
                                            </TooltipTrigger><TooltipContent>
                                                <p>This entry will be approved automatically.</p>
                                            </TooltipContent></Tooltip>
                                            <FormControl>
                                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <div className="flex items-center gap-4">
                                    <Button type="button" variant="outline" size="lg" onClick={handleFormReset}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSubmitting} size="lg">
                                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                                        Save Voucher
                                    </Button>
                                </div>
                            </div>

                        </form>
                    </Form>
                </TooltipProvider>

                {Math.abs(totals.difference) > 0.01 && (
                    <Alert variant="destructive" className="mt-8 bg-orange-500 text-white border-orange-600 [&>svg]:text-white">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>ALERT!</AlertTitle>
                        <AlertDescription>
                            Sum of debits must be equal to sum of credits. (DEBITS == CREDITS)
                        </AlertDescription>
                    </Alert>
                )}
            </CardContent>
        </Card>
    );
}
