
'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';

import { LedgerDetailView, type LedgerTransaction } from './ledger-detail-view';
import { generateJournalEntries } from '@/app/journal-entries/data';
import { ledgerData as chartOfAccountsData, type Ledger } from '@/lib/ledger-data';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Loading from '../loading';

const flattenLedgers = (nodes: Ledger[]): { id: string; name: string }[] => {
  let list: { id: string; name: string }[] = [];
  nodes.forEach(node => {
    if (node.type === 'ledger') {
      list.push({ id: node.id, name: node.name });
    }
    if (node.children) {
      list = [...list, ...flattenLedgers(node.children)];
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
    const [allLedgers, setAllLedgers] = useState<{ id: string; name: string }[]>([]);
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

    const filteredTransactions = useMemo(() => {
        if (!allTransactions || !selectedLedgerId) return [];
        return allTransactions.filter(t => t.accountId === allLedgers.find(l => l.id === selectedLedgerId)?.name);
    }, [allTransactions, selectedLedgerId, allLedgers]);

    if (!allTransactions || !selectedLedgerId) {
        return <Loading />;
    }

    const selectedLedgerName = allLedgers.find(l => l.id === selectedLedgerId)?.name || 'Ledger';

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>{selectedLedgerName}</CardTitle>
                            <CardDescription>View transactions for the selected ledger.</CardDescription>
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
                    <LedgerDetailView ledgerTransactions={filteredTransactions} />
                </CardContent>
            </Card>
        </div>
    );
}
