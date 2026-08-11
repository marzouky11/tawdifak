
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { AddTestimonialForm } from './add-testimonial-form';
import { MessageSquare } from 'lucide-react';
import { FullPageLoader } from '@/components/ui/full-page-loader';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { getUserTestimonial } from '@/lib/data';
import type { Testimonial } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function AddTestimonialPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [checkingExisting, setCheckingExisting] = useState(true);
  const [existingTestimonial, setExistingTestimonial] = useState<Testimonial | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/add-testimonial');
    }
  }, [user, loading, router]);

  // يُسمح برأي واحد فقط لكل مستخدم. إن كان لدى المستخدم رأي منشور بالفعل،
  // نمنعه من إنشاء رأي جديد ونوجهه لتعديل رأيه الحالي أو صفحة إدارته.
  useEffect(() => {
    let isCancelled = false;

    async function checkExisting() {
      if (loading || !user) {
        setCheckingExisting(false);
        return;
      }
      setCheckingExisting(true);
      try {
        const testimonial = await getUserTestimonial(user.uid);
        if (!isCancelled) setExistingTestimonial(testimonial);
      } catch (error) {
        console.error('Error checking existing testimonial:', error);
      } finally {
        if (!isCancelled) setCheckingExisting(false);
      }
    }

    checkExisting();
    return () => { isCancelled = true; };
  }, [user, loading]);

  return (
    <>
      <MobilePageHeader title="إضافة رأي">
        <MessageSquare className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={MessageSquare}
        title="شاركنا رأيك"
        description="نحن نقدر رأيك كثيرًا. ملاحظاتك تساعدنا على تحسين المنصة وتطويرها."
      />
      {loading || !user || checkingExisting ? (
        <FullPageLoader />
      ) : existingTestimonial ? (
        <div className="container mx-auto max-w-2xl px-4 pb-12">
          <Alert className="border-primary/50 text-primary text-center">
            <AlertTitle className="font-bold text-center">لديك رأي منشور بالفعل</AlertTitle>
            <AlertDescription className="mt-2 space-y-4 text-center">
              <p>
                يُسمح بنشر رأي واحد فقط لكل مستخدم. يمكنك تعديل رأيك الحالي،
                أو الذهاب إلى صفحة "رأيي" لإدارته.
              </p>
              <div className="flex flex-row flex-nowrap gap-3 justify-center">
                <Button asChild>
                  <Link href={`/edit-testimonial/${existingTestimonial.id}`}>تعديل رأيي الحالي</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/profile/my-testimonial">الذهاب إلى رأيي</Link>
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      ) : (
      <div className="container mx-auto max-w-2xl px-4 pb-12">
        <Card>
          <CardContent className="pt-6">
            <AddTestimonialForm />
          </CardContent>
        </Card>
      </div>
      )}
    </>
  );
}
