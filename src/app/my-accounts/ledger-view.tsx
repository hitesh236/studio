'use client';

import * as React from 'react';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, PlusCircle } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

export type Ledger = {
  id: string;
  name: string;
  type: 'group' | 'ledger';
  balance: number;
  children?: Ledger[];
};

interface LedgerViewProps {
  data: Ledger[];
}

const LedgerEntry = ({ ledger, level }: { ledger: Ledger; level: number }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = ledger.children && ledger.children.length > 0;

  return (
    <div>
      <div
        className={cn(
          'flex items-center justify-between py-2 px-2 rounded-md hover:bg-muted/50',
          'cursor-pointer'
        )}
        style={{ paddingLeft: `${level * 1.5 + 0.5}rem` }}
        onClick={() => hasChildren && setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {hasChildren ? (
            isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <div className="w-4 h-4" />
          )}
          <span className="font-medium">{ledger.name}</span>
        </div>
        <div className="font-mono">{formatCurrency(ledger.balance)}</div>
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
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Chart of Accounts</CardTitle>
        <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Account
        </Button>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full" defaultValue={data.map(g => g.id)}>
          {data.map((group) => (
            <AccordionItem value={group.id} key={group.id}>
              <AccordionTrigger className="font-semibold text-lg hover:no-underline -ml-2">
                <div className="flex justify-between w-full pr-4">
                  <span>{group.name}</span>
                  <span className="font-mono text-muted-foreground">{formatCurrency(group.balance)}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                {group.children?.map((child) => (
                  <LedgerEntry key={child.id} ledger={child} level={0} />
                ))}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}
