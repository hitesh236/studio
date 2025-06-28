
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { CalendarIcon, Settings as SettingsIcon, Upload, Save, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { GstSettingsForm } from './gst-settings-form';
import { PaymentTermsForm } from './payment-terms-form';


const settingsTabs = [
  { id: 'company', label: 'Company Setting' },
  { id: 'gst', label: 'GST Type' },
  { id: 'payment', label: 'Payment Terms' },
  { id: 'integration', label: 'Integration' },
];

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

const businessTypes = [
    'Proprietorship',
    'Partnership',
    'Private Limited Company',
    'Public Limited Company',
    'Limited Liability Partnership (LLP)',
    'Other'
];

const currencies = ['INR', 'USD', 'EUR', 'GBP'];

const companySettingsSchema = z.object({
  legalName: z.string().min(1, 'Legal name is required.'),
  tradingName: z.string().optional(),
  businessType: z.string().min(1, 'Business type is required.'),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().min(1, 'State is required.'),
  pincode: z.string().optional(),
  contactEmail: z.string().email('Invalid email address.').optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  website: z.string().url('Invalid URL.').optional().or(z.literal('')),
  gstin: z.string().length(15, 'GSTIN must be 15 characters.').optional().or(z.literal('')),
  pan: z.string().length(10, 'PAN must be 10 characters.').optional().or(z.literal('')),
  logo: z.any().optional(),
  financialYearStart: z.date(),
  financialYearEnd: z.date(),
  baseCurrency: z.string().min(1, 'Base currency is required.'),
  decimalPlaces: z.coerce.number().int().min(0).max(4),
  thousandSeparator: z.string(),
});

type CompanySettingsValues = z.infer<typeof companySettingsSchema>;

const optionalFields = {
    tradingName: 'Trading Name',
    address: 'Address',
    contact: 'Contact Info',
    taxIds: 'Tax IDs',
    logo: 'Logo',
    numberFormat: 'Number Formatting',
};

function CompanySettingForm() {
    const { toast } = useToast();
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [visibleFields, setVisibleFields] = React.useState<Record<string, boolean>>({
        tradingName: true,
        address: true,
        contact: true,
        taxIds: true,
        logo: true,
        numberFormat: true,
    });
    
    const form = useForm<CompanySettingsValues>({
        resolver: zodResolver(companySettingsSchema),
        defaultValues: {
            legalName: '',
            tradingName: '',
            businessType: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            state: '',
            pincode: '',
            contactEmail: '',
            phoneNumber: '',
            website: '',
            gstin: '',
            pan: '',
            financialYearStart: new Date(new Date().getFullYear(), 3, 1),
            financialYearEnd: new Date(new Date().getFullYear() + 1, 2, 31),
            baseCurrency: 'INR',
            decimalPlaces: 2,
            thousandSeparator: ',',
        },
    });

    async function onSubmit(data: CompanySettingsValues) {
        setIsSubmitting(true);
        console.log(data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast({
            title: "Settings Saved",
            description: "Your company settings have been updated successfully.",
        });
        setIsSubmitting(false);
    }
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Company Settings</h2>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <SettingsIcon className="h-5 w-5" />
                                <span className="sr-only">Toggle field visibility</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Show/Hide Fields</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {Object.entries(optionalFields).map(([key, label]) => (
                                <DropdownMenuCheckboxItem
                                    key={key}
                                    checked={visibleFields[key]}
                                    onCheckedChange={(checked) => setVisibleFields(prev => ({ ...prev, [key]: !!checked }))}
                                >
                                    {label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {/* Always visible fields */}
                    <FormField name="legalName" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Legal Name</FormLabel>
                            <FormControl><Input placeholder="Your Company Inc." {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {visibleFields.tradingName && <FormField name="tradingName" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Trading Name</FormLabel>
                            <FormControl><Input placeholder="Brand Name" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />}
                    
                    <FormField name="businessType" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>Business Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select business type" /></SelectTrigger></FormControl>
                                <SelectContent>{businessTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />

                    <FormField name="state" control={form.control} render={({ field }) => (
                        <FormItem>
                            <FormLabel>State</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger></FormControl>
                                <SelectContent>{indianStates.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {/* Optional Address Fields */}
                    {visibleFields.address && (
                        <>
                           <FormField name="addressLine1" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address Line 1</FormLabel>
                                    <FormControl><Input placeholder="123 Main St" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField name="addressLine2" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address Line 2</FormLabel>
                                    <FormControl><Input placeholder="Suite 4B" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField name="city" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl><Input placeholder="Mumbai" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                             <FormField name="pincode" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pincode</FormLabel>
                                    <FormControl><Input placeholder="400001" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </>
                    )}

                    {/* Optional Contact Fields */}
                    {visibleFields.contact && (
                        <>
                            <FormField name="contactEmail" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Contact Email</FormLabel>
                                    <FormControl><Input type="email" placeholder="contact@company.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField name="phoneNumber" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Phone Number</FormLabel>
                                    <FormControl><Input placeholder="+91 12345 67890" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField name="website" control={form.control} render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Website</FormLabel>
                                    <FormControl><Input placeholder="https://company.com" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </>
                    )}

                    {/* Optional Tax Fields */}
                    {visibleFields.taxIds && (
                        <>
                            <FormField name="gstin" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>GSTIN</FormLabel>
                                    <FormControl><Input placeholder="15-digit GSTIN" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField name="pan" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>PAN</FormLabel>
                                    <FormControl><Input placeholder="10-digit PAN" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </>
                    )}

                    {/* Optional Logo */}
                    {visibleFields.logo && <FormField name="logo" control={form.control} render={({ field }) => (
                        <FormItem className="md:col-span-2">
                            <FormLabel>Company Logo</FormLabel>
                            <FormControl>
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-md bg-muted flex items-center justify-center">
                                        <Upload className="h-8 w-8 text-muted-foreground"/>
                                    </div>
                                    <Input type="file" className="flex-1" onChange={(e) => field.onChange(e.target.files ? e.target.files[0] : null)} />
                                </div>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />}
                    
                    {/* Financial Year */}
                    <FormField name="financialYearStart" control={form.control} render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Financial Year Start</FormLabel>
                            <Popover><PopoverTrigger asChild><FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent></Popover>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField name="financialYearEnd" control={form.control} render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Financial Year End</FormLabel>
                            <Popover><PopoverTrigger asChild><FormControl>
                                <Button variant={"outline"} className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                            </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                            </PopoverContent></Popover>
                            <FormMessage />
                        </FormItem>
                    )} />

                    {/* Optional Number Formatting */}
                    {visibleFields.numberFormat && (
                        <>
                           <FormField name="baseCurrency" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Base Currency</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select currency" /></SelectTrigger></FormControl>
                                        <SelectContent>{currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField name="decimalPlaces" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Decimal Places</FormLabel>
                                    <FormControl><Input type="number" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField name="thousandSeparator" control={form.control} render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Thousand Separator</FormLabel>
                                    <FormControl><Input placeholder="e.g. , or ." {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </>
                    )}
                </div>
                <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </Form>
    );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState('company');

  const renderContent = () => {
    switch (activeTab) {
      case 'company':
        return <CompanySettingForm />;
      case 'gst':
        return <GstSettingsForm />;
      case 'payment':
        return <PaymentTermsForm />;
      case 'integration':
        return <div><h2 className="text-xl font-semibold">Integration</h2></div>;
      default:
        return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your company settings and preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-[200px_1fr] gap-8">
            <aside className="-ml-2 flex flex-col gap-1">
              {settingsTabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  className={cn(
                    "justify-start",
                    activeTab === tab.id && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                  )}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </Button>
              ))}
            </aside>
            <main>
              {renderContent()}
            </main>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
    