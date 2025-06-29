
'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Check, X, PlusCircle, Edit, Trash2 } from 'lucide-react';

type Role = 'Admin' | 'Accountant' | 'Auditor';

type Permission = {
  feature: string;
  permissions: Record<Role, boolean>;
};

const initialPermissions: Permission[] = [
  {
    feature: 'Dashboard Access',
    permissions: { Admin: true, Accountant: true, Auditor: true },
  },
  {
    feature: 'Customer Management',
    permissions: { Admin: true, Accountant: true, Auditor: false },
  },
  {
    feature: 'Sales Invoices',
    permissions: { Admin: true, Accountant: true, Auditor: false },
  },
  {
    feature: 'Purchase Bills',
    permissions: { Admin: true, Accountant: true, Auditor: false },
  },
  {
    feature: 'Journal Entries',
    permissions: { Admin: true, Accountant: true, Auditor: false },
  },
  {
    feature: 'View Reports',
    permissions: { Admin: true, Accountant: true, Auditor: true },
  },
  {
    feature: 'Export Data',
    permissions: { Admin: true, Accountant: true, Auditor: true },
  },
  {
    feature: 'User Management',
    permissions: { Admin: true, Accountant: false, Auditor: false },
  },
  {
    feature: 'Company Settings',
    permissions: { Admin: true, Accountant: false, Auditor: false },
  },
];

const PermissionIcon = ({ allowed }: { allowed: boolean }) => {
  return allowed ? (
    <Check className="h-5 w-5 text-green-500" />
  ) : (
    <X className="h-5 w-5 text-destructive" />
  );
};

export default function UserRolesPage() {
  const [permissions, setPermissions] = React.useState(initialPermissions);

  const roles: Role[] = ['Admin', 'Accountant', 'Auditor'];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Roles & Permissions</h1>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Role
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>
            Manage what users can see and do in your organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Feature / Permission</TableHead>
                  {roles.map(role => (
                    <TableHead key={role} className="text-center">
                      <div className="flex flex-col items-center">
                        <span>{role}</span>
                        <div className="flex items-center gap-1 mt-1">
                           <Button variant="ghost" size="icon" className="h-7 w-7"><Edit className="h-4 w-4" /></Button>
                           <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {permissions.map(permission => (
                  <TableRow key={permission.feature}>
                    <TableCell className="font-medium">{permission.feature}</TableCell>
                    {roles.map(role => (
                      <TableCell key={role} className="text-center">
                        <div className="flex justify-center">
                           <PermissionIcon allowed={permission.permissions[role]} />
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
