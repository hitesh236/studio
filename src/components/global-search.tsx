
'use client';

import * as React from 'react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Search, User, FileText, Package, BookOpen, Receipt } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { staticCustomers, staticVendors } from '@/lib/customer-data';
import { generateSalesInvoices } from '@/app/sales-invoices/data';
import { generatePurchaseBills } from '@/app/purchase/data';
import { generateStockListData } from '@/app/stock-list/data';
import { generateJournalEntries } from '@/app/journal-entries/data';
import { Button } from './ui/button';

export function GlobalSearch() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = (command: () => void) => {
    setOpen(false);
    command();
  };

  const searchData = React.useMemo(() => {
    const customers = staticCustomers.map(c => ({
      group: 'Customers',
      id: c.id,
      label: c.company,
      description: c.email,
      href: `/customer-portfolio?customerData=${encodeURIComponent(JSON.stringify(c))}`,
      icon: User,
    }));
    const vendors = staticVendors.map(v => ({
      group: 'Vendors',
      id: v.id,
      label: v.company,
      description: v.email,
      href: `/parties`,
      icon: User,
    }));
    const salesInvoices = generateSalesInvoices(20).map(i => ({
      group: 'Sales Invoices',
      id: i.id,
      label: i.invoiceNumber,
      description: i.customerName,
      href: `/invoice-preview?invoiceData=${encodeURIComponent(JSON.stringify(i))}`,
      icon: FileText,
    }));
    const purchaseBills = generatePurchaseBills(20).map(b => ({
        group: 'Purchase Bills',
        id: b.id,
        label: b.billNumber,
        description: b.vendorName,
        href: `/purchase-preview`,
        icon: Receipt,
    }));
    const products = generateStockListData(20).map(p => ({
        group: 'Products',
        id: p.id,
        label: p.productName,
        description: p.sku,
        href: `/stock-list`,
        icon: Package,
    }));
    const journalEntries = generateJournalEntries(20).map(j => ({
        group: 'Journal Entries',
        id: j.id,
        label: j.entryNumber,
        description: j.description,
        href: `/journal-entries`,
        icon: BookOpen,
    }));

    return [
        ...customers,
        ...vendors,
        ...salesInvoices,
        ...purchaseBills,
        ...products,
        ...journalEntries,
    ];
  }, []);
  
  const groupedData = React.useMemo(() => {
    return searchData.reduce((acc, item) => {
      if (!acc[item.group]) {
        acc[item.group] = [];
      }
      acc[item.group].push(item);
      return acc;
    }, {} as Record<string, typeof searchData>);
  }, [searchData]);

  return (
    <>
      <Button
        variant="outline"
        className="w-full justify-start text-muted-foreground sm:w-40 lg:w-64"
        onClick={() => setOpen(true)}
      >
        <Search className="mr-2 h-4 w-4" />
        <span className="hidden lg:inline-flex">Search...</span>
        <kbd className="pointer-events-none ml-auto hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(groupedData).map(([group, items]) => (
            <CommandGroup key={group} heading={group}>
              {items.map(item => {
                const Icon = item.icon;
                return (
                    <CommandItem
                    key={item.id}
                    value={item.label}
                    onSelect={() => runCommand(() => router.push(item.href))}
                    >
                    <Icon className="mr-2 h-4 w-4" />
                    <span>{item.label}</span>
                    <span className="ml-2 text-xs text-muted-foreground">{item.description}</span>
                    </CommandItem>
                );
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
