import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'نشر إعلان جديد - أنشئ ملفك كباحث عن عمل',
  description: 'ابدأ رحلتك المهنية الآن على توظيفك. أنشئ إعلانك كباحث عن عمل مجانًا واعرض مهاراتك وخبراتك أمام أصحاب العمل الباحثين عن كفاءات جديدة.',
  alternates: { canonical: '/post' },
  openGraph: {
    title: 'نشر إعلان جديد - أنشئ ملفك كباحث عن عمل',
    description: 'ابدأ رحلتك المهنية الآن على توظيفك. أنشئ إعلانك كباحث عن عمل مجانًا واعرض مهاراتك وخبراتك أمام أصحاب العمل الباحثين عن كفاءات جديدة.',
    url: '/post',
    siteName: 'توظيفك',
    type: 'website',
  },
};

export default function PostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
