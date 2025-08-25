
'use client';

import type { Ledger } from '@/lib/ledger-data';
import { ledgerData } from '@/lib/ledger-data';

export type TrialBalanceRow = {
    id: string;
    account: string;
    debit: number;
    credit: number;
};

// Recursive function to flatten the ledger data and calculate balances
const flattenLedger = (nodes: Ledger[], parentPath: string = ''): TrialBalanceRow[] => {
    let list: TrialBalanceRow[] = [];
    
    nodes.forEach(node => {
        const currentPath = parentPath ? `${parentPath} -> ${node.name}` : node.name;
        
        if (node.type === 'ledger' && node.balance !== undefined && node.balance !== 0) {
            list.push({
                id: node.id,
                account: node.name,
                debit: node.balance > 0 ? node.balance : 0,
                credit: node.balance < 0 ? Math.abs(node.balance) : 0,
            });
        }
        
        if (node.children) {
            list = [...list, ...flattenLedger(node.children, currentPath)];
        }
    });

    return list;
};

export const generateTrialBalanceData = (): TrialBalanceRow[] => {
    const flattened = flattenLedger(ledgerData);
    return flattened.filter(item => item.debit > 0 || item.credit > 0);
};
