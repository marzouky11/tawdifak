import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'إضافة رأي - شاركنا تجربتك مع توظيفك',
  description: 'شاركنا رأيك وتجربتك مع منصة توظيفك لمساعدة الآخرين واكتشاف كيف نساعد الباحثين عن عمل وأصحاب العمل يوميًا.',
  alternates: { canonical: '/add-testimonial' },
};

export default function AddTestimonialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
