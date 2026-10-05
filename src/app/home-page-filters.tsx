
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
