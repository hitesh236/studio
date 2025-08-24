
import type { LucideIcon } from 'lucide-react';
import { FileWarning, PackageX, UserPlus } from 'lucide-react';

export type Notification = {
  id: string;
  type: 'invoice' | 'stock' | 'user';
  title: string;
  description: string;
  date: Date;
  read: boolean;
  icon: LucideIcon;
  href?: string;
};

export const generateNotifications = (): Notification[] => {
  const now = new Date();
  return [
    {
      id: 'notif-1',
      type: 'invoice',
      title: 'Invoice #INV-002 Overdue',
      description: 'Invoice for Synergy Co. was due 3 days ago.',
      date: new Date(new Date().setDate(now.getDate() - 3)),
      read: false,
      icon: FileWarning,
      href: '/sales-invoices',
    },
    {
      id: 'notif-2',
      type: 'stock',
      title: 'Low Stock Alert',
      description: 'Basmati Rice (1kg) is below the reorder point.',
      date: new Date(new Date().setDate(now.getDate() - 1)),
      read: false,
      icon: PackageX,
      href: '/stock-list',
    },
    {
      id: 'notif-3',
      type: 'user',
      title: 'New User Invited',
      description: 'You have invited peter.jones@example.com as an Auditor.',
      date: new Date(),
      read: true,
      icon: UserPlus,
      href: '/settings/user-roles',
    },
    {
      id: 'notif-4',
      type: 'stock',
      title: 'Low Stock Alert',
      description: 'Aashirvaad Atta (10kg) is running low.',
      date: new Date(),
      read: true,
      icon: PackageX,
      href: '/stock-list',
    },
  ];
};
