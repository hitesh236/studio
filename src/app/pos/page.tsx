

'use client';

import * as React from 'react';
import { Search, Barcode, Plus, Minus, Trash2, X, CreditCard, Printer, Eye, ChevronsUpDown, Check as CheckIcon, Package, CheckCircle2, PlusCircle, Percent, Receipt, Hand, ListCollapse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { generateStockListData, type StockItem } from '@/app/stock-list/data';
import { generateData, type Person } from '@/lib/data';
import { cn, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { numberToWords } from '@/lib/utils';


type CartItem = StockItem & { 
    quantity: number; 
    discount: number; 
    discountType: '%' | 'fixed';
};

type HeldBill = {
    id: number;
    cart: CartItem[];
    customerId: string;
    customerName: string;
    time: Date;
    notes: string;
};


const ProductCard = ({ product, onAddToCart }: { product: StockItem, onAddToCart: (product: StockItem) => void }) => {
    return (
        <Card className="overflow-hidden cursor-pointer hover:border-primary transition-colors" onClick={() => onAddToCart(product)}>
            <CardContent className="p-3">
                <div className="flex items-start gap-3">
                    <div className="bg-muted rounded-md w-16 h-16 flex-shrink-0">
                         {/* Placeholder for an image */}
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm leading-tight line-clamp-2">{product.productName}</p>
                        <p className="text-xs text-muted-foreground">{product.sku}</p>
                        <Badge variant="outline" className="mt-1">{product.category}</Badge>
                    </div>
                </div>
                 <div className="flex justify-between items-baseline mt-2">
                    <span className="text-xs text-muted-foreground">{product.stockInHand} in stock</span>
                    <p className="text-lg font-bold font-mono">{formatCurrency(product.sellingPrice, 'INR')}</p>
                 </div>
            </CardContent>
        </Card>
    )
}

type Payment = {
    id: number;
    method: 'cash' | 'card' | 'upi' | 'pay-later';
    amount: number;
};

const PaymentDialog = ({ open, onOpenChange, totalAmount, onPaymentSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, totalAmount: number, onPaymentSuccess: (payments: Payment[]) => void }) => {
    const { toast } = useToast();
    const [payments, setPayments] = React.useState<Payment[]>([]);

    React.useEffect(() => {
        if (open) {
            setPayments([{ id: 1, method: 'cash', amount: totalAmount }]);
        } else {
            setPayments([]);
        }
    }, [open, totalAmount]);

    const totalPaid = React.useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);
    const remainingAmount = totalAmount - totalPaid;

    const handleAddPayment = () => {
        setPayments(prev => [...prev, { id: Date.now(), method: 'card', amount: 0 }]);
    };

    const handleRemovePayment = (id: number) => {
        setPayments(prev => prev.filter(p => p.id !== id));
    };
    
    const handleUpdatePayment = (id: number, field: 'method' | 'amount', value: string | number) => {
        setPayments(prev => prev.map(p => {
            if (p.id === id) {
                 const newPayment = { ...p, [field]: value };
                 if (field === 'method' && value === 'pay-later') {
                    newPayment.amount = totalAmount - payments.filter(pay => pay.id !== id).reduce((sum, pay) => sum + pay.amount, 0);
                 }
                 return newPayment;
            }
            return p;
        }));
    };

    const handleConfirmPayment = () => {
        if (Math.abs(remainingAmount) > 0.01 && !payments.some(p => p.method === 'pay-later')) {
            toast({ title: 'Payment Mismatch', description: 'The total paid amount does not match the total due. Use "Pay Later" for credit sales.', variant: 'destructive' });
            return;
        }
        onPaymentSuccess(payments);
        onOpenChange(false);
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Complete Payment</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex justify-between items-baseline bg-muted p-4 rounded-lg">
                        <span className="text-muted-foreground">Total Amount Due</span>
                        <span className="text-2xl font-bold font-mono tracking-tight">{formatCurrency(totalAmount, 'INR')}</span>
                    </div>

                    <div className="space-y-3">
                        {payments.map((payment) => (
                            <div key={payment.id} className="flex items-end gap-2">
                                <div className="flex-1">
                                    <Label htmlFor={`method-${payment.id}`}>Payment Method</Label>
                                    <Select
                                        value={payment.method}
                                        onValueChange={(value) => handleUpdatePayment(payment.id, 'method', value)}
                                    >
                                        <SelectTrigger id={`method-${payment.id}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="cash">Cash</SelectItem>
                                            <SelectItem value="card">Card</SelectItem>
                                            <SelectItem value="upi">UPI</SelectItem>
                                            <SelectItem value="pay-later">Pay Later</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="w-32">
                                     <Label htmlFor={`amount-${payment.id}`}>Amount</Label>
                                     <Input
                                        id={`amount-${payment.id}`}
                                        type="number"
                                        value={payment.amount}
                                        onChange={(e) => handleUpdatePayment(payment.id, 'amount', parseFloat(e.target.value) || 0)}
                                        placeholder="0.00"
                                        readOnly={payment.method === 'pay-later'}
                                     />
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive shrink-0"
                                    onClick={() => handleRemovePayment(payment.id)}
                                    disabled={payments.length <= 1}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    {remainingAmount > 0.01 && (
                         <Button variant="outline" className="w-full" onClick={handleAddPayment}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Payment Method
                        </Button>
                    )}

                    <div className={cn(
                        "flex justify-between items-baseline p-4 rounded-lg",
                        remainingAmount > 0.01 ? "bg-red-100 dark:bg-red-900/50 text-red-600" : "bg-green-100 dark:bg-green-900/50 text-green-600"
                    )}>
                        <span className="font-medium">
                             {remainingAmount > 0.01 ? "Remaining Amount" : "Change"}
                        </span>
                        <span className="text-2xl font-bold font-mono tracking-tight">{formatCurrency(Math.abs(remainingAmount), 'INR')}</span>
                    </div>

                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleConfirmPayment}>
                        Confirm Payment
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

const BillPreviewDialog = ({
    open,
    onOpenChange,
    cart,
    totals,
    customerName,
    documentType,
    documentNumber,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cart: CartItem[];
    totals: { subtotal: number; itemDiscount: number, orderDiscount: number, totalTax: number; total: number };
    customerName: string;
    documentType: 'Invoice' | 'Receipt';
    documentNumber: string;
  }) => {
    const handlePrint = () => {
      // A bit of a hack to print just the dialog content
      const printContents = document.getElementById('bill-preview-content')?.innerHTML;
      const originalContents = document.body.innerHTML;
      if (printContents) {
        document.body.innerHTML = printContents;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); // Reload to restore event listeners
      }
    };
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div id="bill-preview-content" className="text-sm font-mono bg-white text-black p-4">
            <h3 className="text-center font-bold text-lg">
                {documentType === 'Invoice' ? 'Tax Invoice' : 'Hicks Inc.'}
            </h3>
            <p className="text-center text-xs">{documentType} #: {documentNumber}</p>
            <p className="text-center text-xs">Date: {format(new Date(), 'dd-MMM-yyyy')}</p>
            <Separator className="my-2 border-black" />
            <p>Customer: {customerName}</p>
            <Separator className="my-2 border-black" />
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">Item</th>
                  <th className="text-center">Qty</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.id}>
                    <td>{item.productName}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">{item.sellingPrice.toFixed(2)}</td>
                    <td className="text-right">{(item.quantity * item.sellingPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Separator className="my-2 border-black border-dashed" />
            <div className="flex justify-end">
              <div className="w-48">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{totals.subtotal.toFixed(2)}</span>
                </div>
                {(totals.itemDiscount + totals.orderDiscount) > 0 && (
                    <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>- {(totals.itemDiscount + totals.orderDiscount).toFixed(2)}</span>
                    </div>
                )}
                <div className="flex justify-between">
                  <span>GST:</span>
                  <span>{totals.totalTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-base mt-1">
                  <span>TOTAL:</span>
                  <span>{totals.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
            <Separator className="my-2 border-black" />
            <p className="text-center">Thank you!</p>
          </div>
          <DialogFooter className="print:hidden">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <DialogClose asChild>
              <Button>Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
};

const AddCustomerDialog = ({ open, onOpenChange, onCustomerAdd, initialValue }: { open: boolean, onOpenChange: (open: boolean) => void, onCustomerAdd: (customer: Person) => void, initialValue?: string }) => {
    const [name, setName] = React.useState('');
    const [phone, setPhone] = React.useState('');

    React.useEffect(() => {
        if (open) {
            const isPhoneNumber = initialValue && /^\d{10,}$/.test(initialValue);
            setName(isPhoneNumber ? '' : initialValue || '');
            setPhone(isPhoneNumber ? initialValue || '' : '');
        }
    }, [open, initialValue]);

    const handleSave = () => {
        const newCustomer: Person = {
            id: `cust-${Date.now()}`,
            firstName: name.split(' ')[0] || '',
            lastName: name.split(' ').slice(1).join(' ') || '',
            email: '',
            company: name,
            phone: phone,
            saleAmount: 0,
            rating: 0,
            status: 'Active',
            address: { street: '', city: '', state: '', zip: '' },
            bio: 'Customer added from POS.',
            gstin: '-',
            type: 'Customer',
            balance: 0,
            lastSeen: new Date(),
        };
        onCustomerAdd(newCustomer);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add New Customer</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-cust-name" className="text-right">Name</Label>
                        <Input id="new-cust-name" value={name} onChange={e => setName(e.target.value)} className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="new-cust-phone" className="text-right">Phone</Label>
                        <Input id="new-cust-phone" value={phone} onChange={e => setPhone(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Customer</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

const CustomerCombobox = ({
    value,
    onChange,
    customers,
    onCustomerAdd,
}: {
    value: string;
    onChange: (value: string) => void;
    customers: Person[];
    onCustomerAdd: (customer: Person) => void;
}) => {
    const [open, setOpen] = React.useState(false);
    const [isAddCustomerOpen, setIsAddCustomerOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const walkInCustomer = { id: 'walk-in', company: 'Walk-in Customer', phone: '', gstin: '' };
    
    const displayValue = value === 'walk-in' ? 'Walk-in Customer' : customers.find(c => c.id === value)?.company || value;

    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" role="combobox" className="w-full justify-between">
                        {displayValue}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                    <Command filter={(value, search) => {
                        const customer = customers.find(c => c.id === value);
                        if (customer?.company.toLowerCase().includes(search.toLowerCase()) || customer?.phone?.includes(search)) return 1;
                        return 0;
                    }}>
                        <CommandInput placeholder="Search by name or phone..." onValueChange={setSearch} />
                        <CommandList>
                            <CommandEmpty>
                                <Button variant="ghost" className="w-full" onClick={() => { setIsAddCustomerOpen(true); setOpen(false); }}>
                                    <PlusCircle className="mr-2 h-4 w-4" /> Add "{search}" as a new customer
                                </Button>
                            </CommandEmpty>
                            <CommandGroup>
                                {[walkInCustomer, ...customers].map(customer => (
                                    <CommandItem
                                        key={customer.id}
                                        value={customer.id}
                                        onSelect={(currentValue) => {
                                            onChange(currentValue);
                                            setOpen(false);
                                        }}
                                    >
                                        <CheckIcon className={cn("mr-2 h-4 w-4", value === customer.id ? "opacity-100" : "opacity-0")} />
                                        <span>{customer.company}</span>
                                        {customer.phone && <span className="ml-2 text-muted-foreground text-xs">{customer.phone}</span>}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
            <AddCustomerDialog open={isAddCustomerOpen} onOpenChange={setIsAddCustomerOpen} onCustomerAdd={onCustomerAdd} initialValue={search} />
        </>
    );
};

// New Printable Receipt Component
const PrintableReceipt = React.forwardRef<HTMLDivElement, {
    cart: CartItem[];
    totals: { 
        subtotal: number; 
        itemDiscount: number;
        orderDiscount: number;
        totalTax: number;
        cgst: number;
        sgst: number;
        igst: number;
        total: number;
    };
    payments: Payment[];
    customerName: string;
    documentType: 'Invoice' | 'Receipt';
    documentNumber: string;
}>(({ cart, totals, payments, customerName, documentType, documentNumber }, ref) => {

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const amountDue = totals.total - totalPaid;

    return (
        <div ref={ref} className="p-1 font-mono text-xs text-black bg-white" style={{ width: '288px' }}>
            <div className="text-center space-y-1">
                <h3 className="font-bold text-sm">Hicks Inc.</h3>
                <p>123 Business Rd, Mumbai</p>
                <p>GSTIN: 27ABCDE1234F1Z5</p>
                <p>{documentType} #: {documentNumber}</p>
                <p>Date: {format(new Date(), 'dd-MMM-yy hh:mm a')}</p>
            </div>
            <div className="border-t border-b border-black border-dashed my-2 py-1">
                <p>Customer: {customerName}</p>
            </div>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left font-normal pb-1">Item</th>
                  <th className="text-center font-normal pb-1">Qty</th>
                  <th className="text-right font-normal pb-1">Rate</th>
                  <th className="text-right font-normal pb-1">Total</th>
                </tr>
              </thead>
              <tbody>
                {cart.map(item => (
                  <tr key={item.id} className="align-top">
                    <td className="pb-1">{item.productName}</td>
                    <td className="text-center pb-1">{item.quantity}</td>
                    <td className="text-right pb-1">{item.sellingPrice.toFixed(2)}</td>
                    <td className="text-right pb-1">{(item.quantity * item.sellingPrice).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="border-t border-black border-dashed my-1"></div>
            <div className="space-y-1">
                <div className="flex justify-between"><span>Subtotal:</span><span>{totals.subtotal.toFixed(2)}</span></div>
                {(totals.itemDiscount + totals.orderDiscount) > 0 && <div className="flex justify-between"><span>Discount:</span><span>-{(totals.itemDiscount + totals.orderDiscount).toFixed(2)}</span></div>}
                {totals.cgst > 0 && <div className="flex justify-between"><span>CGST:</span><span>{totals.cgst.toFixed(2)}</span></div>}
                {totals.sgst > 0 && <div className="flex justify-between"><span>SGST:</span><span>{totals.sgst.toFixed(2)}</span></div>}
                {totals.igst > 0 && <div className="flex justify-between"><span>IGST:</span><span>{totals.igst.toFixed(2)}</span></div>}
                <div className="border-t border-black my-1"></div>
                <div className="flex justify-between font-bold text-sm"><span>TOTAL:</span><span>{totals.total.toFixed(2)}</span></div>
                <div className="border-t border-black border-dashed my-1"></div>
                {payments.map(p => (
                    <div key={p.id} className="flex justify-between"><span>Paid ({p.method}):</span><span>{p.amount.toFixed(2)}</span></div>
                ))}
                <div className="flex justify-between font-bold"><span>Amount Due:</span><span>{amountDue.toFixed(2)}</span></div>
            </div>
            <div className="text-center mt-2">
                <p>Thank you!</p>
            </div>
        </div>
    );
});
PrintableReceipt.displayName = "PrintableReceipt";


export default function PosPage() {
    const { toast } = useToast();
    const [products, setProducts] = React.useState<StockItem[]>([]);
    const [customers, setCustomers] = React.useState<Person[]>([]);
    const [filteredProducts, setFilteredProducts] = React.useState<StockItem[]>([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [cart, setCart] = React.useState<CartItem[]>([]);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false);
    const [isOrderComplete, setIsOrderComplete] = React.useState(false);
    const [isClearCartAlertOpen, setIsClearCartAlertOpen] = React.useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
    const [selectedCustomerId, setSelectedCustomerId] = React.useState('walk-in');
    const [orderNotes, setOrderNotes] = React.useState('');
    const [activeCategory, setActiveCategory] = React.useState('All');
    const [finalDocumentType, setFinalDocumentType] = React.useState<'Invoice' | 'Receipt'>('Receipt');
    const [documentNumber, setDocumentNumber] = React.useState('');
    const [editingDiscountId, setEditingDiscountId] = React.useState<string | null>(null);
    const [discountInputValue, setDiscountInputValue] = React.useState<string>('');
    const printRef = React.useRef<HTMLDivElement>(null);
    const barcodeInputRef = React.useRef<HTMLInputElement>(null);
    const [heldBills, setHeldBills] = React.useState<HeldBill[]>([]);
    const [showHeldBills, setShowHeldBills] = React.useState(false);
    const [finalizedPayments, setFinalizedPayments] = React.useState<Payment[]>([]);
    
    const [orderDiscount, setOrderDiscount] = React.useState(0);
    const [orderDiscountType, setOrderDiscountType] = React.useState<'%' | 'fixed'>('%');

    const selectedCustomer = React.useMemo(() => {
        return customers.find(c => c.id === selectedCustomerId);
    }, [customers, selectedCustomerId]);
    
    const customerName = selectedCustomer?.company || 'Walk-in Customer';

    const documentType = React.useMemo(() => {
        const hasGstin = !!(selectedCustomer && selectedCustomer.gstin && selectedCustomer.gstin !== '-');
        return hasGstin ? 'Invoice' : 'Receipt';
    }, [selectedCustomer]);
    
     React.useEffect(() => {
        const prefix = documentType === 'Invoice' ? 'INV' : 'RCT';
        const newNumber = `${prefix}-${Math.floor(Math.random() * 9000) + 1000}`;
        setDocumentNumber(newNumber);
    }, [documentType, selectedCustomerId]);

    const shouldGenerateInvoice = (payments: Payment[]) => {
        const isPaidInFull = !payments.some(p => p.method === 'pay-later');
        return documentType === 'Invoice' || !isPaidInFull;
    };


    React.useEffect(() => {
        const productData = generateStockListData(50);
        const customerData = generateData(20);
        setProducts(productData);
        setCustomers(customerData);
        setFilteredProducts(productData);
    }, []);

    const productCategories = React.useMemo(() => {
        const cats = new Set(products.map(p => p.category));
        return ['All', ...Array.from(cats)];
    }, [products]);

    React.useEffect(() => {
        let results = products;
        if (activeCategory !== 'All') {
            results = results.filter(p => p.category === activeCategory);
        }
        if (searchTerm) {
            results = results.filter(p => 
                p.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                p.sku.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        setFilteredProducts(results);
    }, [searchTerm, products, activeCategory]);
    
    const addToCart = (product: StockItem) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item => 
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevCart, { ...product, quantity: 1, discount: 0, discountType: '%' }];
            }
        });
    };

    const updateQuantity = (productId: string, change: 1 | -1) => {
        setCart(prevCart => {
            return prevCart.map(item => {
                if (item.id === productId) {
                    const newQuantity = item.quantity + change;
                    return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
                }
                return item;
            }).filter(Boolean) as CartItem[];
        });
    };
    
    const updateDiscount = (productId: string, discount: number) => {
        setCart(prevCart => 
            prevCart.map(item => 
                item.id === productId ? { ...item, discount: Math.max(0, discount) } : item
            )
        );
    };

    const toggleDiscountType = (productId: string) => {
        setCart(prevCart => 
            prevCart.map(item => 
                item.id === productId ? { ...item, discountType: item.discountType === '%' ? 'fixed' : '%' } : item
            )
        );
    }

    const removeFromCart = (productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };
    
    const handleCustomerAdd = (newCustomer: Person) => {
        setCustomers(prev => [...prev, newCustomer]);
        setSelectedCustomerId(newCustomer.id);
        toast({
            title: "Customer Added",
            description: `${newCustomer.company} has been added successfully.`
        });
    };

    const cartTotals = React.useMemo(() => {
        const subtotal = cart.reduce((acc, item) => acc + (item.sellingPrice * item.quantity), 0);
        
        const itemDiscount = cart.reduce((acc, item) => {
            const itemTotal = item.sellingPrice * item.quantity;
            if (item.discountType === '%') {
                return acc + (itemTotal * (item.discount / 100));
            } else {
                return acc + Math.min(item.discount, itemTotal); // Fixed discount cannot be more than item total
            }
        }, 0);

        const subtotalAfterItemDiscount = subtotal - itemDiscount;

        let orderDiscountAmount = 0;
        if (orderDiscountType === '%') {
            orderDiscountAmount = subtotalAfterItemDiscount * (orderDiscount / 100);
        } else {
            orderDiscountAmount = Math.min(orderDiscount, subtotalAfterItemDiscount);
        }
        
        const taxableAmount = subtotalAfterItemDiscount - orderDiscountAmount;
        const gst = taxableAmount * 0.18; // Assume flat 18% GST for simplicity
        const total = taxableAmount + gst;

        const isIntraState = selectedCustomer?.address.state === 'Maharashtra'; // Assuming seller is in MH
        const cgst = isIntraState ? gst / 2 : 0;
        const sgst = isIntraState ? gst / 2 : 0;
        const igst = !isIntraState ? gst : 0;

        return { subtotal, itemDiscount, orderDiscount: orderDiscountAmount, totalTax: gst, cgst, sgst, igst, total };
    }, [cart, orderDiscount, orderDiscountType, selectedCustomer]);

    const handlePaymentSuccess = (payments: Payment[]) => {
        const docType = shouldGenerateInvoice(payments) ? 'Invoice' : 'Receipt';
        setFinalDocumentType(docType);
        setFinalizedPayments(payments);

        toast({
            title: `${docType} Created!`,
            description: `Paid ${formatCurrency(cartTotals.total, 'INR')}.`
        });
        setIsOrderComplete(true);
    };

    const handleNewOrder = () => {
        setCart([]);
        setIsOrderComplete(false);
        setSearchTerm('');
        setSelectedCustomerId('walk-in');
        setOrderNotes('');
        setActiveCategory('All');
        setOrderDiscount(0);
        setOrderDiscountType('%');
        setFinalizedPayments([]);
        barcodeInputRef.current?.focus();
    };
    
    const handlePrintReceipt = () => {
        const printContent = printRef.current;
        if (printContent) {
          const originalContents = document.body.innerHTML;
          const printContentsHTML = printContent.outerHTML;
          document.body.innerHTML = `<html><head><title>Print</title></head><body>${printContentsHTML}</body></html>`;
          window.print();
          document.body.innerHTML = originalContents;
          window.location.reload();
        }
    };
    
    const handleBarcodeScan = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const barcode = e.currentTarget.value.trim();
            if (barcode) {
                const product = products.find(p => p.sku === barcode || p.id === barcode);
                if (product) {
                    addToCart(product);
                    toast({ title: 'Item Added', description: `${product.productName} added to cart.` });
                } else {
                    toast({ variant: 'destructive', title: 'Product Not Found', description: `No product found with barcode: ${barcode}` });
                }
                e.currentTarget.value = '';
            }
        }
    };
    
    const handleHoldBill = () => {
        if (cart.length === 0) {
            toast({ variant: 'destructive', title: 'Cart is empty' });
            return;
        }
        const newHeldBill: HeldBill = {
            id: Date.now(),
            cart,
            customerId: selectedCustomerId,
            customerName: customerName,
            time: new Date(),
            notes: orderNotes
        };
        setHeldBills(prev => [...prev, newHeldBill]);
        toast({ title: 'Bill Held', description: `Bill for ${customerName} has been put on hold.`});
        handleNewOrder();
    };
    
    const handleRecallBill = (bill: HeldBill) => {
        if (cart.length > 0) {
            toast({ variant: 'destructive', title: 'Cannot recall bill', description: 'Please clear or complete the current cart first.' });
            return;
        }
        setCart(bill.cart);
        setSelectedCustomerId(bill.customerId);
        setOrderNotes(bill.notes);
        setHeldBills(prev => prev.filter(b => b.id !== bill.id));
        setShowHeldBills(false);
        toast({ title: 'Bill Recalled', description: `Resumed bill for ${bill.customerName}.` });
    };

    return (
        <TooltipProvider>
            <div className="h-screen flex flex-col print:block print:p-0 bg-muted/40">
                <div className="flex-1 grid md:grid-cols-[1fr_420px] gap-4 p-4 overflow-hidden">
                    {/* Left Side - Products */}
                    <div className="flex flex-col h-full bg-card rounded-lg shadow-sm print:hidden overflow-hidden">
                        <div className="p-4 border-b space-y-4">
                            <div className="flex flex-col sm:flex-row gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input autoFocus placeholder="Search by name or SKU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                                </div>
                                <div className="relative">
                                    <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input ref={barcodeInputRef} placeholder="Scan Barcode" className="pl-10" onKeyDown={handleBarcodeScan} />
                                </div>
                            </div>
                            <ScrollArea className="w-full whitespace-nowrap">
                                <div className="flex gap-2 pb-2">
                                    {productCategories.map(cat => (
                                        <Button key={cat} variant={activeCategory === cat ? 'default' : 'outline'} onClick={() => setActiveCategory(cat)}>
                                            {cat}
                                        </Button>
                                    ))}
                                </div>
                            </ScrollArea>
                        </div>
                         <ScrollArea className="flex-1 p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredProducts.map(p => (
                                    <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
                                ))}
                            </div>
                         </ScrollArea>
                    </div>

                    {/* Right Side - Cart */}
                    <div className={cn("flex flex-col h-full bg-card rounded-lg shadow-sm overflow-hidden", isOrderComplete ? 'hidden print:flex' : 'flex', showHeldBills ? 'hidden' : 'flex')}>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Current Order</CardTitle>
                                <div className="flex items-center gap-1">
                                    <Button variant="outline" size="sm" onClick={handleHoldBill}><Hand className="mr-1 h-4 w-4" /> Hold</Button>
                                    <Button variant="outline" size="sm" onClick={() => setShowHeldBills(true)} className="relative">
                                        <ListCollapse className="mr-1 h-4 w-4" /> Recall
                                        {heldBills.length > 0 && <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 justify-center rounded-full">{heldBills.length}</Badge>}
                                    </Button>
                                </div>
                            </div>
                            <div className="pt-2">
                                <Label htmlFor="customer-name">Customer</Label>
                                <CustomerCombobox
                                    value={selectedCustomerId}
                                    onChange={setSelectedCustomerId}
                                    customers={customers}
                                    onCustomerAdd={handleCustomerAdd}
                                />
                            </div>
                        </CardHeader>
                        <ScrollArea className="flex-1">
                            <CardContent className="p-4 pt-0">
                                {cart.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground pt-12">
                                        <Package className="h-12 w-12 mb-4" />
                                        <p>Your cart is empty.</p>
                                        <p className="text-xs">Select products to get started.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {cart.map(item => (
                                            <div key={item.id} className="flex items-start gap-4">
                                                <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0"></div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-sm line-clamp-2">{item.productName}</p>
                                                    <p className="text-sm font-mono">{formatCurrency(item.sellingPrice, 'INR')}</p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.id, -1)}><Minus className="h-4 w-4" /></Button>
                                                        <span className="w-6 text-center font-mono">{item.quantity}</span>
                                                        <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => updateQuantity(item.id, 1)}><Plus className="h-4 w-4" /></Button>
                                                        <div className="flex items-center rounded-md border">
                                                            <Input 
                                                                type="number" 
                                                                value={editingDiscountId === item.id ? discountInputValue : item.discount} 
                                                                onFocus={() => {
                                                                    setEditingDiscountId(item.id);
                                                                    setDiscountInputValue(item.discount > 0 ? String(item.discount) : '');
                                                                }}
                                                                onBlur={() => {
                                                                    updateDiscount(item.id, parseFloat(discountInputValue) || 0);
                                                                    setEditingDiscountId(null);
                                                                }}
                                                                onChange={e => setDiscountInputValue(e.target.value)} 
                                                                className="h-8 w-16 pl-2 pr-1 text-sm text-right border-0 focus-visible:ring-0" 
                                                                placeholder="Disc" 
                                                            />
                                                            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleDiscountType(item.id)}>
                                                                {item.discountType === '%' ? <Percent className="h-4 w-4" /> : <Receipt className="h-4 w-4" />}
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-mono font-semibold">{formatCurrency(item.sellingPrice * item.quantity * (1 - (item.discountType === '%' ? item.discount / 100 : 0)) - (item.discountType === 'fixed' ? item.discount : 0), 'INR')}</p>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground mt-2" onClick={() => removeFromCart(item.id)}><X className="h-4 w-4" /></Button>
                                                </div>
                                            </div>
                                        ))}
                                        <Separator />
                                        <div className="space-y-2">
                                            <Label htmlFor="order-notes">Order Notes</Label>
                                            <Textarea id="order-notes" value={orderNotes} onChange={e => setOrderNotes(e.target.value)} placeholder="e.g., No onions" rows={2} />
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </ScrollArea>
                        {cart.length > 0 && (
                            <CardFooter className="flex-col !p-4 border-t mt-auto">
                                <div className="w-full space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span className="font-mono">{formatCurrency(cartTotals.subtotal, 'INR')}</span>
                                    </div>
                                    {(cartTotals.itemDiscount + cartTotals.orderDiscount) > 0 && (
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Discount</span>
                                            <span className="font-mono text-destructive">- {formatCurrency(cartTotals.itemDiscount + cartTotals.orderDiscount, 'INR')}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center">
                                        <Label htmlFor="order-discount" className="text-muted-foreground">Order Discount</Label>
                                        <div className="flex items-center rounded-md border w-32">
                                            <Input
                                                type="number"
                                                id="order-discount"
                                                value={orderDiscount}
                                                onChange={(e) => setOrderDiscount(parseFloat(e.target.value) || 0)}
                                                className="h-7 pl-2 pr-1 text-xs text-right border-0 focus-visible:ring-0"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => setOrderDiscountType(p => p === '%' ? 'fixed' : '%')}
                                            >
                                                {orderDiscountType === '%' ? <Percent className="h-3 w-3" /> : <Receipt className="h-3 w-3" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">GST (18%)</span>
                                        <span className="font-mono">{formatCurrency(cartTotals.totalTax, 'INR')}</span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex justify-between items-center text-lg font-bold">
                                        <div className="flex items-center gap-1.5">
                                            <span>Total</span>
                                            <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
                                              <Tooltip>
                                                <TooltipTrigger asChild>
                                                  <DialogTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-5 w-5 text-muted-foreground">
                                                      <Eye className="h-4 w-4" />
                                                    </Button>
                                                  </DialogTrigger>
                                                </TooltipTrigger>
                                                <TooltipContent>
                                                  <p>{documentType} No: {documentNumber}</p>
                                                </TooltipContent>
                                              </Tooltip>
                                            </Dialog>
                                        </div>
                                        <span className="font-mono">{formatCurrency(cartTotals.total, 'INR')}</span>
                                    </div>
                                </div>
                                <div className="w-full mt-4 flex gap-2">
                                     <Button size="lg" className="w-full" onClick={() => setIsPaymentDialogOpen(true)}>
                                        <CreditCard className="mr-2 h-5 w-5" />
                                        Pay Now
                                    </Button>
                                     <Button size="lg" variant="destructive" onClick={() => setIsClearCartAlertOpen(true)}>
                                        Clear
                                    </Button>
                                </div>
                            </CardFooter>
                        )}
                    </div>
                    
                    {/* Held Bills Panel */}
                    <div className={cn("flex-col h-full bg-card rounded-lg shadow-sm overflow-hidden", showHeldBills ? 'flex' : 'hidden')}>
                        <CardHeader className="flex-row justify-between items-center">
                            <CardTitle>Recalled Bills</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => setShowHeldBills(false)}><X className="h-5 w-5" /></Button>
                        </CardHeader>
                        <ScrollArea className="flex-1">
                            <CardContent className="p-4 pt-0 space-y-3">
                                {heldBills.length === 0 ? (
                                    <div className="text-center text-muted-foreground py-12">No bills on hold.</div>
                                ) : (
                                    heldBills.map(bill => (
                                        <Card key={bill.id} className="cursor-pointer hover:border-primary" onClick={() => handleRecallBill(bill)}>
                                            <CardContent className="p-3">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-semibold">{bill.customerName}</p>
                                                        <p className="text-xs text-muted-foreground">{format(bill.time, "p")}</p>
                                                    </div>
                                                    <p className="font-mono font-bold text-lg">{formatCurrency(bill.cart.reduce((sum, item) => sum + item.quantity * item.sellingPrice, 0), 'INR')}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))
                                )}
                            </CardContent>
                        </ScrollArea>
                    </div>

                    {/* Post-Order Screen */}
                    <div className={cn("flex-col h-full bg-card rounded-lg shadow-sm print:hidden", isOrderComplete ? 'flex' : 'hidden')}>
                        <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-6">
                            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                            <h2 className="text-2xl font-semibold">{finalDocumentType} Created!</h2>
                            <p className="text-muted-foreground mt-2">The order has been completed successfully.</p>
                             <div className="flex gap-4 mt-8">
                                <Button size="lg" variant="outline" onClick={handlePrintReceipt}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print {finalDocumentType}
                                </Button>
                                 <Button size="lg" onClick={handleNewOrder}>
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    New Order
                                </Button>
                            </div>
                        </CardContent>
                    </div>
                </div>

                <PaymentDialog 
                    open={isPaymentDialogOpen} 
                    onOpenChange={setIsPaymentDialogOpen} 
                    totalAmount={cartTotals.total} 
                    onPaymentSuccess={handlePaymentSuccess}
                />
                
                <BillPreviewDialog
                    open={isPreviewOpen}
                    onOpenChange={setIsPreviewOpen}
                    cart={cart}
                    totals={cartTotals}
                    customerName={customerName}
                    documentType={documentType}
                    documentNumber={documentNumber}
                />

                <AlertDialog open={isClearCartAlertOpen} onOpenChange={setIsClearCartAlertOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will clear all items from the current order. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction asChild>
                                <Button variant="destructive" onClick={() => { setCart([]); setOrderNotes(''); setOrderDiscount(0); setIsClearCartAlertOpen(false); }}>
                                    Clear Cart
                                </Button>
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <div className="hidden">
                    <div className="print-content">
                         <PrintableReceipt
                            ref={printRef}
                            cart={cart}
                            totals={cartTotals}
                            payments={finalizedPayments}
                            customerName={customerName}
                            documentType={finalDocumentType}
                            documentNumber={documentNumber}
                        />
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
}
