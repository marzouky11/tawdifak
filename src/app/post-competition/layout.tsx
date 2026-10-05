import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'نشر مباراة عمومية',
  robots: { index: false, follow: false },
  alternates: { canonical: '/post-competition' },
};

export default function PostCompetitionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
