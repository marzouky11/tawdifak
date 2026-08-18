import React from 'react';
import { notFound } from 'next/navigation';
import { getCachedImmigrationById } from '@/lib/data';
import type { Metadata } from 'next';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { Plane } from 'lucide-react';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { getProgramTypeDetails } from '@/lib/utils';
import { ImmigrationDesktopDetails } from './immigration-desktop-details';
import { ImmigrationMobileDetails } from './immigration-mobile-details';
import { SITE_URL } from '@/lib/site-config';

// Keep the page-level cache in sync with the 1-hour data cache used by
// getCachedImmigrationById (see src/lib/data.ts). Without this, a transient
// not-found result rendered once would be cached indefinitely by the
// Full Route Cache instead of self-healing within an hour.
export const revalidate = 3600;

interface ImmigrationDetailPageProps {
  params: Promise<{ id: string }>;
}

interface JobPostingJsonLd {
  '@context': string;
  '@type': string;
  title: string;
  description: string;
  datePosted: string;
  validThrough?: string;
  hiringOrganization: {
    '@type': 'Organization';
    name: string;
    sameAs: string;
  };
  jobLocation: {
    '@type': 'Place';
    address: {
      '@type': 'PostalAddress';
      addressCountry?: string;
      addressLocality?: string;
    };
  };
  employmentType: string;
}

// Builds the JobPosting structured-data object for a given immigration post.
// Shared with the page component, which renders it as a real
// <script type="application/ld+json"> tag (Next.js's `other` metadata field
// only emits <meta> tags, so JSON-LD must never be passed through `other` —
// it would silently fail to be recognized by Google as structured data).
function buildImmigrationJsonLd(post: NonNullable<Awaited<ReturnType<typeof getCachedImmigrationById>>>, baseUrl: string, metaTitle: string, metaDescription: string): JobPostingJsonLd {
  const createdAtDate = post.createdAt?.toDate ? post.createdAt.toDate() : new Date();

  const jobPostingJsonLd: JobPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: metaTitle,
    description: metaDescription,
    datePosted: createdAtDate.toISOString(),
    hiringOrganization: {
      '@type': 'Organization',
      name: 'توظيفك',
      sameAs: baseUrl,
    },
    jobLocation: {
        '@type': 'Place',
        address: {
            '@type': 'PostalAddress',
            ...(post.targetCountry && { addressCountry: post.targetCountry }),
            ...(post.city && { addressLocality: post.city }),
        },
    },
    employmentType: "FULL_TIME", // Using a general valid value
  };

  const expiryDate = post.deadline ? new Date(post.deadline) : new Date(createdAtDate);
  if (!post.deadline) {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  }
  if (!isNaN(expiryDate.getTime())) {
      jobPostingJsonLd.validThrough = expiryDate.toISOString();
  }

  return jobPostingJsonLd;
}

export async function generateMetadata({ params }: ImmigrationDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const post = await getCachedImmigrationById(id);
  const baseUrl = SITE_URL;
  const siteThumbnail = 'https://i.postimg.cc/MH0BfvFB/og-image.jpg';
  
  if (!post) {
    return {
      title: 'فرصة هجرة غير موجودة',
      description: 'لم نتمكن من العثور على فرصة الهجرة التي تبحث عنها.',
      robots: 'index, follow',
      openGraph: { 
        images: [{ url: siteThumbnail }],
        title: 'فرصة هجرة غير موجودة',
        description: 'لم نتمكن من العثور على فرصة الهجرة التي تبحث عنها.',
      },
    };
  }

  const programDetails = getProgramTypeDetails(post.programType);
  const metaTitle = post.title;
  const metaDescription = (post.description || `فرصة هجرة إلى ${post.targetCountry} في مجال ${programDetails.label}`).substring(0, 160);
  const canonicalUrl = `${baseUrl}/immigration/${post.id}`;
  const createdAtDate = post.createdAt?.toDate ? post.createdAt.toDate() : new Date();

  return {
    title: metaTitle,
    description: metaDescription,
    robots: 'index, follow',
    alternates: {
        canonical: canonicalUrl,
    },
    openGraph: {
        title: metaTitle,
        description: metaDescription,
        url: canonicalUrl,
        siteName: 'توظيفك',
        type: 'article',
        publishedTime: createdAtDate.toISOString(),
        images: [ { url: siteThumbnail, width: 1200, height: 630, alt: metaTitle } ],
    },
    twitter: {
        card: 'summary_large_image',
        title: metaTitle,
        description: metaDescription,
        images: [siteThumbnail],
    },
  };
}


export default async function ImmigrationDetailPage({ params }: ImmigrationDetailPageProps) {
    const { id } = await params;
    const post = await getCachedImmigrationById(id);

    if (!post) {
        notFound();
    }

    const programDetails = getProgramTypeDetails(post.programType);
    const metaDescription = (post.description || `فرصة هجرة إلى ${post.targetCountry} في مجال ${programDetails.label}`).substring(0, 160);
    const jobPostingJsonLd = buildImmigrationJsonLd(post, SITE_URL, post.title, metaDescription);

    return (
        <>
            {/* Structured data for rich results. Rendered here as a real <script>
                tag — NOT via the metadata `other` field, which only produces
                <meta> tags and would be invisible to Google. */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
            />
            <MobilePageHeader title="فرصة هجرة">
                <Plane className="h-5 w-5 text-primary" />
            </MobilePageHeader>
            <DesktopPageHeader
                icon={Plane}
                title="تفاصيل فرصة الهجرة"
                description={`استكشف جميع المعلومات المتعلقة بفرصة الهجرة إلى ${post.targetCountry}.`}
            />
            <div className="container flex justify-center">
              
            </div>

            {/* Mobile View */}
            <div className="block md:hidden">
                <ImmigrationMobileDetails post={post} />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <ImmigrationDesktopDetails post={post} />
            </div>
        </>
    );
}   
      
