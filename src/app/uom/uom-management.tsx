
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
import { PlusCircle, Trash2, Edit, ChevronDown, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

type UomSubUnit = {
  id: string;
  name: string;
  abbreviation: string;
  conversionFactor: number;
};

type Uom = {
  id: string;
  baseUnit: string;
  subUnits: UomSubUnit[];
};

const initialUomData: Uom[] = [
  {
    id: 'weight',
    baseUnit: 'Weight',
    subUnits: [
      { id: 'kg', name: 'Kilogram', abbreviation: 'kg', conversionFactor: 1 },
      { id: 'g', name: 'Gram', abbreviation: 'g', conversionFactor: 1000 },
      { id: 'mg', name: 'Milligram', abbreviation: 'mg', conversionFactor: 1000000 },
    ],
  },
  {
    id: 'length',
    baseUnit: 'Length',
    subUnits: [
      { id: 'm', name: 'Meter', abbreviation: 'm', conversionFactor: 1 },
      { id: 'cm', name: 'Centimeter', abbreviation: 'cm', conversionFactor: 100 },
      { id: 'in', name: 'Inch', abbreviation: 'in', conversionFactor: 39.37 },
    ],
  },
  {
    id: 'volume',
    baseUnit: 'Volume',
    subUnits: [
      { id: 'l', name: 'Liter', abbreviation: 'l', conversionFactor: 1 },
      { id: 'ml', name: 'Milliliter', abbreviation: 'ml', conversionFactor: 1000 },
    ],
  },
  {
    id: 'quantity',
    baseUnit: 'Quantity',
    subUnits: [
        { id: 'pcs', name: 'Pieces', abbreviation: 'pcs', conversionFactor: 1 },
        { id: 'box', name: 'Box', abbreviation: 'box', conversionFactor: 0.1 },
        { id: 'dozen', name: 'Dozen', abbreviation: 'dz', conversionFactor: 0.0833 },
    ]
  }
];

const AddUomDialog = ({ onSave }: { onSave: (name: string) => void }) => {
    const [name, setName] = React.useState('');
    const [isOpen, setIsOpen] = React.useState(false);

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
            setIsOpen(false);
            setName('');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add New UOM
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Base Unit</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <Label htmlFor="uom-name">Base Unit Name</Label>
                    <Input id="uom-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Area" />
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleSave}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

const SubUnitDialog = ({ 
    baseUnitName, 
    onSave, 
    children, 
    editingSubUnit 
}: { 
    baseUnitName: string, 
    onSave: (subUnit: Omit<UomSubUnit, 'id'>) => void, 
    children: React.ReactNode, 
    editingSubUnit?: UomSubUnit | null 
}) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [name, setName] = React.useState('');
    const [abbreviation, setAbbreviation] = React.useState('');
    const [conversionFactor, setConversionFactor] = React.useState('');
    
    const isEditing = !!editingSubUnit;

    React.useEffect(() => {
        if (isOpen) {
            if (isEditing) {
                setName(editingSubUnit.name);
                setAbbreviation(editingSubUnit.abbreviation);
                setConversionFactor(String(editingSubUnit.conversionFactor));
            } else {
                setName('');
                setAbbreviation('');
                setConversionFactor('');
            }
        }
    }, [isOpen, editingSubUnit, isEditing]);

    const handleSave = () => {
        const factor = parseFloat(conversionFactor);
        if (name.trim() && abbreviation.trim() && !isNaN(factor) && factor > 0) {
            onSave({ name: name.trim(), abbreviation: abbreviation.trim(), conversionFactor: factor });
            setIsOpen(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? `Edit ${editingSubUnit.name}` : `Add Sub-Unit to ${baseUnitName}`}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="sub-name">Unit Name</Label>
                        <Input id="sub-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Square Meter" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="sub-abbr">Abbreviation</Label>
                        <Input id="sub-abbr" value={abbreviation} onChange={e => setAbbreviation(e.target.value)} placeholder="e.g., sq.m" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="sub-factor">Conversion Factor</Label>
                        <Input id="sub-factor" type="number" value={conversionFactor} onChange={e => setConversionFactor(e.target.value)} placeholder={`How many sub-units = 1 ${baseUnitName}`} />
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


export function UomManagement() {
  const { toast } = useToast();
  const [uomData, setUomData] = React.useState<Uom[]>(initialUomData);
  const [openRows, setOpenRows] = React.useState<Set<string>>(new Set(uomData.map(u => u.id)));
  const [editingSubUnit, setEditingSubUnit] = React.useState<{ uomId: string, subUnit: UomSubUnit } | null>(null);

  const handleToggleRow = (id: string) => {
    setOpenRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  const handleAddUom = (name: string) => {
    if (uomData.some(u => u.baseUnit.toLowerCase() === name.toLowerCase())) {
        toast({ title: 'Duplicate Unit', description: 'This base unit already exists.', variant: 'destructive' });
        return;
    }
    const newUom: Uom = {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        baseUnit: name,
        subUnits: [],
    };
    setUomData(prev => [...prev, newUom]);
    toast({ title: 'UOM Added', description: `Successfully added ${name}.` });
  };
  
  const handleAddSubUnit = (uomId: string, subUnit: Omit<UomSubUnit, 'id'>) => {
     setUomData(prev => prev.map(uom => {
        if (uom.id === uomId) {
            if (uom.subUnits.some(s => s.name.toLowerCase() === subUnit.name.toLowerCase())) {
                 toast({ title: 'Duplicate Sub-Unit', description: 'This sub-unit already exists for this base unit.', variant: 'destructive' });
                 return uom;
            }
            const newSubUnit = { ...subUnit, id: subUnit.abbreviation.toLowerCase() };
            return { ...uom, subUnits: [...uom.subUnits, newSubUnit] };
        }
        return uom;
     }));
     toast({ title: 'Sub-Unit Added' });
  };

  const handleEditSubUnit = (uomId: string, subUnitId: string, updatedSubUnitData: Omit<UomSubUnit, 'id'>) => {
    setUomData(prev => prev.map(uom => {
        if (uom.id === uomId) {
            return {
                ...uom,
                subUnits: uom.subUnits.map(sub => 
                    sub.id === subUnitId ? { id: subUnitId, ...updatedSubUnitData } : sub
                )
            };
        }
        return uom;
    }));
    toast({ title: 'Sub-Unit Updated' });
    setEditingSubUnit(null);
  };
  
  const handleDeleteSubUnit = (uomId: string, subUnitId: string) => {
    setUomData(prev => prev.map(uom => {
        if (uom.id === uomId) {
            return { ...uom, subUnits: uom.subUnits.filter(s => s.id !== subUnitId) };
        }
        return uom;
    }));
    toast({ title: 'Sub-Unit Deleted' });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Units of Measurement (UOM)</CardTitle>
          <CardDescription>
            Manage base units and their convertible sub-units.
          </CardDescription>
        </div>
        <AddUomDialog onSave={handleAddUom} />
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead className="w-[200px]">Base Unit</TableHead>
                <TableHead>Sub Units</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {uomData.map(uom => (
                <React.Fragment key={uom.id}>
                  <TableRow className="bg-muted/50 hover:bg-muted/80">
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleToggleRow(uom.id)}>
                        {openRows.has(uom.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </Button>
                    </TableCell>
                    <TableCell className="font-semibold text-base">{uom.baseUnit}</TableCell>
                    <TableCell>
                        <div className="flex flex-wrap gap-2">
                           {uom.subUnits.map(sub => <Badge key={sub.id} variant="secondary">{sub.name} ({sub.abbreviation})</Badge>)}
                        </div>
                    </TableCell>
                    <TableCell className="text-right">
                       <SubUnitDialog 
                         baseUnitName={uom.baseUnit} 
                         onSave={(subUnit) => handleAddSubUnit(uom.id, subUnit)}
                        >
                            <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-3.5 w-3.5" /> Add Sub-Unit</Button>
                       </SubUnitDialog>
                    </TableCell>
                  </TableRow>
                  {openRows.has(uom.id) && (
                      <TableRow>
                          <TableCell colSpan={4} className="p-0">
                               <div className="p-4 bg-background">
                                   <Table>
                                       <TableHeader>
                                           <TableRow>
                                                <TableHead>Unit Name</TableHead>
                                                <TableHead>Abbreviation</TableHead>
                                                <TableHead className="text-right">Conversion Factor</TableHead>
                                                <TableHead className="text-center">Actions</TableHead>
                                           </TableRow>
                                       </TableHeader>
                                       <TableBody>
                                           {uom.subUnits.map(sub => (
                                               <TableRow key={sub.id}>
                                                   <TableCell>{sub.name}</TableCell>
                                                   <TableCell>{sub.abbreviation}</TableCell>
                                                   <TableCell className="text-right font-mono">1 {uom.baseUnit} = {sub.conversionFactor} {sub.abbreviation}</TableCell>
                                                   <TableCell className="text-center">
                                                        <SubUnitDialog 
                                                            baseUnitName={uom.baseUnit}
                                                            editingSubUnit={sub}
                                                            onSave={(updatedSubUnit) => handleEditSubUnit(uom.id, sub.id, updatedSubUnit)}
                                                        >
                                                            <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-4 w-4" /></Button>
                                                        </SubUnitDialog>
                                                       <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDeleteSubUnit(uom.id, sub.id)}><Trash2 className="h-4 w-4" /></Button>
                                                   </TableCell>
                                               </TableRow>
                                           ))}
                                       </TableBody>
                                   </Table>
                               </div>
                          </TableCell>
                      </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
