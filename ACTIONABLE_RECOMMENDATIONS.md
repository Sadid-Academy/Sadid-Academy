# 🛠️ توصيات تطبيقية - أكاديمية سديد
## Actionable Recommendations & Code Snippets

---

## 1. تحسين الأمان (Security Headers)

### إضافة Security Headers في `_headers` (Netlify):

```
/*
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  X-Content-Type-Options: nosniff
  X-Frame-Options: SAMEORIGIN
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com https://cdnjs.cloudflare.com https://flagcdn.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; media-src 'self' https: blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';
  X-UA-Compatible: IE=edge
  Cache-Control: public, max-age=3600, must-revalidate
```

---

## 2. تحسين الأداء

### أ) إضافة Service Worker

**ملف جديد:** `public/service-worker.js`
```javascript
// Service Worker for Caching
const CACHE_NAME = 'sadid-academy-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/courses.html',
  '/course-quran.html',
  '/course-arabic.html',
  '/course-islamic.html',
  '/tailwind-compiled.css',
  '/main.js',
  '/manifest.json',
  '/assets/images/logo.webp'
];

// تثبيت Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// تنظيف الـ Cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch with Cache Strategy
self.addEventListener('fetch', (event) => {
  // استراتيجية Cache First للموارد الثابتة
  if (event.request.method === 'GET') {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) return response;
          
          return fetch(event.request).then((response) => {
            // تخزين الاستجابة الناجحة فقط
            if (!response || response.status !== 200 || response.type === 'error') {
              return response;
            }
            
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          }).catch(() => {
            // رجوع إلى النسخة المخزنة إذا فشل الفتح
            return caches.match('/index.html');
          });
        })
    );
  }
});
```

**في `index.html` (قبل `</body>`):**
```html
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => console.log('✅ Service Worker تم تسجيله'))
      .catch(err => console.log('❌ Service Worker خطأ:', err));
  }
</script>
```

### ب) تحسين تحميل الخطوط (Font Optimization)

```html
<!-- بدلاً من -->
<link rel="preload" href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" as="style">

<!-- استخدم -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet">

<!-- أو أفضل بكثير - تحميل الخطوط محليًا -->
<!-- ضع الخطوط في /assets/fonts/ -->
<style>
  @font-face {
    font-family: 'Amiri';
    src: url('/assets/fonts/amiri-regular.woff2') format('woff2');
    font-weight: 400;
    font-display: swap;
  }
</style>
```

### ج) تقسيم main.js

**ملف جديد:** `src/modules/translations.js`
```javascript
// Module for translations
export const translationsCache = {};

export async function fetchTranslations(lang) {
  if (translationsCache[lang]) return translationsCache[lang];
  
  try {
    const response = await fetch(`locales/${lang}.json`);
    if (response.ok) {
      const data = await response.json();
      translationsCache[lang] = data;
      return data;
    }
  } catch (error) {
    console.error('Translation fetch error:', error);
  }
  
  return translationsCache['ar'] || {};
}
```

**ملف جديد:** `src/modules/ui.js`
```javascript
// Module for UI interactions
export function initializeUI() {
  // Move UI-related code here
  const giftBtn = document.getElementById("giftBtn");
  const giftModal = document.getElementById("giftModal");
  
  if (giftBtn && giftModal) {
    giftBtn.addEventListener("click", () => {
      giftModal.classList.remove("hidden");
    });
  }
}
```

**في main.js:**
```javascript
import { fetchTranslations } from './modules/translations.js';
import { initializeUI } from './modules/ui.js';

// استخدام الوحدات
async function init() {
  const lang = getLang();
  const translations = await fetchTranslations(lang);
  initializeUI();
  applyTranslations(lang);
}

init();
```

---

## 3. تحسين الوصولية (Accessibility)

### أ) تحسين Form Labels

**بدلاً من:**
```html
<input type="text" placeholder="اسمك" id="input-name" />
```

**استخدم:**
```html
<label for="input-name">الاسم *</label>
<input 
  type="text" 
  id="input-name" 
  placeholder="أدخل اسمك الكامل"
  aria-required="true"
  aria-describedby="name-hint"
/>
<span id="name-hint" class="text-sm text-gray-500">مثال: محمد أحمد</span>
```

### ب) تحسين Focus Indicators

