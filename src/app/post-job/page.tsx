
import { FullPageLoader } from '@/components/ui/full-page-loader';

import type { Metadata } from 'next';
import { getCategories } from '@/lib/data';
import PostJobClientPage from './post-job-client-page';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'أنشئ إعلانك الشخصي وشارك مؤهلاتك وخبراتك',
  description: 'أنشئ إعلانك الشخصي الآن وشارك مهاراتك وخبراتك ومؤهلاتك لتظهر أمام أرباب العمل الباحثين عن الكفاءات.',
  alternates: { canonical: '/post-job' },
};

function PostJobPageFallback() {
    return (
        <FullPageLoader />
    )
}

export default function PostJobPage() {
    const categories = getCategories();
    return (
        <Suspense fallback={<PostJobPageFallback />}>
            <PostJobClientPage categories={categories} />
        </Suspense>
    );
}
