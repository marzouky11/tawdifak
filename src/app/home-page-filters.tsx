
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Briefcase, Users, Plane, Award } from 'lucide-react';

const SEARCH_SCOPES = [
  { value: 'jobs', label: 'عروض العمل', icon: Briefcase },
  { value: 'immigration', label: 'فرص الهجرة', icon: Plane },
  { value: 'competitions', label: 'المباريات العمومية', icon: Award },
  { value: 'workers', label: 'الباحثون عن عمل', icon: Users },
];

export function HomePageFilters() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [scope, setScope] = useState('jobs');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const params = new URLSearchParams();
      params.set('q', searchQuery.trim());
      router.push(`/${scope}?${params.toString()}`);
    } else {
       router.push(`/${scope}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2 items-center">
      <div className="relative w-full flex-grow">
        <Input
          placeholder="ابحث عن وظيفة أو فرصة الهجرة..."
          className="h-14 text-base rounded-xl pl-4 pr-16 border-2 bg-background shadow-inner focus-visible:ring-primary/50"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2">
          <Button type="submit" size="icon" variant="ghost" className="rounded-full h-10 w-10">
            <Search className="h-5 w-5 text-primary" />
          </Button>
        </div>
      </div>
      <Select value={scope} onValueChange={setScope}>
        <SelectTrigger className="h-14 w-auto shrink-0 min-w-[9rem] md:min-w-[13rem] gap-2 whitespace-nowrap rounded-xl border-2 bg-background shadow-inner text-base [&>span]:whitespace-nowrap [&>span]:line-clamp-none">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SEARCH_SCOPES.map(({ value, label, icon: Icon }) => (
            <SelectItem key={value} value={value}>
              <span className="flex items-center gap-2 whitespace-nowrap">
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </form>
  );
}
