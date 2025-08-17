
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Trash2, PlusCircle, Check, ChevronsUpDown, Search } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

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

const partyFormSchema = z.object({
  partyType: z.enum(['customer', 'vendor', 'both']),
  gstinSearch: z.string().optional(),
  
  // Basic Info
  businessName: z.string().min(1, 'Business Name is required.'),
  displayName: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  website: z.string().url('Invalid URL.').optional().or(z.literal('')),

  // Address
  billingAddress: z.string().optional(),
  state: z.string().optional(),

  // Tax
  pan: z.string().length(10, 'PAN must be 10 characters.').optional().or(z.literal('')),
  placeOfSupply: z.string().optional(),
  
  // Accounting
  openingBalance: z.coerce.number().optional().default(0),
  balanceType: z.enum(['debit', 'credit']).default('debit'),
  creditLimit: z.coerce.number().optional(),
  creditLimitDays: z.coerce.number().int().optional(),
  paymentTerms: z.string().optional(),
  currency: z.string().optional(),

  // Sales & CRM
  customerType: z.string().optional(),

  // Notes
  notes: z.string().optional(),
});

type PartyFormValues = z.infer<typeof partyFormSchema>;

const SectionWrapper = ({ children, isVisible }: { children: React.ReactNode; isVisible: boolean }) => (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );

