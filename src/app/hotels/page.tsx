
'use client';

import * as React from 'react';
import { HotelTable } from './hotel-table';
import { generateHotelData, type Hotel } from './data';
import Loading from '../loading';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HotelsPage() {
    const [hotels, setHotels] = React.useState<Hotel[] | null>(null);

    React.useEffect(() => {
        setHotels(generateHotelData());
    }, []);

    if (!hotels) {
        return <Loading />;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <HotelTable data={hotels} />
            <motion.div
                className="fixed bottom-8 right-8 z-50"
                initial={{ opacity: 0, y: 100 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0.3,
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Button asChild className="rounded-full shadow-lg">
                <Link href="/hotels/new">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add Hotel
                </Link>
                </Button>
            </motion.div>
        </div>
    );
}
