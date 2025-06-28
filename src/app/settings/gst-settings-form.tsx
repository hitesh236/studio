'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type GstRate = {
  id: number;
  rate: number;
};

const initialGstRates: GstRate[] = [
  { id: 1, rate: 0 },
  { id: 2, rate: 5 },
  { id: 3, rate: 12 },
  { id: 4, rate: 18 },
  { id: 5, rate: 28 },
];

export function GstSettingsForm() {
  const { toast } = useToast();
  const [gstRates, setGstRates] = React.useState<GstRate[]>(initialGstRates);
  const [newRate, setNewRate] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleAddGst = () => {
    const rateValue = parseFloat(newRate);
    if (isNaN(rateValue) || rateValue < 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid Rate',
        description: 'Please enter a valid, non-negative number.',
      });
      return;
    }

    if (gstRates.some(r => r.rate === rateValue)) {
      toast({
        variant: 'destructive',
        title: 'Duplicate Rate',
        description: `GST rate ${rateValue}% already exists.`,
      });
      return;
    }

    setGstRates(prevRates => [
      ...prevRates,
      { id: Date.now(), rate: rateValue },
    ].sort((a, b) => a.rate - b.rate));

    toast({
      title: 'GST Rate Added',
      description: `Successfully added ${rateValue}% GST rate.`,
    });

    setNewRate('');
    setIsDialogOpen(false);
  };

  const handleDeleteGst = (id: number) => {
    setGstRates(prevRates => prevRates.filter(r => r.id !== id));
    toast({
      title: 'GST Rate Removed',
      description: 'The GST rate has been successfully removed.',
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">GST Settings</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2" />
              Add New GST Rate
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New GST Rate</DialogTitle>
              <DialogDescription>
                Enter the new GST percentage you want to add.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gst-rate" className="text-right">
                  Rate (%)
                </Label>
                <Input
                  id="gst-rate"
                  type="number"
                  value={newRate}
                  onChange={e => setNewRate(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g. 18"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddGst}>Add Rate</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Available GST Rates</CardTitle>
          <CardDescription>
            Manage the GST rates used across your invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">Rate (%)</TableHead>
                  <TableHead className="text-right">CGST (%)</TableHead>
                  <TableHead className="text-right">SGST (%)</TableHead>
                  <TableHead className="text-right">IGST (%)</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gstRates.map(({ id, rate }) => (
                  <TableRow key={id}>
                    <TableCell className="text-right font-medium">{rate.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{(rate / 2).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{(rate / 2).toFixed(2)}</TableCell>
                    <TableCell className="text-right">{rate.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteGst(id)}
                        disabled={initialGstRates.some(initial => initial.rate === rate)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
           <p className="text-xs text-muted-foreground mt-2">
            Standard GST rates (0%, 5%, 12%, 18%, 28%) cannot be deleted.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