export function AddPartyForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<PartyFormValues>({
    resolver: zodResolver(partyFormSchema),
    defaultValues: {
      partyType: 'customer',
      businessName: '',
      displayName: '',
      openingBalance: 0,
      balanceType: 'debit',
      currency: 'INR'
    },
  });

  const { watch } = form;
  const partyType = watch('partyType');
  const isCustomer = partyType === 'customer' || partyType === 'both';
  const isVendor = partyType === 'vendor' || partyType === 'both';

  const handleGstSearch = () => {
    const gstin = form.getValues('gstinSearch');
    if (gstin && gstin.length === 15) {
        toast({
            title: 'Searching GSTIN...',
            description: `Looking up details for ${gstin}. This is a placeholder for a real API call.`
        });
        // In a real app, you would make an API call here.
        // For now, let's pre-fill some dummy data.
        form.setValue('businessName', 'GSTIN Fetched Company');
        form.setValue('billingAddress', '123 GST Street, Mumbai, Maharashtra, 400001');
        form.setValue('placeOfSupply', 'Maharashtra');
    } else {
        toast({
            variant: 'destructive',
            title: 'Invalid GSTIN',
            description: 'Please enter a valid 15-digit GSTIN.',
        });
    }
  }

  async function onSubmit(data: PartyFormValues) {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('New Party Data:', data);
    toast({
      title: "Party Created",
      description: `${data.businessName} has been successfully added.`,
    });
    setIsSubmitting(false);
    if(onSuccess) onSuccess();
  }

  return (
    <div className="space-y-6">
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Create New Party</CardTitle>
                    <CardDescription>Add a new customer, vendor, or both to your system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                        <FormField
                            control={form.control}
                            name="partyType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select Party Type</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a party type" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="customer">Customer</SelectItem>
                                            <SelectItem value="vendor">Vendor</SelectItem>
                                            <SelectItem value="both">Both (Customer & Vendor)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-bold">Basic Information</h3>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField name="businessName" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Customer Name</FormLabel><FormControl><Input placeholder="e.g., Innovate Inc." {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField name="displayName" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Display Name</FormLabel><FormControl><Input placeholder="e.g., Innovate" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField name="contactPerson" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Contact Person</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField name="phone" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Phone Number(s)</FormLabel><FormControl><Input type="tel" placeholder="+91 12345 67890" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField name="email" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="contact@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField name="website" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Website URL</FormLabel><FormControl><Input placeholder="https://example.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader><h3 className="text-lg font-bold">Address</h3></CardHeader>
                <CardContent className="space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <FormField name="billingAddress" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Billing Address</FormLabel><FormControl><Textarea placeholder="Full billing address" {...field} rows={3}/></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="state" control={form.control} render={({ field }) => (
                            <FormItem>
                                <FormLabel>State</FormLabel>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <FormControl>
                                            <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                                {field.value ? indianStates.find(state => state === field.value) : "Select state"}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search state..." />
                                            <CommandList>
                                                <CommandEmpty>No state found.</CommandEmpty>
                                                <CommandGroup>
                                                    {indianStates.map(state => (
                                                        <CommandItem
                                                            value={state}
                                                            key={state}
                                                            onSelect={() => {
                                                                form.setValue("state", state)
                                                            }}
                                                        >
                                                            <Check className={cn("mr-2 h-4 w-4", state === field.value ? "opacity-100" : "opacity-0")} />
                                                            {state}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                                <FormMessage />
                            </FormItem>
                        )}/>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><h3 className="text-lg font-bold">Tax & Compliance</h3></CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField name="pan" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>PAN / Legal ID</FormLabel><FormControl><Input placeholder="10-digit PAN" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField name="placeOfSupply" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Place of Supply</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger></FormControl><SelectContent>{indianStates.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent></Select><FormMessage /></FormItem>
                    )}/>
                </CardContent>
            </Card>

            <Card>
                <CardHeader><h3 className="text-lg font-bold">Accounting & Financial</h3></CardHeader>
                 <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-end gap-2">
                                <FormField name="openingBalance" control={form.control} render={({ field }) => (
                                <FormItem className="flex-1"><FormLabel>Opening Balance</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField name="balanceType" control={form.control} render={({ field }) => (
                                <FormItem className="space-y-3"><FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4">
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl><RadioGroupItem value="debit" /></FormControl>
                                            <FormLabel className="font-normal flex items-baseline gap-1.5">
                                                <span>Debit</span>
                                                <span className="text-xs text-muted-foreground">(To collect)</span>
                                            </FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl><RadioGroupItem value="credit" /></FormControl>
                                            <FormLabel className="font-normal flex items-baseline gap-1.5">
                                                <span>Credit</span>
                                                <span className="text-xs text-muted-foreground">(To Pay)</span>
                                            </FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        <FormField name="creditLimit" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Credit Limit (Amount)</FormLabel><FormControl><Input type="number" placeholder="e.g., 50000" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="creditLimitDays" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Credit Limit (Days)</FormLabel><FormControl><Input type="number" placeholder="e.g., 30" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="paymentTerms" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Payment Terms</FormLabel><FormControl><Textarea placeholder="e.g., Net 30, advance, etc." {...field} rows={2} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="currency" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Currency</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </CardContent>
            </Card>

            <SectionWrapper isVisible={isCustomer}>
                <Card>
                    <CardHeader>
                        <h3 className="text-lg font-bold">Sales & CRM</h3>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField name="customerType" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Customer Type</FormLabel><FormControl><Input placeholder="e.g., Retailer, Dealer" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </CardContent>
                </Card>
            </SectionWrapper>
            
            <SectionWrapper isVisible={isVendor}>
                 <Card>
                    <CardHeader>
                         <h3 className="text-lg font-bold">Vendor Details</h3>
                    </CardHeader>
                    {/* Vendor specific fields would go here */}
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Vendor-specific fields will be shown here.</p>
                    </CardContent>
                </Card>
            </SectionWrapper>

             <Card>
                <CardHeader>
                    <h3 className="text-lg font-bold">Notes & Miscellaneous</h3>
                </CardHeader>
                <CardContent>
                    <FormField name="notes" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Remarks / Notes</FormLabel><FormControl><Textarea placeholder="Any other special instructions or comments..." {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                </CardContent>
             </Card>
            
            <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isSubmitting} size="lg">
                    {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Party
                </Button>
            </div>
        </form>
        </Form>
    </div>
  );
}
