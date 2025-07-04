
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ChevronRight, ChevronDown, PlusCircle, Pencil, MoreHorizontal, Trash2, Folder, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Ledger } from '@/lib/ledger-data';

interface LedgerViewProps {
  data: Ledger[];
}

const nonDeletableGroupIds = new Set([
  'assets', 'current-assets', 'fixed-assets',
  'liabilities', 'current-liabilities', 'long-term-liabilities',
  'equity',
  'income',
  'expenses', 'cogs', 'operating-expenses'
]);


const LedgerEntry = ({ ledger, level, onEdit, onDelete, reportType }: { 
    ledger: Ledger; 
    level: number; 
    onEdit: (ledger: Ledger) => void; 
    onDelete: (ledger: Ledger) => void;
    reportType: 'Balance Sheet' | 'Profit & Loss' | null 
}) => {
  const [isOpen, setIsOpen] = useState(level < 2);
  const hasChildren = ledger.children && ledger.children.length > 0;
  const isDeletable = ledger.type === 'group' && !nonDeletableGroupIds.has(ledger.id);

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
        <div className="flex items-center gap-2 flex-1 truncate">
          <span className="w-4 h-4 shrink-0 flex items-center justify-center">
            {hasChildren && (isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />)}
          </span>

          {ledger.type === 'group' 
            ? <Folder className="h-4 w-4 shrink-0 text-amber-500" />
            : <FileText className="h-4 w-4 shrink-0 text-sky-500" />
          }
          
          <span className={cn("text-sm truncate", ledger.type === 'group' ? "font-semibold" : "font-normal")}>{ledger.name}</span>
        </div>
        
        <div className="flex items-center gap-2 shrink-0 ml-4">
             {ledger.type === 'group' && (
               <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => onEdit(ledger)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => onDelete(ledger)}
                            disabled={!isDeletable}
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
            {reportType && (
                <Badge
                    variant="outline"
                    className={cn(
                        "font-normal text-xs",
                        reportType === 'Balance Sheet' ? 'border-secondary text-secondary' : 'border-primary text-primary'
                    )}
                >
                    {reportType}
                </Badge>
            )}
        </div>
      </div>
      {hasChildren && isOpen && (
        <div>
          {ledger.children?.sort((a, b) => (a.position ?? Number.MAX_SAFE_INTEGER) - (b.position ?? Number.MAX_SAFE_INTEGER)).map((child) => (
            <LedgerEntry key={child.id} ledger={child} level={level + 1} onEdit={onEdit} onDelete={onDelete} reportType={reportType} />
          ))}
        </div>
      )}
    </div>
  );
};