**في tailwind.config.js أو CSS:**
```css
/* في src/input.css */
@layer base {
  /* تحسين Focus indicators */
  button:focus-visible,
  a:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    @apply outline-2 outline-offset-2 outline-blue-500;
  }
}

/* Tailwind config */
module.exports = {
  theme: {
    extend: {
      ringColor: {
        focus: '#3b82f6',
      }
    }
  }
}
```

**في HTML:**
```html
<!-- استخدام focus-visible -->
<button class="focus-visible:outline-2 focus-visible:outline-blue-500">
  اضغط هنا
</button>
```

### ج) تحسين Modal Accessibility

**ملف جديد:** `src/modules/modal.js`
```javascript
export class AccessibleModal {
  constructor(modalElement) {
    this.modal = modalElement;
    this.previouslyFocused = null;
    this.focusableElements = null;
  }

  open() {
    // حفظ العنصر الذي كان مركزًا
    this.previouslyFocused = document.activeElement;
    
    // الحصول على جميع العناصر القابلة للتركيز
    this.focusableElements = this.modal.querySelectorAll(
      'button, a, input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    // إظهار الـ Modal
    this.modal.classList.remove('hidden');
    this.modal.setAttribute('aria-hidden', 'false');
    
    // نقل التركيز إلى أول عنصر قابل للتركيز
    if (this.focusableElements.length > 0) {
      this.focusableElements[0].focus();
    }
    
    // تطبيق focus trap
    this.modal.addEventListener('keydown', (e) => this.handleKeydown(e));
    
    // منع التفاعل مع الخلفية
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.modal.classList.add('hidden');
    this.modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    
    // إعادة التركيز إلى العنصر السابق
    if (this.previouslyFocused) {
      this.previouslyFocused.focus();
    }
  }

  handleKeydown(e) {
    if (e.key === 'Escape') {
      this.close();
      return;
    }

    if (e.key === 'Tab') {
      const firstElement = this.focusableElements[0];
      const lastElement = this.focusableElements[this.focusableElements.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  }
}

// الاستخدام:
const modal = new AccessibleModal(document.getElementById('articleModal'));
```

### د) إضافة نصوص للفيديو

```html
<video id="introVideo" controls preload="none" poster="assets/images/logo.webp">
  <!-- Captions Track -->
  <track 
    kind="captions" 
    srclang="ar" 
    label="العربية" 
    src="/captions-ar.vtt"
  />
  <track 
    kind="captions" 
    srclang="en" 
    label="English" 
    src="/captions-en.vtt"
  />
  
  <!-- Video Source -->
  <source src="/video.mp4" type="video/mp4" />
  
  <!-- Fallback -->
  متصفحك لا يدعم الفيديو HTML5
</video>
```

---

## 4. تحسين SEO

### أ) إضافة Course Schema

```html
<!-- في course-quran.html -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "دورة القرآن الكريم",
  "description": "تعلم تلاوة وتجويد القرآن الكريم مع معلمين متخصصين",
  "provider": {
    "@type": "EducationalOrganization",
    "@id": "https://sadidacademy.netlify.app/#organization"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "ratingCount": "125"
  },
  "offers": {
    "@type": "CourseOffer",
    "url": "https://sadidacademy.netlify.app/course-quran",
    "price": "999",
    "priceCurrency": "EGP",
    "availability": "https://schema.org/InStock"
  },
  "educationalLevel": "Beginner to Advanced",
  "inLanguage": ["ar", "en"]
}
</script>
```

### ب) إضافة Breadcrumb Schema

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "الرئيسية",
      "item": "https://sadidacademy.netlify.app/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "الدورات",
      "item": "https://sadidacademy.netlify.app/courses"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "دورة القرآن الكريم",
      "item": "https://sadidacademy.netlify.app/course-quran"
    }
  ]
}
</script>
```

### ج) تحسين الربط الداخلي

**في index.html (قسم الدورات):**
```html
<div class="grid md:grid-cols-3 gap-6">
  <a href="/course-quran" class="course-card">
    <h3>دورة القرآن الكريم</h3>
    <p>تعلم التجويد والتلاوة الصحيحة</p>
  </a>
  
  <a href="/course-arabic" class="course-card">
    <h3>دورة اللغة العربية</h3>
    <p>إتقان أساسيات اللغة العربية</p>
  </a>
  
  <a href="/course-islamic" class="course-card">
    <h3>دورة العلوم الشرعية</h3>
    <p>العقيدة والفقه والحديث</p>
  </a>
