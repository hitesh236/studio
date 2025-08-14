
'use client';

import * as React from 'react';
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
import { PlusCircle, Trash2, Edit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

type Attribute = {
  id: string;
  name: string;
  dataType: 'Text' | 'Text Area' | 'Number' | 'Date';
  isSearchable: boolean;
  isFilterable: boolean;
};

const initialAttributes: Record<string, Attribute[]> = {
  cosmetics: [
    { id: 'attr-cos-1', name: 'Shade Name', dataType: 'Text', isSearchable: true, isFilterable: false },
    { id: 'attr-cos-2', name: 'Ingredients', dataType: 'Text Area', isSearchable: false, isFilterable: false },
    { id: 'attr-cos-3', name: 'colr', dataType: 'Text', isSearchable: true, isFilterable: false },
  ],
  apparel: [
    { id: 'attr-app-1', name: 'Size', dataType: 'Text', isSearchable: true, isFilterable: true },
    { id: 'attr-app-2', name: 'Color', dataType: 'Text', isSearchable: true, isFilterable: true },
    { id: 'attr-app-3', name: 'Material', dataType: 'Text Area', isSearchable: false, isFilterable: true },
  ],
  'motor-parts': [
    { id: 'attr-mot-1', name: 'Part Number', dataType: 'Text', isSearchable: true, isFilterable: false },
    { id: 'attr-mot-2', name: 'OEM', dataType: 'Text', isSearchable: true, isFilterable: true },
  ],
};

const AttributeDialog = ({
  attribute,
  onSave,
  children,
}: {
  attribute?: Attribute | null;
  onSave: (attr: Omit<Attribute, 'id'>) => void;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [name, setName] = React.useState(attribute?.name || '');
  const [dataType, setDataType] = React.useState<Attribute['dataType']>(attribute?.dataType || 'Text');
  const [isSearchable, setIsSearchable] = React.useState(attribute?.isSearchable || false);
  const [isFilterable, setIsFilterable] = React.useState(attribute?.isFilterable || false);

  React.useEffect(() => {
    if (isOpen) {
      setName(attribute?.name || '');
      setDataType(attribute?.dataType || 'Text');
      setIsSearchable(attribute?.isSearchable || false);
      setIsFilterable(attribute?.isFilterable || false);
    }
  }, [isOpen, attribute]);

  const handleSave = () => {
    onSave({ name, dataType, isSearchable, isFilterable });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{attribute ? 'Edit' : 'Add'} Attribute</DialogTitle>
          <DialogDescription>
            {attribute ? 'Edit the details of this attribute.' : 'Define a new attribute for this category.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="data-type" className="text-right">Data Type</Label>
            <Select value={dataType} onValueChange={(value: Attribute['dataType']) => setDataType(value)}>
                <SelectTrigger id="data-type" className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="Text">Text</SelectItem>
                    <SelectItem value="Text Area">Text Area</SelectItem>
                    <SelectItem value="Number">Number</SelectItem>
                    <SelectItem value="Date">Date</SelectItem>
                </SelectContent>
            </Select>
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Searchable</Label>
            <Switch checked={isSearchable} onCheckedChange={setIsSearchable} />
          </div>
           <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Filterable</Label>
            <Switch checked={isFilterable} onCheckedChange={setIsFilterable} />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


export function AttributesTable({ category }: { category: { id: string; name: string } }) {
  const { toast } = useToast();
  const [attributes, setAttributes] = React.useState<Attribute[]>(initialAttributes[category.id] || []);

  const handleAddAttribute = (newAttrData: Omit<Attribute, 'id'>) => {
    if (!newAttrData.name.trim()) {
        toast({ variant: 'destructive', title: 'Attribute name is required.' });
        return;
    }
    const newAttribute: Attribute = { ...newAttrData, id: `attr-${Date.now()}` };
    setAttributes(prev => [...prev, newAttribute]);
    toast({ title: 'Attribute Added', description: `Successfully added "${newAttribute.name}".` });
  };

  const handleEditAttribute = (id: string) => (updatedAttrData: Omit<Attribute, 'id'>) => {
    if (!updatedAttrData.name.trim()) {
        toast({ variant: 'destructive', title: 'Attribute name is required.' });
        return;
    }
    setAttributes(prev => prev.map(attr => attr.id === id ? { ...attr, ...updatedAttrData } : attr));
    toast({ title: 'Attribute Updated', description: `Successfully updated "${updatedAttrData.name}".` });
  };

  const handleDeleteAttribute = (id: string) => {
    setAttributes(prev => prev.filter(attr => attr.id !== id));
    toast({ title: 'Attribute Removed' });
  };
  
  const BooleanBadge = ({ value }: { value: boolean }) => (
    <Badge variant={value ? 'default' : 'destructive'} className={value ? 'bg-green-600' : 'bg-red-600'}>
      {value ? 'Yes' : 'No'}
    </Badge>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">
          Attributes for: <span className="text-primary">{category.name}</span>
        </h2>
        <AttributeDialog onSave={handleAddAttribute}>
             <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Attribute
            </Button>
        </AttributeDialog>
      </div>
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="p-2 h-10">Attribute Name</TableHead>
              <TableHead className="p-2 h-10">Data Type</TableHead>
              <TableHead className="p-2 h-10">Searchable</TableHead>
              <TableHead className="p-2 h-10">Filterable</TableHead>
              <TableHead className="text-center p-2 h-10">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attributes.length > 0 ? attributes.map(attr => (
              <TableRow key={attr.id}>
                <TableCell className="font-medium p-2">{attr.name}</TableCell>
                <TableCell className="p-2">{attr.dataType}</TableCell>
                <TableCell className="p-2"><BooleanBadge value={attr.isSearchable} /></TableCell>
                <TableCell className="p-2"><BooleanBadge value={attr.isFilterable} /></TableCell>
                <TableCell className="text-center space-x-1 p-2">
                  <AttributeDialog attribute={attr} onSave={handleEditAttribute(attr.id)}>
                    <Button variant="ghost" size="icon" className="text-blue-600 hover:text-blue-700">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  </AttributeDialog>
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
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center p-2">No attributes found for this category.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
