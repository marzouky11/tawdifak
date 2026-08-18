ز
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getCachedArticleBySlug, getArticles } from '@/lib/data';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { Card, CardContent } from '@/components/ui/card';
import { User, Newspaper } from 'lucide-react';
import type { Metadata } from 'next';
import { ArticleCard } from '../article-card';
import { Separator } from '@/components/ui/separator';
import type { Article } from '@/lib/types';
import { SITE_URL } from '@/lib/site-config';

// Keep the page-level cache in sync with the 1-hour data cache used by
// getCachedArticleBySlug (see src/lib/data.ts). Without this, a transient
// not-found result rendered once would be cached indefinitely by the
// Full Route Cache instead of self-healing within an hour.
export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

async function getArticle(slug: string): Promise<Article | null> {
  return await getCachedArticleBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  const baseUrl = SITE_URL;
  const siteThumbnail = 'https://i.postimg.cc/MH0BfvFB/og-image.jpg';

  if (!article) {
    return {
      title: 'المقال غير موجود',
      description: 'لم نتمكن من العثور على المقال الذي تبحث عنه.',
      openGraph: { images: [{ url: siteThumbnail }] },
      twitter: { images: [siteThumbnail] }
    };
  }

  const articleDate = getArticleDate(article);

  return {
    title: article.title,
    description: article.summary,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/articles/${article.slug}`,
    },
    robots: 'index, follow',
    openGraph: {
      title: article.title,
      description: article.summary,
      images: [{ url: article.imageUrl, width: 1200, height: 630 }],
      url: `${baseUrl}/articles/${article.slug}`,
      siteName: 'توظيفك',
      type: 'article',
      publishedTime: articleDate.toISOString(),
      authors: [article.author],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary,
      images: [article.imageUrl],
    },
  };
}

// Resolves the article's publish date across the various shapes it can take
// (Firestore Timestamp, ISO string, or a plain `date` fallback field).
function getArticleDate(article: Article): Date {
  if (article.createdAt && typeof article.createdAt === 'object' && 'toDate' in article.createdAt) {
    return article.createdAt.toDate();
  }
  if (typeof article.createdAt === 'string') {
    return new Date(article.createdAt);
  }
  if (article.date) {
    return new Date(article.date);
  }
  return new Date();
}

// Builds the Article structured-data object. Rendered by the page component
// as a real <script type="application/ld+json"> tag — NOT via the metadata
// `other` field, which only produces <meta> tags and would be invisible to
// Google as structured data.
function buildArticleJsonLd(article: Article, baseUrl: string) {
  const articleDate = getArticleDate(article);
  const siteThumbnail = 'https://i.postimg.cc/MH0BfvFB/og-image.jpg';

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${baseUrl}/articles/${article.slug}`,
    },
    headline: article.title,
    description: article.summary,
    image: article.imageUrl,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'توظيفك',
      logo: {
        '@type': 'ImageObject',
        url: siteThumbnail,
      },
    },
    datePublished: articleDate.toISOString(),
    dateModified: articleDate.toISOString(),
  };
}

const linkify = (text: string) => {
  const regex = /(?:("([^"]+)"\s*\(url:([^\s)]+)\))|((https?:\/\/[^\s]+)))/g;
  let lastIndex = 0;
  const elements: React.ReactNode[] = [];
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.slice(lastIndex, match.index));
    }

    const displayText = match[2] || match[4];
    const url = match[3] || match[4];

    elements.push(
      <a
        key={lastIndex}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 font-medium hover:text-blue-800 break-words"
      >
        {displayText}
      </a>
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.slice(lastIndex));
  }

  return elements;
};

const renderContent = (content: string) => {
  const lines = content.split('\n').map(l => l.trim());
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = (key: string) => {
    if (listItems.length) {
      elements.push(
        <ul key={key} className="list-disc ms-6 mb-4 space-y-2">
          {listItems.map((item, i) => (
            <li key={i}>{linkify(item)}</li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  lines.forEach((line, i) => {
    if (!line) {
      flushList(`ul-${i}`);
      return;
    }

    if (line.startsWith('### ')) {
      flushList(`ul-${i}`);
      elements.push(
        <h2 key={i} className="text-2xl font-bold mt-6 mb-3 text-green-600">
          {line.replace(/^###\s/, '')}
        </h2>
      );
      return;
    }

    if (line.startsWith('#### ')) {
      flushList(`ul-${i}`);
      elements.push(
        <h3 key={i} className="text-lg font-bold mt-4 mb-3">
          {line.replace(/^####\s/, '')}
        </h3>
      );
      return;
    }

    if (line.startsWith('- ')) {
      listItems.push(line.replace(/^- /, ''));
      return;
    }

    flushList(`ul-${i}`);
    elements.push(
      <p key={i} className="mb-4 leading-relaxed">
        {linkify(line)}
      </p>
    );
  });

  flushList('end');
  return elements;
};

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const { data } = await getArticles({ limit: 4 });
  const relatedArticles = data.filter(a => a.slug !== article.slug).slice(0, 3);
  const articleJsonLd = buildArticleJsonLd(article, SITE_URL);

  return (
    <>
      {/* Structured data for rich results. Rendered here as a real <script>
          tag — NOT via the metadata `other` field, which only produces
          <meta> tags and would be invisible to Google. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <MobilePageHeader title="مقالات">
        <Newspaper className="h-5 w-5 text-primary" />
      </MobilePageHeader>

      <div className="container mx-auto max-w-5xl px-4 pb-12 md:pt-6">
        <article>
          <Card>
            <CardContent className="p-4 md:p-8">
              <h1 className="text-3xl md:text-4xl font-bold text-red-600 mb-4">
                {article.title}
              </h1>

              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <User className="h-4 w-4" />
                {article.author}
              </div>

              {/* نسخة الهاتف: عرض الصورة بحجمها ونسبتها الأصلية دون قص */}
              <div className="md:hidden w-full mb-8 rounded-lg overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-auto rounded-lg"
                />
              </div>

              {/* نسخة الحاسوب: تبقى كما هي (ارتفاع ثابت وقص للصورة) */}
              <div className="relative h-80 w-full mb-8 rounded-lg overflow-hidden hidden md:block">
                <Image
                  src={article.imageUrl}
                  alt={article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              <div className="prose max-w-none dark:prose-invert">
                {renderContent(article.content)}
              </div>
            </CardContent>
          </Card>
        </article>

        {relatedArticles.length > 0 && (
          <section>
            <Separator className="my-6" />
            <h2 className="text-2xl font-bold text-center mb-8">
              مقالات قد تعجبك أيضاً
            </h2>

            <div className="grid md:grid-cols-3 gap-6">
              {relatedArticles.map(a => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

export async function generateStaticParams() {
  const { data } = await getArticles({ limit: 24 });
  return data.map(article => ({ slug: article.slug }));
      }
