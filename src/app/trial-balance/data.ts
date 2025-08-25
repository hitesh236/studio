
'use client';

import type { Ledger } from '@/lib/ledger-data';
import { ledgerData } from '@/lib/ledger-data';

export type TrialBalanceRow = {
    id: string;
    account: string;
    level: number;
    isGroup: boolean;
    openingBalance: number;
    debit: number;
    credit: number;
    closingBalance: number;
};

// Recursive function to flatten the ledger data and calculate balances
const processLedger = (nodes: Ledger[], level: number, dateRange: { from: Date; to: Date }): TrialBalanceRow[] => {
    let list: TrialBalanceRow[] = [];
    
    for (const node of nodes) {
        let openingBalance = 0;
        let debit = 0;
        let credit = 0;
        let closingBalance = 0;

        if (node.type === 'ledger') {
            // Simulate opening balance and transactions for demonstration
            openingBalance = node.previousBalance || (node.balance ? node.balance * (0.8 + Math.random() * 0.4) : 0);
            const transactionValue = (node.balance || 0) - openingBalance;
            
            if (transactionValue > 0) {
                debit = transactionValue;
            } else {
                credit = Math.abs(transactionValue);
            }
            closingBalance = openingBalance + debit - credit;

            list.push({
                id: node.id,
                account: node.name,
                level: level,
                isGroup: false,
                openingBalance,
                debit,
                credit,
                closingBalance,
            });
        } else if (node.children) {
            const childrenRows = processLedger(node.children, level + 1, dateRange);
            
            // Calculate group totals from children
            const groupTotals = childrenRows.reduce((acc, curr) => {
                acc.openingBalance += curr.openingBalance;
                acc.debit += curr.debit;
                acc.credit += curr.credit;
                acc.closingBalance += curr.closingBalance;
                return acc;
            }, { openingBalance: 0, debit: 0, credit: 0, closingBalance: 0 });

            // Add the group row itself
            list.push({
                id: node.id,
                account: node.name,
                level: level,
                isGroup: true,
                ...groupTotals,
            });

            // Add the children rows after the group
            list = [...list, ...childrenRows];
        }
    }

    return list;
};

export const generateTrialBalanceData = (dateRange: { from: Date; to: Date }): TrialBalanceRow[] => {
    return processLedger(ledgerData, 0, dateRange);
};
