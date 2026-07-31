import type { Metadata } from 'next';

// Private, ownership-gated edit page. Already blocked in robots.txt; this
// noindex tag is a second, defense-in-depth layer.
export const metadata: Metadata = {
  title: 'تعديل الإعلان',
  robots: { index: false, follow: false },
};

export default function EditJobLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
