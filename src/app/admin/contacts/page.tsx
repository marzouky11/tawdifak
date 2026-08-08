
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Mail, Trash2 } from 'lucide-react';
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
import { getContactMessages, deleteContactMessage } from '@/lib/data';
import type { ContactMessage, FirestoreCursor } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { revalidateAll } from '@/lib/revalidate';
import { LoadMoreButton } from '@/components/admin/admin-ads-grids';

const ITEMS_PER_PAGE = 16;

export default function AdminContactsPage() {
  const { userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [cursor, setCursor] = useState<FirestoreCursor>(null);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState<ContactMessage | null>(null);

  useEffect(() => {
    if (!authLoading && !userData?.isAdmin) {
      router.push('/');
    }
  }, [userData, authLoading, router]);

  const fetchMessages = useCallback(
    async (isLoadMore = false) => {
      isLoadMore ? setLoadingMore(true) : setLoading(true);
      try {
        const res = await getContactMessages({
          limit: ITEMS_PER_PAGE,
          lastDoc: isLoadMore ? cursor : null,
        });
        setMessages((prev) => (isLoadMore ? [...prev, ...res.data] : res.data));
        setCursor(res.lastDoc);
        setHasMore(res.data.length === ITEMS_PER_PAGE);
      } catch (error) {
        toast({ variant: 'destructive', title: 'فشل تحميل الرسائل' });
      } finally {
        isLoadMore ? setLoadingMore(false) : setLoading(false);
      }
    },
    [cursor, toast]
  );

  useEffect(() => {
    if (userData?.isAdmin) {
      fetchMessages(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData]);

  const handleDelete = async () => {
    if (!messageToDelete) return;
    try {
        await deleteContactMessage(messageToDelete.id);
        await revalidateAll();
        setMessages(prev => prev.filter(m => m.id !== messageToDelete.id));
        toast({ title: "تم حذف الرسالة بنجاح" });
    } catch (error) {
        toast({ variant: 'destructive', title: 'فشل حذف الرسالة' });
    } finally {
        setMessageToDelete(null);
    }
  };
  
  const formatDate = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return 'غير معروف';
    return format(timestamp.toDate(), 'yyyy/MM/dd, h:mm a');
  };

  return (
    <>
      <MobilePageHeader title="رسائل التواصل">
        <Mail className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={Mail}
        title="رسائل التواصل"
        description="عرض وحذف الرسائل الواردة من صفحة اتصل بنا."
      />
      {authLoading || (loading && messages.length === 0) ? (
        <FullPageLoader />
      ) : (
      <div className="container mx-auto max-w-6xl px-4 pb-12">
        {messages.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {messages.map((message) => (
                  <Card key={message.id} className="flex flex-col h-full">
                      <CardHeader>
                          <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                              <div>
                                  <CardTitle>{message.name}</CardTitle>
                                  <CardDescription className="text-primary hover:underline pt-1">
                                      <a href={`mailto:${message.email}`}>{message.email}</a>
                                  </CardDescription>
                              </div>
                              <Badge variant="secondary" className="shrink-0">{formatDate(message.createdAt)}</Badge>
                          </div>
                      </CardHeader>
                      <CardContent className="flex-grow">
                          <p className="whitespace-pre-wrap">{message.message}</p>
                      </CardContent>
                      <CardFooter className="border-t pt-4">
                           <Button
                              variant="destructive"
                              className="w-full active:scale-95 transition-transform"
                              onClick={() => setMessageToDelete(message)}
                          >
                              <Trash2 className="ml-2 h-4 w-4" />
                              حذف الرسالة
                          </Button>
                      </CardFooter>
                  </Card>
                ))}
              </div>
              <LoadMoreButton
                onClick={() => fetchMessages(true)}
                loading={loadingMore}
                hasMore={hasMore}
              />
            </>
        ) : (
             <div className="text-center text-muted-foreground py-10">
                <p>لا توجد رسائل لعرضها.</p>
            </div>
        )}
      </div>
      )}

       <AlertDialog open={!!messageToDelete} onOpenChange={(open) => !open && setMessageToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذه الرسالة؟</AlertDialogTitle>
            <AlertDialogDescription>
                هذا الإجراء سيقوم بحذف الرسالة بشكل نهائي. لا يمكن التراجع عن هذا القرار.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setMessageToDelete(null)} className="active:scale-95 transition-transform">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground active:scale-95 transition-transform">تأكيد الحذف</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
