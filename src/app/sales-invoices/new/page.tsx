import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function CreateInvoicePage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <Card className="max-w-4xl mx-auto">
            <CardHeader>
                <CardTitle>Create New Invoice</CardTitle>
                <CardDescription>Fill out the form below to create a new sales invoice.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Invoice form will go here.</p>
            </CardContent>
        </Card>
    </div>
  );
}
