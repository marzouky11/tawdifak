
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { PostJobForm } from './post-job-form';
import { Briefcase } from 'lucide-react';
import { FullPageLoader } from '@/components/ui/full-page-loader';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { getCategories } from '@/lib/data';
import { AnimatePresence } from 'framer-motion';

export default function PostJobPage() {
  const { user, userData, loading } = useAuth();
  const router = useRouter();
  const categories = getCategories();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login?redirect=/post-job');
      } else if (!userData?.isAdmin) {
        alert("ليس لديك صلاحية الوصول لهذه الصفحة.");
        router.push('/');
      }
    }
  }, [user, userData, loading, router]);

  return (
    <>
      <MobilePageHeader title="نشر وظيفة">
        <Briefcase className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={Briefcase}
        title="نشر وظيفة جديدة"
        description="هذه الصفحة مخصصة للمشرفين فقط لنشر عروض العمل في المنصة."
      />
      {loading || !userData?.isAdmin ? (
        <FullPageLoader />
      ) : (
      <div className="container mx-auto max-w-3xl px-4 pb-12">
        <Card>
          <CardContent className="p-0">
            <AnimatePresence>
              <PostJobForm categories={categories} preselectedType="seeking_worker" />
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
      )}
    </>
  );
}
