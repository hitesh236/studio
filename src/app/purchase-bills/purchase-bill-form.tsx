
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
  Settings,
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
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ledgerData as chartOfAccountsData, type Ledger } from '@/lib/ledger-data';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

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

const purchaseItemSchema = z.object({
  itemName: z.string().min(1, 'Item name is required.'),
  ledgerAccountId: z.string().min(1, 'Account is required.'),
  hsnCode: z.string().optional(),
  quantity: z.coerce.number().min(0.01, 'Quantity must be positive.'),
  rate: z.coerce.number().min(0, 'Rate cannot be negative.'),
  gstRate: z.coerce.number().min(0).max(100).default(18),
});

const purchaseBillSchema = z.object({
  vendorName: z.string().min(1, 'Vendor name is required.'),
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

export function PurchaseBillForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [purchaseMode, setPurchaseMode] = React.useState<'both' | 'assets' | 'inventory'>('both');
  const [activeTab, setActiveTab] = React.useState<'assets' | 'inventory'>('inventory');


  const [vendors, setVendors] = React.useState([
    { id: 'vend1', name: 'Cloud Services LLC', gstin: '27AAAAA0000A1Z5', address: '789 Cloud Ave, Pune, Maharashtra' },
    { id: 'vend2', name: 'Office Supplies R Us', gstin: '29BBBBB1111B1Z6', address: '101 Supply St, Bengaluru, Karnataka' },
    { id: 'vend3', name: 'Marketing Wizards', gstin: '07CCCCC2222C1Z7', address: '202 Creative Ln, Delhi, Delhi' },
  ]);
  const [isVendorDialogOpen, setIsVendorDialogOpen] = React.useState(false);
  const [newVendor, setNewVendor] = React.useState({ name: '', gstin: '', address: '' });


  const form = useForm<PurchaseBillValues>({
    resolver: zodResolver(purchaseBillSchema),
    defaultValues: {
      vendorName: '',
      vendorAddress: '',
      billNumber: '',
      billDate: undefined,
      dueDate: undefined,
      items: [{ itemName: '', ledgerAccountId: '', hsnCode: '', quantity: 1, rate: 0, gstRate: 18 }],
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


  const { fields, append, remove } = useFieldArray({
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
        const newVendorData = { ...newVendor, id: `vend-${Date.now()}` };
        setVendors(prev => [...prev, newVendorData]);
        form.setValue('vendorName', newVendorData.name);
        form.setValue('vendorGstin', newVendorData.gstin);
        form.setValue('vendorAddress', newVendorData.address);
        
        const stateMatch = indianStates.find(state => newVendorData.address.toLowerCase().includes(state.toLowerCase()));
        if(stateMatch) {
            form.setValue('placeOfSupply', stateMatch);
        }

        toast({ title: 'Vendor Added', description: `${newVendorData.name} has been added.` });
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
  
  async function onSubmit(data: PurchaseBillValues) {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('Form Submitted', { data, totals });
    toast({
      title: "Purchase Bill Recorded",
      description: `Bill from ${data.vendorName} has been successfully recorded.`,
    });
    setIsSubmitting(false);
    form.reset({
      vendorName: '',
      vendorAddress: '',
      billNumber: '',
      billDate: new Date(),
      items: [{ itemName: '', ledgerAccountId: '', hsnCode: '', quantity: 1, rate: 0, gstRate: 18 }],
    });
  }

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
  
  const showAccountColumn = activeTab === 'inventory';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="max-w-6xl mx-auto">
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
                    name="vendorName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Vendor</FormLabel>
                             <div className="flex items-start gap-2">
                                <Select
                                    onValueChange={(value) => {
                                        const selectedVendor = vendors.find(c => c.name === value);
                                        if (selectedVendor) {
                                            field.onChange(value);
                                            form.setValue('vendorGstin', selectedVendor.gstin);
                                            form.setValue('vendorAddress', selectedVendor.address);
                                            const stateMatch = indianStates.find(state => selectedVendor.address.toLowerCase().includes(state.toLowerCase()));
                                            if(stateMatch) {
                                                form.setValue('placeOfSupply', stateMatch);
                                            }
                                        }
                                    }}
                                    value={field.value}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a vendor" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {vendors.map(vendor => (
                                            <SelectItem key={vendor.id} value={vendor.name}>
                                                {vendor.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Dialog open={isVendorDialogOpen} onOpenChange={setIsVendorDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button type="button" variant="outline" size="icon" className="shrink-0">
                                            <PlusCircle className="h-4 w-4" />
                                            <span className="sr-only">Add New Vendor</span>
                                        </Button>
                                    </DialogTrigger>
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
                            </div>
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
                    <TableHead className="w-1/3">Item</TableHead>
                    {showAccountColumn && <TableHead className="w-1/4">Account</TableHead>}
                    <TableHead>HSN/SAC</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Rate</TableHead>
                    <TableHead className="text-right">GST%</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell><FormField control={form.control} name={`items.${index}.itemName`} render={({ field }) => <Input placeholder="Item name" {...field} />} /></TableCell>
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
                      <TableCell><FormField control={form.control} name={`items.${index}.quantity`} render={({ field }) => <Input type="number" className="text-right" {...field} />} /></TableCell>
                      <TableCell><FormField control={form.control} name={`items.${index}.rate`} render={({ field }) => <Input type="number" className="text-right" {...field} />} /></TableCell>
                      <TableCell><FormField control={form.control} name={`items.${index}.gstRate`} render={({ field }) => <Input type="number" className="text-right" {...field} />} /></TableCell>
                      <TableCell className="text-right font-mono">{formatCurrency((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.rate || 0), 'INR')}</TableCell>
                      <TableCell><Button variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button type="button" variant="outline" className="mt-4" onClick={() => append({ itemName: '', ledgerAccountId: '', hsnCode: '', quantity: 1, rate: 0, gstRate: 18 })}>
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
    </Form>
  );
}
