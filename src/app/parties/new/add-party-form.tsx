
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
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Trash2, PlusCircle, Check, ChevronsUpDown, Search } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AnimatePresence, motion } from 'framer-motion';

const partyFormSchema = z.object({
  // Party Type
  isCustomer: z.boolean().default(false),
  isVendor: z.boolean().default(false),
  gstinSearch: z.string().optional(),

  // Common Fields
  businessName: z.string().min(1, 'Business Name is required.'),
  displayName: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().min(10, "Phone number must be at least 10 digits.").optional().or(z.literal('')),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  website: z.string().url('Invalid URL.').optional().or(z.literal('')),
  billingAddress: z.string().optional(),
  isShippingSame: z.boolean().default(true),
  shippingAddress: z.string().optional(),
  gstin: z.string().length(15, "GSTIN must be 15 characters.").optional().or(z.literal('')),
  pan: z.string().length(10, 'PAN must be 10 characters.').optional().or(z.literal('')),
  placeOfSupply: z.string().optional(),
  openingBalance: z.coerce.number().optional().default(0),
  balanceType: z.enum(['debit', 'credit']).default('debit'),
  currency: z.string().optional(),
  paymentTerms: z.string().optional(),
  preferredPaymentMode: z.string().optional(),
  notes: z.string().optional(),

  // Customer-Specific
  customerType: z.string().optional(),
  salesPerson: z.string().optional(),
  priceList: z.string().optional(),
  creditLimit: z.coerce.number().optional(),
  loyaltyId: z.string().optional(),

  // Vendor-Specific
  vendorType: z.string().optional(),
  purchaseCategory: z.string().optional(),
  defaultExpenseLedger: z.string().optional(),
  paymentCycle: z.string().optional(),
  bankDetails: z.object({
    accountNumber: z.string().optional(),
    ifsc: z.string().optional(),
    swiftCode: z.string().optional(),
  }).optional(),
  tdsPercentage: z.coerce.number().optional(),
}).refine(data => data.isCustomer || data.isVendor, {
  message: 'Please select at least one party type (Customer or Vendor).',
  path: ['isCustomer'],
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
      isCustomer: true,
      isVendor: false,
      businessName: '',
      displayName: '',
      isShippingSame: true,
      openingBalance: 0,
      balanceType: 'debit',
      currency: 'INR'
    },
  });

  const { watch } = form;
  const isCustomer = watch('isCustomer');
  const isVendor = watch('isVendor');
  const isShippingSame = watch('isShippingSame');

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
        form.setValue('gstin', gstin);
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
    <div className="p-4 sm:p-6 space-y-6">
        <div className="text-center">
            <h2 className="text-2xl font-bold">Create New Party</h2>
            <p className="text-muted-foreground">Add a new customer, vendor, or both to your system.</p>
        </div>
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <h3 className="text-base font-bold">Party Type</h3>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="flex items-center gap-8">
                            <FormField
                                control={form.control}
                                name="isCustomer"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <FormLabel className="font-normal">Customer</FormLabel>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isVendor"
                                render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2 space-y-0">
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <FormLabel className="font-normal">Vendor</FormLabel>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormMessage>{form.formState.errors.isCustomer?.message}</FormMessage>
                         <Separator className="my-4"/>
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
                    <h3 className="text-base font-bold">Common Details</h3>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField name="businessName" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Name / Business Name</FormLabel><FormControl><Input placeholder="e.g., Innovate Inc." {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="displayName" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Display Name</FormLabel><FormControl><Input placeholder="e.g., Innovate" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="contactPerson" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Contact Person</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="phone" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="+91 12345 67890" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="email" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" placeholder="contact@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="website" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Website</FormLabel><FormControl><Input placeholder="https://example.com" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>

                    <Separator />

                    <h4 className="text-md font-medium">Billing Address</h4>
                    <div className="grid grid-cols-1 gap-6">
                        <FormField name="billingAddress" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Street, City, State, Pincode</FormLabel><FormControl><Textarea placeholder="123 Main St, Mumbai, Maharashtra, 400001" {...field} rows={3}/></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>

                    <FormField
                        control={form.control}
                        name="isShippingSame"
                        render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-2">
                                <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                <FormLabel className="font-normal">Shipping address is same as billing address</FormLabel>
                            </FormItem>
                        )}
                    />
                    
                    <SectionWrapper isVisible={!isShippingSame}>
                        <h4 className="text-md font-medium">Shipping Address</h4>
                        <div className="grid grid-cols-1 gap-6">
                            <FormField name="shippingAddress" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Street, City, State, Pincode</FormLabel><FormControl><Textarea placeholder="123 Shipping St, Mumbai, Maharashtra, 400001" {...field} rows={3}/></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                    </SectionWrapper>
                    
                    <Separator />

                    <h4 className="text-md font-medium">Tax & Compliance</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField name="gstin" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>GSTIN</FormLabel><FormControl><Input placeholder="15-digit GSTIN" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="pan" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>PAN</FormLabel><FormControl><Input placeholder="10-digit PAN" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="placeOfSupply" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Place of Supply</FormLabel><FormControl><Input placeholder="State" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>

                    <Separator />
                    
                    <h4 className="text-md font-medium">Accounting</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-end gap-2">
                                <FormField name="openingBalance" control={form.control} render={({ field }) => (
                                <FormItem className="flex-1"><FormLabel>Opening Balance</FormLabel><FormControl><Input type="number" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField name="balanceType" control={form.control} render={({ field }) => (
                                <FormItem className="space-y-3"><FormControl>
                                    <RadioGroup onValueChange={field.onChange} value={field.value} className="flex items-center space-x-4">
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl><RadioGroupItem value="debit" /></FormControl>
                                            <FormLabel className="font-normal flex items-baseline gap-1.5">Dr <span className="text-xs text-muted-foreground">(To Collect)</span></FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl><RadioGroupItem value="credit" /></FormControl>
                                            <FormLabel className="font-normal flex items-baseline gap-1.5">Cr <span className="text-xs text-muted-foreground">(To Pay)</span></FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        <FormField name="currency" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Currency</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="paymentTerms" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Payment Terms</FormLabel><FormControl><Input placeholder="e.g., Net 30" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="preferredPaymentMode" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Preferred Payment Mode</FormLabel><FormControl><Input placeholder="e.g., Bank Transfer" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="notes" control={form.control} render={({ field }) => (
                            <FormItem className="md:col-span-2"><FormLabel>Notes</FormLabel><FormControl><Textarea placeholder="Any other remarks" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>
                </CardContent>
            </Card>

            <SectionWrapper isVisible={isCustomer}>
                <Card>
                    <CardHeader>
                        <h3 className="text-base font-bold">Customer Details</h3>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField name="customerType" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Customer Type</FormLabel><FormControl><Input placeholder="e.g., Retailer" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="salesPerson" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Assigned Sales Person</FormLabel><FormControl><Input placeholder="e.g., Jane Smith" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="priceList" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Price List / Discount</FormLabel><FormControl><Input placeholder="e.g., Wholesale Price" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="creditLimit" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Credit Limit</FormLabel><FormControl><Input type="number" placeholder="50000" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        <FormField name="loyaltyId" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Loyalty ID</FormLabel><FormControl><Input placeholder="e.g., CUST-001" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </CardContent>
                </Card>
            </SectionWrapper>
            
            <SectionWrapper isVisible={isVendor}>
                 <Card>
                    <CardHeader>
                         <h3 className="text-base font-bold">Vendor Details</h3>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField name="vendorType" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Vendor Type</FormLabel><FormControl><Input placeholder="e.g., Manufacturer" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField name="purchaseCategory" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Purchase Category</FormLabel><FormControl><Input placeholder="e.g., Raw Materials" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField name="defaultExpenseLedger" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Default Expense Ledger</FormLabel><FormControl><Input placeholder="e.g., Cost of Goods Sold" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField name="paymentCycle" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Payment Cycle</FormLabel><FormControl><Input placeholder="e.g., Weekly" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                        <Separator />
                        <h4 className="text-md font-medium">Bank Details</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormField name="bankDetails.accountNumber" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>Account Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField name="bankDetails.ifsc" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>IFSC Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField name="bankDetails.swiftCode" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>SWIFT Code</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                            <FormField name="tdsPercentage" control={form.control} render={({ field }) => (
                                <FormItem><FormLabel>TDS %</FormLabel><FormControl><Input type="number" placeholder="e.g., 10" {...field} /></FormControl><FormMessage /></FormItem>
                            )}/>
                        </div>
                    </CardContent>
                </Card>
            </SectionWrapper>
            
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
