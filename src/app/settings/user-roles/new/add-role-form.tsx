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
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import Link from 'next/link';

const permissionsList = [
  { id: 'dashboard', label: 'Dashboard Access' },
  { id: 'customer_management', label: 'Customer Management' },
  { id: 'sales_invoices', label: 'Sales Invoices' },
  { id: 'purchase_bills', label: 'Purchase Bills' },
  { id: 'journal_entries', label: 'Journal Entries' },
  { id: 'view_reports', label: 'View Reports' },
  { id: 'export_data', label: 'Export Data' },
  { id: 'user_management', label: 'User Management' },
  { id: 'company_settings', label: 'Company Settings' },
] as const;

const addRoleFormSchema = z.object({
  roleName: z.string().min(1, 'Role name is required.'),
  permissions: z.array(z.string()).refine(value => value.some(item => item), {
    message: 'You have to select at least one permission.',
  }),
});

type AddRoleFormValues = z.infer<typeof addRoleFormSchema>;

export function AddRoleForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<AddRoleFormValues>({
    resolver: zodResolver(addRoleFormSchema),
    defaultValues: {
      roleName: '',
      permissions: [],
    },
  });

  async function onSubmit(data: AddRoleFormValues) {
    setIsSubmitting(true);
    console.log('New Role Data:', data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: 'Role Created',
      description: `The role "${data.roleName}" has been successfully created.`,
    });
    setIsSubmitting(false);
    form.reset();
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create a New Role</CardTitle>
        <CardDescription>
          Define a new user role and assign specific permissions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="roleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Sales Manager" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="permissions"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Permissions</FormLabel>
                    <FormDescription>
                      Select the permissions this role should have.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {permissionsList.map((permission) => (
                      <FormField
                        key={permission.id}
                        control={form.control}
                        name="permissions"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={permission.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(permission.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), permission.id])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== permission.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {permission.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-4 pt-4">
              <Button asChild variant="outline" type="button">
                <Link href="/settings/user-roles">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Role
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
