
'use client';

import * as React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronRight,
  MapPin,
  Star,
  Edit,
  Trash2,
  MoreVertical,
  ChevronDown,
  Utensils,
} from 'lucide-react';
import type { Hotel, RoomType } from './data';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

const HotelRow = ({ hotel, isExpanded, onExpand }: { hotel: Hotel; isExpanded: boolean; onExpand: () => void }) => {
  return (
    <React.Fragment>
      <TableRow onClick={onExpand} className="cursor-pointer">
        <TableCell>
          <div className="flex items-center gap-4">
            <Image
              src={hotel.imageUrl}
              alt={hotel.name}
              width={100}
              height={75}
              className="rounded-md object-cover"
              data-ai-hint="hotel exterior"
            />
            <div>
              <p className="font-semibold">{hotel.name}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{hotel.location}</span>
              </div>
            </div>
          </div>
        </TableCell>
        <TableCell className="text-center">
            <div className="flex items-center justify-center gap-1">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{hotel.rating.toFixed(1)}</span>
            </div>
        </TableCell>
        <TableCell className="text-center">
          <div className="flex flex-wrap gap-1 justify-center">
            {hotel.seasons.map(s => (
              <Badge key={s.name} variant="secondary">{s.name.split(' (')[0]}</Badge>
            ))}
          </div>
        </TableCell>
        <TableCell className="text-center">
          <Button variant="ghost" size="icon">
            <ChevronRight className={cn('h-4 w-4 transition-transform', isExpanded && 'rotate-90')} />
          </Button>
        </TableCell>
      </TableRow>
      {isExpanded && (
        <TableRow>
          <TableCell colSpan={4} className="p-0">
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-muted/50">
                <h4 className="font-semibold text-base mb-4">Pricing Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {hotel.seasons.map(season => (
                    <Card key={season.name}>
                      <CardHeader className="p-4">
                        <CardTitle className="text-base">{season.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Room Type</TableHead>
                              <TableHead className="text-right">Price/Night (EP)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {season.roomTypes.map(room => (
                              <TableRow key={room.name}>
                                <TableCell>
                                    <div className="font-medium">{room.name}</div>
                                    {room.mealPlans.length > 0 && (
                                        <div className="mt-2 space-y-1">
                                            {room.mealPlans.map(plan => (
                                                <div key={plan.name} className="flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Utensils className="h-3 w-3" />
                                                    <span>{plan.name}: <span className="font-mono">{formatCurrency(plan.price, 'INR')}</span></span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </TableCell>
                                <TableCell className="text-right font-mono align-top">{formatCurrency(room.price, 'INR')}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.div>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
};

const MobileHotelCard = ({ hotel, isExpanded, onExpand }: { hotel: Hotel; isExpanded: boolean; onExpand: () => void }) => {
    return (
        <Card>
            <CardHeader className="p-4" onClick={onExpand}>
                <div className="flex gap-4">
                    <Image src={hotel.imageUrl} alt={hotel.name} width={80} height={60} className="rounded-md object-cover" data-ai-hint="hotel exterior" />
                    <div className="flex-1">
                        <CardTitle className="text-lg">{hotel.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {hotel.location}
                        </CardDescription>
                        <div className="flex items-center gap-1 mt-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                            <span className="font-medium">{hotel.rating.toFixed(1)}</span>
                        </div>
                    </div>
                     <Button variant="ghost" size="icon" className="-mr-2 -mt-2">
                        <ChevronDown className={cn('h-5 w-5 transition-transform', isExpanded && 'rotate-180')} />
                    </Button>
                </div>
            </CardHeader>
            <AnimatePresence>
            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <CardContent className="p-4 pt-0">
                         <Separator className="mb-4" />
                         <div className="space-y-4">
                            {hotel.seasons.map(season => (
                                <div key={season.name}>
                                    <h4 className="font-semibold mb-2">{season.name}</h4>
                                     <div className="space-y-3 text-sm">
                                        {season.roomTypes.map(room => (
                                            <div key={room.name}>
                                                <div className="flex justify-between font-medium">
                                                    <span>{room.name}</span>
                                                    <span className="font-mono">{formatCurrency(room.price, 'INR')}</span>
                                                </div>
                                                {room.mealPlans.length > 0 && (
                                                    <div className="pl-2 mt-1 space-y-1">
                                                        {room.mealPlans.map(plan => (
                                                            <div key={plan.name} className="flex justify-between text-xs text-muted-foreground">
                                                                <span className="flex items-center gap-1.5"><Utensils className="h-3 w-3" /> {plan.name}</span>
                                                                <span className="font-mono">{formatCurrency(plan.price, 'INR')}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                         </div>
                    </CardContent>
                </motion.div>
            )}
            </AnimatePresence>
        </Card>
    );
};


export function HotelTable({ data }: { data: Hotel[] }) {
  const [search, setSearch] = React.useState('');
  const [locationFilter, setLocationFilter] = React.useState('all');
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());

  const uniqueLocations = React.useMemo(() => ['all', ...Array.from(new Set(data.map(h => h.location)))], [data]);

  const filteredData = React.useMemo(() => {
    return data.filter(hotel => {
      const matchesSearch = search
        ? hotel.name.toLowerCase().includes(search.toLowerCase()) ||
          hotel.location.toLowerCase().includes(search.toLowerCase())
        : true;
      const matchesLocation = locationFilter === 'all' ? true : hotel.location === locationFilter;
      return matchesSearch && matchesLocation;
    });
  }, [data, search, locationFilter]);
  
  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev => {
        const newSet = new Set(prev);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        return newSet;
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Hotel Management</CardTitle>
            <CardDescription>
              A list of available hotels across India.
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search hotels..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                {uniqueLocations.map(location => (
                  <SelectItem key={location} value={location}>
                    {location === 'all' ? 'All Locations' : location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Desktop Table */}
        <div className="hidden md:block rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/2">Hotel</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead className="text-center">Seasons</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map(hotel => (
                  <HotelRow
                    key={hotel.id}
                    hotel={hotel}
                    isExpanded={expandedRows.has(hotel.id)}
                    onExpand={() => toggleRowExpansion(hotel.id)}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    No hotels found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Mobile View */}
        <div className="grid gap-4 md:hidden">
            {filteredData.length > 0 ? (
                filteredData.map(hotel => (
                    <MobileHotelCard 
                        key={hotel.id} 
                        hotel={hotel}
                        isExpanded={expandedRows.has(hotel.id)}
                        onExpand={() => toggleRowExpansion(hotel.id)}
                    />
                ))
            ) : (
                <div className="text-center text-muted-foreground py-12">No hotels found.</div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
