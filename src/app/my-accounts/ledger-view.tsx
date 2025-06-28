'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChevronRight, ChevronDown, PlusCircle, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export type Ledger = {
  id: string;
  name: string;
  type: 'group' | 'ledger';
  balance?: number;
  position?: number;
  children?: Ledger[];
};

interface LedgerViewProps {
  data: Ledger[];
}

const LedgerEntry = ({ ledger, level, onEdit, reportType }: { ledger: Ledger; level: number; onEdit: (ledger: Ledger) => void; reportType: 'Balance Sheet' | 'Profit & Loss' | null }) => {
  const [isOpen, setIsOpen] = useState(level < 2);
  const hasChildren = ledger.children && ledger.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          'flex items-center justify-between py-1 px-2 rounded-md hover:bg-muted/50 group',
          hasChildren && 'cursor-pointer'
        )}
        style={{ paddingLeft: `${level * 1 + 0.5}rem` }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2 flex-1">
          {hasChildren ? (
            <span className="w-4 h-4">
                {isOpen ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
            </span>
          ) : (
            <div className="w-4 h-4" />
          )}
          <span className={cn("font-medium text-sm", level === 0 && "font-semibold")}>{ledger.name}</span>
          {ledger.type === 'group' && reportType && (
            <Badge variant="outline" className="font-normal text-xs">{reportType}</Badge>
          )}
        </div>
        <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
                e.stopPropagation();
                onEdit(ledger);
            }}
        >
            <Pencil className="h-4 w-4" />
        </Button>
      </div>
      {hasChildren && isOpen && (
        <div>
          {ledger.children?.sort((a, b) => (a.position ?? Number.MAX_SAFE_INTEGER) - (b.position ?? Number.MAX_SAFE_INTEGER)).map((child) => (
            <LedgerEntry key={child.id} ledger={child} level={level + 1} onEdit={onEdit} reportType={reportType} />
          ))}
        </div>
      )}
    </div>
  );
};

