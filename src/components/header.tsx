
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
import { LogOut, User, LayoutGrid, BookOpen, FileText, Eye, Globe, UserCircle, Palette, MonitorPlay, Tags, UserCog, UserCheck, UserX } from 'lucide-react';
import { cn } from '@/lib/utils';
import useUserRole from '@/hooks/use-user-role';

const componentMenuItems = [
    { href: '/ledgers', icon: BookOpen, label: 'Ledgers' },
    { href: '/table2', icon: FileText, label: 'Table 2' },
    { href: '/invoice-preview', icon: Eye, label: 'Invoice Preview' },
    { href: '/invoice2', icon: FileText, label: 'Invoice2' },
    { href: '/invoice-preview-fc', icon: Globe, label: 'Invoice Preview FC' },
    { href: '/customer-portfolio', icon: UserCircle, label: 'Customer Portfolio' },
    { href: '/ui', icon: Palette, label: 'UI' },
    { href: '/product-structure', icon: Tags, label: 'Product Structure' },
];

const MegaMenu = () => (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
                <LayoutGrid />
                <span className="sr-only">Open Components Menu</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64 sm:w-[400px] md:w-[550px]" align="end">
            <DropdownMenuLabel>Components</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 p-1">
                {componentMenuItems.map(item => (
                    <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="flex items-center gap-2 p-2">
                            <item.icon className="h-4 w-4 text-muted-foreground" />
                            <span>{item.label}</span>
                        </Link>
                    </DropdownMenuItem>
                ))}
            </div>
        </DropdownMenuContent>
    </DropdownMenu>
);

export function Header() {
  const { role, setRole } = useUserRole();
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card px-6 shrink-0">
      <SidebarTrigger className="flex" />
      <div className="flex-1" />
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
