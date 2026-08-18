import type { Metadata } from 'next';

// Admin-only page (client-side redirects non-admins away) — kept out of the
// index, same as /post-immigration and /post-competition which are also
// admin-only.
export const metadata: Metadata = {
  title: 'نشر وظيفة جديدة على توظيفك',
  description: 'انشر عرض عمل جديد على منصة توظيفك ليصل إلى آلاف الباحثين عن عمل في المغرب، واعثر على الكفاءة المناسبة لشركتك بسهولة وسرعة.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/post-job' },
};

export default function PostJobLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