export function LedgerView({ data }: LedgerViewProps) {
  const [ledgers, setLedgers] = useState<Ledger[]>(data);
  const { toast } = useToast();

  // State for Create Ledger Dialog
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [newSelectedParent, setNewSelectedParent] = useState<string | null>(null);

  // State for Create Group Dialog
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupParent, setNewGroupParent] = useState<string | null>(null);
  const [newGroupType, setNewGroupType] = useState<'primary' | 'subgroup'>('primary');
  
  // State for Edit Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingLedger, setEditingLedger] = useState<Ledger | null>(null);
  const [editAccountName, setEditAccountName] = useState('');
  const [editAccountPosition, setEditAccountPosition] = useState('');
  const [editAccountType, setEditAccountType] = useState<'primary' | 'subgroup'>('primary');
  const [editSelectedParent, setEditSelectedParent] = useState<string | null>(null);
  
  // State for Delete Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [ledgerToDelete, setLedgerToDelete] = useState<Ledger | null>(null);

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
    setNewSelectedParent(null);
  };

  const resetGroupForm = () => {
      setNewGroupName('');
      setNewGroupParent(null);
      setNewGroupType('primary');
  };
  
  const handleCreateLedger = () => {
    if (!newAccountName.trim() || !newSelectedParent) {
        toast({
            title: "Missing Information",
            description: "Ledger name and parent group are required.",
            variant: "destructive"
        });
        return;
    }

    const newLedger: Ledger = {
      id: `ledger-${Date.now()}`,
      name: newAccountName.trim(),
      type: 'ledger',
    };

    const addLedgerToParent = (nodes: Ledger[], parentId: string, newLedger: Ledger): Ledger[] => {
        return nodes.map(node => {
            if (node.id === parentId) {
                return { ...node, children: [...(node.children || []), newLedger] };
            }
            if (node.children) {
                return { ...node, children: addLedgerToParent(node.children, parentId, newLedger) };
            }
            return node;
        });
    };
    setLedgers(prevLedgers => addLedgerToParent(prevLedgers, newSelectedParent, newLedger));

    resetCreateForm();
    setIsCreateDialogOpen(false);
  };

  const handleCreateGroup = () => {
      if (!newGroupName.trim()) {
          toast({ title: "Missing Information", description: "Group name is required.", variant: "destructive" });
          return;
      }
      if (newGroupType === 'subgroup' && !newGroupParent) {
          toast({ title: "Missing Information", description: "Parent group is required for a subgroup.", variant: "destructive" });
          return;
      }

      const newGroup: Ledger = {
          id: `group-${Date.now()}`,
          name: newGroupName.trim(),
          type: 'group',
          children: []
      };

      if (newGroupType === 'primary' || !newGroupParent) {
          setLedgers(prevLedgers => [...prevLedgers, newGroup]);
      } else {
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
          setLedgers(prevLedgers => addGroupToParent(prevLedgers, newGroupParent!, newGroup));
      }
      
      toast({ title: "Group Created", description: `Successfully created the group "${newGroup.name}".`});

      resetGroupForm();
      setIsGroupDialogOpen(false);
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

  const handleOpenDeleteDialog = (ledger: Ledger) => {
    setLedgerToDelete(ledger);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!ledgerToDelete) return;

    const removeNodeRecursively = (nodes: Ledger[], id: string): Ledger[] => {
      return nodes.filter(node => {
        if (node.id === id) {
          return false;
        }
        if (node.children) {
          node.children = removeNodeRecursively(node.children, id);
        }
        return true;
      });
    };
    
    setLedgers(currentLedgers => removeNodeRecursively(currentLedgers, ledgerToDelete.id));

    toast({
        title: "Group Deleted",
        description: `The group "${ledgerToDelete.name}" and its subgroups have been removed.`,
    });

    setIsDeleteDialogOpen(false);
    setLedgerToDelete(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Chart of Accounts</CardTitle>
          <CardDescription>Create and manage your ledger accounts and groups.</CardDescription>
        </div>
        <div className="flex items-center gap-2">
            <Dialog open={isGroupDialogOpen} onOpenChange={(open) => {
                setIsGroupDialogOpen(open);
                if (!open) resetGroupForm();
            }}>
                <DialogTrigger asChild>
                    <Button variant="outline">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Group
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Group</DialogTitle>
                        <DialogDescription>Create a new group to organize your ledgers.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="group-name" className="text-right">Name</Label>
                            <Input id="group-name" value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Type</Label>
                            <Select onValueChange={(value) => setNewGroupType(value as any)} value={newGroupType}>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="primary">Primary Group</SelectItem>
                                    <SelectItem value="subgroup">Subgroup of...</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {newGroupType === 'subgroup' && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="parent-group" className="text-right">Parent Group</Label>
                                <Select onValueChange={setNewGroupParent} value={newGroupParent || undefined}>
                                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Select parent" /></SelectTrigger>
                                    <SelectContent>
                                        {allGroups.map(group => (
                                            <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={handleCreateGroup}>Create Group</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
            setIsCreateDialogOpen(open);
            if (!open) resetCreateForm();
            }}>
            <DialogTrigger asChild>
                <Button>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Ledger
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>Add New Ledger</DialogTitle>
                <DialogDescription>
                    Add a new ledger to an existing group in your chart of accounts.
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
                    <Label htmlFor="parent" className="text-right">
                        Parent Group
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
                </div>
                <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleCreateLedger}>Create</Button>
                </DialogFooter>
            </DialogContent>
            </Dialog>
        </div>
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
            </div>
            <DialogFooter>
               <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleUpdateAccount}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the 
                <span className="font-semibold text-foreground"> {ledgerToDelete?.name} </span> 
                group and all of its subgroups.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setLedgerToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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

            return <LedgerEntry key={group.id} ledger={group} level={0} onEdit={handleOpenEditDialog} onDelete={handleOpenDeleteDialog} reportType={reportType} />;
          })}
        </div>
      </CardContent>
    </Card>
  );
}
