
import { FullPageLoader } from '@/components/ui/full-page-loader';
import { Suspense } from 'react';
import PostArticleClient from './post-article-client';

function PostArticlePageFallback() {
  return (
    <FullPageLoader />
  );
}

export default function PostArticlePage() {
  return (
    <Suspense fallback={<PostArticlePageFallback />}>
      <PostArticleClient />
    </Suspense>
  );
}
