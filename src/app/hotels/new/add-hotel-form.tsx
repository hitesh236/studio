
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

const addHotelFormSchema = z.object({
  name: z.string().min(1, 'Hotel name is required.'),
  location: z.string().min(1, 'Location is required.'),
  rating: z.coerce.number().min(0, 'Rating must be between 0 and 5').max(5, 'Rating must be between 0 and 5.'),
  imageUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
});

type AddHotelFormValues = z.infer<typeof addHotelFormSchema>;

export function AddHotelForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<AddHotelFormValues>({
    resolver: zodResolver(addHotelFormSchema),
    defaultValues: {
      name: '',
      location: '',
      rating: 4.5,
      imageUrl: '',
    },
  });

  async function onSubmit(data: AddHotelFormValues) {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('New Hotel Data:', data);
    toast({
      title: 'Hotel Created',
      description: `Hotel "${data.name}" has been successfully added.`,
    });
    setIsSubmitting(false);
    form.reset();
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Hotel</CardTitle>
        <CardDescription>
          Enter the essential details to quickly add a new hotel.
          <br />
          You can add pricing and other details later.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hotel Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., The Grand Palace" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Agra, India" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.1" min="0" max="5" placeholder="e.g., 4.8" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://placehold.co/400x300.png" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Hotel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
