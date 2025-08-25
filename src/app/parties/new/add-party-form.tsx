
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Search, Check, ChevronsUpDown, PlusCircle, Trash2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
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

const contactSchema = z.object({
    name: z.string().optional(),
    contact: z.string().optional(),
});

const partyFormSchema = z.object({
  partyType: z.enum(['customer', 'vendor']),
  gstinSearch: z.string().optional(),
  
  // Basic Info
  businessName: z.string(),
  phone: z.string(),
  email: z.string().email("Invalid email address.").optional().or(z.literal('')),
  address: z.string().optional(),
  state: z.string().optional(),
  openingBalance: z.coerce.number().optional().default(0),
  balanceType: z.enum(['debit', 'credit']).default('debit'),
  customerType: z.string().optional(),
  gstin: z.string().length(15, 'GSTIN must be 15 characters.').optional().or(z.literal('')),

  // Other Information
  contactPerson: z.string().optional(),
  creditLimit: z.coerce.number().optional(),
  creditLimitDays: z.coerce.number().int().optional(),
  multipleContacts: z.array(contactSchema).optional(),
  shippingAddresses: z.string().optional(),
  notes: z.string().optional(),
  attachments: z.any().optional(),
  industry: z.string().optional(),
}).refine(data => data.businessName.trim() !== '' || data.phone.trim() !== '', {
    message: "Either Party Name or Phone Number is required.",
    path: ["businessName"],
});


type PartyFormValues = z.infer<typeof partyFormSchema>;


export function AddPartyForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<PartyFormValues>({
    resolver: zodResolver(partyFormSchema),
    defaultValues: {
      partyType: 'customer',
      businessName: '',
      phone: '',
      email: '',
      openingBalance: 0,
      balanceType: 'debit',
      multipleContacts: [{ name: '', contact: '' }],
      shippingAddresses: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'multipleContacts',
  });
  
  const { watch } = form;
  const partyType = watch('partyType');

  const handleGstSearch = () => {
    const gstin = form.getValues('gstinSearch');
    if (gstin && gstin.length === 15) {
        toast({
            title: 'Searching GSTIN...',
            description: `Looking up details for ${gstin}. This is a placeholder for a real API call.`
        });
        form.setValue('businessName', 'GSTIN Fetched Company');
        form.setValue('address', '123 GST Street, Mumbai, Maharashtra, 400001');
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

  const partyTypeLabel = partyType === 'customer' ? 'Customer' : 'Vendor';

  return (
    <div className="space-y-6 p-4">
        <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">Create New Party</CardTitle>
                    <CardDescription>Add a new customer or vendor to your system.</CardDescription>
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
                        <FormItem><FormLabel>{partyTypeLabel} Name</FormLabel><FormControl><Input placeholder={`e.g., Innovate Inc.`} {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField name="phone" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" placeholder="+91 12345 67890" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField name="email" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="contact@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField name="gstin" control={form.control} render={({ field }) => (
                        <FormItem><FormLabel>GSTIN / Tax ID</FormLabel><FormControl><Input placeholder="Optional GSTIN" {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                     <FormField name="address" control={form.control} render={({ field }) => (
                        <FormItem className="md:col-span-2"><FormLabel>Address</FormLabel><FormControl><Textarea placeholder="Full address" {...field} rows={3}/></FormControl><FormMessage /></FormItem>
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
                                                        onSelect={() => form.setValue("state", state)}
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
                </CardContent>
            </Card>
            
             <Card>
                <CardHeader>
                    <h3 className="text-lg font-bold">Other Information</h3>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="flex items-end gap-2">
                            <FormField name="openingBalance" control={form.control} render={({ field }) => (
                                <FormItem className="flex-1"><FormLabel>Opening Balance</FormLabel><FormControl><Input type="text" placeholder="0.00" {...field} /></FormControl><FormMessage /></FormItem>
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
                        <FormField name="customerType" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>{partyTypeLabel} Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="individual">Individual</SelectItem>
                                    <SelectItem value="business">Business</SelectItem>
                                    <SelectItem value="dealer">Dealer</SelectItem>
                                    <SelectItem value="retailer">Retailer</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage /></FormItem>
                        )}/>
                        <FormField name="contactPerson" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Contact Person</FormLabel><FormControl><Input placeholder="e.g., John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                        
                        {partyType === 'customer' && (
                            <>
                                <FormField name="creditLimit" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Credit Limit (Amount)</FormLabel><FormControl><Input type="text" placeholder="e.g., 50000" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField name="creditLimitDays" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Credit Limit (Days)</FormLabel><FormControl><Input type="text" placeholder="e.g., 30" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </>
                        )}
                        
                         <FormField name="industry" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Industry / Segment</FormLabel><FormControl><Input placeholder="e.g., IT, Manufacturing" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                         <FormField name="attachments" control={form.control} render={({ field }) => (
                            <FormItem><FormLabel>Attachments</FormLabel><FormControl><Input type="file" {...field} /></FormControl><FormMessage /></FormItem>
                        )}/>
                    </div>

                    <div>
                        <Label>Multiple Contacts</Label>
                        <div className="space-y-2 mt-2">
                             {fields.map((field, index) => (
                                <div key={field.id} className="flex items-center gap-2">
                                    <FormField name={`multipleContacts.${index}.name`} control={form.control} render={({ field }) => (
                                        <Input {...field} placeholder="Contact Name" />
                                    )} />
                                    <FormField name={`multipleContacts.${index}.contact`} control={form.control} render={({ field }) => (
                                        <Input {...field} placeholder="Phone or Email" />
                                    )} />
                                    <Button type="button" variant="ghost" size="icon" className="text-destructive shrink-0" onClick={() => remove(index)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                        <Button type="button" variant="link" size="sm" className="mt-2" onClick={() => append({ name: '', contact: '' })}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add More Contacts
                        </Button>
                    </div>

                    {partyType === 'customer' && (
                        <FormField
                            name="shippingAddresses"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Shipping Addresses</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter multiple shipping addresses, each on a new line."
                                            {...field}
                                            rows={4}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

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
