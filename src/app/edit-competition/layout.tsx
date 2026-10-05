import type { Metadata } from 'next';

// Private, admin-only edit page. Already blocked in robots.txt; this
// noindex tag is a second, defense-in-depth layer.
export const metadata: Metadata = {
  title: 'تعديل المباراة',
  robots: { index: false, follow: false },
};

export default function EditCompetitionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
