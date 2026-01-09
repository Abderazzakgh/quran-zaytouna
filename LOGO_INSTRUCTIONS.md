# تعليمات إضافة الشعار الجديد

## المشكلة الحالية
التطبيق يستخدم حالياً الشعار القديم (`zaytuna-logo.png`) كبديل مؤقت.

## خطوات إضافة الشعار الجديد

### 1. حفظ الصورة
1. احفظ الصورة المرفقة (شعار معهد التعليم الزيتوني)
2. ضعها في مجلد `src/assets/`
3. اسم الملف: `zaytouna-emblem.png`

### 2. تحديث الملفات
بعد حفظ الصورة، قم بإلغاء التعليق عن السطور التالية:

#### في `src/components/Header.tsx`:
```typescript
// احذف هذه السطور:
import zaytunaLogo from "@/assets/zaytuna-logo.png";

// وألغِ التعليق عن هذه:
import zaytounaEmblem from "@/assets/zaytouna-emblem.png";
// ثم استبدل zaytunaLogo بـ zaytounaEmblem في الكود
```

#### في `src/components/HeroSection.tsx`:
```typescript
// احذف هذه السطور:
import zaytunaLogo from "@/assets/zaytuna-logo.png";

// وألغِ التعليق عن هذه:
import zaytounaEmblem from "@/assets/zaytouna-emblem.png";
// ثم استبدل zaytunaLogo بـ zaytounaEmblem في الكود
```

#### في `src/pages/Index.tsx`:
```typescript
// احذف هذه السطور:
import zaytunaLogo from "@/assets/zaytuna-logo.png";

// وألغِ التعليق عن هذه:
import zaytounaEmblem from "@/assets/zaytouna-emblem.png";
// ثم استبدل zaytunaLogo بـ zaytounaEmblem في الكود
```

### 3. التحقق
بعد التحديث، تأكد من:
- ✅ الملف موجود في `src/assets/zaytouna-emblem.png`
- ✅ جميع الاستيرادات محدثة
- ✅ التطبيق يعمل بدون أخطاء

## ملاحظة
إذا كان اسم الملف مختلفاً، استخدم الاسم الصحيح في جميع الملفات.

---

**بعد إضافة الشعار الجديد، سيتم عرضه تلقائياً في جميع أنحاء التطبيق!**



