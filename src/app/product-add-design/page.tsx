
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
  Folder,
  Tag,
  PlusCircle,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';

const CategoryNode = ({ name, level, children }: { name: string; level: number; children?: React.ReactNode }) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const hasChildren = React.Children.count(children) > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 py-1.5 px-2 rounded-md hover:bg-muted/50 group"
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
      >
        <div className="flex items-center gap-2 flex-1 cursor-pointer" onClick={() => hasChildren && setIsOpen(!isOpen)}>
          <span className="w-4 h-4">
            {hasChildren && (isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
          </span>
          <Folder className="h-4 w-4 text-amber-500" />
          <span>{name}</span>
        </div>
        <div className="hidden group-hover:flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-7 w-7"><PlusCircle className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7"><Edit2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </div>
      {isOpen && children}
    </div>
  );
};


export default function ProductAddDesignPage() {
  const [isGlobal, setIsGlobal] = React.useState(false);
  const [attributeType, setAttributeType] = React.useState('text');

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
        <div className="text-center">
            <h1 className="text-3xl font-bold">Category and Attribute Management UI</h1>
            <p className="text-muted-foreground">A UI/UX design for managing hierarchical data structures.</p>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Categories Management */}
        <Card>
          <CardHeader>
            <CardTitle>Categories Management</CardTitle>
            <CardDescription>A tree view for hierarchical category relationships.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-2 border rounded-md min-h-[300px]">
                <CategoryNode name="Electronics" level={0}>
                    <CategoryNode name="Mobile Phones" level={1}>
                        <CategoryNode name="Smartphones" level={2} />
                        <CategoryNode name="Feature Phones" level={2} />
                    </CategoryNode>
                    <CategoryNode name="Laptops" level={1} />
                    <CategoryNode name="Accessories" level={1}>
                        <CategoryNode name="Keyboards" level={2} />
                        <CategoryNode name="Mice" level={2} />
                    </CategoryNode>
                </CategoryNode>
                <CategoryNode name="Apparel" level={0}>
                     <CategoryNode name="Men" level={1}>
                        <CategoryNode name="Tops" level={2}>
                            <CategoryNode name="T-Shirts" level={3} />
                            <CategoryNode name="Shirts" level={3} />
                        </CategoryNode>
                        <CategoryNode name="Bottoms" level={2}>
                            <CategoryNode name="Jeans" level={3} />
                            <CategoryNode name="Trousers" level={3} />
                        </CategoryNode>
                     </CategoryNode>
                     <CategoryNode name="Women" level={1}>
                        <CategoryNode name="Tops" level={2} />
                        <CategoryNode name="Bottoms" level={2} />
                     </CategoryNode>
                </CategoryNode>
                <CategoryNode name="Furniture" level={0} />
            </div>
             <div className="mt-4 flex justify-end">
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Root Category</Button>
            </div>
          </CardContent>
        </Card>

        {/* Attributes Management */}
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Attributes Management</CardTitle>
                    <CardDescription>A table displaying all attributes and their assignments.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Attribute Name</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Assigned To</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">Color</TableCell>
                                    <TableCell>Dropdown</TableCell>
                                    <TableCell><Badge variant="secondary">Global</Badge></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Size</TableCell>
                                    <TableCell>Dropdown</TableCell>
                                    <TableCell><Badge>Apparel</Badge></TableCell>
                                </TableRow>
                                 <TableRow>
                                    <TableCell className="font-medium">Screen Size</TableCell>
                                    <TableCell>Text</TableCell>
                                    <TableCell><Badge>Electronics</Badge></TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Attribute Form</CardTitle>
                    <CardDescription>Form for creating or editing an attribute.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="attr-name">Attribute Name</Label>
                        <Input id="attr-name" placeholder="e.g., Color" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="attr-type">Attribute Type</Label>
                        <Select value={attributeType} onValueChange={setAttributeType}>
                            <SelectTrigger id="attr-type"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="text">Text</SelectItem>
                                <SelectItem value="dropdown">Dropdown</SelectItem>
                                <SelectItem value="checkbox">Checkbox</SelectItem>
                                <SelectItem value="date">Date</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {attributeType === 'dropdown' && (
                         <div className="space-y-2">
                            <Label htmlFor="attr-options">Options</Label>
                            <Input id="attr-options" placeholder="Enter comma-separated values (e.g., Red, Green, Blue)" />
                         </div>
                    )}

                    <Separator />
                    
                    <div className="space-y-4">
                        <h4 className="font-medium">Assignment</h4>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div>
                                <Label htmlFor="global-toggle">Global Attribute</Label>
                                <p className="text-xs text-muted-foreground">Apply this attribute to all categories.</p>
                            </div>
                            <Switch id="global-toggle" checked={isGlobal} onCheckedChange={setIsGlobal} />
                        </div>

                        {!isGlobal && (
                            <div className="space-y-2">
                                <Label>Assign to Specific Categories</Label>
                                <Input disabled placeholder="Multi-select dropdown would be here" />
                            </div>
                        )}
                         <div className="space-y-2">
                            <Label>Block Inheritance from Categories (Optional)</Label>
                            <Input disabled placeholder="Multi-select for categories to block" />
                             <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Info className="h-3 w-3" /> Child categories will not inherit this attribute if their parent is selected here.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Empty State Showcase */}
        <Card>
            <CardHeader>
                <CardTitle>Empty States</CardTitle>
                <CardDescription>Visuals for when no data is present.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-8 border rounded-lg flex flex-col items-center justify-center">
                    <img src="https://placehold.co/200x150.png" data-ai-hint="empty state illustration" alt="No Categories" className="mb-4" />
                    <h3 className="font-semibold">No Categories Yet</h3>
                    <p className="text-sm text-muted-foreground">Start by adding a root category.</p>
                    <Button size="sm" className="mt-4">Add Category</Button>
                </div>
                <div className="text-center p-8 border rounded-lg flex flex-col items-center justify-center">
                     <img src="https://placehold.co/200x150.png" data-ai-hint="empty state illustration" alt="No Attributes" className="mb-4" />
                    <h3 className="font-semibold">No Attributes Found</h3>
                    <p className="text-sm text-muted-foreground">Create your first attribute to begin.</p>
                    <Button size="sm" className="mt-4">Add Attribute</Button>
                </div>
            </CardContent>
        </Card>
        
         <div className="fixed bottom-8 right-8 z-50">
            <Button className="rounded-full shadow-lg h-14 w-14">
                <PlusCircle className="h-6 w-6" />
                 <span className="sr-only">Add Attribute</span>
            </Button>
        </div>
      </div>
    </div>
  );
}
