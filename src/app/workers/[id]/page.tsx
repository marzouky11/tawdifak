
import React from 'react';
import { notFound } from 'next/navigation';
import { getCachedJobById } from '@/lib/data';
import type { Metadata } from 'next';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { User as UserIcon } from 'lucide-react';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { WorkerDesktopDetails } from './worker-desktop-details';
import { WorkerMobileDetails } from './worker-mobile-details';

// Keep the page-level cache in sync with the 1-hour data cache used by
// getCachedJobById (see src/lib/data.ts). Without this, a transient
// not-found result rendered once would be cached indefinitely by the
// Full Route Cache instead of self-healing within an hour.
export const revalidate = 3600;


interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getCachedJobById(id);
  
  if (!job) {
    return {
      title: 'الإعلان غير موجود',
    };
  }

  // Worker profiles contain personal data (name, phone, skills, etc.)
  // and must NOT be indexed by search engines.
  return {
    title: job.title,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function WorkerDetailPage({ params }: JobDetailPageProps) {
    const { id } = await params;
    const job = await getCachedJobById(id);

    if (!job || job.postType !== 'seeking_job') {
        notFound();
    }
    
    return (
        <>
            <MobilePageHeader title="ملف باحث عن عمل">
                <UserIcon className="h-5 w-5 text-primary" />
            </MobilePageHeader>
            <DesktopPageHeader
                icon={UserIcon}
                title="ملف باحث عن عمل"
                description="استعرض مهارات وخبرات هذا المرشح وتواصل معه مباشرة."
            />
            <div className="container flex justify-center">
              
            </div>

            {/* Mobile View */}
            <div className="block md:hidden">
                <WorkerMobileDetails job={job} />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <WorkerDesktopDetails job={job} />
            </div>
        </>
    );
}
