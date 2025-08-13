
'use client';

import * as React from 'react';
import { ProfileForm } from './profile-form';
import { ChangePasswordForm } from './change-password-form';
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Mail, Phone, Briefcase } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const user = {
    name: 'Jane Doe',
    email: 'jane.doe@hicks.inc',
    role: 'Administrator',
    phone: '(123) 456-7890',
    department: 'Accounting',
    bio: 'Manages all accounting and administrative tasks for Hicks Inc.'
};

export default function ProfilePage() {
    const [isDetailsExpanded, setIsDetailsExpanded] = React.useState(false);

  return (
    <div data-section="main-content" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="https://placehold.co/64x64.png" alt={user.name} data-ai-hint="person avatar" />
                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{user.name}</CardTitle>
                <CardDescription>{user.role}</CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}>
                {isDetailsExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                <span className="sr-only">{isDetailsExpanded ? 'Collapse' : 'Expand'} details</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-4 text-sm">
                <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <p className="text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <p className="text-muted-foreground">{user.phone}</p>
                </div>
                <div className="flex items-start gap-3">
                    <Briefcase className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <p className="text-muted-foreground">{user.department} Department</p>
                </div>
            </div>
            {isDetailsExpanded && (
                <>
                    <Separator className="my-4" />
                    <div className="space-y-4 text-sm">
                        <div>
                            <h4 className="font-semibold mb-1">Bio</h4>
                            <p className="text-muted-foreground italic">{user.bio}</p>
                        </div>
                    </div>
                </>
            )}
        </CardContent>
      </Card>
      
      <Tabs defaultValue="settings">
        <TabsList>
          <TabsTrigger value="settings">Profile Settings</TabsTrigger>
          <TabsTrigger value="password">Change Password</TabsTrigger>
        </TabsList>
        <TabsContent value="settings" className="mt-4">
          <ProfileForm />
        </TabsContent>
        <TabsContent value="password" className="mt-4">
          <ChangePasswordForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
