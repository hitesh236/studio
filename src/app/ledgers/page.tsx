
'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { ChevronRight } from 'lucide-react';

import { LedgerDetailView, type LedgerTransaction } from './ledger-detail-view';
import { generateJournalEntries } from '@/app/journal-entries/data';
import { ledgerData as chartOfAccountsData, type Ledger } from '@/lib/ledger-data';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '../loading';

const flattenLedgers = (nodes: Ledger[], path: string[] = []): { id: string; name: string, path: string[] }[] => {
  let list: { id: string; name: string, path: string[] }[] = [];
  nodes.forEach(node => {
    const currentPath = [...path, node.name];
    if (node.type === 'ledger') {
      list.push({ id: node.id, name: node.name, path: currentPath });
    }
    if (node.children) {
      list = [...list, ...flattenLedgers(node.children, currentPath)];
    }
  });
  return list;
};

const mapJournalToTransactions = (entries: ReturnType<typeof generateJournalEntries>): LedgerTransaction[] => {
    const transactions: LedgerTransaction[] = [];
    entries.forEach(entry => {
        const otherAccounts = entry.lines.map(l => l.account).join(', ');
        entry.lines.forEach(line => {
            transactions.push({
                id: `${entry.id}-${line.id}`,
                accountId: line.account,
                date: entry.date,
                description: `${entry.description} (w.r.t. ${otherAccounts.replace(line.account, '').replace(', ,',',').trim()})`,
                ref: entry.entryNumber,
                debit: line.debit,
                credit: line.credit,
            });
        });
    });
    return transactions;
};


export default function LedgersPage() {
    const [allLedgers, setAllLedgers] = useState<{ id: string; name: string, path: string[] }[]>([]);
    const [allTransactions, setAllTransactions] = useState<LedgerTransaction[] | null>(null);
    const [selectedLedgerId, setSelectedLedgerId] = useState<string | null>(null);

    React.useEffect(() => {
        const flattened = flattenLedgers(chartOfAccountsData);
        setAllLedgers(flattened);
        if (flattened.length > 0) {
            setSelectedLedgerId(flattened[0].id);
        }

        const journalEntries = generateJournalEntries(200);
        const mappedTransactions = mapJournalToTransactions(journalEntries);
        setAllTransactions(mappedTransactions);

    }, []);

    const selectedLedger = useMemo(() => {
        if (!selectedLedgerId) return null;
        return allLedgers.find(l => l.id === selectedLedgerId);
    }, [selectedLedgerId, allLedgers]);

    const filteredTransactions = useMemo(() => {
        if (!allTransactions || !selectedLedger) return [];
        return allTransactions.filter(t => t.accountId === selectedLedger.name);
    }, [allTransactions, selectedLedger]);
    
    const openingBalance = useMemo(() => {
        // This is a simplified calculation for demonstration.
        // A real app would fetch opening balance based on a period.
        if (!selectedLedger) return 0;
        const closingBalance = filteredTransactions.reduce((acc, t) => acc + t.debit - t.credit, 0);
        return closingBalance * (0.8 + Math.random() * 0.4); // Simulate some opening balance
    }, [selectedLedger, filteredTransactions]);

    if (!allTransactions || !selectedLedgerId || !selectedLedger) {
        return <Loading />;
    }

    return (
        <div data-section="main-content" className="p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>{selectedLedger.name}</CardTitle>
                            <div className="text-sm text-muted-foreground flex items-center flex-wrap">
                                {selectedLedger.path.map((part, index) => (
                                    <React.Fragment key={index}>
                                        <span>{part}</span>
                                        {index < selectedLedger.path.length - 1 && <ChevronRight className="h-4 w-4 mx-1" />}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                        <div className="w-full sm:w-[280px]">
                            <Select onValueChange={setSelectedLedgerId} value={selectedLedgerId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a ledger" />
                                </SelectTrigger>
                                <SelectContent>
                                    {allLedgers.map(ledger => (
                                        <SelectItem key={ledger.id} value={ledger.id}>
                                            {ledger.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <LedgerDetailView ledgerTransactions={filteredTransactions} openingBalance={openingBalance} />
                </CardContent>
            </Card>
        </div>
    );
}
