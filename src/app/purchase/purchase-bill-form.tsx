
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
  Loader2,
  ChevronsUpDown,
  Check,
  Settings,
  Layers,
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ledgerData as chartOfAccountsData, type Ledger } from '@/lib/ledger-data';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { staticVendors } from '@/lib/customer-data';
import type { Person } from '@/lib/data';
import { generateStockListData, type StockItem } from '@/app/stock-list/data';

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

const batchSchema = z.object({
    id: z.string(),
    batchNumber: z.string().optional(),
    expiryDate: z.date().optional(),
    quantity: z.coerce.number().min(0.01, 'Qty must be > 0'),
});

const purchaseItemSchema = z.object({
  productId: z.string().optional(),
  itemName: z.string().min(1, 'Item name is required.'),
  ledgerAccountId: z.string().min(1, 'Account is required.'),
  hsnCode: z.string().optional(),
  quantity: z.coerce.number().min(0.01, 'Quantity must be positive.'),
  rate: z.coerce.number().min(0, 'Rate cannot be negative.'),
  gstRate: z.coerce.number().min(0).max(100).default(18),
  batches: z.array(batchSchema).optional(),
});

const purchaseBillSchema = z.object({
  vendorId: z.string().min(1, 'Vendor is required.'),
  vendorGstin: z.string().optional(),
  vendorAddress: z.string().min(1, 'Vendor address is required.'),
  placeOfSupply: z.string().min(1, 'Place of supply is required.'),
  billNumber: z.string().min(1, 'Bill number is required.'),
  billDate: z.date(),
  dueDate: z.date().optional(),
  items: z.array(purchaseItemSchema).min(1, 'At least one item is required.'),
  notes: z.string().optional(),
});

type PurchaseBillValues = z.infer<typeof purchaseBillSchema>;
type BatchValues = z.infer<typeof batchSchema>;

