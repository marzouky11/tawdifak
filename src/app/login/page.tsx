

import type { Metadata } from 'next';
import { LogIn } from 'lucide-react';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { LoginForm } from './login-form';
import { Suspense } from 'react';
import { FullPageLoader } from '@/components/ui/full-page-loader';

export const metadata: Metadata = {
  title: 'تسجيل الدخول إلى حسابك - منصة الوظائف في المغرب',
  description: 'سجّل دخولك للوصول إلى وظائفك وإعلاناتك بسهولة، وتقدم للوظائف أو تابع فرص العمل المتاحة في المغرب بسرعة وسلاسة.',
  alternates: { canonical: '/login' },
};

function LoginFormFallback() {
  return <FullPageLoader />;
}

export default function LoginPage() {
  return (
    <>
      <DesktopPageHeader
        icon={LogIn}
        title="أهلاً بك مجدداً!"
        description="سجّل دخولك للوصول إلى حسابك وإدارة إعلاناتك."
      />
      <Suspense fallback={<LoginFormFallback />}>
        <LoginForm />
      </Suspense>
    </>
  );
}
