
import type { Metadata } from 'next';
import { UserPlus } from 'lucide-react';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { SignupForm } from './signup-form';
import { Suspense } from 'react';
import { FullPageLoader } from '@/components/ui/full-page-loader';


export const metadata: Metadata = {
  title: 'إنشاء حساب جديد - الوصول إلى وظائف المغرب',
  description: 'أنشئ حسابك مجانًا للوصول إلى فرص العمل في المغرب وابدأ بإنشاء ملفك كباحث عن عمل بسهولة وسرعة.',
  alternates: { canonical: '/signup' },
};

function SignupFormFallback() {
  return <FullPageLoader />;
}

export default function SignupPage() {
  return (
    <>
      <MobilePageHeader title="إنشاء حساب">
        <UserPlus className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
  icon={UserPlus}
  title="ابدأ رحلتك المهنية"
  description="سجّل مجانًا للعثور على فرص عمل في المغرب، وعرض مهاراتك وخبراتك أمام أصحاب العمل والمشاريع."
/>
      <Suspense fallback={<SignupFormFallback />}>
        <SignupForm />
      </Suspense>
    </>
  );
}
