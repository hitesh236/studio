
'use client';

import * as React from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, PlusCircle, Trash2, Save, Send, Loader2, Info } from 'lucide-react';

import { cn, formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

const SELLER_STATE_CODE = '27'; // Maharashtra

const indianStates = [
    { code: '37', name: 'Andhra Pradesh' }, { code: '12', name: 'Arunachal Pradesh' },
    { code: '18', name: 'Assam' }, { code: '10', name: 'Bihar' },
    { code: '22', name: 'Chhattisgarh' }, { code: '30', name: 'Goa' },
    { code: '24', name: 'Gujarat' }, { code: '06', name: 'Haryana' },
    { code: '02', name: 'Himachal Pradesh' }, { code: '20', name: 'Jharkhand' },
    { code: '29', name: 'Karnataka' }, { code: '32', name: 'Kerala' },
    { code: '23', name: 'Madhya Pradesh' }, { code: '27', name: 'Maharashtra' },
    { code: '14', name: 'Manipur' }, { code: '17', name: 'Meghalaya' },
    { code: '15', name: 'Mizoram' }, { code: '13', name: 'Nagaland' },
    { code: '21', name: 'Odisha' }, { code: '34', name: 'Puducherry' },
    { code: '03', name: 'Punjab' }, { code: '08', name: 'Rajasthan' },
    { code: '11', name: 'Sikkim' }, { code: '33', name: 'Tamil Nadu' },
    { code: '36', name: 'Telangana' }, { code: '16', name: 'Tripura' },
    { code: '09', name: 'Uttar Pradesh' }, { code: '05', name: 'Uttarakhand' },
    { code: '19', name: 'West Bengal' }, { code: '35', name: 'Andaman and Nicobar Islands' },
    { code: '04', name: 'Chandigarh' }, { code: '26', name: 'Dadra and Nagar Haveli and Daman and Diu' },
    { code: '07', name: 'Delhi' }, { code: '01', name: 'Jammu and Kashmir' },
    { code: '38', name: 'Ladakh' }, { code: '31', name: 'Lakshadweep' }
];

const gstRates = [0, 5, 12, 18, 28];

const gstr1B2bItemSchema = z.object({
  id: z.string(),
  invoiceNumber: z.string().min(1, 'Invoice number is required.'),
  invoiceDate: z.date(),
  customerGstin: z.string().length(15, 'GSTIN must be 15 characters.'),
  placeOfSupply: z.string().min(1, 'Required.'),
  hsnCode: z.string().optional(),
  taxableValue: z.coerce.number().min(0.01, 'Required.'),
  rate: z.coerce.number(),
  reverseCharge: z.boolean().default(false),
});

const gstr1B2bFormSchema = z.object({
  invoices: z.array(gstr1B2bItemSchema),
});

type Gstr1B2bFormValues = z.infer<typeof gstr1B2bFormSchema>;

export function Gstr1B2bForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<Gstr1B2bFormValues>({
    resolver: zodResolver(gstr1B2bFormSchema),
    defaultValues: {
      invoices: [{
        id: `inv-${Date.now()}`,
        invoiceNumber: '',
        invoiceDate: new Date(),
        customerGstin: '',
        placeOfSupply: '',
        hsnCode: '',
        taxableValue: 0,
        rate: 18,
        reverseCharge: false,
      }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "invoices",
  });

  const watchedInvoices = useWatch({ control: form.control, name: 'invoices' });

  const totals = React.useMemo(() => {
    return watchedInvoices.reduce((acc, invoice) => {
        const taxableValue = invoice.taxableValue || 0;
        const rate = invoice.rate || 0;
        const gstAmount = (taxableValue * rate) / 100;
        const isIntraState = invoice.placeOfSupply === SELLER_STATE_CODE;

        acc.taxableValue += taxableValue;
        acc.igst += isIntraState ? 0 : gstAmount;
        acc.cgst += isIntraState ? gstAmount / 2 : 0;
        acc.sgst += isIntraState ? gstAmount / 2 : 0;
        acc.totalTax += gstAmount;
        return acc;
    }, { taxableValue: 0, igst: 0, cgst: 0, sgst: 0, totalTax: 0 });
  }, [watchedInvoices]);

  async function onSubmit(data: Gstr1B2bFormValues) {
    setIsSubmitting(true);
    console.log('GSTR-1 B2B Data:', data);
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast({
      title: "GSTR-1 B2B Filed",
      description: `Successfully filed ${data.invoices.length} B2B invoices.`,
    });
    setIsSubmitting(false);
  }

  const addNewInvoice = () => {
    append({
        id: `inv-${Date.now()}`,
        invoiceNumber: '',
        invoiceDate: new Date(),
        customerGstin: '',
        placeOfSupply: '',
        hsnCode: '',
        taxableValue: 0,
        rate: 18,
        reverseCharge: false,
    });
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <CardTitle>GSTR-1 Filing: B2B Invoices</CardTitle>
          <CardDescription>Enter details for supplies made to registered persons (B2B).</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Invoice No.</TableHead>
                      <TableHead className="min-w-[150px]">Invoice Date</TableHead>
                      <TableHead className="min-w-[180px]">Customer GSTIN</TableHead>
                      <TableHead className="min-w-[180px]">Place of Supply</TableHead>
                      <TableHead className="min-w-[120px]">HSN Code</TableHead>
                      <TableHead className="min-w-[120px] text-right">Taxable Value</TableHead>
                      <TableHead className="min-w-[100px]">Rate</TableHead>
                      <TableHead className="min-w-[120px] text-right">IGST</TableHead>
                      <TableHead className="min-w-[120px] text-right">CGST</TableHead>
                      <TableHead className="min-w-[120px] text-right">SGST</TableHead>
                      <TableHead className="min-w-[120px] text-center">Reverse Charge</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                       const { taxableValue = 0, rate = 0, placeOfSupply = '' } = watchedInvoices[index] || {};
                       const isIntraState = placeOfSupply === SELLER_STATE_CODE;
                       const gstAmount = (taxableValue * rate) / 100;
                       const igst = isIntraState ? 0 : gstAmount;
                       const cgst = isIntraState ? gstAmount / 2 : 0;
                       const sgst = isIntraState ? gstAmount / 2 : 0;

                       return (
                        <TableRow key={field.id} className="align-top">
                          <TableCell>
                            <FormField control={form.control} name={`invoices.${index}.invoiceNumber`} render={({ field }) => (
                                <FormItem><FormControl><Input placeholder="INV-001" className="font-mono font-bold" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </TableCell>
                          <TableCell>
                            <FormField control={form.control} name={`invoices.${index}.invoiceDate`} render={({ field }) => (
                                <FormItem><Popover><PopoverTrigger asChild><FormControl>
                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !field.value && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />{field.value ? format(field.value, "dd/MM/yyyy") : <span>Pick a date</span>}
                                    </Button>
                                </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0"><Calendar mode="single" selected={field.value} onSelect={field.onChange} /></PopoverContent></Popover><FormMessage /></FormItem>
                            )} />
                          </TableCell>
                           <TableCell>
                            <FormField control={form.control} name={`invoices.${index}.customerGstin`} render={({ field, fieldState }) => (
                                <FormItem><FormControl><Input placeholder="15-digit GSTIN" className={cn("uppercase", fieldState.error && "border-destructive ring-destructive")} {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </TableCell>
                          <TableCell>
                             <FormField control={form.control} name={`invoices.${index}.placeOfSupply`} render={({ field }) => (
                                <FormItem><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select State" /></SelectTrigger></FormControl><SelectContent>
                                    {indianStates.map(s => <SelectItem key={s.code} value={s.code}>{s.code} - {s.name}</SelectItem>)}
                                </SelectContent></Select><FormMessage /></FormItem>
                            )} />
                          </TableCell>
                          <TableCell>
                             <FormField control={form.control} name={`invoices.${index}.hsnCode`} render={({ field }) => (
                                <FormItem><Tooltip><TooltipTrigger asChild><FormControl><Input placeholder="998314" {...field} /></FormControl></TooltipTrigger><TooltipContent><p>Software development services</p></TooltipContent></Tooltip><FormMessage /></FormItem>
                            )} />
                          </TableCell>
                           <TableCell>
                             <FormField control={form.control} name={`invoices.${index}.taxableValue`} render={({ field }) => (
                                <FormItem><FormControl><Input type="number" className="text-right" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                          </TableCell>
                           <TableCell>
                             <FormField control={form.control} name={`invoices.${index}.rate`} render={({ field }) => (
                                <FormItem><Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent>
                                    {gstRates.map(r => <SelectItem key={r} value={String(r)}>{r}%</SelectItem>)}
                                </SelectContent></Select><FormMessage /></FormItem>
                            )} />
                          </TableCell>
                          <TableCell><Input className="text-right" disabled value={formatCurrency(igst, 'INR')} /></TableCell>
                          <TableCell><Input className="text-right" disabled value={formatCurrency(cgst, 'INR')} /></TableCell>
                          <TableCell><Input className="text-right" disabled value={formatCurrency(sgst, 'INR')} /></TableCell>
                          <TableCell className="text-center">
                            <FormField control={form.control} name={`invoices.${index}.reverseCharge`} render={({ field }) => (
                                <FormItem className="flex flex-col items-center"><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl><Label htmlFor={`invoices.${index}.reverseCharge`} className="text-xs">{field.value ? 'Yes' : 'No'}</Label></FormItem>
                            )} />
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => fields.length > 1 && remove(index)}><Trash2 className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                        <TableCell colSpan={5} className="text-right font-bold">Total</TableCell>
                        <TableCell className="text-right font-bold font-mono">{formatCurrency(totals.taxableValue, 'INR')}</TableCell>
                        <TableCell />
                        <TableCell className="text-right font-bold font-mono">{formatCurrency(totals.igst, 'INR')}</TableCell>
                        <TableCell className="text-right font-bold font-mono">{formatCurrency(totals.cgst, 'INR')}</TableCell>
                        <TableCell className="text-right font-bold font-mono">{formatCurrency(totals.sgst, 'INR')}</TableCell>
                        <TableCell colSpan={2}/>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
              <Button type="button" variant="outline" onClick={addNewInvoice} className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Row
              </Button>
              <div className="flex justify-end gap-4 mt-8">
                <Button type="button" variant="outline" disabled={isSubmitting}>
                    <Save className="mr-2 h-4 w-4" /> Save Draft
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                    {isSubmitting ? 'Submitting...' : 'File Return'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
