
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
import { Textarea } from '@/components/ui/textarea';

type Attribute = {
  id: string;
  name: string;
  values: string[];
};

const initialAttributes: Attribute[] = [
  { id: 'attr1', name: 'Color', values: ['Red', 'Green', 'Blue', 'Black', 'White'] },
  { id: 'attr2', name: 'Size', values: ['S', 'M', 'L', 'XL', 'XXL'] },
  { id: 'attr3', name: 'Material', values: ['Cotton', 'Polyester', 'Leather', 'Metal'] },
];

export function AttributesForm() {
  const { toast } = useToast();
  const [attributes, setAttributes] = React.useState<Attribute[]>(initialAttributes);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newAttributeName, setNewAttributeName] = React.useState('');
  const [newAttributeValues, setNewAttributeValues] = React.useState('');

  const handleAddAttribute = () => {
    if (!newAttributeName.trim() || !newAttributeValues.trim()) {
      toast({
        variant: 'destructive',
        title: 'Missing Information',
        description: 'Attribute name and at least one value are required.',
      });
      return;
    }

    const newAttribute: Attribute = {
      id: `attr-${Date.now()}`,
      name: newAttributeName.trim(),
      values: newAttributeValues.split(',').map(v => v.trim()).filter(Boolean),
    };

    setAttributes(prev => [...prev, newAttribute]);
    toast({ title: 'Attribute Added', description: `Successfully added the "${newAttribute.name}" attribute.` });

    setNewAttributeName('');
    setNewAttributeValues('');
    setIsDialogOpen(false);
  };

  const handleDeleteAttribute = (id: string) => {
    setAttributes(prev => prev.filter(attr => attr.id !== id));
    toast({ title: 'Attribute Removed' });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Product Attributes</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Attribute
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Attribute</DialogTitle>
              <DialogDescription>
                Define a new attribute and its possible values.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="attr-name" className="text-right">Name</Label>
                <Input
                  id="attr-name"
                  value={newAttributeName}
                  onChange={e => setNewAttributeName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Color"
                />
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="attr-values" className="text-right pt-2">Values</Label>
                <Textarea
                  id="attr-values"
                  value={newAttributeValues}
                  onChange={e => setNewAttributeValues(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Red, Green, Blue"
                />
              </div>
               <p className="col-start-2 col-span-3 text-xs text-muted-foreground -mt-2">
                Enter comma-separated values.
              </p>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <Button onClick={handleAddAttribute}>Add Attribute</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Manage Attributes</CardTitle>
          <CardDescription>
            Define attributes like color, size, or material to create product variations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Attribute Name</TableHead>
                  <TableHead>Values</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attributes.map(attr => (
                  <TableRow key={attr.id}>
                    <TableCell className="font-medium">{attr.name}</TableCell>
                    <TableCell className="text-muted-foreground">{attr.values.join(', ')}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteAttribute(attr.id)}
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
        </CardContent>
      </Card>
    </div>
  );
}
