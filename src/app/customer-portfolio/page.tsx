
import { generateData, Person } from "@/lib/data";
import { generateSalesInvoices, SalesInvoice } from "@/app/sales-invoices/data";
import { generateJournalEntries } from "@/app/journal-entries/data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Mail, Phone, Building, MapPin, ExternalLink } from "lucide-react";
import { format } from 'date-fns';
import { formatCurrency, cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CustomerPortfolioPage() {
  // For demonstration, we'll use a consistent set of data.
  const customer: Person = generateData(1)[0];
  
  // Filter invoices for this customer
  const allInvoices = generateSalesInvoices(50);
  const customerInvoices = allInvoices.filter(inv => inv.customerName === customer.company).slice(0, 5);

  // Generate and filter ledger entries for this customer
  const allJournalEntries = generateJournalEntries(50);
  let balance = 0;
  const customerLedger = allJournalEntries
    .filter(entry => 
        entry.lines.some(line => line.account === 'Accounts Receivable') &&
        (entry.description.toLowerCase().includes('sales') || entry.description.toLowerCase().includes('received cash'))
    )
    .sort((a,b) => a.date.getTime() - b.date.getTime())
    .slice(0, 8)
    .map(entry => {
        const arLine = entry.lines.find(l => l.account === 'Accounts Receivable');
        
        balance += (arLine?.debit ?? 0) - (arLine?.credit ?? 0);

        return {
            date: entry.date,
            particulars: entry.description,
            debit: arLine?.debit ?? 0,
            credit: arLine?.credit ?? 0,
            balance: balance,
        };
    });


  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <Card>
        <CardHeader className="p-6 border-b">
            <div className="flex items-center gap-4">
                <UserCircle className="h-12 w-12 text-muted-foreground" />
                <div>
                    <CardTitle className="text-2xl">{`${customer.firstName} ${customer.lastName}`}</CardTitle>
                    <CardDescription>Customer Portfolio Overview</CardDescription>
                </div>
            </div>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="m-4">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="invoices">Sales Invoices</TabsTrigger>
              <TabsTrigger value="ledger">Ledger</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="p-6 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                 <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Contact Information</h3>
                    <div className="flex items-start gap-4">
                        <Mail className="h-5 w-5 mt-1 text-muted-foreground shrink-0" />
                        <div>
                            <p className="font-medium">Email</p>
                            <p className="text-muted-foreground">{customer.email}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Phone className="h-5 w-5 mt-1 text-muted-foreground shrink-0" />
                        <div>
                            <p className="font-medium">Phone</p>
                            <p className="text-muted-foreground">{customer.phone}</p>
                        </div>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Company Information</h3>
                    <div className="flex items-start gap-4">
                        <Building className="h-5 w-5 mt-1 text-muted-foreground shrink-0" />
                        <div>
                            <p className="font-medium">Company</p>
                            <p className="text-muted-foreground">{customer.company}</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <MapPin className="h-5 w-5 mt-1 text-muted-foreground shrink-0" />
                        <div>
                            <p className="font-medium">Address</p>
                            <p className="text-muted-foreground">
                                {customer.address.street}<br/>
                                {customer.address.city}, {customer.address.state} {customer.address.zip}
                            </p>
                        </div>
                    </div>
                     <div className="flex items-start gap-4">
                        <Badge variant="outline">{customer.status}</Badge>
                     </div>
                 </div>
              </div>
            </TabsContent>

            <TabsContent value="invoices">
              <div className="border-t">
                <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customerInvoices.map((invoice) => {
                            let statusVariant: "default" | "secondary" | "destructive" | "outline";
                            switch (invoice.paymentStatus) {
                            case "Paid":
                                statusVariant = "default";
                                break;
                            case "Partially Paid":
                                statusVariant = "secondary";
                                break;
                            case "Overdue":
                                statusVariant = "destructive";
                                break;
                            default:
                                statusVariant = "outline";
                            }
                            return (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                                    <TableCell>{format(invoice.invoiceDate, 'dd-MMM-yyyy')}</TableCell>
                                    <TableCell>{format(invoice.dueDate, 'dd-MMM-yyyy')}</TableCell>
                                    <TableCell className="text-right font-mono">{formatCurrency(invoice.amountBase, 'INR')}</TableCell>
                                    <TableCell className="text-center"><Badge variant={statusVariant}>{invoice.paymentStatus}</Badge></TableCell>
                                    <TableCell className="text-right">
                                      <Button asChild variant="ghost" size="icon">
                                          <Link href="/invoice-preview"><ExternalLink className="h-4 w-4" /></Link>
                                      </Button>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                         {customerInvoices.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24">No invoices found for this customer.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="ledger">
                <div className="border-t">
                    <Table>
                        <TableHeader>
                            <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Particulars</TableHead>
                            <TableHead className="text-right">Debit</TableHead>
                            <TableHead className="text-right">Credit</TableHead>
                            <TableHead className="text-right">Balance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {customerLedger.map((entry, index) => (
                                <TableRow key={index}>
                                    <TableCell>{format(entry.date, 'dd-MMM-yyyy')}</TableCell>
                                    <TableCell>{entry.particulars}</TableCell>
                                    <TableCell className="text-right font-mono">{entry.debit > 0 ? formatCurrency(entry.debit, 'INR') : '-'}</TableCell>
                                    <TableCell className="text-right font-mono">{entry.credit > 0 ? formatCurrency(entry.credit, 'INR') : '-'}</TableCell>
                                    <TableCell className={cn("text-right font-mono", entry.balance < 0 ? 'text-destructive' : '')}>{formatCurrency(Math.abs(entry.balance), 'INR')} {entry.balance >= 0 ? 'Dr' : 'Cr'}</TableCell>
                                </TableRow>
                            ))}
                            {customerLedger.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">No ledger entries found for this customer.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
