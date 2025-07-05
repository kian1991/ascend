'use client';
import * as React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function DatePicker({
    date,
    onDateChange
}: { date: Date; onDateChange: (date: Date) => void } & React.HTMLAttributes<HTMLInputElement>) {
    const [open, setOpen] = React.useState(false);
    return (
        <div className="flex flex-col gap-3">
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button id="date" className="input  justify-between font-normal">
                        {date ? date.toLocaleDateString() : 'Birthdate'}
                        <ChevronDownIcon />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={date}
                        captionLayout="dropdown"
                        onSelect={(date) => {
                            onDateChange(date as Date);
                            setOpen(false);
                        }}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
