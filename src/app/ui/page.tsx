
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import {
  Mail,
  PlusCircle,
  Save,
  Check,
  ChevronsUpDown,
  Calendar as CalendarIcon,
  Loader2,
  User,
  AtSign,
  KeyRound,
  Bell,
  Palette,
  ThumbsUp,
  CreditCard,
  FileText,
  FileSpreadsheet,
  Settings,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

const FormSchema = z.object({
  textInput: z.string().min(1, 'This field is required.'),
  emailInput: z.string().email(),
  datePicker: z.date(),
  select: z.string().min(1, 'Please make a selection.'),
  combobox: z.string().min(1, 'Please select a language.'),
  itemSelect: z.string().min(1, 'Please select an item.'),
  checkbox: z.boolean(),
  radioGroup: z.enum(['option-one', 'option-two']),
  switch: z.boolean(),
  slider: z.array(z.number()).min(1),
  textarea: z.string().min(10, 'Please enter at least 10 characters.'),
});

type FormValues = z.infer<typeof FormSchema>;

const languages = [
    { label: "English", value: "en" },
    { label: "French", value: "fr" },
    { label: "German", value: "de" },
    { label: "Spanish", value: "es" },
    { label: "Portuguese", value: "pt" },
    { label: "Russian", value: "ru" },
    { label: "Japanese", value: "ja" },
    { label: "Korean", value: "ko" },
    { label: "Chinese", value: "zh" },
] as const

const timelineEvents = [
  {
    icon: User,
    title: 'New User Registration',
    description: 'John Doe created an account and was assigned the "Accountant" role.',
    time: '2 days ago',
  },
  {
    icon: FileText,
    title: 'Invoice #INV-001 Created',
    description: 'An invoice for $2,500 was sent to Solutions Corp.',
    time: 'Yesterday at 4:30 PM',
  },
  {
    icon: CreditCard,
    title: 'Payment Received',
    description: 'Received a partial payment of $1,250 for invoice #INV-001.',
    time: 'Today at 9:15 AM',
  },
  {
    icon: FileSpreadsheet,
    title: 'GSTR-1 Report Generated',
    description: 'The report for Q3 2024 is ready for review and filing.',
    time: 'Today at 11:00 AM',
  },
  {
    icon: Settings,
    title: 'Company Settings Updated',
    description: 'Jane Smith updated the primary business address.',
    time: 'Today at 11:45 AM',
  },
];

const WizardForm = () => {
    const { toast } = useToast();
    const [step, setStep] = React.useState(1);
    const [direction, setDirection] = React.useState(1);

    const [formData, setFormData] = React.useState({
        name: '',
        email: '',
        username: '',
        notifications: true,
        color: 'blue'
    });
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({...prev, notifications: checked }));
    }
  
    const handleRadioChange = (value: string) => {
         setFormData(prev => ({...prev, color: value }));
    }
  
    const nextStep = () => {
      setDirection(1);
      setStep((prev) => Math.min(prev + 1, 4));
    }
    const prevStep = () => {
      setDirection(-1);
      setStep((prev) => Math.max(prev - 1, 1));
    }
  
    const handleSubmit = () => {
      toast({
        title: 'Wizard Submitted!',
        description: 'Your account has been created.',
      });
      setStep(1); // Reset to first step
    };
  
    const STEPS = [
      <div className="space-y-4" key="step1">
        <h3 className="text-lg font-medium">Personal Information</h3>
        <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} />
        </div>
         <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" placeholder="john.doe@example.com" value={formData.email} onChange={handleChange} />
        </div>
      </div>,
      <div className="space-y-4" key="step2">
         <h3 className="text-lg font-medium">Account Details</h3>
         <div className="space-y-2">
            <Label htmlFor="username">Choose Username</Label>
            <Input id="username" name="username" placeholder="johndoe" value={formData.username} onChange={handleChange} />
        </div>
         <div className="space-y-2">
            <Label htmlFor="password">Create Password</Label>
            <Input id="password" name="password" type="password" />
        </div>
      </div>,
      <div className="space-y-4" key="step3">
        <h3 className="text-lg font-medium">Preferences</h3>
         <div className="flex items-center justify-between rounded-lg border p-4">
            <Label htmlFor="notifications" className="flex flex-col space-y-1">
                <span>Email Notifications</span>
                <span className="font-normal leading-snug text-muted-foreground">
                    Receive important updates via email.
                </span>
            </Label>
            <Switch id="notifications" checked={formData.notifications} onCheckedChange={handleSwitchChange} />
        </div>
        <div className="space-y-2">
            <Label>Profile Color</Label>
            <RadioGroup value={formData.color} onValueChange={handleRadioChange} className="grid grid-cols-3 gap-4">
                {(['Blue', 'Green', 'Red'] as const).map(color => (
                    <div key={color}>
                        <RadioGroupItem value={color.toLowerCase()} id={color.toLowerCase()} className="peer sr-only" />
                        <Label htmlFor={color.toLowerCase()} className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                           {color}
                        </Label>
                    </div>
                ))}
            </RadioGroup>
        </div>
      </div>,
      <div className="text-center space-y-4 flex flex-col items-center justify-center h-[200px]" key="step4">
         <ThumbsUp className="h-12 w-12 text-primary" />
        <h3 className="text-xl font-semibold">You're all set!</h3>
        <p className="text-muted-foreground">
            Thank you for setting up your account. Click submit to finalize.
        </p>
      </div>,
    ];
  
    return (
      <Card>
        <CardHeader>
          <CardTitle>Wizard Form</CardTitle>
          <CardDescription>A multi-step form with animated transitions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-sm font-medium">Step {step} of 4</div>
            <Progress value={step * 25} className="flex-1" />
          </div>
          <div className="relative overflow-x-hidden min-h-[250px]">
             <AnimatePresence custom={direction} mode="wait">
                <motion.div
                    key={step}
                    custom={direction}
                    variants={{
                        enter: (direction: number) => ({ x: direction > 0 ? 300 : -300, opacity: 0 }),
                        center: { x: 0, opacity: 1 },
                        exit: (direction: number) => ({ x: direction < 0 ? 300 : -300, opacity: 0 }),
                    }}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                        x: { type: "spring", stiffness: 300, damping: 30 },
                        opacity: { duration: 0.2 }
                    }}
                >
                    {STEPS[step - 1]}
                </motion.div>
             </AnimatePresence>
          </div>
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={prevStep} disabled={step === 1}>
              Previous
            </Button>
            {step < 4 && (
              <Button onClick={nextStep}>
                Next
              </Button>
            )}
            {step === 4 && (
              <Button onClick={handleSubmit}>
                Submit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
};

export default function UiPage() {
    const { toast } = useToast();

    const [items, setItems] = React.useState([
        { id: 'item1', name: 'Sample Item 1' },
        { id: 'item2', name: 'Sample Item 2' },
    ]);
    const [isItemDialogOpen, setIsItemDialogOpen] = React.useState(false);
    const [newItem, setNewItem] = React.useState({ name: '' });

    const form = useForm<FormValues>({
        resolver: zodResolver(FormSchema),
        defaultValues: {
            textInput: '',
            emailInput: '',
            datePicker: new Date(),
            select: '',
            combobox: '',
            itemSelect: '',
            checkbox: false,
            radioGroup: 'option-one',
            switch: false,
            slider: [50],
            textarea: '',
        },
    });

    const handleAddItem = () => {
        if (newItem.name) {
            const newItemData = { ...newItem, id: `item-${Date.now()}` };
            setItems(prev => [...prev, newItemData]);
            form.setValue('itemSelect', newItemData.name);
            toast({ title: 'Item Added', description: `${newItemData.name} has been added.` });
            setIsItemDialogOpen(false);
            setNewItem({ name: '' });
        } else {
            toast({ title: 'Error', description: 'Item Name is required.', variant: 'destructive' });
        }
    }

    function onSubmit(data: FormValues) {
        toast({
            title: "Form Submitted!",
            description: (
                <pre className="mt-2 w-[340px] rounded-md bg-slate-950 p-4">
                    <code className="text-white">{JSON.stringify(data, null, 2)}</code>
                </pre>
            ),
        });
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
            {/* Buttons Showcase */}
            <Card>
                <CardHeader>
                    <CardTitle>Buttons</CardTitle>
                    <CardDescription>A showcase of all button variants and sizes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {(['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const).map(variant => (
                        <div key={variant} className="flex items-center gap-4">
                            <span className="w-24 text-sm font-medium capitalize text-muted-foreground">{variant}</span>
                            <Button variant={variant} size="lg">Large Button</Button>
                            <Button variant={variant}>Default Button</Button>
                            <Button variant={variant} size="sm">Small Button</Button>
                            <Button variant={variant} size="icon"><Mail /></Button>
                            <Button variant={variant} disabled><Loader2 className="animate-spin mr-2" /> Disabled</Button>
                        </div>
                    ))}
                </CardContent>
            </Card>

            {/* Badges Showcase */}
            <Card>
                <CardHeader>
                    <CardTitle>Badges</CardTitle>
                    <CardDescription>A showcase of all badge variants.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                </CardContent>
            </Card>

            {/* Text Colors Showcase */}
            <Card>
                <CardHeader>
                    <CardTitle>Text Colors</CardTitle>
                    <CardDescription>
                        A showcase of theme colors and standard Tailwind colors. Theme colors (e.g., primary, destructive) do not have numeric variants. Standard colors (e.g., blue, green) have shades from 50 to 950.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <p className="font-semibold">General</p>
                        <p className="text-foreground">text-foreground</p>
                        <p className="text-muted-foreground">text-muted-foreground</p>
                        <p className="text-card-foreground">text-card-foreground</p>
                    </div>
                    <div className="space-y-2">
                         <p className="font-semibold">Primary & Secondary</p>
                        <p className="text-primary">text-primary</p>
                        <p className="text-primary-foreground bg-primary p-1 rounded">text-primary-foreground</p>
                        <p className="text-secondary">text-secondary</p>
                    </div>
                    <div className="space-y-2">
                        <p className="font-semibold">Accent & Destructive</p>
                        <p className="text-accent">text-accent</p>
                        <p className="text-destructive">text-destructive</p>
                        <p className="text-destructive-foreground bg-destructive p-1 rounded">text-destructive-foreground</p>
                    </div>
                    <div className="space-y-2">
                        <p className="font-semibold">Standard Palette</p>
                        <p className="text-blue-500">text-blue-500</p>
                        <p className="text-green-600">text-green-600</p>
                        <p className="text-yellow-700">text-yellow-700</p>
                        <p className="text-slate-800">text-slate-800</p>
                    </div>
                </CardContent>
            </Card>

             {/* Cards Showcase */}
            <Card>
                <CardHeader>
                    <CardTitle>Cards</CardTitle>
                    <CardDescription>A showcase of different card styles.</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Basic Card</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>This is the content of a basic card. It's simple and clean.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Full Card</CardTitle>
                            <CardDescription>With header, content, and footer.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>This card demonstrates all available sections for more complex content.</p>
                        </CardContent>
                        <CardFooter className="flex justify-end">
                            <Button>Action</Button>
                        </CardFooter>
                    </Card>
                    <Card className="bg-primary text-primary-foreground">
                        <CardHeader>
                            <CardTitle>Primary Card</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>This card uses the primary theme color to draw attention.</p>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>
            
             {/* Wizard Form Showcase */}
            <WizardForm />

            {/* Form Showcase */}
            <Card>
                <CardHeader>
                    <CardTitle>Form Elements</CardTitle>
                    <CardDescription>A comprehensive form showcasing various input types.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormField control={form.control} name="textInput" render={({ field }) => (
                                    <FormItem><FormLabel>Text Input</FormLabel><FormControl><Input placeholder="Your name" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="emailInput" render={({ field }) => (
                                    <FormItem><FormLabel>Email Input</FormLabel><FormControl><Input type="email" placeholder="your.email@example.com" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="datePicker" render={({ field }) => (
                                    <FormItem className="flex flex-col"><FormLabel>Date Picker</FormLabel><Popover><PopoverTrigger asChild><FormControl>
                                        <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                        </Button>
                                    </FormControl></PopoverTrigger><PopoverContent className="w-auto p-0" align="start"><Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus /></PopoverContent></Popover><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="select" render={({ field }) => (
                                    <FormItem><FormLabel>Select</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select a fruit" /></SelectTrigger></FormControl><SelectContent>
                                        <SelectItem value="apple">Apple</SelectItem><SelectItem value="banana">Banana</SelectItem><SelectItem value="blueberry">Blueberry</SelectItem>
                                    </SelectContent></Select><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="combobox" render={({ field }) => (
                                    <FormItem className="flex flex-col"><FormLabel>Combobox</FormLabel><Popover><PopoverTrigger asChild>
                                        <FormControl><Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                            {field.value ? languages.find((lang) => lang.value === field.value)?.label : "Select language"}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button></FormControl>
                                    </PopoverTrigger><PopoverContent className="w-full p-0"><Command><CommandInput placeholder="Search language..." /><CommandEmpty>No language found.</CommandEmpty><CommandList><CommandGroup>
                                        {languages.map((lang) => (
                                            <CommandItem value={lang.label} key={lang.value} onSelect={() => form.setValue("combobox", lang.value)}>
                                                <Check className={cn("mr-2 h-4 w-4", lang.value === field.value ? "opacity-100" : "opacity-0")}/>
                                                {lang.label}
                                            </CommandItem>
                                        ))}
                                    </CommandGroup></CommandList></Command></PopoverContent></Popover><FormMessage /></FormItem>
                                )}/>
                                <FormField
                                    control={form.control}
                                    name="itemSelect"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Group Input</FormLabel>
                                            <div className="flex items-start gap-2">
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select an item" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {items.map(item => (
                                                            <SelectItem key={item.id} value={item.name}>
                                                                {item.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button type="button" variant="outline" size="icon" className="shrink-0">
                                                            <PlusCircle className="h-4 w-4" />
                                                            <span className="sr-only">Add New Item</span>
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Add New Item</DialogTitle>
                                                            <DialogDescription>
                                                                Quickly add a new item to the list.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="grid gap-4 py-4">
                                                            <div className="grid grid-cols-4 items-center gap-4">
                                                                <Label htmlFor="new-item-name" className="text-right">Name</Label>
                                                                <Input id="new-item-name" value={newItem.name} onChange={(e) => setNewItem({ name: e.target.value })} className="col-span-3" />
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>Cancel</Button>
                                                            <Button onClick={handleAddItem}>Add Item</Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                            <FormDescription>This is a group input field with a popup to add new items.</FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField control={form.control} name="textarea" render={({ field }) => (
                                    <FormItem><FormLabel>Textarea</FormLabel><FormControl><Textarea placeholder="Tell us a little bit about yourself" {...field} /></FormControl><FormMessage /></FormItem>
                                )}/>
                                <FormField control={form.control} name="checkbox" render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"><FormControl>
                                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl><div className="space-y-1 leading-none"><FormLabel>I agree to the terms and conditions</FormLabel></div></FormItem>
                                )}/>
                                <FormField control={form.control} name="radioGroup" render={({ field }) => (
                                    <FormItem className="space-y-3"><FormLabel>Radio Group</FormLabel><FormControl>
                                        <RadioGroup onValueChange={field.onChange} value={field.value} className="flex flex-col space-y-1">
                                            <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="option-one" /></FormControl><FormLabel className="font-normal">Option One</FormLabel></FormItem>
                                            <FormItem className="flex items-center space-x-3 space-y-0"><FormControl><RadioGroupItem value="option-two" /></FormControl><FormLabel className="font-normal">Option Two</FormLabel></FormItem>
                                        </RadioGroup>
                                    </FormControl><FormMessage /></FormItem>
                                )}/>
                                 <FormField control={form.control} name="switch" render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4"><div className="space-y-0.5">
                                        <FormLabel className="text-base">Marketing emails</FormLabel>
                                        <FormDescription>Receive emails about new products, features, and more.</FormDescription>
                                    </div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                                )}/>
                                <FormField control={form.control} name="slider" render={({ field }) => (
                                    <FormItem><FormLabel>Slider</FormLabel><FormControl><Slider value={field.value} max={100} step={1} onValueChange={field.onChange} /></FormControl><FormMessage /></FormItem>
                                )}/>
                            </div>
                            <div className="flex justify-end">
                                <Button type="submit"><Save className="mr-2 h-4 w-4"/> Submit Form</Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Timeline Showcase */}
            <Card>
                <CardHeader>
                    <CardTitle>Timeline</CardTitle>
                    <CardDescription>A vertical timeline to display a sequence of events.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="relative pl-4">
                        {/* The vertical line */}
                        <div className="absolute left-6 top-0 h-full w-0.5 -translate-x-1/2 bg-border" />
                        
                        {timelineEvents.map((event, index) => (
                            <div key={index} className="relative mb-10 flex items-start">
                                {/* The dot and icon */}
                                <div className="absolute left-6 top-0 flex h-12 w-12 -translate-x-1/2 items-center justify-center">
                                    <div className="z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary ring-8 ring-background">
                                        <event.icon className="h-4 w-4 text-primary-foreground" />
                                    </div>
                                </div>
                                <div className="flex-1 pl-16 pt-2.5">
                                    <p className="font-semibold">{event.title}</p>
                                    <p className="text-sm text-muted-foreground">{event.description}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{event.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
