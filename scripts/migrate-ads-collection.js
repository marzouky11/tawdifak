/**
 * سكريبت هجرة لمرة واحدة: ينقل المستندات من المجموعة القديمة المشتركة "ads"
 * إلى المجموعتين الجديدتين المخصصتين "jobs" (عروض عمل) و"workers" (باحثون
 * عن عمل)، حسب قيمة الحقل postType في كل مستند.
 *
 * لماذا هذا السكريبت ضروري:
 * تعديل الكود ليقرأ من مجموعات جديدة لا "ينقل" المستندات الموجودة فعلاً في
 * Firestore تلقائياً — المستندات القديمة تبقى في مجموعة "ads" القديمة حتى
 * تُنسخ يدوياً. بدون تشغيل هذا السكريبت، ستبدو الوظائف/الباحثون عن عمل وكأنهم
 * اختفوا من الموقع رغم أن بياناتهم لا تزال موجودة بأمان في "ads".
 *
 * -------------------------------------------------------------------------
 * طريقة الاستخدام:
 * -------------------------------------------------------------------------
 * 1) تأكد من توفر متغيرات البيئة التالية (نفس المستخدمة في src/lib/firebase-admin.ts):
 *      FIREBASE_PROJECT_ID
 *      FIREBASE_CLIENT_EMAIL
 *      FIREBASE_PRIVATE_KEY
 *
 * 2) ثبّت firebase-admin إن لم يكن مثبتاً (موجود أصلاً في package.json):
 *      npm install
 *
 * 3) شغّل السكريبت أولاً في وضع "تجريبي" (لا يكتب أي شيء، فقط يعرض ما
 *    سيحدث) للتأكد من أن كل شيء صحيح قبل التنفيذ الفعلي:
 *      node scripts/migrate-ads-collection.js
 *
 * 4) إذا كانت النتائج صحيحة، نفّذ الهجرة الفعلية (تنسخ المستندات فقط، ولا
 *    تحذف شيئاً من "ads" بعد):
 *      node scripts/migrate-ads-collection.js --confirm
 *
 * 5) بعد التأكد يدوياً (من Firebase Console) أن كل المستندات نُسخت بنجاح
 *    إلى "jobs" و"workers"، احذف مجموعة "ads" القديمة نهائياً:
 *      node scripts/migrate-ads-collection.js --delete-old
 *
 * ملاحظات أمان:
 * - السكريبت لا يحذف أي شيء من "ads" إلا عند تمرير --delete-old صراحةً،
 *   وحتى حينها يحذف فقط المستندات التي تم التأكد من نسخها بنجاح.
 * - يستخدم معرّف المستند (document ID) نفسه في المجموعة الجديدة، لذلك تبقى
 *   الروابط الحالية للإعلانات (/jobs/[id] و /workers/[id]) تعمل دون تغيير.
 * - المستندات التي ليس لديها postType واضح (seeking_worker / seeking_job)
 *   تُترك في "ads" ولا تُنقل، ويُطبع تحذير بشأنها لمراجعتها يدوياً.
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
const CONFIRM = args.includes('--confirm');
const DELETE_OLD = args.includes('--delete-old');

function getCredentials() {
  // الطريقة الأسهل: ضع ملف مفتاح حساب الخدمة (JSON) الذي حمّلته من Firebase
  // في نفس مجلد المشروع باسم "serviceAccountKey.json" — السكريبت سيجده تلقائياً.
  const keyFilePath = path.join(__dirname, '..', 'serviceAccountKey.json');
  if (fs.existsSync(keyFilePath)) {
    const key = JSON.parse(fs.readFileSync(keyFilePath, 'utf8'));
    return {
      projectId: key.project_id,
      clientEmail: key.client_email,
      privateKey: key.private_key,
    };
  }

  // بديل: متغيرات البيئة (نفس المستخدمة في src/lib/firebase-admin.ts)
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!projectId || !clientEmail || !privateKey) {
    console.error('❌ لم يتم العثور على بيانات الاعتماد.');
    console.error('   ضع ملف serviceAccountKey.json في مجلد المشروع الرئيسي (راجع الخطوات في أعلى هذا الملف)،');
    console.error('   أو اضبط متغيرات البيئة FIREBASE_PROJECT_ID و FIREBASE_CLIENT_EMAIL و FIREBASE_PRIVATE_KEY.');
    process.exit(1);
  }

  return { projectId, clientEmail, privateKey };
}

async function main() {
  const { projectId, clientEmail, privateKey } = getCredentials();
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
  const db = getFirestore();

  console.log(`\n🔎 وضع التشغيل: ${DELETE_OLD ? 'حذف المستندات القديمة المنقولة بنجاح من "ads"' : CONFIRM ? 'نسخ فعلي (سيكتب في jobs/workers)' : 'تجريبي فقط (لن يُكتب أي شيء)'}\n`);

  const adsSnapshot = await db.collection('ads').get();

  if (adsSnapshot.empty) {
    console.log('لا توجد مستندات في مجموعة "ads". لا شيء لنقله.');
    return;
  }

  console.log(`تم العثور على ${adsSnapshot.size} مستند في "ads".\n`);

  const toJobs = [];
  const toWorkers = [];
  const unknown = [];

  adsSnapshot.forEach((doc) => {
    const data = doc.data();
    if (data.postType === 'seeking_worker') {
      toJobs.push(doc);
    } else if (data.postType === 'seeking_job') {
      toWorkers.push(doc);
    } else {
      unknown.push(doc);
    }
  });

  console.log(`  → ${toJobs.length} مستند سينتقل إلى "jobs" (عروض عمل)`);
  console.log(`  → ${toWorkers.length} مستند سينتقل إلى "workers" (باحثون عن عمل)`);
  if (unknown.length > 0) {
    console.log(`  ⚠️  ${unknown.length} مستند بدون postType واضح — سيبقى في "ads" لمراجعته يدوياً:`);
    unknown.forEach((doc) => console.log(`      - ${doc.id}`));
  }
  console.log('');

  if (!CONFIRM && !DELETE_OLD) {
    console.log('هذا عرض تجريبي فقط. لتنفيذ النسخ الفعلي، أعد التشغيل مع: --confirm');
    return;
  }

  if (DELETE_OLD) {
    // تحقق أولاً أن كل مستند منقول موجود فعلاً في وجهته الجديدة قبل حذفه من "ads"
    let deleted = 0;
    let skipped = 0;
    const batchSize = 400;
    const allMigrated = [...toJobs.map((d) => ({ doc: d, target: 'jobs' })), ...toWorkers.map((d) => ({ doc: d, target: 'workers' }))];

    for (let i = 0; i < allMigrated.length; i += batchSize) {
      const chunk = allMigrated.slice(i, i + batchSize);
      const batch = db.batch();
      let batchCount = 0;

      for (const { doc, target } of chunk) {
        const targetSnap = await db.collection(target).doc(doc.id).get();
        if (targetSnap.exists) {
          batch.delete(db.collection('ads').doc(doc.id));
          batchCount++;
        } else {
          console.log(`  ⚠️  تخطي حذف ${doc.id} من "ads" — لم يُعثر عليه في "${target}" بعد`);
          skipped++;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
        deleted += batchCount;
      }
    }

    console.log(`\n✅ تم حذف ${deleted} مستند من "ads" (تم التأكد من نسخها بنجاح).`);
    if (skipped > 0) console.log(`⚠️  تم تخطي ${skipped} مستند لعدم العثور عليها في الوجهة الجديدة — راجعها يدوياً.`);
    return;
  }

  // النسخ الفعلي (--confirm)
  const batchSize = 400; // أقل من حد Firestore (500) لترك هامش أمان
  let written = 0;

  async function copyBatch(docs, targetCollection) {
    for (let i = 0; i < docs.length; i += batchSize) {
      const chunk = docs.slice(i, i + batchSize);
      const batch = db.batch();
      for (const doc of chunk) {
        batch.set(db.collection(targetCollection).doc(doc.id), doc.data());
      }
      await batch.commit();
      written += chunk.length;
      console.log(`  ✓ تم نسخ ${chunk.length} مستند إلى "${targetCollection}" (المجموع حتى الآن: ${written})`);
    }
  }

  await copyBatch(toJobs, 'jobs');
  await copyBatch(toWorkers, 'workers');

  console.log(`\n✅ تم نسخ ${toJobs.length + toWorkers.length} مستند بنجاح إلى "jobs" و"workers".`);
  console.log('   المستندات الأصلية في "ads" لم تُحذف بعد — تحقق من صحة البيانات في Firebase Console،');
  console.log('   ثم شغّل السكريبت مع --delete-old لحذفها نهائياً من "ads".');

  // تصحيح إضافي: توحيد حقل الإحصائيات القديم "seekers" في stats/general
  // إلى الاسم الجديد "workers" (الكود يجمعهما مؤقتاً كحل احتياطي، لكن من
  // الأفضل توحيدهما فعلياً هنا لمرة واحدة).
  const statsRef = db.collection('stats').doc('general');
  const statsSnap = await statsRef.get();
  if (statsSnap.exists) {
    const stats = statsSnap.data();
    if (stats.seekers !== undefined) {
      const mergedWorkers = (stats.workers || 0) + (stats.seekers || 0);
      await statsRef.update({
        workers: mergedWorkers,
        seekers: require('firebase-admin/firestore').FieldValue.delete(),
      });
      console.log(`\n✅ تم توحيد حقل الإحصائيات: workers = ${mergedWorkers} (وحُذف الحقل القديم seekers).`);
    }
  }
}

main().catch((error) => {
  console.error('❌ حدث خطأ أثناء الهجرة:', error);
  process.exit(1);
});
