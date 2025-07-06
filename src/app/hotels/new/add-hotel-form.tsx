
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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
import { Loader2, Save, PlusCircle, Trash2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const roomTypeSchema = z.object({
  name: z.string().min(1, 'Room type name is required.'),
  price: z.coerce.number().min(0, 'Price must be a positive number.'),
});

const seasonSchema = z.object({
  name: z.string().min(1, 'Season name is required.'),
  roomTypes: z.array(roomTypeSchema).min(1, 'At least one room type is required for a season.'),
});

const addHotelFormSchema = z.object({
  name: z.string().min(1, 'Hotel name is required.'),
  location: z.string().min(1, 'Location is required.'),
  rating: z.coerce.number().min(0).max(5, 'Rating must be between 0 and 5.'),
  imageUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  seasons: z.array(seasonSchema).min(1, 'At least one season is required.'),
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
      seasons: [
        {
          name: 'Peak Season',
          roomTypes: [{ name: 'Deluxe Room', price: 10000 }],
        },
      ],
    },
  });

  const { fields: seasonFields, append: appendSeason, remove: removeSeason } = useFieldArray({
    control: form.control,
    name: 'seasons',
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
  
  const RoomTypesArray = ({ seasonIndex }: { seasonIndex: number }) => {
    const { fields, append, remove } = useFieldArray({
      control: form.control,
      name: `seasons.${seasonIndex}.roomTypes`,
    });

    return (
      <div className="space-y-4 pl-4 border-l-2 border-muted">
        {fields.map((field, roomIndex) => (
          <div key={field.id} className="flex items-start gap-2">
            <div className="grid grid-cols-2 gap-2 flex-grow">
               <FormField
                  control={form.control}
                  name={`seasons.${seasonIndex}.roomTypes.${roomIndex}.name`}
                  render={({ field }) => (
                      <FormItem>
                        <FormControl><Input placeholder="Room Type Name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                  )}
              />
               <FormField
                  control={form.control}
                  name={`seasons.${seasonIndex}.roomTypes.${roomIndex}.price`}
                  render={({ field }) => (
                      <FormItem>
                        <FormControl><Input type="number" placeholder="Price" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                  )}
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => remove(roomIndex)}
              disabled={fields.length <= 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
         <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ name: '', price: 0 })}
            className="mt-2"
        >
            <PlusCircle className="mr-2 h-4 w-4" /> Add Room Type
        </Button>
      </div>
    );
  };


  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Hotel</CardTitle>
        <CardDescription>Fill in the details below to add a new hotel to the system.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Hotel Name</FormLabel>
                        <FormControl><Input placeholder="e.g., The Grand Palace" {...field} /></FormControl>
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
                        <FormControl><Input placeholder="e.g., Agra, India" {...field} /></FormControl>
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
                        <FormControl><Input type="number" step="0.1" min="0" max="5" placeholder="e.g., 4.8" {...field} /></FormControl>
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
                        <FormControl><Input placeholder="https://placehold.co/400x300.png" {...field} /></FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
            
            <Separator />

            <div>
                <h3 className="text-lg font-medium mb-4">Seasons & Pricing</h3>
                <div className="space-y-6">
                    {seasonFields.map((field, index) => (
                        <Card key={field.id} className="p-4">
                             <div className="flex justify-between items-center mb-4">
                                <FormField
                                    control={form.control}
                                    name={`seasons.${index}.name`}
                                    render={({ field }) => (
                                        <FormItem className="flex-grow mr-4">
                                            <FormControl><Input placeholder="Season Name" {...field} className="text-base font-semibold" /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={() => removeSeason(index)}
                                    disabled={seasonFields.length <= 1}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Remove Season
                                </Button>
                            </div>
                            <RoomTypesArray seasonIndex={index} />
                        </Card>
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => appendSeason({ name: '', roomTypes: [{ name: '', price: 0 }] })}
                        className="mt-4"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Season
                    </Button>
                </div>
            </div>
            
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
