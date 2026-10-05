/**
 * محدّد معدل الطلبات (Rate Limiting) — حماية مسارات الـ API الحساسة
 * (تسجيل الدخول، التحقق من Turnstile...) من محاولات تلقائية/بوتات مكثفة.
 *
 * التنفيذ هنا بسيط ومعياري: نافذة زمنية منزلقة (sliding window) محفوظة فذاكرة
 * العملية (in-memory)، بلا أي خدمة خارجية — كيخدم مباشرة بلا إعداد إضافي.
 *
 * ملاحظة للإنتاج على نطاق واسع جداً (عدة نسخ/مناطق من السيرفر فنفس الوقت):
 * هاد التنفيذ كيحتفظ بعدّاد منفصل لكل نسخة من السيرفر (instance)، ماشي حد
 * مشترك عالمياً. هذا كافٍ ومناسب لحجم حملة إعلانية عادية (آلاف الزوار/اليوم).
 * إذا احتجتي فالمستقبل حداً صارماً 100% عبر كل النسخ فنفس الوقت على نطاق
 * عالمي كبير جداً، الحل المعياري هو Upstash Redis (@upstash/ratelimit) —
 * خدمة مجانية فحدودها الأساسية ومتوافقة مع Edge Runtime.
 */

interface RateLimitResult {
  /** واش الطلب مسموح ولا تجاوز الحد */
  success: boolean;
  /** عدد الطلبات المتبقية فهاد النافذة الزمنية */
  remaining: number;
  /** الوقت (timestamp) اللي غادي تتصفر فيه النافذة */
  resetAt: number;
}

const buckets = new Map<string, { count: number; resetAt: number }>();

// تنظيف دوري بسيط للذاكرة، باش ما تكبرش بلا داعي مع الوقت
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredBuckets() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

/**
 * @param identifier معرّف فريد لصاحب الطلب (عادة: عنوان IP + اسم المسار)
 * @param limit العدد الأقصى المسموح به من الطلبات
 * @param windowMs مدة النافذة الزمنية بالميلي ثانية
 */
export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60_000
): RateLimitResult {
  cleanupExpiredBuckets();

  const now = Date.now();
  const bucket = buckets.get(identifier);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(identifier, { count: 1, resetAt: now + windowMs });
    return { success: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { success: true, remaining: limit - bucket.count, resetAt: bucket.resetAt };
}

/** استخراج عنوان IP الحقيقي للزائر من رؤوس الطلب (كيخدم خلف أي CDN/Proxy عادي) */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;

  return 'unknown';
}
