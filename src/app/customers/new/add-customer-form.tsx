
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

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
  firstName: z.string().min(1, "First name is required."),
  lastName: z.string().min(1, "Last name is required."),
  company: z.string().min(1, "Company name is required."),
  email: z.string().email("Invalid email address."),
  phone: z.string().min(10, "Phone number must be at least 10 digits.").optional().or(z.literal('')),
  gstin: z.string().length(15, "GSTIN must be 15 characters.").optional().or(z.literal('')),
  street: z.string().min(1, "Street is required."),
  city: z.string().min(1, "City is required."),
  state: z.string().min(1, "State is required."),
  zip: z.string().min(5, "ZIP code is required."),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

export function AddCustomerForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      company: '',
      email: '',
      phone: '',
      gstin: '',
      street: '',
      city: '',
      state: '',
      zip: '',
    },
  });

  async function onSubmit(data: CustomerFormValues) {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('New Customer Data:', data);
    toast({
      title: "Customer Created",
      description: `${data.firstName} ${data.lastName} has been successfully added.`,
    });
    setIsSubmitting(false);
    form.reset();
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Create a New Customer</CardTitle>
        <CardDescription>Fill in the details below to add a new customer to your records.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div>
                <h3 className="text-lg font-medium">Basic Information</h3>
                <Separator className="my-2" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="company"
                        render={({ field }) => (
                            <FormItem className="md:col-span-2">
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Innovate Inc." {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>

            <div>
                <h3 className="text-lg font-medium">Contact Details</h3>
                <Separator className="my-2" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                                <Input placeholder="john.doe@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input placeholder="(123) 456-7890" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
            
            <div>
                <h3 className="text-lg font-medium">Address & Tax</h3>
                <Separator className="my-2" />
                <div className="space-y-4 mt-4">
                     <FormField
                        control={form.control}
                        name="street"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Street Address</FormLabel>
                            <FormControl>
                                <Input placeholder="123 Main St" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                    <Input placeholder="Mumbai" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>State</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                    <SelectTrigger>
                                    <SelectValue placeholder="Select a state" />
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    {indianStates.map(state => <SelectItem key={state} value={state}>{state}</SelectItem>)}
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="zip"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>ZIP Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="400001" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="gstin"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>GSTIN <span className="text-muted-foreground">(Optional)</span></FormLabel>
                            <FormControl>
                                <Input placeholder="15-digit GST Identification Number" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            </div>
            
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
