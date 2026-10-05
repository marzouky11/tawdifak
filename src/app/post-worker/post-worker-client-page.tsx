
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { PostJobForm } from '@/app/post-job/post-job-form';
import { PlusCircle } from 'lucide-react';
import { FullPageLoader } from '@/components/ui/full-page-loader';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import type { Category, Job } from '@/lib/types';
import { AnimatePresence } from 'framer-motion';
import { getJobsByUserId } from '@/lib/data';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface PostWorkerClientPageProps {
    categories: Category[];
}

export default function PostWorkerClientPage({ categories }: PostWorkerClientPageProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checkingExistingAd, setCheckingExistingAd] = useState(true);
  const [existingWorkerAd, setExistingWorkerAd] = useState<Job | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/post-worker');
    }
  }, [user, loading, router]);

  // التحقق مما إذا كان المستخدم قد نشر بالفعل إعلان "باحث عن عمل"
  // لمنع نشر أكثر من إعلان واحد لنفس المستخدم
  useEffect(() => {
    let isCancelled = false;

    async function checkExistingWorkerAd() {
      if (loading || !user) {
        setCheckingExistingAd(false);
        return;
      }

      setCheckingExistingAd(true);
      try {
        const userAds = await getJobsByUserId(user.uid);
        const existingAd = userAds.find((ad) => ad.postType === 'seeking_job') ?? null;
        if (!isCancelled) {
          setExistingWorkerAd(existingAd);
        }
      } catch (error) {
        console.error('Error checking existing worker ad:', error);
      } finally {
        if (!isCancelled) {
          setCheckingExistingAd(false);
        }
      }
    }

    checkExistingWorkerAd();

    return () => {
      isCancelled = true;
    };
  }, [user, loading]);

  return (
    <>
      <MobilePageHeader title="نشر طلب عمل">
        <PlusCircle className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={PlusCircle}
        title="نشر طلب عمل"
        description="املأ الحقول التالية لعرض مهاراتك وخبراتك للشركات."
      />
      <div className="flex-grow">
        {(loading || !user || checkingExistingAd) ? (
            <FullPageLoader />
        ) : existingWorkerAd ? (
            <div className="container mx-auto max-w-3xl px-4 pb-12">
                <Alert className="border-primary/50 text-primary text-center">
                    <AlertTitle className="font-bold text-center">لديك إعلان بحث عن عمل منشور بالفعل</AlertTitle>
                    <AlertDescription className="mt-2 space-y-4 text-center">
                        <p>
                            يُسمح بنشر إعلان واحد فقط كباحث عن عمل. يمكنك تعديل إعلانك الحالي،
                            أو الذهاب إلى صفحة إعلاناتي لإدارته.
                        </p>
                        <div className="flex flex-row flex-nowrap gap-3 justify-center">
                            <Button asChild>
                                <Link href={`/edit-job/${existingWorkerAd.id}`}>تعديل إعلاني الحالي</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/profile/my-ads">الذهاب إلى إعلاناتي</Link>
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        ) : (
            <div className="container mx-auto max-w-3xl px-4 pb-12">
                <Card>
                  <CardContent className="p-0">
                    <AnimatePresence>
                        <PostJobForm categories={categories} preselectedType="seeking_job" />
                    </AnimatePresence>
                  </CardContent>
                </Card>
            </div>
        )}
      </div>
    </>
  );
}
