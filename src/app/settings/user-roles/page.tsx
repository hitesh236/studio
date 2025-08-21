
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, Trash2, Edit, Users, Mail, KeyRound } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import useUserRole from '@/hooks/use-user-role';
import Link from 'next/link';

type Role = 'Admin' | 'Accountant' | 'Auditor' | 'Guest';

type User = {
    id: string;
    name: string;
    email: string;
    role: Role;
    avatar: string;
};

const initialUsers: User[] = [
  { id: 'user-1', name: 'Jane Doe', email: 'jane.doe@hicks.inc', role: 'Admin', avatar: '/avatars/01.png' },
  { id: 'user-2', name: 'John Smith', email: 'john.smith@example.com', role: 'Accountant', avatar: '/avatars/02.png' },
  { id: 'user-3', name: 'Peter Jones', email: 'peter.jones@example.com', role: 'Auditor', avatar: '/avatars/03.png' },
  { id: 'user-4', name: 'Mary Jane', email: 'mary.jane@example.com', role: 'Guest', avatar: '/avatars/04.png' },
];

const availableRoles: Role[] = ['Admin', 'Accountant', 'Auditor', 'Guest'];

const InviteUserDialog = ({ onInvite }: { onInvite: (email: string, role: Role) => void }) => {
    const [email, setEmail] = React.useState('');
    const [role, setRole] = React.useState<Role>('Guest');

    const handleInvite = () => {
        if (email.trim()) {
            onInvite(email, role);
        }
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Invite New User</DialogTitle>
                <DialogDescription>
                    Enter the user's email and assign them a role. They will receive an invitation to join.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="email" className="text-right">Email</Label>
                    <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="role" className="text-right">Role</Label>
                     <Select onValueChange={(value) => setRole(value as Role)} defaultValue={role}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {availableRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <DialogClose asChild>
                    <Button onClick={handleInvite}>Send Invitation</Button>
                </DialogClose>
            </DialogFooter>
        </DialogContent>
    );
};


export default function UserRolesPage() {
  const { role: currentRole, setRole: setAppRole } = useUserRole();
  const [users, setUsers] = React.useState(initialUsers);
  const { toast } = useToast();

  const handleInviteUser = (email: string, role: Role) => {
    const newUser = {
        id: `user-${Date.now()}`,
        name: 'Invited User',
        email,
        role,
        avatar: '',
    };
    setUsers(prev => [...prev, newUser]);
    toast({
        title: 'Invitation Sent',
        description: `${email} has been invited as a(n) ${role}.`,
    });
  };
  
  const handleRoleChange = (userId: string, newRole: Role) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    toast({ title: 'Role Updated', description: `User role has been changed to ${newRole}.` });
  };

  const handleRemoveUser = (userId: string) => {
    const userToRemove = users.find(u => u.id === userId);
    setUsers(prev => prev.filter(u => u.id !== userId));
    if (userToRemove) {
        toast({ title: 'User Removed', description: `${userToRemove.name} has been removed from the system.`, variant: 'destructive' });
    }
  }

  return (
    <div data-section="main-content" className="p-4 sm:p-6 lg:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex gap-2">
            <Button asChild variant="outline">
                <Link href="/settings/user-roles/new">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create New Role
                </Link>
            </Button>
            <Dialog>
                <DialogTrigger asChild>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" /> Invite User
                    </Button>
                </DialogTrigger>
                <InviteUserDialog onInvite={handleInviteUser} />
            </Dialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Current Users</CardTitle>
          <CardDescription>
            Manage existing users and their roles in the organization.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[350px]">User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell>
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                    </TableCell>
                    <TableCell>
                       <Select onValueChange={(value) => handleRoleChange(user.id, value as Role)} defaultValue={user.role}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {availableRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleRemoveUser(user.id)} disabled={user.role === 'Admin'}>
                           <Trash2 className="h-4 w-4" />
                           <span className="sr-only">Remove User</span>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mt-8">
          <CardHeader>
              <CardTitle>Simulate Role</CardTitle>
              <CardDescription>
                  For demonstration, you can switch the global user role here to see how the UI changes based on permissions.
              </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="flex items-center gap-4">
                  <Label>Current Simulated Role:</Label>
                  <Select onValueChange={(value) => setAppRole(value as Role)} value={currentRole}>
                      <SelectTrigger className="w-[200px]">
                          <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                           {availableRoles.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                  </Select>
              </div>
          </CardContent>
      </Card>
    </div>
  );
}
