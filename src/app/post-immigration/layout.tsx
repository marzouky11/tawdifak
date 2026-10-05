import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'نشر فرصة هجرة',
  robots: { index: false, follow: false },
  alternates: { canonical: '/post-immigration' },
};

export default function PostImmigrationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
