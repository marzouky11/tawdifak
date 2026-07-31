'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Briefcase, Plane, Landmark, Newspaper, FileText, MessageSquare, Flag, User, Users, Mail, ChevronLeft, Bug } from 'lucide-react';
import { FullPageLoader } from '@/components/ui/full-page-loader';

const SectionItem = ({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
}) => (
  <li className="flex items-center w-full">
    <Link href={href} className="w-full">
      <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors w-full">
        <div className="flex items-center gap-4">
          <Icon className="h-5 w-5 text-primary" />
          <span className="font-medium">{label}</span>
        </div>
        <ChevronLeft className="h-5 w-5 text-muted-foreground" />
      </div>
    </Link>
  </li>
);

export default function AdminDashboardPage() {
  const { userData, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !userData?.isAdmin) {
      router.push('/');
    }
  }, [userData, loading, router]);

  if (loading || !userData?.isAdmin) {
    return (
      <FullPageLoader />
    );
  }

  return (
    <>
      <MobilePageHeader title="لوحة مشرف">
        <Shield className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={Shield}
        title="لوحة مشرف"
        description="جميع أدوات النشر والإدارة مجمعة في مكان واحد."
      />
      <div className="container mx-auto max-w-6xl px-4 pb-12 grid grid-cols-1 gap-6 items-start">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              قسم النشر
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              <SectionItem
                icon={Briefcase}
                label="نشر وظيفة"
                href="/post-job?type=seeking_worker"
              />
              <SectionItem
                icon={Plane}
                label="نشر فرص الهجرة"
                href="/post-immigration"
              />
              <SectionItem
                icon={Landmark}
                label="نشر مباراة عمومية"
                href="/post-competition"
              />
              <SectionItem
                icon={Newspaper}
                label="نشر مقالة"
                href="/admin/post-article"
              />
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              إدارة المحتوى
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              <SectionItem
                icon={Briefcase}
                label="إدارة الوظائف"
                href="/admin/manage-jobs"
              />
              <SectionItem
                icon={Plane}
                label="إدارة فرص الهجرة"
                href="/admin/manage-immigration"
              />
              <SectionItem
                icon={Landmark}
                label="إدارة المباريات العمومية"
                href="/admin/manage-competitions"
              />
              <SectionItem
                icon={Users}
                label="إدارة الباحثين عن عمل"
                href="/admin/manage-seekers"
              />
              <SectionItem
                icon={Newspaper}
                label="إدارة المقالات"
                href="/admin/articles"
              />
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              أقسام إدارية أخرى
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              <SectionItem
                icon={Mail}
                label="إدارة الرسائل"
                href="/admin/contacts"
              />
              <SectionItem
                icon={Flag}
                label="إدارة البلاغات"
                href="/admin/reports"
              />
              <SectionItem
                icon={User}
                label="إدارة المستخدمين"
                href="/admin/users"
              />
              <SectionItem
                icon={MessageSquare}
                label="إدارة الآراء والتقييمات"
                href="/admin/testimonials"
              />
              <SectionItem
                icon={Bug}
                label="سجل الأخطاء"
                href="/admin/error-logs"
              />
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