</div>

<!-- CTA -->
<div class="text-center mt-8">
  <a href="/courses" class="btn btn-lg">
    شاهد جميع الدورات ←
  </a>
</div>
```

### د) تحسين أسماء الصور

```
قبل:  course-islamic.webp
بعد:  online-islamic-studies-course.webp

قبل:  course-arabic.webp
بعد:  learn-arabic-online-course.webp

قبل:  course-quran.webp
بعد:  quran-tajweed-classes-online.webp
```

---

## 5. تحسينات تقنية إضافية

### أ) إضافة sitemap البيانات المنظمة

**تحديث sitemap.xml:**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://sadidacademy.netlify.app/course-quran</loc>
    <lastmod>2026-06-06</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
    <!-- صورة الدورة -->
    <image:image>
      <image:loc>https://sadidacademy.netlify.app/assets/images/course-quran.webp</image:loc>
      <image:title>دورة القرآن الكريم</image:title>
    </image:image>
    <!-- Hreflang للغات -->
    <xhtml:link rel="alternate" hreflang="ar" href="https://sadidacademy.netlify.app/course-quran?lang=ar"/>
    <xhtml:link rel="alternate" hreflang="en" href="https://sadidacademy.netlify.app/course-quran?lang=en"/>
  </url>
</urlset>
```

### ب) إضافة robots.txt محسّن

```
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/
Disallow: /*.json$
Disallow: /*.xml$
Disallow: /?lang=*
Allow: /?lang=ar
Allow: /?lang=en

User-agent: AdsBot-Google
Allow: /

Crawl-delay: 1

Sitemap: https://sadidacademy.netlify.app/sitemap.xml
Sitemap: https://sadidacademy.netlify.app/sitemap-en.xml
```

### ج) ملف 404.html مخصص

**ملف جديد:** `404.html`
```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>الصفحة غير موجودة - أكاديمية سديد</title>
  <link rel="stylesheet" href="/tailwind-compiled.css">
</head>
<body class="bg-gradient-to-b from-blue-50 to-yellow-50 flex items-center justify-center min-h-screen">
  <div class="text-center px-4">
    <h1 class="text-6xl font-bold text-yellow-500 mb-4">404</h1>
    <h2 class="text-3xl font-bold text-gray-800 mb-2">الصفحة غير موجودة</h2>
    <p class="text-gray-600 mb-8">عذرًا، الصفحة التي تبحث عنها غير موجودة</p>
    
    <div class="space-y-4">
      <a href="/" class="btn btn-lg bg-yellow-500 text-white hover:bg-yellow-600">
        العودة إلى الرئيسية
      </a>
      <a href="/courses" class="btn btn-lg btn-outline">
        اكتشف الدورات
      </a>
    </div>
  </div>
</body>
</html>
```

---

## 6. اختبار وتحقق

### قائمة التحقق (Checklist):

- [ ] تشغيل lighthouse تحت 75 في:
  - [ ] Performance
  - [ ] Accessibility  
  - [ ] Best Practices
  - [ ] SEO

- [ ] اختبار Accessibility:
  - [ ] اختبار keyboard navigation (Tab, Enter, Escape)
  - [ ] اختبار مع screen readers (NVDA, JAWS)
  - [ ] اختبار color contrast
  - [ ] اختبار mobile accessibility

- [ ] اختبار SEO:
  - [ ] التحقق من hreflang في Google Search Console
  - [ ] اختبار structured data مع Google Rich Results Test
  - [ ] التحقق من meta tags لكل صفحة
  - [ ] اختبار breadcrumb schema

- [ ] اختبار الأداء:
  - [ ] تشغيل Google PageSpeed Insights
  - [ ] اختبار Core Web Vitals
  - [ ] اختبار على اتصال 4G بطيء
  - [ ] اختبار على جهاز قديم

---

## 📞 الدعم والمساعدة

للمزيد من المعلومات:
- [Google Developers](https://developers.google.com/)
- [MDN Web Docs](https://developer.mozilla.org/)
- [Web.dev](https://web.dev/)

---

**آخر تحديث:** 2026-06-07
