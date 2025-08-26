
'use client';

import * as React from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Calendar as CalendarIcon,
  PlusCircle,
  Trash2,
  Save,
  Send,
  Loader2,
  Settings,
  ChevronsUpDown,
  Check
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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { generateStockListData, type StockItem } from '@/app/stock-list/data';

// --- Sample Data for Demonstration ---
const sampleInvoiceData = {
    customerName: 'Innovate Inc.',
    customerGstin: '27AXYZE9876G1Z3',
    billingAddress: '789 Industrial Area, Andheri (E), Mumbai, Maharashtra, 400093',
    placeOfSupply: 'Maharashtra',
    isShippingSameAsBilling: true,
    shippingAddress: '',
    invoiceNumber: 'INV-2024-07-001',
    invoiceDate: new Date('2024-07-21'),
    dueDate: new Date('2024-08-20'),
    currency: 'INR' as 'INR' | 'USD' | 'EUR',
    exchangeRate: 1,
    items: [
        { productId: 'prod-1', itemName: 'Cloud Hosting Services', hsnCode: '998315', quantity: 1, unit: 'year', rate: 50000, discount: 0, gstRate: 18 },
        { productId: 'prod-2', itemName: 'Domain Name Registration', hsnCode: '998314', quantity: 1, unit: 'item', rate: 2500, discount: 0, gstRate: 18 },
        { productId: 'prod-3', itemName: 'Technical Support Retainer', hsnCode: '998313', quantity: 12, unit: 'months', rate: 10000, discount: 0, gstRate: 18 },
    ],
    notes: 'Thank you for your business. All payments are due within 30 days.',
    paymentReceived: 100000,
    paymentMode: 'bank',
};


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
    name: 'Hicks Inc.',
    address: '123 Business Rd, Financial District',
    cityStateZip: 'Mumbai, Maharashtra, 400001',
    gstin: '27ABCDE1234F1Z5',
    state: 'Maharashtra',
};

const invoiceItemSchema = z.object({
  productId: z.string().min(1, 'Item selection is required.'),
  itemName: z.string().min(1, 'Item name is required.'),
  hsnCode: z.string().optional(),
  quantity: z.coerce.number().min(0.01, 'Quantity must be positive.'),
  unit: z.string().optional(),
  rate: z.coerce.number().min(0, 'Rate cannot be negative.'),
  discount: z.coerce.number().min(0).max(100).optional().default(0),
  gstRate: z.coerce.number().min(0).max(100).default(18),
});

const invoiceFormSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required.'),
  customerGstin: z.string().optional(),
  billingAddress: z.string().min(1, 'Billing address is required.'),
  placeOfSupply: z.string().min(1, 'Place of supply is required.'),
  isShippingSameAsBilling: z.boolean().default(true),
  shippingAddress: z.string().optional(),
  invoiceNumber: z.string().min(1, 'Invoice number is required.'),
  invoiceDate: z.date(),
  dueDate: z.date().optional(),
  currency: z.enum(['INR', 'USD', 'EUR']).default('INR'),
  exchangeRate: z.coerce.number().min(0.01, 'Exchange rate must be positive.').default(1),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required.'),
  notes: z.string().optional(),
  paymentReceived: z.coerce.number().optional().default(0),
  paymentMode: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export function InvoiceForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [invoiceType, setInvoiceType] = React.useState<'item' | 'service'>('item');
  const [invoiceCreationMode, setInvoiceCreationMode] = React.useState<'both' | 'item' | 'service'>('both');
  
  const [columnVisibility, setColumnVisibility] = React.useState({
    unit: true,
    hsn: true,
    discount: true,
  });

  const [formFieldVisibility, setFormFieldVisibility] = React.useState({
    dueDate: true,
    currency: true,
  });
  
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const [manualRoundOff, setManualRoundOff] = React.useState<number>(0);
  const [autoRoundOff, setAutoRoundOff] = React.useState(true);
  
  const [numberingSettings, setNumberingSettings] = React.useState({
    changePrefixEveryYear: true,
    prefixType: 'financialYear' as 'text' | 'financialYear',
    prefixText: '',
    startingNumber: 1,
  });

  const [customers, setCustomers] = React.useState([
    { id: 'cust1', name: 'Innovate Inc.', gstin: '27AXYZE9876G1Z3', address: '789 Industrial Area, Andheri (E), Mumbai, Maharashtra, 400093' },
    { id: 'cust2', name: 'Solutions Corp.', gstin: '29AABCS1234A1Z5', address: '456 Business Hub, Bengaluru, Karnataka' },
    { id: 'cust3', name: 'Quantum Tech', gstin: '36AAAAA0000A1Z0', address: '789 Science City, Hyderabad, Telangana' },
  ]);
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = React.useState(false);
  const [newCustomer, setNewCustomer] = React.useState({ name: '', gstin: '', address: '' });
  
  const [products, setProducts] = React.useState<StockItem[]>([]);

  React.useEffect(() => {
    setProducts(generateStockListData(50));
  }, []);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: sampleInvoiceData
  });

  const currentFinancialYear = React.useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();
    if (currentMonth >= 3) { // April (index 3) onwards
      return `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
    } else { // Jan, Feb, March
      return `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
    }
  }, []);

  const invoicePreview = React.useMemo(() => {
    const prefix = numberingSettings.prefixType === 'financialYear' ? currentFinancialYear : numberingSettings.prefixText || '';
    const paddedNumber = String(numberingSettings.startingNumber || 1).padStart(4, '0');
    return `${prefix}${prefix ? '/' : ''}${paddedNumber}`;
  }, [numberingSettings, currentFinancialYear]);
  
  React.useEffect(() => {
    if (!form.getValues('invoiceNumber')) {
      form.setValue('invoiceNumber', invoicePreview);
    }
  }, [invoicePreview, form]);

  React.useEffect(() => {
    if (invoiceCreationMode === 'item') {
        setInvoiceType('item');
    } else if (invoiceCreationMode === 'service') {
        setInvoiceType('service');
    }
  }, [invoiceCreationMode]);


  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const watchedFormValues = form.watch();
  
  const handleAddCustomer = () => {
    if (newCustomer.name && newCustomer.address) {
        const newCustomerData = { ...newCustomer, id: `cust-${Date.now()}` };
        const updatedCustomers = [...customers, newCustomerData];
        setCustomers(updatedCustomers);
        form.setValue('customerName', newCustomerData.name);
        form.setValue('customerGstin', newCustomerData.gstin);
        form.setValue('billingAddress', newCustomerData.address);
        const stateMatch = indianStates.find(state => newCustomerData.address.toLowerCase().includes(state.toLowerCase()));
        if(stateMatch) {
            form.setValue('placeOfSupply', stateMatch);
        }

        toast({ title: 'Customer Added', description: `${newCustomerData.name} has been added.` });
        setIsCustomerDialogOpen(false);
        setNewCustomer({ name: '', gstin: '', address: '' });
    } else {
        toast({ title: 'Error', description: 'Customer Name and Address are required.', variant: 'destructive' });
    }
  }

  const totals = React.useMemo(() => {
    const { items, placeOfSupply, paymentReceived } = watchedFormValues;
    let subtotal = 0;
    let totalDiscount = 0;
    const gstSummary: { [key: number]: { taxable: number; gst: number } } = {};

    (items || []).forEach(item => {
        const quantity = invoiceType === 'service' ? 1 : (item.quantity || 0);
        const itemAmount = quantity * (item.rate || 0);
        const itemDiscount = itemAmount * ((item.discount || 0) / 100);
        const taxableAmount = itemAmount - itemDiscount;
        const gstRate = item.gstRate || 0;
        const gstAmount = taxableAmount * (gstRate / 100);

        subtotal += itemAmount;
        totalDiscount += itemDiscount;

        if (!gstSummary[gstRate]) {
            gstSummary[gstRate] = { taxable: 0, gst: 0 };
        }
        gstSummary[gstRate].taxable += taxableAmount;
        gstSummary[gstRate].gst += gstAmount;
    });

    const totalTaxableValue = subtotal - totalDiscount;
    const totalGst = Object.values(gstSummary).reduce((acc, { gst }) => acc + gst, 0);
    const isIntraState = placeOfSupply === sellerDetails.state;

    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    if (totalGst > 0) {
      if (isIntraState) {
          Object.values(gstSummary).forEach(({ gst }) => {
              totalCgst += gst / 2;
              totalSgst += gst / 2;
          });
      } else {
          Object.values(gstSummary).forEach(({ gst }) => {
              totalIgst += gst;
          });
      }
    }

    const grandTotalBeforeRoundOff = totalTaxableValue + totalGst;
    
    const roundOffValue = autoRoundOff
      ? Math.round(grandTotalBeforeRoundOff) - grandTotalBeforeRoundOff
      : manualRoundOff;
    
    const grandTotal = grandTotalBeforeRoundOff + roundOffValue;
    const amountDue = grandTotal - (paymentReceived || 0);
    const singleGstRate = Object.keys(gstSummary).length === 1 ? Object.keys(gstSummary)[0] : null;

    return { subtotal, totalDiscount, totalTaxableValue, grandTotal, totalGst, isIntraState, totalCgst, totalSgst, totalIgst, singleGstRate, amountDue, roundOffValue };
  }, [watchedFormValues, autoRoundOff, manualRoundOff, invoiceType]);
  
  async function onSubmit(data: InvoiceFormValues) {
    setIsSubmitting(true);
    
    console.log("Deducting stock for items:", data.items.map(item => ({ id: item.productId, quantity: item.quantity })));
    
    const journalEntry = {
        id: `JE-${data.invoiceNumber}`,
        date: data.invoiceDate,
        entryNumber: `JRNL-${data.invoiceNumber}`,
        voucherType: 'Sales',
        description: `Sales to ${data.customerName} against invoice ${data.invoiceNumber}`,
        lines: [
            { id: 'line-1', account: `${data.customerName} A/c`, debit: totals.grandTotal, credit: 0 },
            { id: 'line-2', account: 'Sales A/c', debit: 0, credit: totals.totalTaxableValue },
            ...(totals.totalCgst > 0 ? [{ id: 'line-3', account: 'CGST Payable A/c', debit: 0, credit: totals.totalCgst }] : []),
            ...(totals.totalSgst > 0 ? [{ id: 'line-4', account: 'SGST Payable A/c', debit: 0, credit: totals.totalSgst }] : []),
            ...(totals.totalIgst > 0 ? [{ id: 'line-5', account: 'IGST Payable A/c', debit: 0, credit: totals.totalIgst }] : []),
        ],
        createdBy: 'Admin',
        status: 'Approved'
    };

    console.log('--- GENERATED JOURNAL ENTRY ---');
    console.log(JSON.stringify(journalEntry, null, 2));
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Form Submitted', { data, totals });
    toast({
      title: "Invoice Created",
      description: `Invoice ${data.invoiceNumber} has been successfully created.`,
    });
    setIsSubmitting(false);
  }

  const ProductCombobox = ({ value, onChange, onProductSelect }: { value: string; onChange: (value: string) => void; onProductSelect: (product: StockItem) => void; }) => {
    const [open, setOpen] = React.useState(false);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild><FormControl>
                <Button variant="outline" role="combobox" className={cn("w-full justify-between", !value && "text-muted-foreground")}>
                {value ? products.find(product => product.id === value)?.productName : "Select item"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </FormControl></PopoverTrigger>
            <PopoverContent className="w-full p-0" style={{minWidth: 'var(--radix-popover-trigger-width)'}}>
                <Command filter={(value, search) => {
                    const product = products.find(p => p.id === value);
                    if (product?.productName.toLowerCase().includes(search.toLowerCase()) || product?.sku.toLowerCase().includes(search)) return 1;
                    return 0;
                }}>
                    <CommandInput placeholder="Search items..." />
                    <CommandList>
                        <CommandEmpty>No item found.</CommandEmpty>
                        <CommandGroup>
                            {products.map(product => (
                                <CommandItem value={product.id} key={product.id} onSelect={() => { 
                                    onChange(product.id);
                                    onProductSelect(product);
                                    setOpen(false); 
                                }}>
                                    <Check className={cn("mr-2 h-4 w-4", product.id === value ? "opacity-100" : "opacity-0")} />
                                    <div className="flex justify-between w-full">
                                        <span>{product.productName}</span>
                                        <span className="text-muted-foreground text-xs">{product.sku}</span>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-start justify-between p-4 pb-2">
            <div className="flex-1 space-y-1">
              <CardTitle className="text-2xl">New Invoice</CardTitle>
              <CardDescription>Fill out the details below to create a new sales invoice.</CardDescription>
            </div>
            <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <Settings className="h-5 w-5" />
                        <span className="sr-only">Invoice Settings</span>
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Invoice Settings</DialogTitle>
                        <DialogDescription>
                            Customize your invoice creation experience.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="max-h-[70vh] overflow-y-auto p-1 pr-4">
                        <Tabs defaultValue="numbering" className="w-full">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="numbering">Numbering</TabsTrigger>
                                <TabsTrigger value="columns">Columns</TabsTrigger>
                                <TabsTrigger value="fields">Fields</TabsTrigger>
                                <TabsTrigger value="mode">Mode</TabsTrigger>
                            </TabsList>
                            <TabsContent value="numbering" className="py-4">
                                <Card>
                                    <CardHeader><CardTitle className="text-base">Invoice Numbering</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex flex-row items-center justify-between rounded-lg border p-3">
                                            <Label htmlFor="change-fy" className="text-sm font-normal">Change Every FY</Label>
                                            <Switch id="change-fy" checked={numberingSettings.changePrefixEveryYear} onCheckedChange={(checked) => setNumberingSettings(s => ({...s, changePrefixEveryYear: checked}))} />
                                        </div>
                                        <div>
                                            <Label>Prefix Type</Label>
                                            <RadioGroup value={numberingSettings.prefixType} onValueChange={(value: 'text' | 'financialYear') => setNumberingSettings(s => ({...s, prefixType: value}))} className="mt-2 grid grid-cols-2 gap-4">
                                                <div><RadioGroupItem value="text" id="text" className="peer sr-only" /><Label htmlFor="text" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Text</Label></div>
                                                <div><RadioGroupItem value="financialYear" id="financialYear" className="peer sr-only" /><Label htmlFor="financialYear" className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">Financial Year</Label></div>
                                            </RadioGroup>
                                        </div>
                                        <div className="grid grid-cols-3 gap-2">
                                            <div className="space-y-2 col-span-2">
                                                <Label>Prefix Value</Label>
                                                <Input value={numberingSettings.prefixType === 'financialYear' ? currentFinancialYear : numberingSettings.prefixText} onChange={e => setNumberingSettings(s => ({...s, prefixText: e.target.value}))} readOnly={numberingSettings.prefixType === 'financialYear'}/>
                                            </div>
                                             <div className="space-y-2">
                                                <Label>Starting No.</Label>
                                                <Input type="text" value={numberingSettings.startingNumber} onChange={e => setNumberingSettings(s => ({...s, startingNumber: Number(e.target.value)}))} />
                                            </div>
                                        </div>
                                        <div>
                                            <Label>Preview</Label>
                                            <p className="text-sm font-mono p-2 bg-muted rounded-md border text-muted-foreground">{invoicePreview}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="columns" className="py-4">
                                <Card>
                                    <CardHeader><CardTitle className="text-base">Column Visibility</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex flex-row items-center justify-between rounded-lg border p-3"><Label className="font-normal">Unit</Label><Switch checked={columnVisibility.unit} onCheckedChange={(checked) => setColumnVisibility((prev) => ({ ...prev, unit: !!checked }))} disabled={invoiceType === 'service'} /></div>
                                        <div className="flex flex-row items-center justify-between rounded-lg border p-3"><Label className="font-normal">HSN/SAC Code</Label><Switch checked={columnVisibility.hsn} onCheckedChange={(checked) => setColumnVisibility((prev) => ({ ...prev, hsn: !!checked }))} /></div>
                                        <div className="flex flex-row items-center justify-between rounded-lg border p-3"><Label className="font-normal">Discount (%)</Label><Switch checked={columnVisibility.discount} onCheckedChange={(checked) => setColumnVisibility((prev) => ({ ...prev, discount: !!checked }))} /></div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="fields" className="py-4">
                                 <Card>
                                    <CardHeader><CardTitle className="text-base">Field Visibility</CardTitle></CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex flex-row items-center justify-between rounded-lg border p-3"><Label className="font-normal">Due Date</Label><Switch checked={formFieldVisibility.dueDate} onCheckedChange={(checked) => setFormFieldVisibility(prev => ({ ...prev, dueDate: !!checked }))} /></div>
                                        <div className="flex flex-row items-center justify-between rounded-lg border p-3"><Label className="font-normal">Currency & Exchange Rate</Label><Switch checked={formFieldVisibility.currency} onCheckedChange={(checked) => setFormFieldVisibility(prev => ({ ...prev, currency: !!checked }))} /></div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            <TabsContent value="mode" className="py-4">
                                <Card>
                                    <CardHeader><CardTitle className="text-base">Invoice Mode</CardTitle></CardHeader>
                                    <CardContent>
                                        <RadioGroup value={invoiceCreationMode} onValueChange={(value) => setInvoiceCreationMode(value as any)} className="space-y-2">
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="both" id="both" /><Label htmlFor="both">Items and Services</Label></div>
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="item" id="item" /><Label htmlFor="item">Items Only</Label></div>
                                            <div className="flex items-center space-x-2"><RadioGroupItem value="service" id="service" /><Label htmlFor="service">Services Only</Label></div>
                                        </RadioGroup>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="space-y-6 p-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="customerName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Bill To</FormLabel>
                                    <div className="flex items-start gap-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                                        {field.value || "Select a customer"}
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
                                                            {customers.map(customer => (
                                                                <CommandItem
                                                                    key={customer.id}
                                                                    value={customer.name}
                                                                    onSelect={(currentValue) => {
                                                                        const selectedCustomer = customers.find(c => c.name.toLowerCase() === currentValue.toLowerCase());
                                                                        if (selectedCustomer) {
                                                                            form.setValue('customerName', selectedCustomer.name);
                                                                            form.setValue('customerGstin', selectedCustomer.gstin);
                                                                            form.setValue('billingAddress', selectedCustomer.address);
                                                                            const stateMatch = indianStates.find(state => selectedCustomer.address.toLowerCase().includes(state.toLowerCase()));
                                                                            if(stateMatch) {
                                                                                form.setValue('placeOfSupply', stateMatch);
                                                                            }
                                                                        }
                                                                    }}
                                                                >
                                                                    <Check className={cn("mr-2 h-4 w-4", field.value === customer.name ? "opacity-100" : "opacity-0")} />
                                                                    {customer.name}
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                        <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
                                            <DialogTrigger asChild>
                                                <Button type="button" variant="outline" size="icon" className="shrink-0">
                                                    <PlusCircle className="h-4 w-4" />
                                                    <span className="sr-only">Add New Customer</span>
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Add New Customer</DialogTitle>
                                                    <DialogDescription>
                                                        Quickly add a new customer. You can add more details later.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="grid gap-4 py-4">
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="new-customer-name" className="text-right">Name</Label>
                                                        <Input id="new-customer-name" value={newCustomer.name} onChange={(e) => setNewCustomer(p => ({...p, name: e.target.value}))} className="col-span-3" />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="new-customer-gstin" className="text-right">GSTIN</Label>
                                                        <Input id="new-customer-gstin" value={newCustomer.gstin} onChange={(e) => setNewCustomer(p => ({...p, gstin: e.target.value}))} className="col-span-3" />
                                                    </div>
                                                    <div className="grid grid-cols-4 items-center gap-4">
                                                        <Label htmlFor="new-customer-address" className="text-right">Address</Label>
                                                        <Textarea id="new-customer-address" value={newCustomer.address} onChange={(e) => setNewCustomer(p => ({...p, address: e.target.value}))} className="col-span-3" placeholder="Full Address including State" />
                                                    </div>
                                                </div>
                                                <DialogFooter>
                                                    <Button variant="outline" onClick={() => setIsCustomerDialogOpen(false)}>Cancel</Button>
                                                    <Button onClick={handleAddCustomer}>Add Customer</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="customerGstin"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Customer GSTIN</FormLabel>
                                <FormControl>
                                    <Input placeholder="15-digit GSTIN (Optional)" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="billingAddress"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Billing Address</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Customer's Billing Address" {...field} rows={3} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="placeOfSupply"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Place of Supply</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Select state" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {indianStates.map(state => (
                                        <SelectItem key={state} value={state}>{state}</SelectItem>
                                    ))}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="isShippingSameAsBilling"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
                                <FormControl>
                                    <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                    <FormLabel>
                                    Shipping address is the same as billing address
                                    </FormLabel>
                                </div>
                                </FormItem>
                            )}
                        />
                        {!form.watch('isShippingSameAsBilling') && (
                            <div className="mt-2">
                                <FormField
                                    control={form.control}
                                    name="shippingAddress"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Shipping Address</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Customer's Shipping Address" {...field} rows={2} />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        )}
                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="invoiceNumber"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Invoice Number</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="invoiceDate"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Invoice Date</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                    <FormControl>
                                        <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full pl-3 text-left font-normal",
                                            !field.value && "text-muted-foreground"
                                        )}
                                        >
                                        {field.value ? (
                                            format(field.value, "PPP")
                                        ) : (
                                            <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={field.value}
                                        onSelect={field.onChange}
                                        disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                        initialFocus
                                    />
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        {formFieldVisibility.dueDate && (
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                    <FormLabel>Due Date</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full pl-3 text-left font-normal",
                                                !field.value && "text-muted-foreground"
                                            )}
                                            >
                                            {field.value ? (
                                                format(field.value, "PPP")
                                            ) : (
                                                <span>Pick a date</span>
                                            )}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={field.onChange}
                                            initialFocus
                                        />
                                        </PopoverContent>
                                    </Popover>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}
                        {formFieldVisibility.currency && (
                          <>
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Currency</FormLabel>
                                    <Select onValueChange={(value) => {
                                        field.onChange(value);
                                        form.setValue('exchangeRate', value === 'INR' ? 1 : 83.50);
                                    }} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select currency" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="INR">INR (Indian Rupee)</SelectItem>
                                        <SelectItem value="USD">USD (United States Dollar)</SelectItem>
                                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            {watchedFormValues.currency !== 'INR' && (
                                <FormField
                                    control={form.control}
                                    name="exchangeRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Exchange Rate (1 {watchedFormValues.currency} to INR)</FormLabel>
                                            <FormControl>
                                                <Input type="text" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            )}
                          </>
                        )}
                    </div>
                </div>

                <Separator />
                
                <div className="space-y-4">
                    {invoiceCreationMode === 'both' && (
                        <Tabs value={invoiceType} onValueChange={(value) => setInvoiceType(value as 'item' | 'service')} className="w-full">
                            <TabsList className="bg-transparent p-0 justify-start gap-2 h-auto flex-wrap">
                                <TabsTrigger value="item" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=active]:border-transparent">Item Invoice</TabsTrigger>
                                <TabsTrigger value="service" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=active]:border-transparent">Service Invoice</TabsTrigger>
                            </TabsList>
                        </Tabs>
                    )}
                    
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead className="w-[30%] min-w-[200px] h-12 p-2 text-xs whitespace-nowrap">{invoiceType === 'item' ? 'Item' : 'Service'}</TableHead>
                                {invoiceType === 'item' && <TableHead className="text-right h-12 p-2 text-xs whitespace-nowrap">Qty</TableHead>}
                                {invoiceType === 'item' && columnVisibility.unit && <TableHead className="text-right h-12 p-2 text-xs whitespace-nowrap">Unit</TableHead>}
                                <TableHead className="text-right h-12 p-2 text-xs whitespace-nowrap">{invoiceType === 'item' ? 'Rate' : 'Amount'}</TableHead>
                                {columnVisibility.discount && <TableHead className="text-right h-12 p-2 text-xs whitespace-nowrap">Discount(%)</TableHead>}
                                <TableHead className="text-right h-12 p-2 text-xs whitespace-nowrap">Taxable Amt.</TableHead>
                                <TableHead className="text-right h-12 p-2 text-xs whitespace-nowrap">GST(%)</TableHead>
                                <TableHead className="text-right h-12 p-2 text-xs whitespace-nowrap">Total</TableHead>
                                <TableHead className="w-12 h-12 p-2 text-xs whitespace-nowrap"></TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {fields.map((field, index) => {
                                const item = watchedFormValues.items[index];
                                const quantity = invoiceType === 'service' ? 1 : (item.quantity || 0);
                                const itemAmount = quantity * (item.rate || 0);
                                const itemDiscount = itemAmount * ((item.discount || 0) / 100);
                                const taxableAmount = itemAmount - itemDiscount;
                                const gstAmount = taxableAmount * ((item.gstRate || 0) / 100);
                                const totalAmount = taxableAmount + gstAmount;

                                return (
                                    <TableRow key={field.id} className="align-top">
                                    <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.productId`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <ProductCombobox
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        onProductSelect={(product) => {
                                                            form.setValue(`items.${index}.itemName`, product.productName);
                                                            form.setValue(`items.${index}.rate`, product.sellingPrice);
                                                            form.setValue(`items.${index}.unit`, product.uom);
                                                        }}
                                                    />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        {columnVisibility.hsn && <FormField
                                            control={form.control}
                                            name={`items.${index}.hsnCode`}
                                            render={({ field }) => (
                                                <FormItem className="mt-1">
                                                    <FormControl>
                                                        <Input
                                                            placeholder={invoiceType === 'item' ? 'HSN Code' : 'SAC Code'}
                                                            {...field}
                                                            className="h-8 text-xs"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />}
                                    </TableCell>
                                    {invoiceType === 'item' && <TableCell>
                                         <FormField
                                            control={form.control}
                                            name={`items.${index}.quantity`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="text" className="text-right min-w-[60px]" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>}
                                    {invoiceType === 'item' && columnVisibility.unit && <TableCell>
                                         <FormField
                                            control={form.control}
                                            name={`items.${index}.unit`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input placeholder="pcs" className="text-right min-w-[70px]" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>}
                                    <TableCell>
                                         <FormField
                                            control={form.control}
                                            name={`items.${index}.rate`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="text" className="text-right min-w-[80px]" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    {columnVisibility.discount && <TableCell>
                                         <FormField
                                            control={form.control}
                                            name={`items.${index}.discount`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="text" className="text-right min-w-[70px]" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>}
                                    <TableCell className="text-right font-mono">{formatCurrency(taxableAmount, watchedFormValues.currency)}</TableCell>
                                    <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.gstRate`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                                                        <FormControl>
                                                            <SelectTrigger className="min-w-[80px]">
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            {[0, 5, 12, 18, 28].map(rate => (
                                                                <SelectItem key={rate} value={String(rate)}>{rate}%</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(totalAmount, watchedFormValues.currency)}</TableCell>
                                    <TableCell>
                                        <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive hover:text-destructive"
                                        onClick={() => remove(index)}
                                        disabled={fields.length <= 1}
                                        >
                                        <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                    </TableRow>
                                );
                            })}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="md:hidden space-y-4">
                        {fields.map((field, index) => {
                            const item = watchedFormValues.items[index];
                            const quantity = invoiceType === 'service' ? 1 : (item.quantity || 0);
                            const itemAmount = quantity * (item.rate || 0);
                            const itemDiscount = itemAmount * ((item.discount || 0) / 100);
                            const taxableAmount = itemAmount - itemDiscount;
                            const gstAmount = taxableAmount * ((item.gstRate || 0) / 100);
                            const totalAmount = taxableAmount + gstAmount;

                            return (
                                <Card key={field.id} className="p-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="font-semibold pt-1">{invoiceType === 'item' ? 'Item' : 'Service'} #{index + 1}</h4>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:text-destructive -mt-1 -mr-1 h-8 w-8"
                                            onClick={() => remove(index)}
                                            disabled={fields.length <= 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <div className="space-y-4">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.productId`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{invoiceType === 'item' ? 'Item Name' : 'Service Description'}</FormLabel>
                                                    <ProductCombobox
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        onProductSelect={(product) => {
                                                            form.setValue(`items.${index}.itemName`, product.productName);
                                                            form.setValue(`items.${index}.rate`, product.sellingPrice);
                                                            form.setValue(`items.${index}.unit`, product.uom);
                                                        }}
                                                    />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                         {columnVisibility.hsn && <FormField
                                            control={form.control}
                                            name={`items.${index}.hsnCode`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>{invoiceType === 'item' ? 'HSN Code' : 'SAC Code'}</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder={invoiceType === 'item' ? 'HSN Code' : 'SAC Code'} {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />}
                                        <div className="grid grid-cols-2 gap-4">
                                            {invoiceType === 'item' && <>
                                                <FormField
                                                    control={form.control}
                                                    name={`items.${index}.quantity`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Quantity</FormLabel>
                                                            <FormControl><Input type="text" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                {columnVisibility.unit && <FormField
                                                    control={form.control}
                                                    name={`items.${index}.unit`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Unit</FormLabel>
                                                            <FormControl><Input placeholder="pcs" {...field} /></FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />}
                                            </>}
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.rate`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{invoiceType === 'item' ? 'Rate' : 'Amount'}</FormLabel>
                                                        <FormControl><Input type="text" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {columnVisibility.discount && <FormField
                                                control={form.control}
                                                name={`items.${index}.discount`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Discount (%)</FormLabel>
                                                        <FormControl><Input type="text" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />}
                                             <FormField
                                                control={form.control}
                                                name={`items.${index}.gstRate`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>GST (%)</FormLabel>
                                                        <Select onValueChange={(v) => field.onChange(Number(v))} value={String(field.value)}>
                                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                                            <SelectContent>
                                                                {[0, 5, 12, 18, 28].map(rate => (
                                                                    <SelectItem key={rate} value={String(rate)}>{rate}%</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <Separator/>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">Taxable Amt.</span>
                                                <span className="font-mono">{formatCurrency(taxableAmount, watchedFormValues.currency)}</span>
                                            </div>
                                            <div className="flex justify-between font-medium">
                                                <span>Total</span>
                                                <span className="font-mono">{formatCurrency(totalAmount, watchedFormValues.currency)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => append({ productId: '', itemName: '', hsnCode: '', quantity: 1, rate: 0, discount: 0, gstRate: 18, unit: 'pcs' })}
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Another Line
                    </Button>
                </div>


                <Separator />
                
                <div className="flex justify-end pt-4">
                  <div className="w-full md:max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                    <Card>
                       <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base font-semibold">GST Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-2 text-sm">
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">CGST</span>
                            <span className="font-mono">{formatCurrency(totals.totalCgst, watchedFormValues.currency)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">SGST</span>
                            <span className="font-mono">{formatCurrency(totals.totalSgst, watchedFormValues.currency)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">IGST</span>
                            <span className="font-mono">{formatCurrency(totals.totalIgst, watchedFormValues.currency)}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-base font-semibold">Totals</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Subtotal</span>
                          <span className="font-mono">{formatCurrency(totals.subtotal, watchedFormValues.currency)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total Discount</span>
                          <span className="font-mono text-destructive">
                            - {formatCurrency(totals.totalDiscount, watchedFormValues.currency)}
                          </span>
                        </div>
                        <Separator className="my-1" />
                        <div className="flex justify-between font-medium">
                          <span>Taxable Value</span>
                          <span className="font-mono">{formatCurrency(totals.totalTaxableValue, watchedFormValues.currency)}</span>
                        </div>
                        <div className="flex justify-between">
                           <span className="text-muted-foreground">
                              {totals.singleGstRate ? `GST (${totals.singleGstRate}%)` : 'Total GST'}
                            </span>
                          <span className="font-mono">{formatCurrency(totals.totalGst, watchedFormValues.currency)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <Label htmlFor="auto-round-off" className="text-muted-foreground">Round Off</Label>
                                <Switch
                                    id="auto-round-off"
                                    checked={autoRoundOff}
                                    onCheckedChange={setAutoRoundOff}
                                    className="h-4 w-7 data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0 [&>span]:h-3 [&>span]:w-3"
                                />
                            </div>
                            <Input
                                type="text"
                                className="h-7 w-24 text-right font-mono p-1"
                                value={autoRoundOff ? totals.roundOffValue.toFixed(2) : manualRoundOff}
                                onChange={(e) => setManualRoundOff(parseFloat(e.target.value) || 0)}
                                readOnly={autoRoundOff}
                                disabled={autoRoundOff}
                            />
                        </div>
                        <Separator className="my-1" />
                        <div className="flex justify-between text-base font-bold">
                          <span>Grand Total</span>
                          <span className="font-mono">{formatCurrency(totals.grandTotal, watchedFormValues.currency)}</span>
                        </div>
                         <div className="flex justify-end text-xs text-muted-foreground mt-1">
                            <span>Base Currency (INR) {formatCurrency(totals.grandTotal * (form.getValues('exchangeRate') || 1), 'INR')}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator />
                
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Receive Payment</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <FormField
                                control={form.control}
                                name="paymentReceived"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount Received</FormLabel>
                                        <FormControl>
                                            <Input type="text" placeholder="0.00" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="paymentMode"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Mode</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                        <SelectValue placeholder="Select mode" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="cash">Cash</SelectItem>
                                        <SelectItem value="hdfc-bank">HDFC Bank</SelectItem>
                                        <SelectItem value="sbi-bank">SBI Bank</SelectItem>
                                        <SelectItem value="icici-bank">ICICI Bank</SelectItem>
                                        <SelectItem value="online">Online / UPI</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                        </div>

                        <Card className="bg-muted/50">
                            <CardHeader className="p-4 pb-2">
                                <CardTitle className="text-base font-semibold">Balance Due</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <div className="text-3xl font-bold font-mono text-destructive">
                                    {formatCurrency(totals.amountDue, watchedFormValues.currency)}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Base Currency (INR): {formatCurrency(totals.amountDue * (form.getValues('exchangeRate') || 1), 'INR')}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                <Separator />

                <div className="space-y-4">
                     <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Notes / Terms & Conditions</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Any additional notes or payment terms." {...field} rows={2} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row justify-end gap-4">
            <Button type="button" variant="outline" disabled={isSubmitting}>
                <Save className="mr-2 h-4 w-4" /> Save as Draft
            </Button>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                {isSubmitting ? 'Creating...' : 'Save & Send Invoice'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