export function LedgerView({ data }: LedgerViewProps) {
  const [ledgers, setLedgers] = useState<Ledger[]>(data);

  // State for Create Dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountPosition, setNewAccountPosition] = useState('');
  const [newAccountType, setNewAccountType] = useState<'primary' | 'subgroup'>('primary');
  const [newSelectedParent, setNewSelectedParent] = useState<string | null>(null);
  
  // State for Edit Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLedger, setEditingLedger] = useState<Ledger | null>(null);
  const [editAccountName, setEditAccountName] = useState('');
  const [editAccountPosition, setEditAccountPosition] = useState('');
  const [editAccountType, setEditAccountType] = useState<'primary' | 'subgroup'>('primary');
  const [editSelectedParent, setEditSelectedParent] = useState<string | null>(null);

  const getFlattenedGroups = (nodes: Ledger[], level = 0): { id: string; name: string }[] => {
    let groups: { id: string; name: string }[] = [];
    for (const node of nodes) {
        if (node.type === 'group') {
            groups.push({ id: node.id, name: `${'—'.repeat(level)} ${node.name}` });
            if (node.children) {
                groups = groups.concat(getFlattenedGroups(node.children, level + 1));
            }
        }
    }
    return groups;
  }
  
  const allGroups = useMemo(() => getFlattenedGroups(ledgers), [ledgers]);

  const getDescendantIds = (node: Ledger): string[] => {
    if (!node.children || node.children.length === 0) return [];
    let ids: string[] = [];
    for (const child of node.children) {
        ids.push(child.id);
        ids = ids.concat(getDescendantIds(child));
    }
    return ids;
  }

  const findNode = (nodes: Ledger[], nodeId: string): Ledger | null => {
    for (const node of nodes) {
        if (node.id === nodeId) return node;
        if (node.children) {
            const found = findNode(node.children, nodeId);
            if (found) return found;
        }
    }
    return null;
  }
  
  const validParentGroupsForEdit = useMemo(() => {
    if (!editingLedger) return [];
    const nodeBeingEdited = findNode(ledgers, editingLedger.id);
    if (!nodeBeingEdited) return allGroups;
    
    const invalidIds = [editingLedger.id, ...getDescendantIds(nodeBeingEdited)];
    return allGroups.filter(group => !invalidIds.includes(group.id));
  }, [editingLedger, ledgers, allGroups]);


  const resetCreateForm = () => {
    setNewAccountName('');
    setNewAccountPosition('');
    setNewAccountType('primary');
    setNewSelectedParent(null);
  };
  
  const handleCreateAccount = () => {
    if (!newAccountName.trim()) return;
    if (newAccountType === 'subgroup' && !newSelectedParent) return;

    const newGroup: Ledger = {
      id: `ledger-${Date.now()}`,
      name: newAccountName.trim(),
      type: 'group',
      position: newAccountPosition ? parseInt(newAccountPosition, 10) : undefined,
      children: [],
    };

    if (newAccountType === 'primary') {
      setLedgers(prev => [...prev, newGroup]);
    } else if (newSelectedParent) {
        const addGroupToParent = (nodes: Ledger[], parentId: string, newGroup: Ledger): Ledger[] => {
            return nodes.map(node => {
                if (node.id === parentId) {
                    return { ...node, children: [...(node.children || []), newGroup] };
                }
                if (node.children) {
                    return { ...node, children: addGroupToParent(node.children, parentId, newGroup) };
                }
                return node;
            });
        };
        setLedgers(prevLedgers => addGroupToParent(prevLedgers, newSelectedParent, newGroup));
    }

    resetCreateForm();
    setIsCreateDialogOpen(false);
  };

  const findParent = (nodes: Ledger[], childId: string, parent: Ledger | null = null): Ledger | null => {
    for (const node of nodes) {
        if (node.children?.some(child => child.id === childId)) {
            return node;
        }
        if (node.children) {
            const found = findParent(node.children, childId, node);
            if (found) return found;
        }
    }
    return null;
  }

  const handleOpenEditDialog = (ledger: Ledger) => {
    setEditingLedger(ledger);
    setEditAccountName(ledger.name);
    setEditAccountPosition(ledger.position?.toString() ?? '');
    const parent = findParent(ledgers, ledger.id);
    if (parent) {
      setEditAccountType('subgroup');
      setEditSelectedParent(parent.id);
    } else {
      setEditAccountType('primary');
      setEditSelectedParent(null);
    }
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateAccount = () => {
    if (!editingLedger || !editAccountName.trim()) return;
    if (editAccountType === 'subgroup' && !editSelectedParent) return;

    setLedgers(currentLedgers => {
      let newLedgers = JSON.parse(JSON.stringify(currentLedgers));
      let nodeToMove: Ledger | null = null;
      
      const removeNode = (nodes: Ledger[], nodeId: string): boolean => {
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === nodeId) {
                [nodeToMove] = nodes.splice(i, 1);
                return true;
            }
            if (nodes[i].children && removeNode(nodes[i].children, nodeId)) {
                return true;
            }
        }
        return false;
      };

      removeNode(newLedgers, editingLedger.id);
      if (!nodeToMove) return currentLedgers;

      nodeToMove.name = editAccountName.trim();
      nodeToMove.position = editAccountPosition ? parseInt(editAccountPosition, 10) : undefined;
      
      if (editAccountType === 'primary') {
        newLedgers.push(nodeToMove);
      } else {
        const addNodeToParent = (nodes: Ledger[], parentId: string, nodeToAdd: Ledger): boolean => {
          for (let node of nodes) {
            if (node.id === parentId) {
              node.children = node.children || [];
              node.children.push(nodeToAdd);
              return true;
            }
            if (node.children && addNodeToParent(node.children, parentId, nodeToAdd)) {
              return true;
            }
          }
          return false;
        };
        if (editSelectedParent) {
            addNodeToParent(newLedgers, editSelectedParent, nodeToMove);
        }
      }
      return newLedgers;
    });

    setIsEditDialogOpen(false);
    setEditingLedger(null);
  };


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Chart of Accounts</CardTitle>
          <CardDescription>Create and manage your ledger groups.</CardDescription>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) resetCreateForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>
                Add a new primary or sub-group to your chart of accounts.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newAccountName}
                  onChange={(e) => setNewAccountName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g. Office Supplies"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="position" className="text-right">
                  Position
                </Label>
                <Input
                  id="position"
                  type="number"
                  value={newAccountPosition}
                  onChange={(e) => setNewAccountPosition(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g. 1"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Type</Label>
                <RadioGroup
                  value={newAccountType}
                  onValueChange={(value: 'primary' | 'subgroup') => {
                    setNewAccountType(value);
                    setNewSelectedParent(null);
                  }}
                  className="col-span-3 flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="primary" id="r1" />
                    <Label htmlFor="r1">Primary Group</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="subgroup" id="r2" />
                    <Label htmlFor="r2">Sub Group</Label>
                  </div>
                </RadioGroup>
              </div>
              {newAccountType === 'subgroup' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parent" className="text-right">
                    Parent
                  </Label>
                  <Select onValueChange={setNewSelectedParent} value={newSelectedParent || undefined}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a parent group" />
                    </SelectTrigger>
                    <SelectContent>
                      {allGroups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleCreateAccount}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Group</DialogTitle>
              <DialogDescription>
                Update the name or parent group of this group.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Name
                </Label>
                <Input
                  id="edit-name"
                  value={editAccountName}
                  onChange={(e) => setEditAccountName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-position" className="text-right">
                  Position
                </Label>
                <Input
                  id="edit-position"
                  type="number"
                  value={editAccountPosition}
                  onChange={(e) => setEditAccountPosition(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">Type</Label>
                <RadioGroup
                  value={editAccountType}
                  onValueChange={(value: 'primary' | 'subgroup') => {
                    setEditAccountType(value);
                    if (value === 'primary') {
                        setEditSelectedParent(null);
                    }
                  }}
                  className="col-span-3 flex gap-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="primary" id="er1" />
                    <Label htmlFor="er1">Primary Group</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="subgroup" id="er2" />
                    <Label htmlFor="er2">Sub Group</Label>
                  </div>
                </RadioGroup>
              </div>
              {editAccountType === 'subgroup' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-parent" className="text-right">
                    Parent
                  </Label>
                  <Select onValueChange={setEditSelectedParent} value={editSelectedParent || undefined}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a parent group" />
                    </SelectTrigger>
                    <SelectContent>
                      {validParentGroupsForEdit.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <DialogFooter>
               <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleUpdateAccount}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="rounded-md border p-2">
          {ledgers.sort((a, b) => (a.position ?? Number.MAX_SAFE_INTEGER) - (b.position ?? Number.MAX_SAFE_INTEGER)).map((group) => {
            let reportType: 'Balance Sheet' | 'Profit & Loss' | null = null;
            const balanceSheetIds = ['assets', 'liabilities', 'equity'];
            const profitAndLossIds = ['income', 'expenses'];

            if (balanceSheetIds.includes(group.id)) {
                reportType = 'Balance Sheet';
            } else if (profitAndLossIds.includes(group.id)) {
                reportType = 'Profit & Loss';
            }
            return <LedgerEntry key={group.id} ledger={group} level={0} onEdit={handleOpenEditDialog} reportType={reportType} />;
          })}
        </div>
      </CardContent>
    </Card>
  );
}
