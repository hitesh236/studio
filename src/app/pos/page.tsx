
'use client';

import * as React from 'react';
import { Search, Barcode, Plus, Minus, Trash2, X, CreditCard, Printer, Package, CheckCircle2, PlusCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { generateStockListData, type StockItem } from '@/app/stock-list/data';
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


type CartItem = StockItem & { quantity: number };

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

const PaymentDialog = ({ open, onOpenChange, totalAmount, onPaymentSuccess }: { open: boolean, onOpenChange: (open: boolean) => void, totalAmount: number, onPaymentSuccess: (method: string) => void }) => {
    const { toast } = useToast();
    const [paymentMethod, setPaymentMethod] = React.useState('cash');
    const [amountReceived, setAmountReceived] = React.useState<number | string>('');
    const [change, setChange] = React.useState(0);

    React.useEffect(() => {
        if (open) {
            setAmountReceived(totalAmount.toFixed(2));
            setChange(0);
        }
    }, [open, totalAmount]);
    
    React.useEffect(() => {
        const received = parseFloat(String(amountReceived));
        if (!isNaN(received) && received >= totalAmount) {
            setChange(received - totalAmount);
        } else {
            setChange(0);
        }
    }, [amountReceived, totalAmount]);

    const handleConfirmPayment = () => {
        if (!paymentMethod) {
            toast({ title: 'Payment method required', variant: 'destructive' });
            return;
        }
        toast({ title: 'Payment Successful!', description: `Paid ${formatCurrency(totalAmount, 'INR')} via ${paymentMethod}.` });
        onPaymentSuccess(paymentMethod);
        onOpenChange(false);
    }
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Complete Payment</DialogTitle>
                    <DialogDescription>Select a payment method and confirm the transaction.</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Total Amount Due</p>
                        <p className="text-5xl font-bold font-mono tracking-tight">{formatCurrency(totalAmount, 'INR')}</p>
                    </div>
                     <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-3 gap-4">
                        {(['Cash', 'Card', 'UPI'] as const).map(method => (
                            <div key={method}>
                                <RadioGroupItem value={method.toLowerCase()} id={method.toLowerCase()} className="peer sr-only" />
                                <Label htmlFor={method.toLowerCase()} className="flex items-center justify-center rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary">
                                   {method}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>
                    {paymentMethod === 'cash' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="amount-received">Amount Received</Label>
                                <Input id="amount-received" type="number" value={amountReceived} onChange={(e) => setAmountReceived(e.target.value)} placeholder="0.00" />
                            </div>
                             <div className="space-y-2">
                                <Label>Change to Return</Label>
                                <Input value={formatCurrency(change, 'INR')} readOnly className="font-mono" />
                            </div>
                        </div>
                    )}
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleConfirmPayment} disabled={!paymentMethod || (paymentMethod === 'cash' && parseFloat(String(amountReceived)) < totalAmount)}>
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
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    cart: CartItem[];
    totals: { subtotal: number; gst: number; total: number };
    customerName: string;
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
            <h3 className="text-center font-bold text-lg">Hicks Inc.</h3>
            <p className="text-center text-xs">{new Date().toLocaleString()}</p>
            <Separator className="my-2 border-black" />
            <p>Date: {format(new Date(), 'dd-MMM-yyyy')}</p>
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
                <div className="flex justify-between">
                  <span>GST:</span>
                  <span>{totals.gst.toFixed(2)}</span>
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

export default function PosPage() {
    const { toast } = useToast();
    const [products, setProducts] = React.useState<StockItem[]>([]);
    const [filteredProducts, setFilteredProducts] = React.useState<StockItem[]>([]);
    const [searchTerm, setSearchTerm] = React.useState('');
    const [cart, setCart] = React.useState<CartItem[]>([]);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = React.useState(false);
    const [isOrderComplete, setIsOrderComplete] = React.useState(false);
    const [isClearCartAlertOpen, setIsClearCartAlertOpen] = React.useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = React.useState(false);
    const [customerName, setCustomerName] = React.useState('Walk-in Customer');

    React.useEffect(() => {
        const productData = generateStockListData(50);
        setProducts(productData);
        setFilteredProducts(productData);
    }, []);

    React.useEffect(() => {
        const results = products.filter(p => 
            p.productName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            p.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(results);
    }, [searchTerm, products]);
    
    const addToCart = (product: StockItem) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.id === product.id);
            if (existingItem) {
                return prevCart.map(item => 
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            } else {
                return [...prevCart, { ...product, quantity: 1 }];
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

    const removeFromCart = (productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.id !== productId));
    };

    const cartTotals = React.useMemo(() => {
        const subtotal = cart.reduce((acc, item) => acc + (item.sellingPrice * item.quantity), 0);
        const gst = subtotal * 0.18; // Assume flat 18% GST for simplicity
        const total = subtotal + gst;
        return { subtotal, gst, total };
    }, [cart]);

    const handlePaymentSuccess = (method: string) => {
        // Here you would typically save the order to a database
        console.log('Order completed with payment method:', method);
        setIsOrderComplete(true);
    };

    const handleNewOrder = () => {
        setCart([]);
        setIsOrderComplete(false);
        setSearchTerm('');
        setCustomerName('Walk-in Customer');
    };
    
    const handlePrintReceipt = () => {
        window.print();
    };

    return (
        <div className="h-[calc(100vh-theme(spacing.14))] grid md:grid-cols-[2fr_1fr] gap-6 p-4 bg-muted/40 print:block print:p-0">
            {/* Left Side - Products */}
            <div className="flex flex-col h-full bg-card rounded-lg shadow-sm print:hidden">
                <div className="p-4 border-b">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Search by name or SKU..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                        </div>
                        <div className="relative">
                            <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Scan Barcode" className="pl-10" />
                        </div>
                    </div>
                </div>
                 <ScrollArea className="flex-1 p-4">
                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredProducts.map(p => (
                            <ProductCard key={p.id} product={p} onAddToCart={addToCart} />
                        ))}
                    </div>
                 </ScrollArea>
            </div>

            {/* Right Side - Cart */}
            <div className={cn("flex-col h-full bg-card rounded-lg shadow-sm", isOrderComplete ? 'hidden print:flex' : 'flex')}>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Current Order</CardTitle>
                        {cart.length > 0 && (
                            <Button variant="destructive" size="sm" onClick={() => setIsClearCartAlertOpen(true)}>Clear Cart</Button>
                        )}
                    </div>
                    <div className="pt-2">
                        <Label htmlFor="customer-name">Customer</Label>
                        <Input id="customer-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                    </div>
                </CardHeader>
                <CardContent className="flex-1 p-4 pt-0">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                            <Package className="h-12 w-12 mb-4" />
                            <p>Your cart is empty.</p>
                            <p className="text-xs">Select products to get started.</p>
                        </div>
                    ) : (
                         <ScrollArea className="h-full pr-4 -mr-4">
                            <div className="space-y-4">
                                {cart.map(item => (
                                    <div key={item.id} className="flex items-start gap-4">
                                        <div className="w-16 h-16 bg-muted rounded-md flex-shrink-0"></div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-sm line-clamp-2">{item.productName}</p>
                                            <p className="text-sm font-mono">{formatCurrency(item.sellingPrice, 'INR')}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.id, -1)}><Minus className="h-3 w-3" /></Button>
                                                <span className="w-6 text-center font-mono">{item.quantity}</span>
                                                <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => updateQuantity(item.id, 1)}><Plus className="h-3 w-3" /></Button>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-mono font-semibold">{formatCurrency(item.sellingPrice * item.quantity, 'INR')}</p>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground mt-2" onClick={() => removeFromCart(item.id)}><X className="h-4 w-4" /></Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    )}
                </CardContent>
                {cart.length > 0 && (
                    <CardFooter className="flex-col !p-4 border-t">
                        <div className="w-full space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-mono">{formatCurrency(cartTotals.subtotal, 'INR')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">GST (18%)</span>
                                <span className="font-mono">{formatCurrency(cartTotals.gst, 'INR')}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span className="font-mono">{formatCurrency(cartTotals.total, 'INR')}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full mt-4">
                             <Button size="lg" variant="outline" className="w-full" onClick={() => setIsPreviewOpen(true)}>
                                <Eye className="mr-2 h-5 w-5" />
                                Preview
                            </Button>
                            <Button size="lg" className="w-full" onClick={() => setIsPaymentDialogOpen(true)}>
                                <CreditCard className="mr-2 h-5 w-5" />
                                Pay Now
                            </Button>
                        </div>
                    </CardFooter>
                )}
            </div>

            {/* Post-Order Screen */}
             <div className={cn("flex-col h-full bg-card rounded-lg shadow-sm print:hidden", isOrderComplete ? 'flex' : 'hidden')}>
                <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                    <h2 className="text-2xl font-semibold">Payment Successful!</h2>
                    <p className="text-muted-foreground mt-2">The order has been completed.</p>
                     <div className="flex gap-4 mt-8">
                        <Button size="lg" variant="outline" onClick={handlePrintReceipt}>
                            <Printer className="mr-2 h-4 w-4" />
                            Print Receipt
                        </Button>
                         <Button size="lg" onClick={handleNewOrder}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            New Order
                        </Button>
                    </div>
                </CardContent>
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
                            <Button variant="destructive" onClick={() => { setCart([]); setIsClearCartAlertOpen(false); }}>
                                Clear Cart
                            </Button>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
