
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
  SidebarSeparator
} from '@/components/ui/sidebar';
import {
    BookOpen,
    Eye,
    FileSpreadsheet,
    FileText,
    Globe,
    History,
    LayoutDashboard,
    Percent,
    Receipt,
    Redo2,
    Scale,
    Settings,
    Shield,
    Store,
    TrendingUp,
    Undo2,
    UserCircle,
    Users,
    Wallet
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { usePathname } from 'next/navigation';
import Link from 'next/link';


export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
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
                    Dashboard
                </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        <SidebarGroup>
          <SidebarGroupLabel>Component</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Table" isActive={pathname.startsWith('/table')} asChild>
                    <Link href="/table" onClick={handleLinkClick}>
                        <FileText />
                        Table
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Invoice Preview" isActive={pathname.startsWith('/invoice-preview')} asChild>
                    <Link href="/invoice-preview" onClick={handleLinkClick}>
                        <Eye />
                        Invoice Preview
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Invoice Preview FC" isActive={pathname.startsWith('/invoice-preview-fc')} asChild>
                    <Link href="/invoice-preview-fc" onClick={handleLinkClick}>
                        <Globe />
                        Invoice Preview FC
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Customer Portfolio" isActive={pathname.startsWith('/customer-portfolio')} asChild>
                    <Link href="/customer-portfolio" onClick={handleLinkClick}>
                        <UserCircle />
                        Customer Portfolio
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>


        <SidebarGroup>
          <SidebarGroupLabel>Money In</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Customers" isActive={pathname.startsWith('/customers')} asChild>
                    <Link href="/customers" onClick={handleLinkClick}>
                        <Users />
                        Customers
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <SidebarMenuButton tooltip="Sales Invoices" isActive={pathname.startsWith('/sales-invoices')} asChild>
                    <Link href="/sales-invoices" onClick={handleLinkClick}>
                        <FileText />
                        Sales Invoices
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Invoice Returns (Sales)">
                <Undo2 />
                Invoice Returns (Sales)
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Money Out</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Vendors">
                <Store />
                Vendors
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Purchase Bills">
                <Receipt />
                Purchase Bills
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Invoice Returns (Purchase)">
                <Redo2 />
                Invoice Returns (Purchase)
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Accounts &amp; Books</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="My Accounts" isActive={pathname.startsWith('/my-accounts')} asChild>
                <Link href="/my-accounts" onClick={handleLinkClick}>
                    <Wallet />
                    My Accounts
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Journal Entries" isActive={pathname.startsWith('/journal-entries')} asChild>
                <Link href="/journal-entries" onClick={handleLinkClick}>
                    <BookOpen />
                    Journal Entries
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="Ledgers" isActive={pathname.startsWith('/ledgers')} asChild>
                <Link href="/ledgers" onClick={handleLinkClick}>
                    <Scale />
                    Ledgers
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="View All Transactions" isActive={pathname.startsWith('/all-transactions')} asChild>
                <Link href="/all-transactions" onClick={handleLinkClick}>
                    <History />
                    View All Transactions
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Reports</SidebarGroupLabel>
          <SidebarMenu>
             <SidebarMenuItem>
              <SidebarMenuButton tooltip="Profit &amp; Loss">
                <TrendingUp />
                Profit &amp; Loss
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton tooltip="What I Own / Owe">
                <Scale />
                What I Own / Owe
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton tooltip="GST Summary" isActive={pathname.startsWith('/gst-summary')} asChild>
                    <Link href="/gst-summary" onClick={handleLinkClick}>
                        <Percent />
                        GST Summary
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
                <SidebarMenuButton tooltip="GST Reports" isActive={pathname.startsWith('/gst-reports')} asChild>
                    <Link href="/gst-reports" onClick={handleLinkClick}>
                        <FileSpreadsheet />
                        GST Reports
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton tooltip="Invoice Overviews">
                <BookOpen />
                Invoice Overviews
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
                            Company Settings
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton tooltip="User Roles" isActive={pathname.startsWith('/settings/user-roles')} asChild>
                        <Link href="/settings/user-roles" onClick={handleLinkClick}>
                            <Shield />
                            User Roles
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
        <SidebarSeparator />
        <div className="flex items-center gap-2 p-2">
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