// Batch Management Dialog
const BatchDialog = ({
    item,
    itemIndex,
    updateBatches,
    onClose,
}: {
    item: z.infer<typeof purchaseItemSchema>;
    itemIndex: number;
    updateBatches: (itemIndex: number, batches: BatchValues[]) => void;
    onClose: () => void;
}) => {
    const [batches, setBatches] = React.useState<BatchValues[]>(item.batches || []);
    
    const handleAddBatch = () => {
        setBatches([...batches, { id: `batch-${Date.now()}`, quantity: 0 }]);
    };

    const handleRemoveBatch = (id: string) => {
        setBatches(batches.filter(b => b.id !== id));
    };

    const handleBatchChange = (id: string, field: keyof BatchValues, value: any) => {
        setBatches(batches.map(b => b.id === id ? { ...b, [field]: value } : b));
    };

    const handleSave = () => {
        updateBatches(itemIndex, batches);
        onClose();
    };

    return (
        <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
                <DialogTitle>Manage Batches for {item.itemName}</DialogTitle>
                <DialogDescription>Add batch numbers, expiry dates, and quantities for this item.</DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                {batches.map((batch, index) => (
                    <div key={batch.id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_100px_auto] gap-2 items-end p-2 border rounded-lg">
                        <div className="space-y-1">
                            {index === 0 && <Label>Batch No.</Label>}
                            <Input placeholder="Optional" value={batch.batchNumber} onChange={(e) => handleBatchChange(batch.id, 'batchNumber', e.target.value)} />
                        </div>
                        <div className="space-y-1">
                             {index === 0 && <Label>Expiry Date</Label>}
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className={cn("w-full justify-start text-left font-normal", !batch.expiryDate && "text-muted-foreground")}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {batch.expiryDate ? format(batch.expiryDate, "dd/MM/yyyy") : <span>No Expiry</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={batch.expiryDate} onSelect={(date) => handleBatchChange(batch.id, 'expiryDate', date)} /></PopoverContent>
                            </Popover>
                        </div>
                        <div className="space-y-1">
                             {index === 0 && <Label>Quantity</Label>}
                            <Input type="text" value={batch.quantity} onChange={(e) => handleBatchChange(batch.id, 'quantity', parseFloat(e.target.value))} />
                        </div>
                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleRemoveBatch(batch.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                ))}
                <Button type="button" variant="outline" onClick={handleAddBatch}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Batch
                </Button>
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave}>Save Batches</Button>
            </DialogFooter>
        </DialogContent>
    )
}

export function PurchaseBillForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [purchaseMode, setPurchaseMode] = React.useState<'both' | 'assets' | 'inventory'>('both');
  const [activeTab, setActiveTab] = React.useState<'assets' | 'inventory'>('inventory');

  const [vendors, setVendors] = React.useState<Person[]>([]);
  const [products, setProducts] = React.useState<StockItem[]>([]);
  const [isVendorDialogOpen, setIsVendorDialogOpen] = React.useState(false);
  const [newVendor, setNewVendor] = React.useState({ name: '', gstin: '', address: '' });
  const [vendorSearch, setVendorSearch] = React.useState("");

  const [isBatchDialogOpen, setIsBatchDialogOpen] = React.useState(false);
  const [activeItemForBatch, setActiveItemForBatch] = React.useState<{ item: z.infer<typeof purchaseItemSchema>, index: number } | null>(null);

  React.useEffect(() => {
    setVendors(staticVendors);
    setProducts(generateStockListData());
  }, []);


  const form = useForm<PurchaseBillValues>({
    resolver: zodResolver(purchaseBillSchema),
    defaultValues: {
      vendorId: '',
      vendorAddress: '',
      billNumber: '',
      billDate: undefined,
      dueDate: undefined,
      items: [{ productId: '', itemName: '', ledgerAccountId: '', hsnCode: '', quantity: 1, rate: 0, gstRate: 18, batches: [{ id: 'default-batch', quantity: 1}] }],
      notes: '',
    },
  });
  
  React.useEffect(() => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + 30);
    
    form.setValue('billDate', today);
    form.setValue('dueDate', futureDate);
  }, [form]);

  React.useEffect(() => {
    if (purchaseMode === 'assets') {
        setActiveTab('assets');
    } else if (purchaseMode === 'inventory') {
        setActiveTab('inventory');
    }
  }, [purchaseMode]);


  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'items',
  });
  
  const watchedItems = form.watch('items');
  const watchedPlaceOfSupply = form.watch('placeOfSupply');

  const allLedgers = React.useMemo(() => {
    const flatten = (accounts: Ledger[]): { value: string, label: string }[] => {
        let list: { value: string, label: string }[] = [];
        accounts.forEach(acc => {
            if (acc.type === 'ledger') {
                list.push({ value: acc.id, label: acc.name });
            }
            if (acc.children) {
                list = [...list, ...flatten(acc.children)];
            }
        });
        return list;
    };
    return flatten(chartOfAccountsData);
  }, []);
  
  const handleAddVendor = () => {
    if (newVendor.name && newVendor.address) {
        const newVendorData: Person = { 
            ...newVendor, 
            id: `vend-${Date.now()}`,
            firstName: newVendor.name.split(' ')[0],
            lastName: newVendor.name.split(' ').slice(1).join(' '),
            company: newVendor.name,
            email: '', phone: '', saleAmount: 0, rating: 0, status: 'Active',
            address: { street: newVendor.address, city: '', state: '', zip: '' },
            bio: '', type: 'Vendor', balance: 0,
            lastSeen: new Date(),
        };
        setVendors(prev => [...prev, newVendorData]);
        form.setValue('vendorId', newVendorData.id);
        form.setValue('vendorGstin', newVendorData.gstin);
        form.setValue('vendorAddress', newVendorData.address.street);
        
        const stateMatch = indianStates.find(state => newVendorData.address.street.toLowerCase().includes(state.toLowerCase()));
        if(stateMatch) {
            form.setValue('placeOfSupply', stateMatch);
        }

        toast({ title: 'Vendor Added', description: `${newVendorData.company} has been added.` });
        setIsVendorDialogOpen(false);
        setNewVendor({ name: '', gstin: '', address: '' });
    } else {
        toast({ title: 'Error', description: 'Vendor Name and Address are required.', variant: 'destructive' });
    }
  }

  const totals = React.useMemo(() => {
    let subtotal = 0;
    
    watchedItems.forEach(item => {
        const itemAmount = (item.quantity || 0) * (item.rate || 0);
        subtotal += itemAmount;
    });

    const gstRate = watchedItems.length > 0 ? watchedItems[0].gstRate : 0; // simplified
    const totalGst = subtotal * (gstRate / 100);
    const isIntraState = watchedPlaceOfSupply === "Maharashtra"; // Assuming user's state is MH

    const totalCgst = isIntraState ? totalGst / 2 : 0;
    const totalSgst = isIntraState ? totalGst / 2 : 0;
    const totalIgst = !isIntraState ? totalGst : 0;

    const grandTotal = subtotal + totalGst;

    return { subtotal, grandTotal, totalGst, totalCgst, totalSgst, totalIgst };
  }, [watchedItems, watchedPlaceOfSupply]);
  
  const handleUpdateBatches = (itemIndex: number, batches: BatchValues[]) => {
    const totalQuantity = batches.reduce((sum, b) => sum + (b.quantity || 0), 0);
    const currentItem = form.getValues(`items.${itemIndex}`);
    update(itemIndex, { ...currentItem, batches, quantity: totalQuantity });
  };
  
  async function onSubmit(data: PurchaseBillValues) {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Form Submitted', { data, totals });
    const vendor = vendors.find(v => v.id === data.vendorId);
    toast({
      title: "Purchase Bill Recorded",
      description: `Bill from ${vendor?.company} has been successfully recorded.`,
    });
    setIsSubmitting(false);
    form.reset({
      vendorId: '',
      vendorAddress: '',
      billNumber: '',
      billDate: new Date(),
      items: [{ productId: '', itemName: '', ledgerAccountId: '', hsnCode: '', quantity: 1, rate: 0, gstRate: 18, batches: [{ id: 'default-batch', quantity: 1 }] }],
    });
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

  const AccountCombobox = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
    const [open, setOpen] = React.useState(false);
    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild><FormControl>
                <Button variant="outline" role="combobox" className={cn("w-full justify-between", !value && "text-muted-foreground")}>
                {value ? allLedgers.find(acc => acc.value === value)?.label : "Select account"}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </FormControl></PopoverTrigger>
            <PopoverContent className="w-[300px] p-0"><Command>
                <CommandInput placeholder="Search accounts..." />
                <CommandList>
                    <CommandEmpty>No account found.</CommandEmpty>
                    <CommandGroup>
                        {allLedgers.map(acc => (
                            <CommandItem value={acc.label} key={acc.value} onSelect={() => { onChange(acc.value); setOpen(false); }}>
                                <Check className={cn("mr-2 h-4 w-4", acc.value === value ? "opacity-100" : "opacity-0")} />
                                {acc.label}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                </CommandList>
            </Command></PopoverContent>
        </Popover>
    );
  };
  
  const showAccountColumn = activeTab === 'assets';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl">New Purchase Bill</CardTitle>
                <CardDescription>Enter the details from your vendor's bill.</CardDescription>
              </div>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                          <Settings className="h-5 w-5" />
                      </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Purchase Mode</DropdownMenuLabel>
                      <DropdownMenuRadioGroup value={purchaseMode} onValueChange={(value) => setPurchaseMode(value as any)}>
                          <DropdownMenuRadioItem value="both">Assets & Inventory</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="assets">Assets Only</DropdownMenuRadioItem>
                          <DropdownMenuRadioItem value="inventory">Inventory Only</DropdownMenuRadioItem>
                      </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                 <FormField
                    control={form.control}
                    name="vendorId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Vendor</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                                {field.value ? vendors.find(v => v.id === field.value)?.company : "Select vendor"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command filter={(value, search) => {
                                            const vendor = vendors.find(v => v.id === value);
                                            if (vendor?.company.toLowerCase().includes(search.toLowerCase()) || vendor?.phone?.includes(search)) return 1;
                                            return 0;
                                        }}>
                                            <CommandInput placeholder="Search by name or phone..." onValueChange={setVendorSearch} />
                                            <CommandList>
                                                <CommandEmpty>
                                                     <Button variant="ghost" className="w-full" onClick={() => { setIsVendorDialogOpen(true); }}>
                                                        <PlusCircle className="mr-2 h-4 w-4" /> Add "{vendorSearch}"
                                                    </Button>
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {vendors.map(vendor => (
                                                        <CommandItem
                                                            value={vendor.id}
                                                            key={vendor.id}
                                                            onSelect={() => {
                                                                form.setValue('vendorId', vendor.id);
                                                                form.setValue('vendorGstin', vendor.gstin);
                                                                form.setValue('vendorAddress', vendor.address.street);
                                                                form.setValue('placeOfSupply', vendor.address.state);
                                                            }}
                                                        >
                                                            <Check className={cn("mr-2 h-4 w-4", vendor.id === field.value ? "opacity-100" : "opacity-0")} />
                                                            {vendor.company}
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
                 <FormField control={form.control} name="vendorGstin" render={({ field }) => (
                    <FormItem><FormLabel>Vendor GSTIN</FormLabel><FormControl><Input placeholder="15-digit GSTIN" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="placeOfSupply" render={({ field }) => (
                    <FormItem>
                        <FormLabel>Place of Supply (Vendor's State)</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger></FormControl>
                        <SelectContent>{indianStates.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent>
                        </Select><FormMessage />
                    </FormItem>
                )} />
              </div>
              {/* Right Column */}
              <div className="space-y-4">
                <FormField control={form.control} name="billNumber" render={({ field }) => (
                    <FormItem><FormLabel>Bill Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="billDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Bill Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild><FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl></PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )} />
                <FormField control={form.control} name="dueDate" render={({ field }) => (
                    <FormItem className="flex flex-col">
                        <FormLabel>Due Date</FormLabel>
                        <Popover>
                            <PopoverTrigger asChild><FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl></PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent>
                        </Popover>
                        <FormMessage />
                    </FormItem>
                )} />
              </div>
            </div>

            <Separator />

            {/* Items Table */}
            <div>
              {purchaseMode === 'both' && (
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="w-full mb-4">
                      <TabsList className="bg-transparent p-0 justify-start gap-2 h-auto flex-wrap">
                          <TabsTrigger value="inventory" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=active]:border-transparent">Inventory Purchase</TabsTrigger>
                          <TabsTrigger value="assets" className="rounded-md data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input bg-transparent hover:bg-accent hover:text-accent-foreground data-[state=active]:border-transparent">Asset Purchase</TabsTrigger>
                      </TabsList>
                  </Tabs>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-1/3 min-w-[250px]">{activeTab === 'inventory' ? 'Item' : 'Asset'}</TableHead>
                    {showAccountColumn && <TableHead className="min-w-[200px]">Account</TableHead>}
                    <TableHead className="min-w-[120px]">HSN/SAC</TableHead>
                    <TableHead className="text-right min-w-[100px]">Qty</TableHead>
                    <TableHead className="text-right min-w-[100px]">Rate</TableHead>
                    <TableHead className="text-right min-w-[100px]">GST%</TableHead>
                    <TableHead className="text-right min-w-[120px]">Amount</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                          <FormField
                            control={form.control}
                            name={`items.${index}.productId`}
                            render={({ field: itemField }) => (
                                <FormItem>
                                    <ProductCombobox
                                        value={itemField.value || ''}
                                        onChange={itemField.onChange}
                                        onProductSelect={(product) => {
                                            form.setValue(`items.${index}.itemName`, product.productName);
                                            form.setValue(`items.${index}.rate`, product.purchasePrice);
                                        }}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                      </TableCell>
                      {showAccountColumn && <TableCell>
                        <FormField
                            control={form.control}
                            name={`items.${index}.ledgerAccountId`}
                            render={({ field }) => (
                                <FormItem>
                                    <AccountCombobox value={field.value} onChange={field.onChange} />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                      </TableCell>}
                      <TableCell><FormField control={form.control} name={`items.${index}.hsnCode`} render={({ field }) => <Input placeholder="HSN Code" {...field} />} /></TableCell>
                      <TableCell>
                         <div className="flex items-center gap-1">
                            <FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => <Input type="text" className="text-right" {...field} readOnly={(field.value > 0 && !!watchedItems[index]?.batches && watchedItems[index]?.batches?.length > 0)} />} />
                            {activeTab === 'inventory' && <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => setActiveItemForBatch({ item: watchedItems[index], index })}>
                                <Layers className="h-4 w-4" />
                            </Button>}
                         </div>
                      </TableCell>
                      <TableCell><FormField control={form.control} name={`items.${index}.rate`} render={({ field }) => <Input type="text" className="text-right" {...field} />} /></TableCell>
                      <TableCell><FormField control={form.control} name={`items.${index}.gstRate`} render={({ field }) => <Input type="text" className="text-right" {...field} />} /></TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.rate || 0), 'INR')}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button type="button" variant="outline" className="mt-4" onClick={() => append({ productId: '', itemName: '', ledgerAccountId: '', hsnCode: '', quantity: 1, rate: 0, gstRate: 18, batches: [{ id: 'default-batch', quantity: 1}] })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Item
              </Button>
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
                <div className="flex justify-between font-bold text-lg"><span>Total Amount</span><span className="font-mono">{formatCurrency(totals.grandTotal, 'INR')}</span></div>
              </div>
            </div>

            <Separator />

             <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                        <Textarea placeholder="Any notes related to this purchase bill." {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
            />

          </CardContent>
        </Card>
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Purchase Bill
          </Button>
        </div>
      </form>
       <Dialog open={isVendorDialogOpen} onOpenChange={setIsVendorDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Vendor</DialogTitle>
                    <DialogDescription>Quickly add a new vendor.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="new-vendor-name" className="text-right">Name</Label><Input id="new-vendor-name" value={newVendor.name} onChange={(e) => setNewVendor(p => ({...p, name: e.target.value}))} className="col-span-3" /></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="new-vendor-gstin" className="text-right">GSTIN</Label><Input id="new-vendor-gstin" value={newVendor.gstin} onChange={(e) => setNewVendor(p => ({...p, gstin: e.target.value}))} className="col-span-3" /></div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="new-vendor-address" className="text-right">Address</Label><Textarea id="new-vendor-address" value={newVendor.address} onChange={(e) => setNewVendor(p => ({...p, address: e.target.value}))} className="col-span-3" placeholder="Full Address including State" /></div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsVendorDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAddVendor}>Add Vendor</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <Dialog open={!!activeItemForBatch} onOpenChange={(open) => !open && setActiveItemForBatch(null)}>
            {activeItemForBatch && <BatchDialog
                item={activeItemForBatch.item}
                itemIndex={activeItemForBatch.index}
                updateBatches={handleUpdateBatches}
                onClose={() => setActiveItemForBatch(null)}
            />}
        </Dialog>
    </Form>
  );
}
