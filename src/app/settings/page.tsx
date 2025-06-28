
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>Settings</CardTitle>
          <CardDescription>Manage your company settings and preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-semibold">Company</h2>
          {/* Company settings form can be added here */}
        </CardContent>
      </Card>
    </div>
  );
}
