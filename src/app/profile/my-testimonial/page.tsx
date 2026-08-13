'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2, Trash2, FileSignature, MessageSquare, PlusCircle } from 'lucide-react';
import { FullPageLoader } from '@/components/ui/full-page-loader';
import { getUserTestimonial, deleteTestimonial } from '@/lib/data';
import type { Testimonial } from '@/lib/types';
import { TestimonialCard } from '@/app/testimonials/testimonial-card';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { useToast } from '@/hooks/use-toast';
import { revalidateAll } from '@/lib/revalidate';

export default function MyTestimonialPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [testimonial, setTestimonial] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/profile/my-testimonial');
    }
  }, [user, authLoading, router]);

  const fetchTestimonial = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserTestimonial(user.uid);
      setTestimonial(data);
    } catch (error) {
      console.error('Error fetching testimonial:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchTestimonial();
  }, [user, fetchTestimonial]);

  const handleDelete = async () => {
    if (!testimonial) return;
    setIsDeleting(true);
    try {
      await deleteTestimonial(testimonial.id);
      await revalidateAll();
      setTestimonial(null);
      toast({ title: 'تم حذف رأيك بنجاح' });
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast({ variant: 'destructive', title: 'خطأ', description: 'فشل حذف الرأي.' });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <MobilePageHeader title="رأيي">
        <MessageSquare className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={MessageSquare}
        title="رأيي"
        description="يمكنك هنا تعديل رأيك المنشور أو حذفه."
      />
      {authLoading || loading ? (
        <FullPageLoader />
      ) : (
        <div className="container mx-auto max-w-2xl px-4 pb-12">
          {testimonial ? (
            <div className="space-y-3">
              <TestimonialCard testimonial={testimonial} />
              <div className="flex gap-2">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                >
                  <Link href={`/edit-testimonial/${testimonial.id}`}>
                    <FileSignature className="h-4 w-4" />
                    <span>تعديل</span>
                  </Link>
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 flex items-center justify-center gap-2 active:scale-95 transition-transform"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span>حذف</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 space-y-4">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground">لم تنشر أي رأي بعد.</p>
              <Button asChild className="active:scale-95 transition-transform">
                <Link href="/add-testimonial">
                  <PlusCircle className="ml-2 h-4 w-4" />
                  أضف رأيك الآن
                </Link>
              </Button>
            </div>
          )}
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف رأيك نهائياً ولا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
  }
                  
