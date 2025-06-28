
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

const paymentTermsSchema = z.object({
  terms: z.string().min(1, 'Payment terms are required.'),
});

type PaymentTermsValues = z.infer<typeof paymentTermsSchema>;

const paymentTermTemplates = [
    {
        title: 'Net 30',
        content: 'Payment is due within 30 days from the invoice date.\nA late fee of 1.5% per month will be charged on overdue invoices.'
    },
    {
        title: 'Due on Receipt',
        content: 'Payment is due immediately upon receipt of this invoice.'
    },
    {
        title: '50% Upfront',
        content: '50% of the total amount is due upon signing the contract. The remaining 50% is due upon project completion.'
    },
];

export function PaymentTermsForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<PaymentTermsValues>({
    resolver: zodResolver(paymentTermsSchema),
    defaultValues: {
      terms: 'Payment is due within 30 days.\nPlease include the invoice number on your payment.',
    },
  });
  
  const handleInsertTemplate = (template: string) => {
    const currentTerms = form.getValues('terms');
    form.setValue('terms', currentTerms ? `${currentTerms}\n\n${template}` : template);
  };

  async function onSubmit(data: PaymentTermsValues) {
    setIsSubmitting(true);
    console.log(data);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Payment Terms Saved",
      description: "Your payment terms have been updated successfully.",
    });
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-xl font-semibold">Payment Terms</h2>
        <Card>
          <CardHeader>
            <CardTitle>Default Payment Terms</CardTitle>
            <CardDescription>
              Set the default terms and conditions that will appear on your invoices. You can use one of the templates or write your own.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Terms & Conditions</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Payment due within 30 days."
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-2">
                <Label className="text-sm font-medium">Insert Template</Label>
                <div className="flex flex-wrap gap-2">
                    {paymentTermTemplates.map(template => (
                        <Button key={template.title} type="button" variant="outline" size="sm" onClick={() => handleInsertTemplate(template.content)}>
                            {template.title}
                        </Button>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Terms
            </Button>
        </div>
      </form>
    </Form>
  );
}
    