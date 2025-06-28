
'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { useMemo } from 'react';

const pathToTitle: { [key: string]: string } = {
  '/': 'Dashboard',
  '/table': 'Table',
  '/invoice-preview': 'Invoice Preview',
  '/invoice-preview-fc': 'Invoice Preview FC',
  '/customers': 'Customers',
  '/customers/new': 'Add Customer',
  '/sales-invoices': 'Sales Invoices',
  '/sales-invoices/new': 'Create Invoice',
  '/my-accounts': 'My Accounts',
  '/settings': 'Settings',
  '/journal-entries': 'Journal Entries',
  '/journal-entries/new': 'New Journal Entry',
  '/all-transactions': 'View All Transactions',
  '/ledgers': 'Ledgers',
};

export function Header() {
  const pathname = usePathname();
  const title = useMemo(() => {
    return pathToTitle[pathname] || 'Dashboard';
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-6 shrink-0 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <SidebarTrigger className="flex" />
      <div className="flex-1">
        <h1 className="font-semibold text-lg">{title}</h1>
      </div>
      <ThemeToggle />
    </header>
  );
}
