
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarFooter,
  useSidebar,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
    BookOpen,
    Box,
    Briefcase,
    ChevronDown,
    Eye,
    FileSpreadsheet,
    FileText,
    FolderPlus,
    Globe,
    LayoutDashboard,
    LayoutGrid,
    PackagePlus,
    Palette,
    Percent,
    Receipt,
    Redo2,
    Scale,
    Send,
    Settings,
    Shield,
    Store,
    Tags,
    TrendingUp,
    Undo2,
    UserCircle,
    Users,
    Wallet
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function AppSidebar() {
  const { state, isMobile, setOpen, setOpenMobile } = useSidebar();
  const pathname = usePathname();

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-6 w-6">
                <rect width="256" height="256" fill="none"></rect>
                <path d="M42.4,188.4,74.8,93.2a15.9,15.9,0,0,1,15.1-10.8h76.2a15.9,15.9,0,0,1,15.1,10.8l32.4,95.2a16,16,0,0,1-15.1,21.2H57.5A16,16,0,0,1,42.4,188.4Z" opacity="0.2"></path>
                <path d="M42.4,188.4,74.8,93.2a15.9,15.9,0,0,1,15.1-10.8h76.2a15.9,15.9,0,0,1,15.1,10.8l32.4,95.2a16,16,0,0,1-15.1,21.2H57.5A16,16,0,0,1,42.4,188.4Z" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></path><line x1="128" y1="40" x2="128" y2="82.4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"></line>
            </svg>
            {state === 'expanded' && <h1 className="text-xl font-bold">Hicks Inc.</h1>}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Dashboard" isActive={pathname === '/'} asChild>
                <Link href="/" onClick={handleLinkClick}>
                    <LayoutDashboard />
                    <span>Dashboard</span>
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
                <SidebarMenuButton tooltip="Parties" isActive={pathname.startsWith('/parties')} asChild>
                    <Link href="/parties" onClick={handleLinkClick}>
                        <Users />
                        <span>Parties</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-green-600 dark:text-green-500">Money In</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Sales" isActive={pathname.startsWith('/sales-invoices')} asChild>
                    <Link href="/sales-invoices" onClick={handleLinkClick}>
                        <FileText />
                        <span>Sales</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Sales Returns" isActive={pathname.startsWith('/sales-invoice-returns')} asChild>
                <Link href="/sales-invoice-returns" onClick={handleLinkClick}>
                  <Undo2 />
                  <span>Sales Returns</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-destructive">Money Out</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Purchase" isActive={pathname.startsWith('/purchase-bills')} asChild>
                 <Link href="/purchase-bills" onClick={handleLinkClick}>
                  <Receipt />
                  <span>Purchase</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Purchase Returns">
                <Redo2 />
                <span>Purchase Returns</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Stock</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Stock List" isActive={pathname.startsWith('/stock-list')} asChild>
                <Link href="/stock-list" onClick={handleLinkClick}>
                    <LayoutGrid />
                    <span>Stock List</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Add Product" isActive={pathname.startsWith('/products/new')} asChild>
                <Link href="/products/new" onClick={handleLinkClick}>
                    <PackagePlus />
                    <span>Add Product</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="UOM" isActive={pathname.startsWith('/uom')} asChild>
                 <Link href="/uom" onClick={handleLinkClick}>
                    <Box />
                    <span>UOM</span>
                 </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Accounts &amp; Books</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Groups & Ledgers" isActive={pathname.startsWith('/my-accounts')} asChild>
                <Link href="/my-accounts" onClick={handleLinkClick}>
                    <Wallet />
                    <span>Groups &amp; Ledgers</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="All Entries" isActive={pathname.startsWith('/journal-entries')} asChild>
                <Link href="/journal-entries" onClick={handleLinkClick}>
                    <BookOpen />
                    <span>All Entries</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
          <SidebarMenu>
             <SidebarMenuItem>
              <SidebarMenuButton tooltip="Profit &amp; Loss" isActive={pathname.startsWith('/profit-loss')} asChild>
                <Link href="/profit-loss" onClick={handleLinkClick}>
                    <TrendingUp />
                    <span>Profit &amp; Loss</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton tooltip="Balance Sheet" isActive={pathname.startsWith('/balance-sheet')} asChild>
                <Link href="/balance-sheet" onClick={handleLinkClick}>
                    <Scale />
                    <span>Balance Sheet</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton tooltip="GST Summary" isActive={pathname.startsWith('/gst-summary')} asChild>
                    <Link href="/gst-summary" onClick={handleLinkClick}>
                        <Percent />
                        <span>GST Summary</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton tooltip="GST Reports" isActive={pathname.startsWith('/gst-reports')} asChild>
                    <Link href="/gst-reports" onClick={handleLinkClick}>
                        <FileSpreadsheet />
                        <span>GST Reports</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton tooltip="Invoice Overviews">
                <BookOpen />
                <span>Invoice Overviews</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Stock Summary" isActive={pathname.startsWith('/stock-summary')} asChild>
                <Link href="/stock-summary" onClick={handleLinkClick}>
                  <LayoutGrid />
                  <span>Stock Summary</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>GST Filing</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="GSTR-1 Filing" isActive={pathname.startsWith('/gst-filing/gstr1')} asChild>
                    <Link href="/gst-filing/gstr1" onClick={handleLinkClick}>
                        <Send />
                        <span>GSTR-1 Filing</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarGroup>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Company Settings" isActive={pathname.startsWith('/settings')} asChild>
                        <Link href="/settings" onClick={handleLinkClick}>
                            <Settings />
                            <span>Company Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip="User Roles" isActive={pathname.startsWith('/settings/user-roles')} asChild>
                        <Link href="/settings/user-roles" onClick={handleLinkClick}>
                            <Shield />
                            <span>User Roles</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <div className="flex items-center gap-2 p-2.5">
            <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/40x40.png" alt="@shadcn" data-ai-hint="profile picture" />
                <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            {state === 'expanded' && (
                <div>
                    <p className="text-sm font-semibold">Jane Doe</p>
                    <p className="text-xs text-muted-foreground">jane.doe@hicks.inc</p>
                </div>
            )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
