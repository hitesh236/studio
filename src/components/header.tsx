
'use client';

import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { LogOut, User, LayoutGrid, BookOpen, FileText, Eye, Globe, UserCircle, Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

const pathToTitle: { [key: string]: string } = {
  '/': 'Dashboard',
  '/balance-sheet': 'Balance Sheet',
  '/customer-portfolio': 'Customer Portfolio',
  '/customers': 'Customers',
  '/customers/new': 'Add Customer',
  '/invoice-preview': 'Invoice Preview',
  '/invoice-preview-fc': 'Invoice Preview FC',
  '/invoice2': 'Invoice with Return',
  '/journal-entries': 'All Entries',
  '/journal-entries/new': 'New Journal Entry',
  '/my-accounts': 'Groups & Ledgers',
  '/profit-loss': 'Profit & Loss Statement',
  '/sales-invoices': 'Sales Invoices',
  '/sales-invoice-returns': 'Sales Invoice Returns',
  '/sales-invoice-returns/new': 'New Sales Return',
  '/sales-invoices/new': 'Create Invoice',
  '/settings': 'Settings',
  '/settings/user-roles': 'User Roles & Permissions',
  '/settings/user-roles/new': 'Add New Role',
  '/table2': 'Table 2',
  '/gst-summary': 'GST Summary',
  '/gst-reports': 'GST Reports',
  '/gst-filing/gstr1': 'GSTR-1 B2B Filing',
  '/ui': 'UI Components',
  '/profile': 'My Profile',
  '/vendors': 'Vendors',
  '/vendors/new': 'Add Vendor',
  '/ledgers': 'Ledger Details',
  '/purchase-bills': 'New Purchase Bill',
};

const componentMenuItems = [
    { href: '/ledgers', icon: BookOpen, label: 'Ledgers' },
    { href: '/table2', icon: FileText, label: 'Table 2' },
    { href: '/invoice-preview', icon: Eye, label: 'Invoice Preview' },
    { href: '/invoice2', icon: FileText, label: 'Invoice2' },
    { href: '/invoice-preview-fc', icon: Globe, label: 'Invoice Preview FC' },
    { href: '/customer-portfolio', icon: UserCircle, label: 'Customer Portfolio' },
    { href: '/ui', icon: Palette, label: 'UI' },
];

const MegaMenu = () => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
                <LayoutGrid />
                <span className="sr-only">Open Components Menu</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="end">
            <DropdownMenuLabel>Components</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="grid grid-cols-2 gap-2 p-2">
                {componentMenuItems.map(item => (
                    <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="flex flex-col items-center justify-center gap-1 p-2 h-auto rounded-md text-center">
                            <item.icon className="h-5 w-5 mb-1" />
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    </DropdownMenuItem>
                ))}
            </div>
        </DropdownMenuContent>
    </DropdownMenu>
);

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
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <MegaMenu />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/40x40.png" alt="@shadcn" data-ai-hint="profile picture" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">Jane Doe</p>
                <p className="text-xs leading-none text-muted-foreground">
                  jane.doe@hicks.inc
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
