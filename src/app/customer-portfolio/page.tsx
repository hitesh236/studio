import { generateData, Person } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, UserCircle } from "lucide-react";

export default function CustomerPortfolioPage() {
  // For demonstration, we'll just take the first customer generated.
  const customer: Person = generateData(1)[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="p-6">
            <div className="flex items-center gap-4">
                <UserCircle className="h-10 w-10 text-muted-foreground" />
                <div>
                    <CardTitle className="text-2xl">{`${customer.firstName} ${customer.lastName}`}</CardTitle>
                    <p className="text-sm text-muted-foreground">Customer Portfolio</p>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-6 pt-0">
            <div className="flex items-start gap-4">
                <MapPin className="h-5 w-5 mt-1 text-muted-foreground shrink-0" />
                <div>
                    <p className="font-semibold">Address</p>
                    <p className="text-muted-foreground">
                        {customer.address.street}<br/>
                        {customer.address.city}, {customer.address.state} {customer.address.zip}
                    </p>
                </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
