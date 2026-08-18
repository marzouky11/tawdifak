
import React from 'react';
import { notFound } from 'next/navigation';
import { getCachedJobById } from '@/lib/data';
import type { Metadata } from 'next';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { Briefcase } from 'lucide-react';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { JobDesktopDetails } from './job-desktop-details';
import { JobMobileDetails } from './job-mobile-details';
import type { Job, WorkType } from '@/lib/types';
import { SITE_URL } from '@/lib/site-config';

// Keep the page-level cache in sync with the 1-hour data cache used by
// getCachedJobById (see src/lib/data.ts). Without this, a transient
// not-found result rendered once would be cached indefinitely by the
// Full Route Cache instead of self-healing within an hour.
export const revalidate = 3600;


interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

interface JobPostingJsonLd {
  '@context': string;
  '@type': string;
  title: string;
  description: string;
  identifier?: {
    '@type': 'PropertyValue';
    name: string;
    value: string;
  };
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
          addressLocality: string;
          addressCountry: string;
      };
  };
  employmentType?: string;
  baseSalary?: {
    '@type': 'MonetaryAmount';
    currency: string;
    value: {
      '@type': 'QuantitativeValue';
      value: string;
      unitText: string;
    };
  };
}

// Builds the JobPosting structured-data object for a given job. Shared by
// the page component, which renders it as a real <script type="application/ld+json">
// tag (Next.js's `other` metadata field only emits <meta> tags, so JSON-LD
// must never be passed through `other` — it would silently fail to be
// recognized by Google as structured data).
function buildJobPostingJsonLd(job: Job, baseUrl: string, metaDescription: string): JobPostingJsonLd {
  const createdAtDate = (job.createdAt && typeof job.createdAt.toDate === 'function')
    ? job.createdAt.toDate()
    : new Date();

  const jobPostingJsonLd: JobPostingJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title || 'إعلان وظيفة',
      description: metaDescription,
      datePosted: createdAtDate.toISOString(),
      hiringOrganization: {
        '@type': 'Organization',
        name: job.companyName || 'توظيفك',
        sameAs: baseUrl,
      },
      jobLocation: {
          '@type': 'Place',
          address: {
              '@type': 'PostalAddress',
              addressLocality: job.city,
              addressCountry: job.country,
          },
      },
  };

  const workTypeMapping: { [key in WorkType]: string } = {
    full_time: 'FULL_TIME',
    part_time: 'PART_TIME',
    remote: 'REMOTE',
    hybrid: 'OTHER',
    flexible: 'OTHER',
  };

  if (job.workType && workTypeMapping[job.workType]) {
      jobPostingJsonLd.employmentType = workTypeMapping[job.workType];
  }

  const expiryDate = new Date(createdAtDate);
  expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Set expiry to 1 year from posting
  jobPostingJsonLd.validThrough = expiryDate.toISOString();

  return jobPostingJsonLd;
}

function getJobMetaDescription(job: Job): string {
  const jobTitle = job.title || 'إعلان وظيفة';
  const jobCity = job.city || 'مدينة غير محددة';
  const jobCountry = job.country || 'دولة غير محددة';
  return (job.description || `${jobTitle} في ${jobCity}, ${jobCountry}.`).substring(0, 160);
}

export async function generateMetadata({ params }: JobDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const job = await getCachedJobById(id);
  const baseUrl = SITE_URL;
  const siteThumbnail = 'https://i.postimg.cc/MH0BfvFB/og-image.jpg';
  
  if (!job) {
    return {
      title: 'الإعلان غير موجود',
      description: 'لم نتمكن من العثور على الإعلان الذي تبحث عنه.',
      openGraph: { images: [{ url: siteThumbnail }] },
      twitter: { images: [siteThumbnail] }
    };
  }
  
  const jobTitle = job.title || 'إعلان وظيفة';
  const metaDescription = getJobMetaDescription(job);
  const canonicalUrl = `${baseUrl}/jobs/${job.id}`;

  return {
    title: jobTitle,
    description: metaDescription,
    robots: 'index, follow',
    alternates: {
        canonical: canonicalUrl,
    },
    openGraph: {
        title: jobTitle,
        description: metaDescription,
        url: canonicalUrl,
        siteName: 'توظيفك',
        type: 'article',
        images: [{ url: siteThumbnail, width: 1200, height: 630, alt: jobTitle }],
    },
    twitter: {
        card: 'summary_large_image',
        title: jobTitle,
        description: metaDescription,
        images: [siteThumbnail],
    },
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
    const { id } = await params;
    const job = await getCachedJobById(id);

    if (!job || job.postType !== 'seeking_worker') {
        notFound();
    }

    const jobPostingJsonLd = buildJobPostingJsonLd(job, SITE_URL, getJobMetaDescription(job));

    return (
        <>
            {/* Structured data for Google Jobs / rich results. Rendered here as a
                real <script> tag — NOT via the metadata `other` field, which only
                produces <meta> tags and would be invisible to Google. */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
            />
            {/* Common Headers for both mobile and desktop */}
            <MobilePageHeader title="تفاصيل عرض العمل">
                <Briefcase className="h-5 w-5 text-primary" />
            </MobilePageHeader>
            <DesktopPageHeader
                icon={Briefcase}
                title="تفاصيل عرض العمل"
                description="هنا تجد جميع المعلومات المتعلقة بفرصة العمل هذه."
            />
            <div className="container flex justify-center">
             
            </div>

            {/* Mobile View */}
            <div className="block md:hidden">
                <JobMobileDetails job={job} />
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <JobDesktopDetails job={job} />
            </div>
        </>
    );
}
  
