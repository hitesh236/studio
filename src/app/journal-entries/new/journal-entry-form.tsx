
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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

const chartOfAccounts = [
  { value: '1010', label: 'Cash' },
  { value: '1200', label: 'Accounts Receivable' },
  { value: '1510', label: 'Office Supplies' },
  { value: '2010', label: 'Accounts Payable' },
  { value: '3010', label: "Owner's Equity" },
  { value: '4010', label: 'Sales Revenue' },
  { value: '5010', label: 'Rent Expense' },
  { value: '5020', label: 'Salaries Expense' },
  { value: '5030', label: 'Utilities Expense' },
];

const journalLineSchema = z.object({
  accountId: z.string().min(1, { message: "Required" }),
  debit: z.coerce.number().min(0).optional(),
  credit: z.coerce.number().min(0).optional(),
}).refine(data => (data.debit || 0) > 0 || (data.credit || 0) > 0, {
  message: "Enter a debit or credit",
  path: ['debit'],
}).refine(data => !((data.debit || 0) > 0 && (data.credit || 0) > 0), {
  message: "Use one column per line",
  path: ['credit'],
});

const journalEntryFormSchema = z.object({
  date: z.date(),
  autoApprove: z.boolean().default(false),
  description: z.string().min(3, "Description is required."),
  lines: z.array(journalLineSchema).min(2, "At least two lines are required."),
}).refine(data => {
  const totalDebits = data.lines.reduce((acc, line) => acc + (line.debit || 0), 0);
  const totalCredits = data.lines.reduce((acc, line) => acc + (line.credit || 0), 0);
  return Math.abs(totalDebits - totalCredits) < 0.01;
}, {
  message: "Total debits must equal total credits.",
  path: ['lines'],
});

type JournalEntryFormValues = z.infer<typeof journalEntryFormSchema>;

export function JournalEntryForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<JournalEntryFormValues>({
    resolver: zodResolver(journalEntryFormSchema),
    defaultValues: {
      date: new Date(),
      autoApprove: false,
      description: '',
      lines: [
        { accountId: '', debit: 0, credit: 0 },
        { accountId: '', debit: 0, credit: 0 },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lines",
  });

  const watchedLines = form.watch('lines');

  const totals = React.useMemo(() => {
    const totalDebits = watchedLines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredits = watchedLines.reduce((sum, line) => sum + (line.credit || 0), 0);
    return { totalDebits, totalCredits, difference: totalDebits - totalCredits };
  }, [watchedLines]);

  async function onSubmit(data: JournalEntryFormValues) {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('New Journal Entry Data:', data);
    toast({
      title: "Journal Entry Created",
      description: `Entry for "${data.description}" has been successfully recorded.`,
    });
    setIsSubmitting(false);
    form.reset({
      date: new Date(),
      autoApprove: false,
      description: '',
      lines: [
        { accountId: '', debit: 0, credit: 0 },
        { accountId: '', debit: 0, credit: 0 },
      ],
    });
  }

  const handleSetAmount = (index: number, column: 'debit' | 'credit', value: number) => {
    if (column === 'debit') {
      form.setValue(`lines.${index}.debit`, value);
      if(form.getValues(`lines.${index}.credit`) !== 0) {
        form.setValue(`lines.${index}.credit`, 0);
      }
    } else {
      form.setValue(`lines.${index}.credit`, value);
      if(form.getValues(`lines.${index}.debit`) !== 0) {
        form.setValue(`lines.${index}.debit`, 0);
      }
    }
    form.trigger(`lines.${index}`);
  };


  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>New Journal Entry</CardTitle>
        <CardDescription>
          Record a new financial transaction. Ensure that total debits equal total credits.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
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
                name="autoApprove"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-start space-x-3 space-y-0 rounded-md border p-4 h-full">
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel>
                                Auto-Approve this Entry
                            </FormLabel>
                            <FormDescription>
                                This entry will be approved automatically.
                            </FormDescription>
                        </div>
                    </FormItem>
                )}
            />
            </div>
            
            <div className="space-y-2">
              <Label>Journal Lines</Label>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40%]">Account</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => (
                      <TableRow key={field.id} className="align-top">
                        <TableCell className="p-2">
                           <FormField
                              control={form.control}
                              name={`lines.${index}.accountId`}
                              render={({ field }) => (
                                <FormItem>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                                        >
                                          {field.value ? chartOfAccounts.find(acc => acc.value === field.value)?.label : "Select account"}
                                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0">
                                      <Command>
                                        <CommandInput placeholder="Search accounts..." />
                                        <CommandList>
                                            <CommandEmpty>No account found.</CommandEmpty>
                                            <CommandGroup>
                                            {chartOfAccounts.map(acc => (
                                                <CommandItem
                                                value={acc.label}
                                                key={acc.value}
                                                onSelect={() => {
                                                    form.setValue(`lines.${index}.accountId`, acc.value);
                                                }}
                                                >
                                                <Check className={cn("mr-2 h-4 w-4", acc.value === field.value ? "opacity-100" : "opacity-0")} />
                                                {acc.label}
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
                        </TableCell>
                        <TableCell className="p-2">
                          <FormField
                            control={form.control}
                            name={`lines.${index}.debit`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    className="text-right" 
                                    placeholder="0.00"
                                    value={field.value || ''}
                                    onChange={(e) => handleSetAmount(index, 'debit', parseFloat(e.target.value) || 0)}
                                    onBlur={field.onBlur}
                                    ref={field.ref}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="p-2">
                           <FormField
                            control={form.control}
                            name={`lines.${index}.credit`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    className="text-right" 
                                    placeholder="0.00"
                                    value={field.value || ''}
                                    onChange={(e) => handleSetAmount(index, 'credit', parseFloat(e.target.value) || 0)}
                                    onBlur={field.onBlur}
                                    ref={field.ref}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            onClick={() => remove(index)}
                            disabled={fields.length <= 2}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell className="font-bold">Totals</TableCell>
                      <TableCell className="text-right font-bold font-mono">{formatCurrency(totals.totalDebits, 'INR')}</TableCell>
                      <TableCell className="text-right font-bold font-mono">{formatCurrency(totals.totalCredits, 'INR')}</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
              <div className="flex justify-between items-center mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => append({ accountId: '', debit: 0, credit: 0 })}
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Line
                </Button>
                <div className="text-right">
                    <p className="font-bold">Difference: 
                        <span className={cn("font-mono ml-2", totals.difference !== 0 ? 'text-destructive' : '')}>
                          {formatCurrency(totals.difference, 'INR')}
                        </span>
                    </p>
                    {form.formState.errors.lines && (
                        <p className="text-sm font-medium text-destructive">{form.formState.errors.lines.root?.message || form.formState.errors.lines.message}</p>
                    )}
                </div>
              </div>
            </div>

            <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Description / Narration</FormLabel>
                    <FormControl>
                    <Textarea placeholder="e.g., Paid monthly office rent" {...field} />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Record Entry
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
