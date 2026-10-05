'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface MobilePageHeaderProps {
  title: string;
  children?: React.ReactNode;
  sticky?: boolean;
  className?: string;
  // Set to false on pages that already render their own, more specific
  // <h1> elsewhere (e.g. ad detail pages showing the job/article title as
  // the real h1) so this header's title doesn't create a duplicate <h1>.
  isMainHeading?: boolean;
}

export function MobilePageHeader({ title, children, sticky = true, className, isMainHeading = true }: MobilePageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div
      className={cn(
        'md:hidden flex items-center gap-4 p-3.4 border-b bg-card mb-6',
        sticky && 'sticky top-0 z-40',
        className
      )}
    >
      <Button variant="ghost" size="icon" className="h-10 w-10 shrink-0" onClick={handleBack}>
        <ArrowRight className="h-5 w-5" />
      </Button>
      <div className="flex items-center gap-3 text-lg font-bold text-foreground">
        {children}
        {isMainHeading ? (
          <h1 className="truncate">{title}</h1>
        ) : (
          <p className="truncate">{title}</p>
        )}
      </div>
    </div>
  );
}
