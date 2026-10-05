'use client';

import { useEffect } from 'react';

// This boundary only activates when the ROOT layout itself throws (very rare —
// e.g. a provider crashing during render), which the regular `error.tsx`
// cannot catch since that one lives *inside* the layout it would need to
// replace. Because the root layout (and everything in it — AuthProvider,
// ThemeProvider, AppLayout) may be exactly what's broken, this file must
// render its own <html>/<body> and avoid importing any app UI/context.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root layout error:', error);
    // Best-effort logging only — never let this affect rendering the fallback.
    try {
      fetch('/api/health').catch(() => {});
    } catch {
      // ignore
    }
  }, [error]);

  return (
    <html lang="ar" dir="rtl">
      <body
        style={{
          fontFamily: 'Tahoma, Arial, sans-serif',
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 0,
          padding: '24px',
          backgroundColor: '#f8f9fa',
          color: '#1a1a1a',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '420px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '12px' }}>
            عذرًا، حدث خطأ غير متوقع
          </h1>
          <p style={{ fontSize: '16px', color: '#555', marginBottom: '24px', lineHeight: 1.6 }}>
            واجه الموقع مشكلة فنية غير متوقعة. يرجى إعادة تحميل الصفحة، وإن استمرت المشكلة يرجى المحاولة لاحقًا.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => reset()}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#0d6efd',
                color: '#fff',
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              إعادة المحاولة
            </button>
            <a
              href="/"
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                color: '#1a1a1a',
                fontSize: '15px',
                textDecoration: 'none',
              }}
            >
              العودة إلى الصفحة الرئيسية
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
