
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Bug, Trash2 } from 'lucide-react';
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
import { getErrorLogs, deleteErrorLog } from '@/lib/data';
import type { ErrorLog, FirestoreCursor } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { LoadMoreButton } from '@/components/admin/admin-ads-grids';

const ITEMS_PER_PAGE = 16;

export default function AdminErrorLogsPage() {
  const { userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [cursor, setCursor] = useState<FirestoreCursor>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [logToDelete, setLogToDelete] = useState<ErrorLog | null>(null);

  useEffect(() => {
    if (!authLoading && !userData?.isAdmin) {
      router.push('/');
    }
  }, [userData, authLoading, router]);

  const fetchLogs = useCallback(
    async (isLoadMore = false) => {
      isLoadMore ? setLoadingMore(true) : setLoading(true);
      try {
        const res = await getErrorLogs({
          limit: ITEMS_PER_PAGE,
          lastDoc: isLoadMore ? cursor : null,
        });
        setLogs((prev) => (isLoadMore ? [...prev, ...res.data] : res.data));
        setCursor(res.lastDoc);
        setHasMore(res.data.length === ITEMS_PER_PAGE);
      } catch (error) {
        toast({ variant: 'destructive', title: 'فشل تحميل سجل الأخطاء' });
      } finally {
        isLoadMore ? setLoadingMore(false) : setLoading(false);
      }
    },
    [cursor, toast]
  );

  useEffect(() => {
    if (userData?.isAdmin) {
      fetchLogs(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const handleDelete = async () => {
    if (!logToDelete) return;
    try {
        await deleteErrorLog(logToDelete.id);
        setLogs(prev => prev.filter(l => l.id !== logToDelete.id));
        toast({ title: "تم حذف السجل بنجاح" });
    } catch (error) {
        toast({ variant: 'destructive', title: 'فشل حذف السجل' });
    } finally {
        setLogToDelete(null);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return 'غير معروف';
    return format(timestamp.toDate(), 'yyyy/MM/dd, h:mm a');
  };

  if (authLoading || (loading && logs.length === 0)) {
    return (
        <FullPageLoader />
    );
  }

  return (
    <>
      <MobilePageHeader title="سجل الأخطاء">
        <Bug className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={Bug}
        title="سجل الأخطاء"
        description="الأخطاء غير المتوقعة التي واجهها الزوار أثناء تصفح الموقع."
      />
      <div className="container mx-auto max-w-7xl px-4 pb-12 space-y-6">
         {logs.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {logs.map((log) => (
                  <Card key={log.id} className="flex flex-col">
                      <CardHeader>
                          <CardTitle className="break-words text-base">{log.message}</CardTitle>
                          {log.url && (
                            <CardDescription className="break-all text-xs">
                                {log.url}
                            </CardDescription>
                          )}
                          <Badge variant="secondary" className="w-fit mt-1">{formatDate(log.createdAt)}</Badge>
                      </CardHeader>
                      {log.stack && (
                        <CardContent className="pt-0 flex-grow">
                            <pre className="whitespace-pre-wrap break-all text-xs bg-muted rounded-md p-3 max-h-40 overflow-y-auto">{log.stack}</pre>
                        </CardContent>
                      )}
                       <CardFooter className="border-t pt-4">
                          <Button
                              variant="destructive"
                              className="w-full active:scale-95 transition-transform"
                              onClick={() => setLogToDelete(log)}
                          >
                              <Trash2 className="ml-2 h-4 w-4" />
                              حذف السجل
                          </Button>
                       </CardFooter>
                  </Card>
                ))}
              </div>
              <LoadMoreButton
                onClick={() => fetchLogs(true)}
                loading={loadingMore}
                hasMore={hasMore}
              />
            </>
         ) : (
            <div className="text-center text-muted-foreground py-10">
                <p>لا توجد أخطاء مسجلة حاليًا. 🎉</p>
            </div>
         )}
      </div>

       <AlertDialog open={!!logToDelete} onOpenChange={(open) => !open && setLogToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا السجل؟</AlertDialogTitle>
            <AlertDialogDescription>
                هذا الإجراء سيقوم بحذف سجل الخطأ بشكل نهائي. لا يمكن التراجع عن هذا القرار.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setLogToDelete(null)} className="active:scale-95 transition-transform">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground active:scale-95 transition-transform">تأكيد الحذف</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
