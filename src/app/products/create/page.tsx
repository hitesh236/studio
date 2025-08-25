
'use client';

import AddProductForm from './add-product-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateProductPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <Card>
            <CardHeader>
                <CardTitle>Add Product</CardTitle>
                <div className="text-sm text-muted-foreground">
                  <div>Product Master Data Setup.</div>
                  <div><strong>Goal:</strong> Define what you can sell.</div>
                  <div><strong>Action:</strong> Add all product attributes, prices, taxes, and supplier info.</div>
                </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <AddProductForm />
            </CardContent>
        </Card>
    </div>
  );
}
