
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
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
import { Loader2, Save, Settings } from 'lucide-react';
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

const customerFormSchema = z.object({
  // Core Information
  name: z.string().min(1, "Name is required."),
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
  gstin: z.string().optional(),
  pan: z.string().optional(),
  tdsApplicable: z.boolean().default(false),
  taxRegistrationNumber: z.string().optional(),

  // Financial Controls
  creditLimit: z.coerce.number().optional().default(0),
  creditPeriod: z.coerce.number().optional().default(0),
  maintainBillWise: z.boolean().default(false),

  // Banking Details
  bankName: z.string().optional(),
  accountNumber: z.string().optional(),
  ifscCode: z.string().optional(),
  
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

export function AddCustomerForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [visibleSections, setVisibleSections] = React.useState<Record<string, boolean>>({
    contactDetails: true,
    taxCompliance: true,
    financialControls: true,
    bankingDetails: true,
    additionalFields: true,
  });

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: '',
      mobile: '',
      openingBalance: 0,
      balanceType: 'debit',
      mailingName: '',
      address: '',
      state: '',
      country: 'India',
      pincode: '',
      email: '',
      gstin: '',
      pan: '',
      tdsApplicable: false,
      taxRegistrationNumber: '',
      creditLimit: 0,
      creditPeriod: 0,
      maintainBillWise: false,
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      contactPerson: '',
      placeOfSupply: '',
      shipToAddress: '',
    },
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
  }

  return (
    <Card className="max-w-4xl mx-auto">
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
            
            {/* Core Information */}
            <section>
                <h3 className="text-lg font-medium mb-2">Core Information</h3>
                <Separator className="mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Name (Mandatory)</FormLabel><FormControl><Input placeholder="Customer's Full Name or Company Name" {...field} /></FormControl><FormMessage /></FormItem>
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
                    <FormField control={form.control} name="gstin" render={({ field }) => (
                        <FormItem><FormLabel>GSTIN/UIN</FormLabel><FormControl><Input placeholder="15-digit GSTIN" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="pan" render={({ field }) => (
                        <FormItem><FormLabel>PAN</FormLabel><FormControl><Input placeholder="10-digit PAN" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField control={form.control} name="taxRegistrationNumber" render={({ field }) => (
                        <FormItem><FormLabel>Tax Registration Number</FormLabel><FormControl><Input placeholder="If applicable" {...field} /></FormControl><FormMessage /></FormItem>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <FormField control={form.control} name="bankName" render={({ field }) => (
                        <FormItem><FormLabel>Bank Name</FormLabel><FormControl><Input placeholder="e.g. HDFC Bank" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="accountNumber" render={({ field }) => (
                        <FormItem><FormLabel>Account Number</FormLabel><FormControl><Input placeholder="Bank account number" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="ifscCode" render={({ field }) => (
                        <FormItem><FormLabel>IFSC Code</FormLabel><FormControl><Input placeholder="e.g. HDFC0000001" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </div>
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
