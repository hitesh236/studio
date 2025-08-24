
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
import { LogOut, User, LayoutGrid, BookOpen, FileText, Eye, Globe, UserCircle, Palette, MonitorPlay, Tags, Repeat, PackagePlus, Box, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';
import useUserRole from '@/hooks/use-user-role';
import { GlobalSearch } from './global-search';

const accountingMenuItems = [
    { href: '/recurring-invoices', icon: Repeat, label: 'Recurring Invoices' },
    { href: '/ledgers', icon: BookOpen, label: 'Ledgers' },
];

const stockMenuItems = [
    { href: '/products/new', icon: PackagePlus, label: 'Add Product' },
    { href: '/product-structure', icon: Tags, label: 'Product Structure' },
    { href: '/uom', icon: Box, label: 'UOM' },
    { href: '/stock-transfer', icon: Truck, label: 'Transfer Stock' },
];

const uiMenuItems = [
    { href: '/table2', icon: FileText, label: 'Table 2' },
    { href: '/invoice-preview', icon: Eye, label: 'Invoice Preview' },
    { href: '/invoice2', icon: FileText, label: 'Invoice2' },
    { href: '/invoice-preview-fc', icon: Globe, label: 'Invoice Preview FC' },
    { href: '/customer-portfolio', icon: UserCircle, label: 'Customer Portfolio' },
    { href: '/ui', icon: Palette, label: 'UI' },
    { href: '/products/create', icon: PackagePlus, label: 'Create Product' },
];

const MegaMenu = () => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
                <LayoutGrid />
                <span className="sr-only">Open Components Menu</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 sm:w-[400px] md:w-[600px] p-2" align="end">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                <div className="space-y-1">
                    <DropdownMenuLabel>Accounting</DropdownMenuLabel>
                    {accountingMenuItems.map(item => (
                        <DropdownMenuItem key={item.href} asChild>
                            <Link href={item.href} className="flex items-center gap-2">
                                <item.icon className="h-4 w-4 text-muted-foreground" />
                                <span>{item.label}</span>
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </div>
                <div className="space-y-1">
                    <DropdownMenuLabel>Stock</DropdownMenuLabel>
                    {stockMenuItems.map(item => (
                        <DropdownMenuItem key={item.href} asChild>
                            <Link href={item.href} className="flex items-center gap-2">
                                <item.icon className="h-4 w-4 text-muted-foreground" />
                                <span>{item.label}</span>
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </div>
                <div className="space-y-1">
                     <DropdownMenuLabel>UI</DropdownMenuLabel>
                    {uiMenuItems.map(item => (
                        <DropdownMenuItem key={item.href} asChild>
                            <Link href={item.href} className="flex items-center gap-2">
                                <item.icon className="h-4 w-4 text-muted-foreground" />
                                <span>{item.label}</span>
                            </Link>
                        </DropdownMenuItem>
                    ))}
                </div>
            </div>
        </DropdownMenuContent>
    </DropdownMenu>
);

export function Header() {
  const { role } = useUserRole();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-6 shrink-0">
      <SidebarTrigger className="flex" />
       <div className="flex-1">
        <GlobalSearch />
      </div>
      <div className="flex items-center gap-2">
        <Button asChild variant="outline">
            <Link href="/pos">
                <MonitorPlay className="mr-2 h-4 w-4" />
                POS
            </Link>
        </Button>
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
