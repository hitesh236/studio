
'use client';

import * as React from 'react';
import { useForm, useFieldArray, Control } from 'react-hook-form';
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
import { Loader2, Save, Trash2, PlusCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const mealPlanSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  price: z.coerce.number().min(0, "Price cannot be negative"),
});

const roomTypeSchema = z.object({
  name: z.string().min(1, "Room name is required"),
  price: z.coerce.number().min(0, "Base price cannot be negative"),
  mealPlans: z.array(mealPlanSchema),
});

const seasonSchema = z.object({
  name: z.string().min(1, "Season name is required"),
  roomTypes: z.array(roomTypeSchema).min(1, "At least one room type is required per season"),
});

const addHotelFormSchema = z.object({
  name: z.string().min(1, 'Hotel name is required.'),
  location: z.string().min(1, 'Location is required.'),
  rating: z.coerce.number().min(0, 'Rating must be between 0 and 5').max(5, 'Rating must be between 0 and 5.'),
  imageUrl: z.string().url('Must be a valid URL.').optional().or(z.literal('')),
  seasons: z.array(seasonSchema).min(1, "At least one season is required."),
});

type AddHotelFormValues = z.infer<typeof addHotelFormSchema>;


const MealPlanArray = ({ control, seasonIndex, roomIndex }: { control: Control<AddHotelFormValues>, seasonIndex: number, roomIndex: number }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `seasons.${seasonIndex}.roomTypes.${roomIndex}.mealPlans`
    });

    return (
        <div className="mt-4 space-y-2">
            <h5 className="text-sm font-medium">Meal Plans</h5>
            {fields.map((mealField, mealIndex) => (
                <div key={mealField.id} className="flex items-end gap-2">
                    <FormField
                        control={control}
                        name={`seasons.${seasonIndex}.roomTypes.${roomIndex}.mealPlans.${mealIndex}.name`}
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormLabel className="text-xs">Plan Name</FormLabel>
                                <FormControl><Input placeholder="Breakfast (CP)" {...field} /></FormControl>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={control}
                        name={`seasons.${seasonIndex}.roomTypes.${roomIndex}.mealPlans.${mealIndex}.price`}
                        render={({ field }) => (
                            <FormItem>
                                 <FormLabel className="text-xs">Price</FormLabel>
                                <FormControl><Input type="number" placeholder="1500" {...field} /></FormControl>
                            </FormItem>
                        )}
                    />
                     <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => remove(mealIndex)}>
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            ))}
             <Button size="sm" type="button" variant="outline" className="mt-2" onClick={() => append({ name: '', price: 0 })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Meal Plan
            </Button>
        </div>
    )
}

const RoomTypeArray = ({ control, seasonIndex }: { control: Control<AddHotelFormValues>, seasonIndex: number }) => {
    const { fields, append, remove } = useFieldArray({
        control,
        name: `seasons.${seasonIndex}.roomTypes`
    });

    return (
        <div className="space-y-3 pl-4 border-l-2">
            {fields.map((roomField, roomIndex) => (
                <div key={roomField.id} className="p-3 bg-muted/50 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                        <h4 className="font-semibold">Room Type #{roomIndex + 1}</h4>
                        <Button type="button" variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(roomIndex)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                            control={control}
                            name={`seasons.${seasonIndex}.roomTypes.${roomIndex}.name`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Room Name</FormLabel>
                                <FormControl><Input placeholder="Deluxe Room" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={control}
                            name={`seasons.${seasonIndex}.roomTypes.${roomIndex}.price`}
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Base Price (EP)</FormLabel>
                                <FormControl><Input type="number" placeholder="10000" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                     <MealPlanArray control={control} seasonIndex={seasonIndex} roomIndex={roomIndex} />
                </div>
            ))}
            <Button size="sm" type="button" variant="secondary" onClick={() => append({ name: '', price: 0, mealPlans: [] })}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Room Type
            </Button>
        </div>
    );
};

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
        { name: 'Peak Season', roomTypes: [{ name: 'Deluxe Room', price: 10000, mealPlans: [{name: 'Breakfast (CP)', price: 1500}] }] }
      ]
    },
  });

  const { fields: seasonFields, append: appendSeason, remove: removeSeason } = useFieldArray({
    control: form.control,
    name: "seasons"
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
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Add New Hotel</CardTitle>
        <CardDescription>
          Enter the hotel details including seasons, rooms, and meal plans.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
            <Separator />
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Seasons & Pricing</h3>
                {seasonFields.map((seasonField, seasonIndex) => (
                    <Card key={seasonField.id} className="p-4 border-2">
                         <div className="flex justify-between items-center mb-4">
                            <FormField
                                control={form.control}
                                name={`seasons.${seasonIndex}.name`}
                                render={({ field }) => (
                                    <FormItem className="flex-grow">
                                    <FormLabel>Season Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Peak Season (Oct - Mar)" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <Button type="button" variant="ghost" size="icon" className="text-destructive mt-8 ml-2" onClick={() => removeSeason(seasonIndex)}>
                                <Trash2 className="h-5 w-5" />
                            </Button>
                        </div>

                        <RoomTypeArray control={form.control} seasonIndex={seasonIndex} />
                    </Card>
                ))}
                 <Button type="button" variant="outline" onClick={() => appendSeason({ name: '', roomTypes: [{ name: '', price: 0, mealPlans:[] }] })}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Season
                </Button>
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
