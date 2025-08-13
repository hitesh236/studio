
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Settings, Search, PlusCircle, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogClose,
    DialogTrigger,
  } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

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

const bankAccountSchema = z.object({
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
});

const customerFormSchema = z.object({
  // Core Information
  gstinSearch: z.string().optional(),
  name: z.string().min(1, "Name is required."),
  customerType: z.string().min(1, "Customer type is required"),
  mobile: z.string().optional(),
  openingBalance: z.coerce.number().optional().default(0),
  balanceType: z.enum(['debit', 'credit']).default('debit'),

  // Contact Details
  mailingName: z.string().optional(),
  address: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  pincode: z.string().optional(),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),

  // Tax & Compliance
  pan: z.string().optional(),
  tdsApplicable: z.boolean().default(false),

  // Financial Controls
  creditLimit: z.coerce.number().optional().default(0),
  creditPeriod: z.coerce.number().optional().default(0),
  maintainBillWise: z.boolean().default(false),

  // Banking Details
  bankAccounts: z.array(bankAccountSchema),
  
  // Additional Fields
  contactPerson: z.string().optional(),
  placeOfSupply: z.string().optional(),
  shipToAddress: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

const optionalSectionsConfig = {
  contactDetails: 'Contact Details',
  taxCompliance: 'Tax & Compliance',
  financialControls: 'Financial Controls',
  bankingDetails: 'Banking Details',
  additionalFields: 'Additional Fields',
};

export function AddCustomerForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [visibleSections, setVisibleSections] = React.useState<Record<string, boolean>>({
    contactDetails: false,
    taxCompliance: true,
    financialControls: false,
    bankingDetails: true,
    additionalFields: false,
  });

  const [customerTypes, setCustomerTypes] = React.useState(['Regular', 'B2B', 'B2C']);
  const [isTypeDialogOpen, setIsTypeDialogOpen] = React.useState(false);
  const [newCustomerType, setNewCustomerType] = React.useState('');

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: '',
      customerType: 'Regular',
      mobile: '',
      openingBalance: 0,
      balanceType: 'debit',
      mailingName: '',
      address: '',
      state: '',
      country: 'India',
      pincode: '',
      email: '',
      pan: '',
      tdsApplicable: false,
      creditLimit: 0,
      creditPeriod: 0,
      maintainBillWise: false,
      bankAccounts: [{ bankName: '', accountNumber: '', ifscCode: '' }],
      contactPerson: '',
      placeOfSupply: '',
      shipToAddress: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "bankAccounts",
  });

  async function onSubmit(data: CustomerFormValues) {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('New Customer Data:', data);
    toast({
      title: "Customer Created",
      description: `${data.name} has been successfully added.`,
    });
    setIsSubmitting(false);
    form.reset();
    if (onSuccess) {
      onSuccess();
    }
  }
  
  const handleAddNewCustomerType = () => {
    if (newCustomerType && !customerTypes.includes(newCustomerType)) {
        setCustomerTypes(prev => [...prev, newCustomerType]);
        form.setValue('customerType', newCustomerType);
        toast({ title: "Customer type added" });
        setIsTypeDialogOpen(false);
        setNewCustomerType('');
    } else {
        toast({ title: 'Error', description: 'Type is invalid or already exists.', variant: 'destructive'});
    }
  }
  
  const handleGstSearch = () => {
    const gstin = form.getValues('gstinSearch');
    toast({
        title: 'Searching GSTIN...',
        description: `Looking up details for ${gstin}. This is a placeholder.`
    });
    // Here you would typically make an API call
  }

  return (
    <Card className="max-w-4xl mx-auto shadow-none border-none">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
            <CardTitle>Create a New Customer</CardTitle>
            <CardDescription>Fill in the details below to add a new customer to your records.</CardDescription>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Settings className="h-5 w-5" />
                    <span className="sr-only">Toggle Fields</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Show/Hide Optional Sections</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Object.entries(optionalSectionsConfig).map(([key, label]) => (
                    <DropdownMenuCheckboxItem
                        key={key}
                        checked={visibleSections[key]}
                        onCheckedChange={(checked) => setVisibleSections(prev => ({ ...prev, [key]: !!checked }))}
                    >
                        {label}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* GST Search */}
             <section>
                <div className="flex items-end gap-2">
                    <FormField control={form.control} name="gstinSearch" render={({ field }) => (
                        <FormItem className="flex-1">
                            <FormLabel>Search by GSTIN</FormLabel>
                            <FormControl><Input placeholder="Enter 15-digit GSTIN to fetch details" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <Button type="button" onClick={handleGstSearch}><Search className="mr-2 h-4 w-4" /> Search</Button>
                </div>
            </section>

            {/* Core Information */}
            <section>
                <h3 className="text-lg font-medium mb-2">Core Information</h3>
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel>Name (Mandatory)</FormLabel><FormControl><Input placeholder="Customer's Full Name or Company Name" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="customerType" render={({ field }) => (
                        <FormItem>
                            <FormLabel>Customer Type</FormLabel>
                            <div className="flex items-start gap-2">
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        {customerTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                                        <SelectItem value="add-new">
                                            <span className="text-primary flex items-center gap-2"><PlusCircle className="h-4 w-4" /> Add New...</span>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
                                    <DialogTrigger asChild>
                                        <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={() => setIsTypeDialogOpen(true)}>
                                            <PlusCircle className="h-4 w-4" />
                                            <span className="sr-only">Add New Customer Type</span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>Add New Customer Type</DialogTitle>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid grid-cols-4 items-center gap-4">
                                                <Label htmlFor="new-type-name" className="text-right">Name</Label>
                                                <Input id="new-type-name" value={newCustomerType} onChange={(e) => setNewCustomerType(e.target.value)} className="col-span-3" />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                                            <Button onClick={handleAddNewCustomerType}>Add Type</Button>
                                        </DialogFooter>
                                    </DialogContent>
                                </Dialog>
                            </div>
                            <FormMessage />
                        </FormItem>
                    )}/>
                    <FormField control={form.control} name="mobile" render={({ field }) => (
                        <FormItem><FormLabel>Mobile</FormLabel><FormControl><Input type="tel" placeholder="9876543210" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="openingBalance" render={({ field }) => (
                        <FormItem><FormLabel>Opening Balance</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="balanceType" render={({ field }) => (
                        <FormItem className="space-y-3"><FormLabel>Balance Type</FormLabel><FormControl>
                            <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4">
                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="debit" /></FormControl><FormLabel className="font-normal">Debit</FormLabel></FormItem>
                                <FormItem className="flex items-center space-x-2 space-y-0"><FormControl><RadioGroupItem value="credit" /></FormControl><FormLabel className="font-normal">Credit</FormLabel></FormItem>
                            </RadioGroup>
                        </FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
            </section>
            
            {/* Contact Details */}
            {visibleSections.contactDetails && <section>
                <h3 className="text-lg font-medium mb-2">Contact Details</h3>
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="mailingName" render={({ field }) => (
                        <FormItem><FormLabel>Mailing Name</FormLabel><FormControl><Input placeholder="Name for correspondence" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="customer@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="address" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Address</FormLabel><FormControl><Textarea placeholder="Full address" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="state" render={({ field }) => (
                        <FormItem><FormLabel>State</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger></FormControl><SelectContent>{indianStates.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="pincode" render={({ field }) => (
                        <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input placeholder="e.g. 400001" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="country" render={({ field }) => (
                        <FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
            </section>}

            {/* Tax & Compliance */}
            {visibleSections.taxCompliance && <section>
                <h3 className="text-lg font-medium mb-2">Tax & Compliance</h3>
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="pan" render={({ field }) => (
                        <FormItem><FormLabel>PAN</FormLabel><FormControl><Input placeholder="10-digit PAN" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="tdsApplicable" render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 pt-8"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl><FormLabel>TDS Applicable</FormLabel></FormItem>
                    )}/>
                </div>
            </section>}

            {/* Financial Controls */}
            {visibleSections.financialControls && <section>
                <h3 className="text-lg font-medium mb-2">Financial Controls</h3>
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="creditLimit" render={({ field }) => (
                        <FormItem><FormLabel>Credit Limit</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="creditPeriod" render={({ field }) => (
                        <FormItem><FormLabel>Credit Period (Days)</FormLabel><FormControl><Input type="number" placeholder="e.g. 30" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="maintainBillWise" render={({ field }) => (
                        <FormItem className="flex items-center space-x-2 pt-8"><FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                          <FormLabel>Maintain Bill-wise Details</FormLabel>
                        </FormItem>
                    )}/>
                </div>
            </section>}

            {/* Banking Details */}
            {visibleSections.bankingDetails && <section>
                <h3 className="text-lg font-medium mb-2">Banking Details</h3>
                <Separator className="mb-4" />
                {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 mb-4 items-end">
                        <FormField control={form.control} name={`bankAccounts.${index}.bankName`} render={({ field }) => (
                            <FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input placeholder="e.g. HDFC Bank" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name={`bankAccounts.${index}.accountNumber`} render={({ field }) => (
                            <FormItem><FormLabel>Account Number</FormLabel><FormControl><Input placeholder="Bank account number" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField control={form.control} name={`bankAccounts.${index}.ifscCode`} render={({ field }) => (
                            <FormItem><FormLabel>IFSC Code</FormLabel><FormControl><Input placeholder="e.g. HDFC0000001" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <Button type="button" variant="ghost" size="icon" className="text-destructive" onClick={() => remove(index)} disabled={fields.length <= 1}>
                           <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                ))}
                 <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => append({ bankName: '', accountNumber: '', ifscCode: '' })}
                >
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Another Bank
                </Button>
            </section>}

             {/* Additional Fields */}
            {visibleSections.additionalFields && <section>
                <h3 className="text-lg font-medium mb-2">Additional Fields</h3>
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="contactPerson" render={({ field }) => (
                        <FormItem><FormLabel>Contact Person</FormLabel><FormControl><Input placeholder="Name of contact" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="placeOfSupply" render={({ field }) => (
                        <FormItem><FormLabel>Place of Supply</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger></FormControl><SelectContent>{indianStates.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="shipToAddress" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Ship-to Address</FormLabel><FormControl><Textarea placeholder="Optional delivery address" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
            </section>}
            
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Customer
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
