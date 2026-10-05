'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { AddTestimonialForm } from '@/app/add-testimonial/add-testimonial-form';
import { getTestimonialById } from '@/lib/data';
import { PenLine } from 'lucide-react';
import { FullPageLoader } from '@/components/ui/full-page-loader';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import type { Testimonial } from '@/lib/types';

export default function EditTestimonialPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchTestimonial = async () => {
      if (params.id) {
        const data = await getTestimonialById(params.id as string);

        // Ownership check: only the original author can edit their review (or an admin).
        const isOwner = data?.userId === user?.uid;
        if (!data || (!isOwner && !userData?.isAdmin)) {
          router.push('/profile/my-testimonial');
          return;
        }

        setTestimonial(data);
      }
      setLoading(false);
    };

    if (user) {
      fetchTestimonial();
    }
  }, [params.id, user, userData, router]);

  return (
    <>
      <MobilePageHeader title="تعديل رأيك">
        <PenLine className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={PenLine}
        title="تعديل رأيك"
        description="قم بتحديث تقييمك ونص رأيك."
      />
      {authLoading || loading ? (
        <FullPageLoader />
      ) : (
      <div className="flex-grow">
        <div className="container mx-auto max-w-2xl px-4 pb-12">
          <Card>
            <CardContent className="pt-6">
              {testimonial ? (
                <AddTestimonialForm existingTestimonial={testimonial} />
              ) : (
                <div className="flex justify-center p-8">
                  <p>الرأي غير موجود.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      )}
    </>
  );
}
