
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
  Send,
  Loader2,
  Check,
  ChevronsUpDown,
  UserPlus,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { generateData, Person } from '@/lib/data';

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
  itemName: z.string().min(1, 'Item name is required.'),
  hsnCode: z.string().optional(),
  quantity: z.coerce.number().min(0.01, 'Quantity must be positive.'),
  rate: z.coerce.number().min(0, 'Rate cannot be negative.'),
  discount: z.coerce.number().min(0).max(100).optional().default(0),
  gstRate: z.coerce.number().min(0).max(100).default(18),
});

const invoiceFormSchema = z.object({
  customerId: z.string().min(1, 'Please select a customer.'),
  customerName: z.string().min(1, 'Customer name is required.'),
  customerGstin: z.string().optional(),
  billingAddress: z.string().min(1, 'Billing address is required.'),
  placeOfSupply: z.string().min(1, 'Place of supply is required.'),
  isShippingSameAsBilling: z.boolean().default(true),
  shippingAddress: z.string().optional(),
  invoiceNumber: z.string().min(1, 'Invoice number is required.'),
  invoiceDate: z.date(),
  dueDate: z.date(),
  currency: z.enum(['INR', 'USD', 'EUR']).default('INR'),
  exchangeRate: z.coerce.number().min(0.01, 'Exchange rate must be positive.').default(1),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required.'),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

const NewCustomerForm = ({ onCustomerAdd }: { onCustomerAdd: (customer: Person) => void }) => {
    const [name, setName] = React.useState('');
    const [gstin, setGstin] = React.useState('');
    const [address, setAddress] = React.useState('');
    const [city, setCity] = React.useState('');
    const [state, setState] = React.useState('');
    const [zip, setZip] = React.useState('');

    const handleSave = () => {
        if (!name || !address || !city || !state || !zip) {
            alert('Please fill all required fields.');
            return;
        }

        const newCustomer: Person = {
            id: `cust-${Date.now()}`,
            firstName: name.split(' ')[0],
            lastName: name.split(' ').slice(1).join(' ') || '',
            email: `${name.toLowerCase().replace(' ', '.')}@new-customer.com`,
            company: name,
            phone: 'N/A',
            saleAmount: 0,
            rating: 0,
            status: 'Active',
            gstin,
            address: { street: address, city, state, zip },
            bio: 'Newly added customer.',
        };
        onCustomerAdd(newCustomer);
    };

    return (
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cust-name" className="text-right">Name</Label>
                <Input id="cust-name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cust-gstin" className="text-right">GSTIN</Label>
                <Input id="cust-gstin" value={gstin} onChange={(e) => setGstin(e.target.value)} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cust-address" className="text-right">Address</Label>
                <Input id="cust-address" value={address} onChange={(e) => setAddress(e.target.value)} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cust-city" className="text-right">City</Label>
                <Input id="cust-city" value={city} onChange={(e) => setCity(e.target.value)} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cust-state" className="text-right">State</Label>
                <Select onValueChange={setState} value={state}>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                        {indianStates.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="cust-zip" className="text-right">Zip Code</Label>
                <Input id="cust-zip" value={zip} onChange={(e) => setZip(e.target.value)} className="col-span-3" />
            </div>
            <DialogFooter>
                <DialogClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </DialogClose>
                <Button type="button" onClick={handleSave}>Save Customer</Button>
            </DialogFooter>
        </div>
    );
}

export function InvoiceForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [customers, setCustomers] = React.useState<Person[]>([]);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = React.useState(false);
  const [isCustomerPopoverOpen, setIsCustomerPopoverOpen] = React.useState(false);


  React.useEffect(() => {
    // In a real app, you'd fetch this from an API
    setCustomers(generateData(25));
  }, []);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      customerId: '',
      customerName: '',
      billingAddress: '',
      isShippingSameAsBilling: true,
      invoiceNumber: `INV-${Math.floor(Math.random() * 9000) + 1000}`,
      invoiceDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      currency: 'INR',
      exchangeRate: 1,
      items: [{ itemName: '', hsnCode: '', quantity: 1, rate: 0, discount: 0, gstRate: 18 }],
      notes: 'Thank you for your business. All payments are due within 30 days.',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const uniqueCustomers = React.useMemo(() => {
    const unique = new Map<string, Person>();
    customers.forEach(customer => {
      if (!unique.has(customer.company)) {
        unique.set(customer.company, customer);
      }
    });
    return Array.from(unique.values());
  }, [customers]);

  const watchedItems = form.watch('items');
  const watchedPlaceOfSupply = form.watch('placeOfSupply');
  const watchedCurrency = form.watch('currency');
  
  const totals = React.useMemo(() => {
    let subtotal = 0;
    let totalDiscount = 0;
    const gstSummary: { [key: number]: { taxable: number; gst: number } } = {};

    watchedItems.forEach(item => {
        const itemAmount = (item.quantity || 0) * (item.rate || 0);
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
    const isIntraState = watchedPlaceOfSupply === sellerDetails.state;

    const grandTotal = totalTaxableValue + totalGst;

    return { subtotal, totalDiscount, totalTaxableValue, grandTotal, totalGst, gstSummary, isIntraState };
  }, [watchedItems, watchedPlaceOfSupply]);
  
  const handleCustomerSelect = (customer: Person) => {
    const fullAddress = `${customer.address.street}, ${customer.address.city}, ${customer.address.state} ${customer.address.zip}`;
    form.setValue('customerName', `${customer.company}`);
    form.setValue('customerGstin', customer.gstin || '');
    form.setValue('billingAddress', fullAddress);
    form.setValue('shippingAddress', fullAddress);
    form.setValue('placeOfSupply', customer.address.state);
    form.setValue('isShippingSameAsBilling', true);
    setIsCustomerPopoverOpen(false);
  };
  
  const handleAddNewCustomer = (customer: Person) => {
      setCustomers(prev => [customer, ...prev]);
      form.setValue('customerId', customer.id);
      handleCustomerSelect(customer);
      setIsAddCustomerOpen(false);
  };

  async function onSubmit(data: InvoiceFormValues) {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Form Submitted', { data, totals });
    toast({
      title: "Invoice Created",
      description: `Invoice ${data.invoiceNumber} has been successfully created.`,
    });
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Card>
            <CardHeader>
                <CardTitle>Create New Invoice</CardTitle>
                <CardDescription>Fill out the form below to create a new sales invoice.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
                {/* Seller & Customer Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Seller Details */}
                    <div className="space-y-1 text-sm">
                        <h3 className="font-semibold text-base">From:</h3>
                        <p className="font-bold text-primary">{sellerDetails.name}</p>
                        <p>{sellerDetails.address}</p>
                        <p>{sellerDetails.cityStateZip}</p>
                        <p><span className="font-medium text-muted-foreground">GSTIN:</span> {sellerDetails.gstin}</p>
                    </div>

                    {/* Customer Details */}
                    <div className="space-y-4">
                       <FormField
                            control={form.control}
                            name="customerId"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                <FormLabel>Bill To</FormLabel>
                                <Popover open={isCustomerPopoverOpen} onOpenChange={setIsCustomerPopoverOpen}>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                className={cn(
                                                    "w-full justify-between",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                            >
                                                {field.value
                                                    ? uniqueCustomers.find((customer) => customer.id === field.value)?.company
                                                    : "Select customer"}
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
                                                    {uniqueCustomers.map((customer) => (
                                                        <CommandItem
                                                            value={customer.company}
                                                            key={customer.id}
                                                            onSelect={() => {
                                                                field.onChange(customer.id);
                                                                handleCustomerSelect(customer);
                                                            }}
                                                        >
                                                            <Check className={cn("mr-2 h-4 w-4",
                                                                  field.value === customer.id ? "opacity-100" : "opacity-0"
                                                            )} />
                                                            {customer.company}
                                                        </CommandItem>
                                                    ))}
                                                    <CommandItem onSelect={() => {
                                                        setIsCustomerPopoverOpen(false);
                                                        setIsAddCustomerOpen(true);
                                                    }}>
                                                        <UserPlus className="mr-2 h-4 w-4" />
                                                        Add New Customer
                                                    </CommandItem>
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
                            name="billingAddress"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Billing Address</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="Customer's Billing Address" {...field} rows={2} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                         </div>
                    </div>
                </div>

                <Separator />
                
                {/* Shipping Details */}
                <div>
                     <FormField
                        control={form.control}
                        name="isShippingSameAsBilling"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
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
                         <div className="mt-4">
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

                <Separator />
                
                {/* Invoice Meta */}
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {watchedCurrency !== 'INR' && (
                        <FormField
                            control={form.control}
                            name="exchangeRate"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Exchange Rate (1 {watchedCurrency} to INR)</FormLabel>
                                    <FormControl>
                                        <Input type="number" step="0.01" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                </div>

                <Separator />
                
                {/* Invoice Items Section */}
                <div>
                    {/* Desktop Table View */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                            <TableRow>
                                <TableHead className="w-[30%] min-w-[200px]">Item / HSN</TableHead>
                                <TableHead className="text-right">Qty</TableHead>
                                <TableHead className="text-right">Rate</TableHead>
                                <TableHead className="text-right">Discount(%)</TableHead>
                                <TableHead className="text-right">GST(%)</TableHead>
                                <TableHead className="text-right">Taxable Amt.</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="w-12"></TableHead>
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {fields.map((field, index) => {
                                const item = watchedItems[index];
                                const itemAmount = (item.quantity || 0) * (item.rate || 0);
                                const itemDiscount = itemAmount * ((item.discount || 0) / 100);
                                const taxableAmount = itemAmount - itemDiscount;
                                const gstAmount = taxableAmount * ((item.gstRate || 0) / 100);
                                const totalAmount = taxableAmount + gstAmount;

                                return (
                                    <TableRow key={field.id} className="align-top">
                                    <TableCell>
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.itemName`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder="Item name and description"
                                                            {...field}
                                                            rows={2}
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.hsnCode`}
                                            render={({ field }) => (
                                                <FormItem className="mt-1">
                                                    <FormControl>
                                                        <Input
                                                            placeholder="HSN/SAC Code"
                                                            {...field}
                                                            className="h-8 text-xs"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>
                                         <FormField
                                            control={form.control}
                                            name={`items.${index}.quantity`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" className="text-right min-w-[60px]" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>
                                         <FormField
                                            control={form.control}
                                            name={`items.${index}.rate`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" className="text-right min-w-[80px]" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
                                    <TableCell>
                                         <FormField
                                            control={form.control}
                                            name={`items.${index}.discount`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormControl>
                                                        <Input type="number" className="text-right min-w-[70px]" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TableCell>
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
                                    <TableCell className="text-right font-mono">{formatCurrency(taxableAmount, watchedCurrency)}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(totalAmount, watchedCurrency)}</TableCell>
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

                     {/* Mobile Card View */}
                    <div className="md:hidden space-y-4">
                        {fields.map((field, index) => {
                            const item = watchedItems[index];
                            const itemAmount = (item.quantity || 0) * (item.rate || 0);
                            const itemDiscount = itemAmount * ((item.discount || 0) / 100);
                            const taxableAmount = itemAmount - itemDiscount;
                            const gstAmount = taxableAmount * ((item.gstRate || 0) / 100);
                            const totalAmount = taxableAmount + gstAmount;

                            return (
                                <Card key={field.id} className="p-4">
                                    <div className="flex justify-between items-start mb-4">
                                        <h4 className="font-semibold pt-1">Item #{index + 1}</h4>
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
                                            name={`items.${index}.itemName`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Item Name / Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea placeholder="Item name..." {...field} rows={2} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                         <FormField
                                            control={form.control}
                                            name={`items.${index}.hsnCode`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>HSN/SAC Code</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="HSN/SAC Code" {...field} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.quantity`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Quantity</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.rate`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Rate</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`items.${index}.discount`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Discount (%)</FormLabel>
                                                        <FormControl><Input type="number" {...field} /></FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
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
                                                <span className="font-mono">{formatCurrency(taxableAmount, watchedCurrency)}</span>
                                            </div>
                                            <div className="flex justify-between font-medium">
                                                <span>Total</span>
                                                <span className="font-mono">{formatCurrency(totalAmount, watchedCurrency)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            )
                        })}
                    </div>
                </div>


                <Button
                    type="button"
                    variant="outline"
                    onClick={() => append({ itemName: '', hsnCode: '', quantity: 1, rate: 0, discount: 0, gstRate: 18 })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Another Item
                </Button>

                <Separator />
                
                {/* Totals Section */}
                <div className="flex justify-end">
                    <div className="w-full max-w-sm space-y-2">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span className="font-mono">{formatCurrency(totals.subtotal, watchedCurrency)}</span>
                        </div>
                         <div className="flex justify-between">
                            <span className="text-muted-foreground">Discount</span>
                            <span className="font-mono text-destructive">- {formatCurrency(totals.totalDiscount, watchedCurrency)}</span>
                        </div>
                        <Separator />
                         <div className="flex justify-between font-medium">
                            <span>Taxable Value</span>
                            <span className="font-mono">{formatCurrency(totals.totalTaxableValue, watchedCurrency)}</span>
                        </div>
                        
                        {Object.entries(totals.gstSummary).map(([rate, { gst }]) => (
                            <React.Fragment key={rate}>
                                {totals.isIntraState ? (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">CGST ({Number(rate)/2}%)</span>
                                            <span className="font-mono">{formatCurrency(gst/2, watchedCurrency)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">SGST ({Number(rate)/2}%)</span>
                                            <span className="font-mono">{formatCurrency(gst/2, watchedCurrency)}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">IGST ({rate}%)</span>
                                        <span className="font-mono">{formatCurrency(gst, watchedCurrency)}</span>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                        
                        <Separator />
                        <div className="flex justify-between text-lg font-bold">
                            <span>Grand Total ({watchedCurrency})</span>
                            <span className="font-mono">{formatCurrency(totals.grandTotal, watchedCurrency)}</span>
                        </div>
                        {watchedCurrency !== 'INR' && (
                             <div className="flex justify-between text-sm text-muted-foreground text-right">
                                <span>(Total in INR: {formatCurrency(totals.grandTotal * form.getValues('exchangeRate'), 'INR')})</span>
                            </div>
                        )}
                    </div>
                </div>

                <Separator />

                {/* Notes and Actions */}
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

        <Dialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen}>
            <DialogContent>
                <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
                <DialogDescription>
                    Enter the details for the new customer.
                </DialogDescription>
                </DialogHeader>
                <NewCustomerForm onCustomerAdd={handleAddNewCustomer} />
            </DialogContent>
        </Dialog>

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
