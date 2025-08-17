
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Edit, Shield, ShieldOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { initialSimpleUnits, initialCompoundUnits, type SimpleUnit, type CompoundUnit } from '@/lib/uom-data';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';


const SimpleUnitDialog = ({ onSave, editingUnit }: { onSave: (unit: Omit<SimpleUnit, 'id' | 'status'>) => void, editingUnit?: SimpleUnit | null }) => {
    const [name, setName] = React.useState('');
    const [abbreviation, setAbbreviation] = React.useState('');
    const isEditing = !!editingUnit;

    React.useEffect(() => {
        if(isEditing) {
            setName(editingUnit.name);
            setAbbreviation(editingUnit.abbreviation);
        } else {
            setName('');
            setAbbreviation('');
        }
    }, [editingUnit, isEditing]);

    const handleSave = () => {
        if (name.trim() && abbreviation.trim()) {
            onSave({ name: name.trim(), abbreviation: abbreviation.trim() });
        }
    };
    
    return (
        <>
            <DialogHeader>
                <DialogTitle>{isEditing ? 'Edit' : 'Create'} Simple Unit</DialogTitle>
                <DialogDescription>
                    A simple unit is a basic measurement like "Piece", "Kilogram", or "Box".
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="space-y-2">
                    <Label htmlFor="simple-name">Unit Name</Label>
                    <Input id="simple-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Pieces" />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="simple-abbr">Abbreviation</Label>
                    <Input id="simple-abbr" value={abbreviation} onChange={e => setAbbreviation(e.target.value)} placeholder="e.g., pcs" />
                </div>
            </div>
            <DialogFooter>
                 <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleSave}>Save Unit</Button>
            </DialogFooter>
        </>
    )
}

