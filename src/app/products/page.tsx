
'use client';

import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import Loading from '../loading';
import { generateStockListData, type StockItem } from '@/app/stock-list/data';
import { ProductCatalogueTable } from './product-catalogue-table';

export default function ProductsPage() {
    const [products, setProducts] = React.useState<StockItem[] | null>(null);

    React.useEffect(() => {
        const items = generateStockListData(80); // Generate more products for a catalogue feel
        setProducts(items);
    }, []);

    if (!products) {
        return <Loading />;
    }

    return (
        <div data-section="main-content" className="p-4 sm:p-6 lg:p-8">
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                            <CardTitle>Product Catalogue</CardTitle>
                            <CardDescription>A master list of all products your business deals with.</CardDescription>
                        </div>
                        <Link href="/products/new" passHref>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add New Product
                            </Button>
                        </Link>
                    </div>
                </CardHeader>
                <CardContent>
                    <ProductCatalogueTable data={products} />
                </CardContent>
            </Card>
        </div>
    );
}
