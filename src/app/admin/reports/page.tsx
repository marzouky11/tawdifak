
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Flag, Trash2 } from 'lucide-react';
import { FullPageLoader } from '@/components/ui/full-page-loader';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { getReports, deleteReport } from '@/lib/data';
import type { Report, FirestoreCursor } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';
import { revalidateAll } from '@/lib/revalidate';
import { LoadMoreButton } from '@/components/admin/admin-ads-grids';

const ITEMS_PER_PAGE = 16;

export default function AdminReportsPage() {
  const { userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [reports, setReports] = useState<Report[]>([]);
  const [cursor, setCursor] = useState<FirestoreCursor>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);

  useEffect(() => {
    if (!authLoading && !userData?.isAdmin) {
      router.push('/');
    }
  }, [userData, authLoading, router]);

  const fetchReports = useCallback(
    async (isLoadMore = false) => {
      isLoadMore ? setLoadingMore(true) : setLoading(true);
      try {
        const res = await getReports({
          limit: ITEMS_PER_PAGE,
          lastDoc: isLoadMore ? cursor : null,
        });
        setReports((prev) => (isLoadMore ? [...prev, ...res.data] : res.data));
        setCursor(res.lastDoc);
        setHasMore(res.data.length === ITEMS_PER_PAGE);
      } catch (error) {
        toast({ variant: 'destructive', title: 'فشل تحميل البلاغات' });
      } finally {
        isLoadMore ? setLoadingMore(false) : setLoading(false);
      }
    },
    [cursor, toast]
  );

  useEffect(() => {
    if (userData?.isAdmin) {
      fetchReports(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const handleDelete = async () => {
    if (!reportToDelete) return;
    try {
        await deleteReport(reportToDelete.id);
        await revalidateAll();
        setReports(prev => prev.filter(r => r.id !== reportToDelete.id));
        toast({ title: "تم حذف البلاغ بنجاح" });
    } catch (error) {
        toast({ variant: 'destructive', title: 'فشل حذف البلاغ' });
    } finally {
        setReportToDelete(null);
    }
  };
  
  const formatDate = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return 'غير معروف';
    return format(timestamp.toDate(), 'yyyy/MM/dd, h:mm a');
  };

  return (
    <>
      <MobilePageHeader title="إدارة البلاغات">
        <Flag className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={Flag}
        title="إدارة البلاغات"
        description="مراجعة وحذف بلاغات المستخدمين حول الإعلانات المخالفة."
      />
      {authLoading || (loading && reports.length === 0) ? (
        <FullPageLoader />
      ) : (
      <div className="container mx-auto max-w-4xl px-4 pb-12 space-y-6">
         {reports.length > 0 ? (
            <>
              {reports.map((report) => (
                <Card key={report.id}>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                            <div>
                                <CardTitle>بلاغ حول إعلان</CardTitle>
                                <CardDescription className="pt-1">
                                    <Link href={report.adUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                       {`عرض الإعلان (ID: ${report.adId})`}
                                    </Link>
                                </CardDescription>
                            </div>
                            <Badge variant="secondary" className="shrink-0">{formatDate(report.createdAt)}</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-2">
                        <p><strong>السبب:</strong> {report.reason}</p>
                        {report.details && <p className="whitespace-pre-wrap"><strong>التفاصيل:</strong> {report.details}</p>}
                    </CardContent>
                     <CardFooter className="border-t pt-4">
                        <Button
                            variant="destructive"
                            className="w-full active:scale-95 transition-transform"
                            onClick={() => setReportToDelete(report)}
                        >
                            <Trash2 className="ml-2 h-4 w-4" />
                            حذف البلاغ
                        </Button>
                     </CardFooter>
                </Card>
              ))}
              <LoadMoreButton
                onClick={() => fetchReports(true)}
                loading={loadingMore}
                hasMore={hasMore}
              />
            </>
         ) : (
            <div className="text-center text-muted-foreground py-10">
                <p>لا توجد بلاغات لعرضها.</p>
            </div>
         )}
      </div>
      )}

       <AlertDialog open={!!reportToDelete} onOpenChange={(open) => !open && setReportToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا البلاغ؟</AlertDialogTitle>
            <AlertDialogDescription>
                هذا الإجراء سيقوم بحذف البلاغ بشكل نهائي. لا يمكن التراجع عن هذا القرار.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReportToDelete(null)} className="active:scale-95 transition-transform">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground active:scale-95 transition-transform">تأكيد الحذف</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
