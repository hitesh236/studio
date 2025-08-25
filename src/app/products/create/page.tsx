
'use client';

import * as React from 'react';
import { AddProductForm } from './add-product-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CreateProductPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
        <Card>
            <CardHeader>
                <CardTitle>Add Product</CardTitle>
                <CardDescription>
                    Product Master Data Setup. Goal: Define what you can sell. Action: Add all product attributes, prices, taxes, and supplier info.
                </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
                <AddProductForm />
            </CardContent>
        </Card>
    </div>
  );
}
