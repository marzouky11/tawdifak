import type { Metadata } from 'next';

// Private, authenticated account pages (settings, my ads, saved ads, edit
// profile). Already blocked in robots.txt; this noindex tag is a second,
// defense-in-depth layer in case a URL is ever linked from elsewhere.
export const metadata: Metadata = {
  title: 'حسابي',
  robots: { index: false, follow: false },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
