
import { ProfileForm } from './profile-form';
import { ChangePasswordForm } from './change-password-form';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ProfilePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="https://placehold.co/64x64.png" alt="Jane Doe" data-ai-hint="person avatar" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">Jane Doe</CardTitle>
              <CardDescription>jane.doe@hicks.inc</CardDescription>
            </div>
          </div>
        </CardHeader>
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
