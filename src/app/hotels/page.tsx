
'use client';

import * as React from 'react';
import { HotelTable } from './hotel-table';
import { generateHotelData, type Hotel } from './data';
import Loading from '../loading';

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
        </div>
    );
}