const CompoundUnitDialog = ({ simpleUnits, onSave }: { simpleUnits: SimpleUnit[], onSave: (unit: Omit<CompoundUnit, 'id'>) => void }) => {
    const [firstUnitId, setFirstUnitId] = React.useState<string | undefined>(undefined);
    const [secondUnitId, setSecondUnitId] = React.useState<string | undefined>(undefined);
    const [conversion, setConversion] = React.useState('');

    const handleSave = () => {
        const factor = parseFloat(conversion);
        if (firstUnitId && secondUnitId && !isNaN(factor) && factor > 0) {
            const firstUnit = simpleUnits.find(u => u.id === firstUnitId);
            const secondUnit = simpleUnits.find(u => u.id === secondUnitId);
            if (firstUnit && secondUnit) {
                 onSave({ firstUnit, secondUnit, conversion: factor });
            }
        }
    };
    
    const activeSimpleUnits = simpleUnits.filter(u => u.status !== 'disabled');

    return (
        <>
            <DialogHeader>
                <DialogTitle>Create Compound Unit</DialogTitle>
                <DialogDescription>
                    A compound unit defines a relationship, like "a dozen contains 12 pieces".
                </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
                <div className="flex items-end gap-2">
                     <div className="flex-1 space-y-2">
                        <Label>First Unit</Label>
                        <Select onValueChange={setFirstUnitId} value={firstUnitId}>
                            <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                            <SelectContent>
                                {activeSimpleUnits.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <span className="pb-2 text-muted-foreground">=</span>
                    <div className="flex-1 space-y-2">
                        <Label>Conversion</Label>
                        <Input type="number" value={conversion} onChange={e => setConversion(e.target.value)} placeholder="e.g., 12" />
                    </div>
                     <div className="flex-1 space-y-2">
                        <Label>Second Unit</Label>
                         <Select onValueChange={setSecondUnitId} value={secondUnitId}>
                            <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                            <SelectContent>
                                {activeSimpleUnits.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <DialogFooter>
                 <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleSave}>Save Unit</Button>
            </DialogFooter>
        </>
    )
}

export function UomManagement() {
  const { toast } = useToast();
  const [simpleUnits, setSimpleUnits] = React.useState<SimpleUnit[]>(initialSimpleUnits);
  const [compoundUnits, setCompoundUnits] = React.useState<CompoundUnit[]>(initialCompoundUnits);
  
  const [dialogContent, setDialogContent] = React.useState<'simple' | 'compound' | null>(null);
  const [editingSimpleUnit, setEditingSimpleUnit] = React.useState<SimpleUnit | null>(null);

  const handleOpenDialog = (type: 'simple' | 'compound', editingUnit?: SimpleUnit) => {
    setEditingSimpleUnit(editingUnit || null);
    setDialogContent(type);
  };
  
  const handleCloseDialog = () => {
    setDialogContent(null);
    setEditingSimpleUnit(null);
  };

  const handleSaveSimple = (unitData: Omit<SimpleUnit, 'id' | 'status'>) => {
    if (editingSimpleUnit) {
        setSimpleUnits(prev => prev.map(u => u.id === editingSimpleUnit.id ? { ...editingSimpleUnit, ...unitData } : u));
        toast({ title: 'Unit Updated' });
    } else {
        if(simpleUnits.some(u => u.name.toLowerCase() === unitData.name.toLowerCase() || u.abbreviation.toLowerCase() === unitData.abbreviation.toLowerCase())) {
            toast({ variant: 'destructive', title: 'Unit already exists.'});
            return;
        }
        const newUnit: SimpleUnit = { ...unitData, id: unitData.abbreviation.toLowerCase(), status: 'active' };
        setSimpleUnits(prev => [...prev, newUnit]);
        toast({ title: 'Simple Unit Added' });
    }
    handleCloseDialog();
  };

  const handleSaveCompound = (unitData: Omit<CompoundUnit, 'id'>) => {
    const newUnit = { ...unitData, id: `${unitData.firstUnit.id}-${unitData.secondUnit.id}-${unitData.conversion}` };
    if(compoundUnits.some(u => u.id === newUnit.id)) {
        toast({ variant: 'destructive', title: 'Compound unit already exists.'});
        return;
    }
    setCompoundUnits(prev => [...prev, newUnit]);
    toast({ title: 'Compound Unit Added' });
    handleCloseDialog();
  };

  const handleDeleteSimple = (id: string) => {
    setSimpleUnits(prev => prev.filter(u => u.id !== id));
    toast({ title: 'Simple Unit Deleted' });
  };
  
  const handleDeleteCompound = (id: string) => {
    setCompoundUnits(prev => prev.filter(u => u.id !== id));
    toast({ title: 'Compound Unit Deleted' });
  };

  const handleToggleStatus = (id: string) => {
    setSimpleUnits(prev => prev.map(unit => {
      if (unit.id === id) {
        const newStatus = unit.status === 'disabled' ? 'active' : 'disabled';
        toast({ title: `Unit ${newStatus === 'active' ? 'Enabled' : 'Disabled'}`, description: `${unit.name} is now ${newStatus}.` });
        return { ...unit, status: newStatus };
      }
      return unit;
    }));
  };

  return (
    <div className="space-y-6">
      <Dialog open={dialogContent !== null} onOpenChange={(open) => !open && handleCloseDialog()}>
          <DialogContent>
            {dialogContent === 'simple' && <SimpleUnitDialog onSave={handleSaveSimple} editingUnit={editingSimpleUnit} />}
            {dialogContent === 'compound' && <CompoundUnitDialog simpleUnits={simpleUnits} onSave={handleSaveCompound} />}
          </DialogContent>
      </Dialog>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Simple Units</CardTitle>
            <CardDescription>
              Basic units of measurement (e.g., pcs, kg, m).
            </CardDescription>
          </div>
           <Button onClick={() => handleOpenDialog('simple')}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Simple Unit
            </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-2 px-3">Unit Name</TableHead>
                  <TableHead className="py-2 px-3">Abbreviation</TableHead>
                  <TableHead className="text-right py-2 px-3">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {simpleUnits.map(unit => (
                    <TableRow key={unit.id} className={cn(unit.status === 'disabled' && 'text-muted-foreground opacity-60')}>
                        <TableCell className="font-medium py-2 px-3">{unit.name}</TableCell>
                        <TableCell className="py-2 px-3">{unit.abbreviation}</TableCell>
                        <TableCell className="text-right py-2 px-3 space-x-2">
                           <Switch
                                checked={unit.status !== 'disabled'}
                                onCheckedChange={() => handleToggleStatus(unit.id)}
                                aria-label={`Toggle ${unit.name}`}
                                className="h-5 w-9 data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0 [&>span]:h-4 [&>span]:w-4"
                           />
                           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog('simple', unit)}>
                               <Edit className="h-4 w-4" />
                           </Button>
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteSimple(unit.id)}>
                               <Trash2 className="h-4 w-4" />
                           </Button>
                        </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
       <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Compound Units</CardTitle>
            <CardDescription>
              Units defined by their relation to simple units (e.g., 1 Dozen = 12 Pieces).
            </CardDescription>
          </div>
          <Button onClick={() => handleOpenDialog('compound')}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Compound Unit
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="py-2 px-3">Conversion Rate</TableHead>
                  <TableHead className="text-right py-2 px-3">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {compoundUnits.map(unit => (
                    <TableRow key={unit.id}>
                        <TableCell className="font-medium font-mono text-base py-2 px-3">
                            1 {unit.firstUnit.name} = {unit.conversion} {unit.secondUnit.name}
                        </TableCell>
                         <TableCell className="text-right py-2 px-3">
                           <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteCompound(unit.id)}>
                               <Trash2 className="h-4 w-4" />
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
