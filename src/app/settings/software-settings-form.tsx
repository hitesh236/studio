
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const softwareSettingsSchema = z.object({
  enableTravelModule: z.boolean().default(false),
  showAdvancedAccounting: z.boolean().default(true),
  integrateInventory: z.boolean().default(true),
  // Invoice Numbering
  changePrefixEveryYear: z.boolean().default(true),
  prefixType: z.enum(['text', 'financialYear']).default('financialYear'),
  prefixText: z.string().optional(),
  startingNumber: z.coerce.number().int().min(1, "Starting number must be at least 1").default(1),
});

type SoftwareSettingsValues = z.infer<typeof softwareSettingsSchema>;

export function SoftwareSettingsForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<SoftwareSettingsValues>({
    resolver: zodResolver(softwareSettingsSchema),
    defaultValues: {
      enableTravelModule: true,
      showAdvancedAccounting: true,
      integrateInventory: true,
      changePrefixEveryYear: true,
      prefixType: 'financialYear',
      prefixText: '',
      startingNumber: 1,
    },
  });

  const watchedPrefixType = form.watch('prefixType');
  const watchedPrefixText = form.watch('prefixText');
  const watchedStartingNumber = form.watch('startingNumber');

  const currentFinancialYear = React.useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();
    if (currentMonth >= 3) { // April (index 3) onwards
      return `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;
    } else { // Jan, Feb, March
      return `${currentYear - 1}-${currentYear.toString().slice(-2)}`;
    }
  }, []);

  const invoicePreview = React.useMemo(() => {
    const prefix = watchedPrefixType === 'financialYear' ? currentFinancialYear : watchedPrefixText || '';
    const paddedNumber = String(watchedStartingNumber || 1).padStart(4, '0');
    return `${prefix}${prefix ? '/' : ''}${paddedNumber}`;
  }, [watchedPrefixType, watchedPrefixText, watchedStartingNumber, currentFinancialYear]);

  React.useEffect(() => {
    if (watchedPrefixType === 'financialYear') {
      form.setValue('prefixText', currentFinancialYear);
    }
  }, [watchedPrefixType, currentFinancialYear, form]);


  async function onSubmit(data: SoftwareSettingsValues) {
    setIsSubmitting(true);
    console.log('Software Settings Data:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Settings Saved",
      description: "Your software settings have been updated.",
    });
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-xl font-semibold">Software Settings</h2>
        
        <Card>
          <CardHeader>
            <CardTitle>Invoice Numbering</CardTitle>
            <CardDescription>
              Customize how your invoice numbers are generated.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="changePrefixEveryYear"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Change Every Financial Year</FormLabel>
                    <FormDescription>
                      Automatically reset invoice number and update prefix at the start of each financial year.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                 <FormField
                    control={form.control}
                    name="prefixType"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Prefix</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Select prefix type" /></SelectTrigger></FormControl>
                                <SelectContent>
                                    <SelectItem value="text">Text</SelectItem>
                                    <SelectItem value="financialYear">Financial Year</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="prefixText"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Prefix Value</FormLabel>
                            <FormControl><Input placeholder="e.g. INV-" {...field} readOnly={watchedPrefixType === 'financialYear'} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="startingNumber"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Starting Number</FormLabel>
                            <FormControl><Input type="number" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <div>
              <Label>Preview</Label>
              <p className="text-sm font-mono p-2 bg-muted rounded-md border text-muted-foreground">
                Your first invoice number will look like: {invoicePreview}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Module Management</CardTitle>
            <CardDescription>
              Enable or disable major features of the application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="enableTravelModule"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Travel Module</FormLabel>
                    <FormDescription>
                      Enable features for managing hotels, cabs, and trips.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="showAdvancedAccounting"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Advanced Accounting View</FormLabel>
                    <FormDescription>
                      Show detailed accounting views and reports.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="integrateInventory"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Integrate Inventory with Accounts</FormLabel>
                    <FormDescription>
                      Automatically create accounting entries for inventory transactions.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Software Settings
          </Button>
        </div>
      </form>
    </Form>
  );
}
