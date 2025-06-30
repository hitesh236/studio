import { ProfileForm } from './profile-form';
import { ChangePasswordForm } from './change-password-form';

export default function ProfilePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-4xl mx-auto">
      <ProfileForm />
      <ChangePasswordForm />
    </div>
  );
}
