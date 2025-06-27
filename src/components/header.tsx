'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { useMemo } from 'react';

const pathToTitle: { [key: string]: string } = {
  '/': 'Dashboard',
  '/table': 'Table',
  '/customers': 'Customers',
  '/sales-invoices': 'Sales Invoices',
};

export function Header() {
  const pathname = usePathname();
  const title = useMemo(() => {
    return pathToTitle[pathname] || 'Dashboard';
  }, [pathname]);

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-6 shrink-0">
      <SidebarTrigger className="flex" />
      <div className="flex-1">
        <h1 className="font-semibold text-lg">{title}</h1>
      </div>
      <ThemeToggle />
    </header>
  );
}
