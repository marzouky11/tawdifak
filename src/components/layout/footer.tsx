'use client';

import Link from 'next/link';
import {
  Instagram,
  Briefcase,
  Users,
  PlusCircle,
  Newspaper,
  Info,
  Mail,
  Shield,
  FileText,
  ArrowLeft,
  Landmark,
  Plane,
  MessageSquare,
  MessageSquarePlus,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const importantLinks = [
  { label: 'الوظائف', href: '/jobs', icon: Briefcase },
  { label: 'فرص الهجرة', href: '/immigration', icon: Plane },
  { label: 'المباريات العمومية', href: '/competitions', icon: Landmark },
  { label: 'العمال', href: '/workers', icon: Users },
  { label: 'مقالات', href: '/articles', icon: Newspaper },
  { label: 'نشر إعلان', href: '/post-job/select-type', icon: PlusCircle },
];

const platformLinks = [
  { label: 'من نحن', href: '/about', icon: Info },
  { label: 'اتصل بنا', href: '/contact', icon: Mail },
  { label: 'سياسة الخصوصية', href: '/privacy', icon: Shield },
  { label: 'شروط الاستخدام', href: '/terms', icon: FileText },
  { label: 'آراء المستخدمين', href: '/testimonials', icon: MessageSquare },
];

const FooterLinkItem = ({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
}) => {
  return (
    <Link
      href={href}
      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-primary" />
        <span className="font-medium text-sm">{label}</span>
      </div>
      <ArrowLeft className="h-4 w-4 text-muted-foreground" />
    </Link>
  );
};

const MobileFooter = () => {
  return (
    <footer className="md:hidden bg-card border-t py-6 mt-0">
      <div className="container mx-auto px-4 space-y-6 pb-24">
        <div>
          <h3 className="font-bold text-lg mb-3 px-2">روابط مهمة</h3>
          <div className="space-y-1">
            {importantLinks.map((link) => (
              <FooterLinkItem key={link.href} {...link} />
            ))}
          </div>
        </div>
        <Separator />
        <div>
          <h3 className="font-bold text-lg mb-3 px-2">معلومات المنصة</h3>
          <div className="space-y-1">
            {platformLinks.map((link) => (
              <FooterLinkItem key={link.href} {...link} />
            ))}
            <FooterLinkItem href="/add-testimonial" icon={MessageSquarePlus} label="إضافة رأي" />
            <a
              href="https://www.instagram.com/tawdifak?igsh=MW9wcG5vdzJzZXpjMw=="
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Instagram className="h-5 w-5 text-primary" />
                <span className="font-medium text-sm">تابعنا على إنستغرام</span>
              </div>
              <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            </a>
          </div>
        </div>
        <Separator />
        <div className="text-center text-muted-foreground text-xs pt-4">
          &copy; توظيفك. جميع الحقوق محفوظة {new Date().getFullYear()}
        </div>
      </div>
    </footer>
  );
};

const FooterColumnLink = ({
  href,
  label,
  external,
}: {
  href: string;
  label: string;
  external?: boolean;
}) => {
  const className =
    'group flex items-center gap-2 text-sm text-gray-500 hover:text-primary transition-colors duration-200 py-1.5';

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        <span className="h-1 w-1 rounded-full bg-gray-300 group-hover:bg-primary transition-colors" />
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      <span className="h-1 w-1 rounded-full bg-gray-300 group-hover:bg-primary transition-colors" />
      {label}
    </Link>
  );
};

const FooterColumnTitle = ({ children }: { children: React.ReactNode }) => (
  <h4 className="flex items-center gap-2 font-bold text-[15px] text-foreground mb-5">
    <span className="h-4 w-1 rounded-full bg-primary" />
    {children}
  </h4>
);

const DesktopFooter = () => {
  return (
    <footer className="hidden md:block bg-white border-t border-gray-200 mt-auto">
      {/* Accent strip */}
      <div className="h-[3px] w-full bg-gradient-to-l from-primary via-primary/50 to-primary/10" />

      <div className="container mx-auto max-w-7xl px-6 lg:px-10">
        {/* Link columns */}
        <div className="grid grid-cols-3 gap-x-12 gap-y-10 pb-12 pt-14 text-right">
          <div>
            <FooterColumnTitle>استكشف المنصة</FooterColumnTitle>
            <ul>
              <li>
                <FooterColumnLink href="/jobs" label="الوظائف" />
              </li>
              <li>
                <FooterColumnLink href="/immigration" label="فرص الهجرة" />
              </li>
              <li>
                <FooterColumnLink href="/competitions" label="المباريات العمومية" />
              </li>
              <li>
                <FooterColumnLink href="/workers" label="العمال" />
              </li>
              <li>
                <FooterColumnLink href="/articles" label="مقالات" />
              </li>
            </ul>
          </div>

          <div>
            <FooterColumnTitle>المشاركة والتواصل</FooterColumnTitle>
            <ul>
              <li>
                <FooterColumnLink href="/post-job/select-type" label="نشر إعلان" />
              </li>
              <li>
                <FooterColumnLink href="/testimonials" label="آراء المستخدمين" />
              </li>
              <li>
                <FooterColumnLink href="/add-testimonial" label="إضافة رأي" />
              </li>
              <li>
                <FooterColumnLink
                  href="https://www.instagram.com/tawdifak?igsh=MW9wcG5vdzJzZXpjMw=="
                  label="تابعنا على إنستغرام"
                  external
                />
              </li>
            </ul>
          </div>

          <div>
            <FooterColumnTitle>عن المنصة والسياسات</FooterColumnTitle>
            <ul>
              <li>
                <FooterColumnLink href="/about" label="من نحن" />
              </li>
              <li>
                <FooterColumnLink href="/contact" label="اتصل بنا" />
              </li>
              <li>
                <FooterColumnLink href="/privacy" label="سياسة الخصوصية" />
              </li>
              <li>
                <FooterColumnLink href="/terms" label="شروط الاستخدام" />
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 py-6">
          <p className="text-sm text-gray-500">
            &copy; توظيفك. جميع الحقوق محفوظة {new Date().getFullYear()}
          </p>
          <a
            href="https://www.instagram.com/tawdifak?igsh=MW9wcG5vdzJzZXpjMw=="
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center h-9 w-9 rounded-full border border-gray-200 text-gray-400 hover:text-primary hover:border-primary/30 transition-colors"
            aria-label="إنستغرام"
          >
            <Instagram className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export function Footer() {
  return (
    <>
      <MobileFooter />
      <DesktopFooter />
    </>
  );
}
