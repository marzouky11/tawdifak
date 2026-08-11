
import { FullPageLoader } from '@/components/ui/full-page-loader';

import type { Metadata } from 'next';
import { getCategories } from '@/lib/data';
import PostWorkerClientPage from './post-worker-client-page';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'أنشئ إعلانك الشخصي وشارك مؤهلاتك وخبراتك',
  description: 'أنشئ إعلانك الشخصي الآن وشارك مهاراتك وخبراتك ومؤهلاتك لتظهر أمام أرباب العمل الباحثين عن الكفاءات.',
  alternates: { canonical: '/post-worker' },
};

function PostWorkerPageFallback() {
    return (
        <FullPageLoader />
    )
}

export default function PostWorkerPage() {
    const categories = getCategories();
    return (
        <Suspense fallback={<PostWorkerPageFallback />}>
            <PostWorkerClientPage categories={categories} />
        </Suspense>
    );
}
