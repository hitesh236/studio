import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewJournalEntryPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader>
          <CardTitle>New Journal Entry</CardTitle>
          <CardDescription>
            Record a new financial transaction by specifying the accounts and amounts to be debited and credited.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Journal entry form component will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
