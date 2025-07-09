
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
    },
  });

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
