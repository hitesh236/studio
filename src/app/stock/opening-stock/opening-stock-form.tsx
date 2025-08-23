
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  TableFooter,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, PlusCircle, Trash2, ChevronsUpDown, Check, Calendar as CalendarIcon } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { initialCategoriesData, type Category } from '@/lib/categories';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { initialSimpleUnits, type SimpleUnit } from '@/lib/uom-data';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

const openingStockItemSchema = z.object({
  productName: z.string().min(1, 'Item name is required'),
  categoryId: z.string().optional(),
  unit: z.string().optional(),
  quantity: z.coerce.number().min(0, 'Quantity cannot be negative'),
  rate: z.coerce.number().min(0, 'Rate cannot be negative'),
});

const openingStockFormSchema = z.object({
  date: z.date(),
  items: z.array(openingStockItemSchema).min(1, 'At least one item is required.'),
});

type OpeningStockFormValues = z.infer<typeof openingStockFormSchema>;

const flattenCategories = (cats: Category[], level = 0): { value: string, label: string }[] => {
    let list: { value: string, label: string }[] = [];
    cats.forEach(cat => {
        list.push({ value: cat.id, label: `${'— '.repeat(level)}${cat.name}` });
        if (cat.children) {
            list = [...list, ...flattenCategories(cat.children, level + 1)];
        }
    });
    return list;
};

export function OpeningStockForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<OpeningStockFormValues>({
    resolver: zodResolver(openingStockFormSchema),
    defaultValues: {
      date: new Date(),
      items: [{ productName: '', quantity: 0, rate: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const watchedItems = form.watch('items');

  const categories = React.useMemo(() => flattenCategories(initialCategoriesData), []);
  const units = React.useMemo(() => initialSimpleUnits.filter(u => u.status === 'active'), []);

  const totals = React.useMemo(() => {
    return watchedItems.reduce((acc, item) => {
        const amount = (item.quantity || 0) * (item.rate || 0);
        acc.totalQuantity += (item.quantity || 0);
        acc.totalAmount += amount;
        return acc;
    }, { totalQuantity: 0, totalAmount: 0 });
  }, [watchedItems]);

  async function onSubmit(data: OpeningStockFormValues) {
    setIsSubmitting(true);
    console.log('Opening Stock Data:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: 'Opening Stock Saved',
      description: `${data.items.length} items have been added to your inventory.`,
    });
    setIsSubmitting(false);
  }
  
  const handleAddNewRow = () => {
    append({ productName: '', quantity: 0, rate: 0 });
  };
  
  const CategoryCombobox = ({ value, onChange }: { value?: string, onChange: (value: string) => void }) => {
    const [open, setOpen] = React.useState(false);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button variant="outline" role="combobox" className={cn("w-full justify-between font-normal", !value && "text-muted-foreground")}>
                        {value ? categories.find(c => c.value === value)?.label.replace(/— /g, '') : "Select category"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandList>
                        <CommandEmpty>No category found.</CommandEmpty>
                        <CommandGroup>
                            {categories.map(cat => (
                                <CommandItem value={cat.label} key={cat.value} onSelect={() => { onChange(cat.value); setOpen(false); }}>
                                    <Check className={cn("mr-2 h-4 w-4", cat.value === value ? "opacity-100" : "opacity-0")} />
                                    {cat.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
  }

  const UnitCombobox = ({ value, onChange }: { value?: string, onChange: (value: string) => void }) => {
    const [open, setOpen] = React.useState(false);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <FormControl>
                    <Button variant="outline" role="combobox" className={cn("w-full justify-between font-normal", !value && "text-muted-foreground")}>
                        {value || "Select unit"}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                <Command>
                    <CommandInput placeholder="Search..." />
                    <CommandList>
                        <CommandEmpty>No unit found.</CommandEmpty>
                        <CommandGroup>
                            {units.map(unit => (
                                <CommandItem value={unit.abbreviation} key={unit.id} onSelect={() => { onChange(unit.abbreviation); setOpen(false); }}>
                                    <Check className={cn("mr-2 h-4 w-4", unit.abbreviation === value ? "opacity-100" : "opacity-0")} />
                                    {unit.name} ({unit.abbreviation})
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Opening Stock Entry</CardTitle>
        <CardDescription>
          Use this form to enter your initial stock quantities and values.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="w-full max-w-sm">
                 <FormField
                    name="date"
                    control={form.control}
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Opening Stock as on</FormLabel>
                            <Popover><PopoverTrigger asChild><FormControl>
                                <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]">S.No.</TableHead>
                    <TableHead className="min-w-[250px]">Name of Item</TableHead>
                    <TableHead className="min-w-[200px]">Under (Category)</TableHead>
                    <TableHead className="min-w-[150px]">Units</TableHead>
                    <TableHead className="text-right min-w-[120px]">Opening Qty</TableHead>
                    <TableHead className="text-right min-w-[120px]">Rate</TableHead>
                    <TableHead className="text-right min-w-[120px]">Amount</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id} className="align-top">
                      <TableCell className="pt-3">{index + 1}.</TableCell>
                      <TableCell>
                        <FormField name={`items.${index}.productName`} control={form.control} render={({ field }) => <Input {...field} />} />
                      </TableCell>
                       <TableCell>
                        <FormField name={`items.${index}.categoryId`} control={form.control} render={({ field }) => (
                             <CategoryCombobox value={field.value} onChange={field.onChange} />
                        )} />
                      </TableCell>
                      <TableCell>
                        <FormField name={`items.${index}.unit`} control={form.control} render={({ field }) => (
                            <UnitCombobox value={field.value} onChange={field.onChange} />
                        )} />
                      </TableCell>
                      <TableCell>
                        <FormField name={`items.${index}.quantity`} control={form.control} render={({ field }) => (
                           <Input type="text" className="text-right" {...field} />
                        )} />
                      </TableCell>
                      <TableCell>
                        <FormField name={`items.${index}.rate`} control={form.control} render={({ field }) => (
                           <Input type="text" className="text-right" {...field} />
                        )} />
                      </TableCell>
                      <TableCell className="text-right font-mono pt-3">
                        {formatCurrency((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.rate || 0), 'INR')}
                      </TableCell>
                      <TableCell>
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 1}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                 <TableFooter>
                    <TableRow>
                        <TableCell colSpan={4} className="text-right font-bold">Total</TableCell>
                        <TableCell className="text-right font-bold font-mono">{totals.totalQuantity}</TableCell>
                        <TableCell />
                        <TableCell className="text-right font-bold font-mono">{formatCurrency(totals.totalAmount, 'INR')}</TableCell>
                        <TableCell />
                    </TableRow>
                 </TableFooter>
              </Table>
            </div>

            <div className="flex justify-between items-center">
              <Button type="button" variant="outline" onClick={handleAddNewRow}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Row
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Opening Stock
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
