
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
import { PlusCircle, Trash2, Edit, ChevronDown, ChevronRight, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

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

export function UomManagement() {
  const { toast } = useToast();
  const [uomData, setUomData] = React.useState<Uom[]>(initialUomData);
  const [openRows, setOpenRows] = React.useState<Set<string>>(new Set(uomData.map(u => u.id)));

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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Units of Measurement (UOM)</CardTitle>
          <CardDescription>
            Manage base units and their convertible sub-units.
          </CardDescription>
        </div>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New UOM
        </Button>
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
                       <Button variant="outline" size="sm"><PlusCircle className="mr-2 h-3.5 w-3.5" /> Add Sub-Unit</Button>
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
                                                       <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-4 w-4" /></Button>
                                                       <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-4 w-4" /></Button>
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
