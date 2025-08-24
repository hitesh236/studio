
'use client';

import * as React from 'react';
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
import { LogOut, User, LayoutGrid, BookOpen, FileText, Eye, Globe, UserCircle, Palette, MonitorPlay, Tags, Repeat, PackagePlus, Box, Truck, Bell, Download as DownloadIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import useUserRole from '@/hooks/use-user-role';
import { GlobalSearch } from './global-search';
import { generateNotifications, type Notification } from '@/lib/notifications';

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
    { href: '#', icon: DownloadIcon, label: 'Install App', disabled: true },
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
                        <DropdownMenuItem key={item.href} asChild disabled={item.disabled}>
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

const NotificationItem = ({ notification }: { notification: Notification }) => {
    const timeSince = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " years ago";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " months ago";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " days ago";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " hours ago";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " minutes ago";
        return Math.floor(seconds) + " seconds ago";
    };

    const content = (
        <div className="flex items-start gap-3 p-3">
            {!notification.read && <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />}
            <notification.icon className={cn("h-5 w-5 text-muted-foreground shrink-0 mt-0.5", notification.read && 'ml-4')} />
            <div className="flex-1">
                <p className="text-sm font-medium">{notification.title}</p>
                <p className="text-xs text-muted-foreground">{notification.description}</p>
                <p className="text-xs text-muted-foreground/80 mt-1">{timeSince(notification.date)}</p>
            </div>
        </div>
    );
    
    if (notification.href) {
        return (
            <DropdownMenuItem asChild className="p-0 cursor-pointer">
                <Link href={notification.href}>{content}</Link>
            </DropdownMenuItem>
        );
    }

    return (
        <DropdownMenuItem className="flex items-start gap-3 p-3 cursor-default">
            {content}
        </DropdownMenuItem>
    )
};

const NotificationBell = () => {
    const [notifications, setNotifications] = React.useState<Notification[]>([]);
    
    React.useEffect(() => {
        setNotifications(generateNotifications());
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell />
                    {unreadCount > 0 && (
                        <div className="absolute top-0 right-0 h-4 w-4 text-xs rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                            {unreadCount}
                        </div>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground p-4 text-center">No new notifications</p>
                ) : (
                    notifications.map(notification => (
                        <NotificationItem key={notification.id} notification={notification} />
                    ))
                )}
                <DropdownMenuSeparator />
                 <DropdownMenuItem className="justify-center">
                    Mark all as read
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
};

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
        <NotificationBell />
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
