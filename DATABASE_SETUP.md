# إعداد قاعدة البيانات - مصحف الزيتونة

## الخطوات المطلوبة

### 1. إنشاء مشروع Supabase
1. اذهب إلى [supabase.com](https://supabase.com)
2. أنشئ مشروعاً جديداً
3. احفظ `SUPABASE_URL` و `SUPABASE_ANON_KEY`

### 2. إعداد متغيرات البيئة
أنشئ ملف `.env` في جذر المشروع:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### 3. تشغيل Migration
في Supabase Dashboard:
1. اذهب إلى SQL Editor
2. انسخ محتوى `supabase/migrations/001_initial_schema.sql`
3. الصقه في SQL Editor
4. اضغط Run

أو استخدم Supabase CLI:
```bash
supabase db push
```

### 4. تفعيل Authentication
في Supabase Dashboard:
1. اذهب إلى Authentication > Providers
2. فعّل Email provider
3. (اختياري) فعّل Google, GitHub, etc.

### 5. اختبار التطبيق
1. شغّل `npm run dev`
2. سجّل حساباً جديداً
3. ابدأ استخدام الميزات

## الجداول المتوفرة

- **profiles**: معلومات المستخدمين
- **bookmark_folders**: مجلدات العلامات المرجعية
- **bookmarks**: العلامات المرجعية
- **reading_sessions**: جلسات القراءة اليومية
- **reading_goals**: أهداف القراءة
- **khatma_history**: تاريخ الختمات
- **memorization_plans**: خطط الحفظ
- **quiz_results**: نتائج الاختبارات
- **tadabbur_notes**: ملاحظات التدبر
- **ai_conversations**: محادثات المساعد الذكي
- **notifications**: الإشعارات
- **user_stats**: إحصائيات المستخدم

## الأمان

جميع الجداول محمية بـ Row Level Security (RLS):
- المستخدمون يمكنهم فقط الوصول لبياناتهم الخاصة
- جميع العمليات تتطلب مصادقة

## الدعم

للمساعدة، راجع [Supabase Documentation](https://supabase.com/docs)

