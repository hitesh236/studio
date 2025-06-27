'use client';

import * as React from 'react';
import { useState } from 'react';
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
import { ChevronRight, ChevronDown, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type Ledger = {
  id: string;
  name: string;
  type: 'group' | 'ledger';
  balance?: number;
  children?: Ledger[];
};

interface LedgerViewProps {
  data: Ledger[];
}

const LedgerEntry = ({ ledger, level }: { ledger: Ledger; level: number }) => {
  const [isOpen, setIsOpen] = useState(level === 0);
  const hasChildren = ledger.children && ledger.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          'flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/50',
          hasChildren && 'cursor-pointer'
        )}
        style={{ paddingLeft: `${level * 1.25 + 0.5}rem` }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
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
          <span className={cn("font-medium", level === 0 && "font-semibold")}>{ledger.name}</span>
        </div>
      </div>
      {hasChildren && isOpen && (
        <div>
          {ledger.children?.map((child) => (
            <LedgerEntry key={child.id} ledger={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

export function LedgerView({ data }: LedgerViewProps) {
  const [ledgers, setLedgers] = useState<Ledger[]>(data);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [accountType, setAccountType] = useState<'primary' | 'subgroup'>('primary');
  const [newAccountName, setNewAccountName] = useState('');
  const [selectedParent, setSelectedParent] = useState<string | null>(null);

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

  const allGroups = getFlattenedGroups(ledgers);

  const resetForm = () => {
    setNewAccountName('');
    setAccountType('primary');
    setSelectedParent(null);
  };
  
  const handleCreateAccount = () => {
    if (!newAccountName.trim()) {
      alert('Please enter an account name.');
      return;
    }
    if (accountType === 'subgroup' && !selectedParent) {
      alert('Please select a parent group for the sub-group.');
      return;
    }

    const newGroup: Ledger = {
      id: `ledger-${Date.now()}`,
      name: newAccountName.trim(),
      type: 'group',
      children: [],
    };

    if (accountType === 'primary') {
      setLedgers(prev => [...prev, newGroup]);
    } else if (selectedParent) {
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
        setLedgers(prevLedgers => addGroupToParent(prevLedgers, selectedParent, newGroup));
    }

    resetForm();
    setIsDialogOpen(false);
  };


  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Chart of Accounts</CardTitle>
          <CardDescription>Create and manage your ledger groups.</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
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
                <Label className="text-right">Type</Label>
                <RadioGroup
                  value={accountType}
                  onValueChange={(value: 'primary' | 'subgroup') => {
                    setAccountType(value);
                    setSelectedParent(null);
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
              {accountType === 'subgroup' && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parent" className="text-right">
                    Parent
                  </Label>
                  <Select onValueChange={setSelectedParent} value={selectedParent || undefined}>
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
        <div className="rounded-md border p-2">
          {ledgers.map((group) => (
            <LedgerEntry key={group.id} ledger={group} level={0} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
