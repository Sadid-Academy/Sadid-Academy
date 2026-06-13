
const video = document.getElementById('introVideo');
const badge = document.getElementById('videoBadge');
if (video && badge) {
    video.addEventListener('play', () => {
        badge.style.opacity = '0';
        badge.style.pointerEvents = 'none';
    });
}

/* =================== Helpers =================== */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const supported = ["ar", "en", "es", "fr", "it", "de"];
const defaultLang = "ar";
const langRegions = {
  ar: "ar-SA",
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  it: "it-IT",
  de: "de-DE"
};
let currentTranslations = {};
const translationsCache = {};

const getLang = () =>
  localStorage.getItem("lang") && supported.includes(localStorage.getItem("lang")) ?
  localStorage.getItem("lang") :
  defaultLang;

function getLangUrl(lang) {
  const url = new URL(window.location.href);
  if (lang === defaultLang) {
    url.searchParams.delete("lang");
  } else {
    url.searchParams.set("lang", lang);
  }
  return url.toString();
}

function getCanonicalUrl(lang) {
  const url = new URL(window.location.href);
  if (lang === defaultLang) {
    url.searchParams.delete("lang");
  } else {
    url.searchParams.set("lang", lang);
  }
  return url.toString();
}

function updateLanguageUrl(lang) {
  const url = new URL(window.location.href);
  if (lang === defaultLang) {
    url.searchParams.delete("lang");
  } else {
    url.searchParams.set("lang", lang);
  }
  history.replaceState(null, "", url.toString());
}

function updateLanguageMetaTags(lang, titleKey, dict, pageKey) {
  const canonicalUrl = getCanonicalUrl(lang);
  const alternateUrls = supported.reduce((acc, item) => {
    acc[item] = getLangUrl(item);
    return acc;
  }, {});

  // Update canonical link
  let canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    canonicalLink = document.createElement("link");
    canonicalLink.rel = "canonical";
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.href = canonicalUrl;

  // Update Open Graph URL
  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute("content", canonicalUrl);
  
  // Update Twitter URL
  const twitterUrl = document.querySelector('meta[name="twitter:url"]');
  if (twitterUrl) twitterUrl.setAttribute("content", canonicalUrl);
  
  // Update Twitter Card
  const twitterCard = document.querySelector('meta[name="twitter:card"]');
  if (!twitterCard) {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "twitter:card");
    meta.setAttribute("content", "summary_large_image");
    document.head.appendChild(meta);
  }

  // Update OG Locale
  const ogLocale = document.querySelector('meta[property="og:locale"]') || (() => {
    const meta = document.createElement("meta");
    meta.setAttribute("property", "og:locale");
    document.head.appendChild(meta);
    return meta;
  })();
  ogLocale.setAttribute("content", langRegions[lang] || langRegions[defaultLang]);

  // Remove old og:locale:alternate tags and recreate them
  document.querySelectorAll('meta[property="og:locale:alternate"]').forEach(el => el.remove());
  
  // Add og:locale:alternate for all other languages
  supported.forEach((item) => {
    if (item !== lang) {
      const altMeta = document.createElement("meta");
      altMeta.setAttribute("property", "og:locale:alternate");
      altMeta.setAttribute("content", langRegions[item]);
      document.head.appendChild(altMeta);
    }
  });

  // Update hreflang links
  supported.forEach((item) => {
    const hreflangValue = langRegions[item];
    const selector = `link[rel="alternate"][hreflang="${hreflangValue}"]`;
    let alternateLink = document.querySelector(selector);
    if (!alternateLink) {
      alternateLink = document.createElement("link");
      alternateLink.rel = "alternate";
      alternateLink.setAttribute("hreflang", hreflangValue);
      document.head.appendChild(alternateLink);
    }
    alternateLink.href = alternateUrls[item];
  });

  // Handle x-default hreflang
  let xdefaultLink = document.querySelector('link[rel="alternate"][hreflang="x-default"]');
  if (!xdefaultLink) {
    xdefaultLink = document.createElement("link");
    xdefaultLink.rel = "alternate";
    xdefaultLink.setAttribute("hreflang", "x-default");
    document.head.appendChild(xdefaultLink);
  }
  xdefaultLink.href = getLangUrl(defaultLang);

  // Update OG title and description with better fallback
  let ogTitle = document.querySelector('meta[property="og:title"]');
  if (!ogTitle) {
    ogTitle = document.createElement("meta");
    ogTitle.setAttribute("property", "og:title");
    document.head.appendChild(ogTitle);
  }
  const ogTitleKey = `og_title_${pageKey}`;
  ogTitle.setAttribute("content", dict[ogTitleKey] || dict[titleKey] || document.title);

  let ogDesc = document.querySelector('meta[property="og:description"]');
  if (!ogDesc) {
    ogDesc = document.createElement("meta");
    ogDesc.setAttribute("property", "og:description");
    document.head.appendChild(ogDesc);
  }
  const ogDescKey = `og_desc_${pageKey}`;
  const metaDescKey = `meta_desc_${pageKey}`;
  ogDesc.setAttribute("content", dict[ogDescKey] || dict[metaDescKey] || "");

  // Update Twitter title and description
  let twitterTitle = document.querySelector('meta[name="twitter:title"]');
  if (!twitterTitle) {
    twitterTitle = document.createElement("meta");
    twitterTitle.setAttribute("name", "twitter:title");
    document.head.appendChild(twitterTitle);
  }
  twitterTitle.setAttribute("content", dict[ogTitleKey] || dict[titleKey] || document.title);

  let twitterDesc = document.querySelector('meta[name="twitter:description"]');
  if (!twitterDesc) {
    twitterDesc = document.createElement("meta");
    twitterDesc.setAttribute("name", "twitter:description");
    document.head.appendChild(twitterDesc);
  }
  twitterDesc.setAttribute("content", dict[ogDescKey] || dict[metaDescKey] || "");

  // Update OG image with fallback
  let ogImage = document.querySelector('meta[property="og:image"]');
  if (!ogImage) {
    ogImage = document.createElement("meta");
    ogImage.setAttribute("property", "og:image");
    document.head.appendChild(ogImage);
  }
  const ogImageUrl = dict[`og_image_${pageKey}`] || "https://sadidacademy.netlify.app/assets/images/logo.webp";
  ogImage.setAttribute("content", ogImageUrl);

  let twitterImage = document.querySelector('meta[name="twitter:image"]');
  if (!twitterImage) {
    twitterImage = document.createElement("meta");
    twitterImage.setAttribute("name", "twitter:image");
    document.head.appendChild(twitterImage);
  }
  twitterImage.setAttribute("content", ogImageUrl);

  // Update structured data for languages
  updateStructuredDataForLanguage(lang, dict, pageKey);
}

function updateStructuredDataForLanguage(lang, dict, pageKey) {
  // Update existing structured data with language-specific information
  let ldJsonScript = document.querySelector('script[type="application/ld+json"]');
  
  if (ldJsonScript) {
    try {
      let jsonData = JSON.parse(ldJsonScript.textContent);
      
      // Handle array of items
      if (Array.isArray(jsonData['@graph'])) {
        jsonData['@graph'].forEach((item) => {
          if (item['@type'] === 'EducationalOrganization') {
            item.name = dict['site-title'] || 'Sadid Academy';
            item.inLanguage = lang;
            item.url = window.location.origin;
          } else if (item['@type'] === 'WebPage') {
            item.inLanguage = lang;
            item.name = dict[`page_title_${pageKey}`] || document.title;
            item.description = dict[`meta_desc_${pageKey}`] || '';
            item.url = window.location.href;
          }
        });
      }
      
      // Update the script
      ldJsonScript.textContent = JSON.stringify(jsonData, null, 2);
    } catch (e) {
      console.debug('Could not parse or update JSON-LD');
    }
  }
}

async function fetchTranslations(lang) {
  if (translationsCache[lang]) return translationsCache[lang];
  
  try {
    const response = await fetch(`locales/${lang}.json`);
    if (response.ok) {
      const data = await response.json();
      translationsCache[lang] = data;
      return data;
    }
  } catch (error) {
    // Silently fallback to Arabic
  }

  return translationsCache['ar'] || {};
}

function setDirByLang(lang) {
  if (lang === "ar") {
    document.documentElement.dir = "rtl";
    document.documentElement.lang = "ar";
  } else {
    document.documentElement.dir = "ltr";
    document.documentElement.lang = lang;
  }
}

function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (m) =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    } [m])
  );
}

async function applyTranslations(lang) {
  const dict = await fetchTranslations(lang);
  currentTranslations = dict;
  setDirByLang(lang);

  let pageKey = "home";
  let titleKey = "page_title_home";

  if (document.getElementById("quran-page")) {
    pageKey = "quran";
    titleKey = "page_title_quran";
  } else if (document.getElementById("arabic-page")) {
    pageKey = "arabic";
    titleKey = "page_title_arabic";
  } else if (document.getElementById("islamic-page")) {
    pageKey = "islamic";
    titleKey = "page_title_islamic";
  } else if (document.getElementById("courses-page")) {
    pageKey = "courses";
    titleKey = "page_title_courses";
  } else if (document.getElementById("enroll-page")) {
    pageKey = "enroll";
    titleKey = "enroll_page_title";
  }
  if (dict[titleKey]) document.title = dict[titleKey];

  document.querySelectorAll("[data-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-placeholder");
    if (dict[key]) el.placeholder = dict[key];
  });

  document.querySelectorAll("[data-text]").forEach((el) => {
    const key = el.getAttribute("data-text");
    if (dict[key]) {
      if (key === "page-hero-title" || key === "courses_header_desc") el.innerHTML = dict[key];
      else el.textContent = dict[key];
    }
  });

  const metaDesc = document.querySelector('meta[name="description"]');
  const descKey = `meta_desc_${pageKey}`;
  if (metaDesc && dict[descKey]) metaDesc.setAttribute("content", dict[descKey]);

  const metaKw = document.querySelector('meta[name="keywords"]');
  const kwKey = `meta_kw_${pageKey}`;
  if (metaKw && dict[kwKey]) metaKw.setAttribute("content", dict[kwKey]);

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle && dict[titleKey]) ogTitle.setAttribute("content", dict[titleKey]);

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc && dict[descKey]) ogDesc.setAttribute("content", dict[descKey]);

  updateLanguageMetaTags(lang, titleKey, dict, pageKey);

  const emailInput = $("#input-email");
  if (emailInput) emailInput.placeholder = dict["email-placeholder"] || "";

  const nameInput = $("#input-name");
  if (nameInput) nameInput.placeholder = dict["name-placeholder"] || "";

  const msgInput = $("#input-message");
  if (msgInput) msgInput.placeholder = dict["message-placeholder"] || dict["search-placeholder"] || "";

  const siteTitle = $("#site-title");
  if (siteTitle) siteTitle.textContent = dict["site-title"] || siteTitle.textContent;

  document
    .querySelectorAll('[data-text="footer"]')
    .forEach((e) => (e.textContent = dict["footer"] || e.textContent));

  const promoText = $("#promoText");
  if (promoText) promoText.innerHTML = dict["promo-text"] || "";

  const promoCta = $("#promoCta");
  if (promoCta) promoCta.textContent = dict["promo-cta"] || "";

  const promoLimited = $("#promoLimited");
  if (promoLimited) promoLimited.textContent = dict["promo-limited"] || "";

  const waFloatText = $("#waFloatText");
  if (waFloatText) waFloatText.textContent = dict["wa-float"] || "Chat";

  renderJourney(dict);
  renderBlog(dict);
  renderCourses(dict);
  initTyped(dict);
  applyWhatsAppFloat(dict);
}

const renderJourney = (dict) => {
  const grid = document.getElementById("journey-grid");
  if (!grid) return;

  const data = Array.isArray(dict.journeyData) ? dict.journeyData : [];
  grid.innerHTML = "";
  const frag = document.createDocumentFragment();

  data.forEach((step, index) => {
    const el = document.createElement("div");
    el.className = "rounded-card p-8 text-center";
    el.dataset.aos = "fade-up";
    el.dataset.aosDelay = index * 150;
    const icon = escapeHtml(step.icon || "");
    el.innerHTML = `
      <div class="text-5xl text-yellow-500 dark:text-yellow-400 mb-6"><i class="fas ${icon}"></i></div>
      <h3 class="text-2xl font-bold mb-4">${escapeHtml(step.title || "")}</h3>
      <p class="muted">${escapeHtml(step.desc || "")}</p>
    `;
    frag.appendChild(el);
  });

  grid.appendChild(frag);
};

const giftBtn = document.getElementById("giftBtn");
const giftModal = document.getElementById("giftModal");
const closeGiftModal = document.getElementById("closeGiftModal");
const modalBackdrop = document.getElementById("modalBackdrop");
const subscribeBtn = document.getElementById("subscribeBtn");

if (giftBtn && giftModal) {
  giftBtn.addEventListener("click", () => {
    giftModal.classList.remove("hidden");
  });
}

if (closeGiftModal && giftModal) {
  closeGiftModal.addEventListener("click", () => giftModal.classList.add("hidden"));
}

if (modalBackdrop && giftModal) {
  modalBackdrop.addEventListener("click", () => giftModal.classList.add("hidden"));
}

if (subscribeBtn) {
  subscribeBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (giftModal) giftModal.classList.add("hidden");
    const coursesSection = document.getElementById("courses");
    if (coursesSection) {
      coursesSection.scrollIntoView({
        behavior: "smooth"
      });
    } else {
      window.location.href = "/courses";
    }
  });
}

function renderBlog(dict) {
  const grid = $("#blog-grid");
  if (!grid) return;

  const list = Array.isArray(dict.blogData) ? dict.blogData : [];
  const readMoreLabel = dict["blog-readmore"] || "Read More";
  const articleLabel = dict["articleLabel"] || "Article";

  grid.innerHTML = "";
  const frag = document.createDocumentFragment();

  list.forEach((item, index) => {
    const card = document.createElement("article");
    card.setAttribute("role", "listitem");
    card.dataset.aos = "fade-up";
    card.dataset.aosDelay = index * 150;
    card.className = "blog-card-modern group relative flex flex-col h-full rounded-[2rem] overflow-hidden transition-all duration-500 cursor-pointer";

    const imgSrc = item.img ? item.img : "";
    const title = escapeHtml(item.title || "");
    const desc = escapeHtml(item.desc || "");

    card.innerHTML = `
      <div class="relative h-64 overflow-hidden">
        <div class="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500 z-10"></div>
        <img src="${imgSrc}" alt="${title}" class="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out" loading="lazy" decoding="async"/>
        <div class="absolute top-4 right-4 z-20">
          <span class="blog-badge backdrop-blur-md text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
            <i class="fa-solid fa-feather-pointed text-teal-500"></i> ${articleLabel}
          </span>
        </div>
      </div>
      <div class="p-8 flex flex-col flex-grow relative">
        <div class="absolute -top-8 left-8 z-20">
          <div class="blog-floating-btn w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 group-hover:rotate-6 group-hover:-translate-y-1 transition-all duration-300">
            <i class="fa-solid fa-arrow-left text-2xl transform -rotate-45 group-hover:rotate-0 transition-transform duration-300"></i>
          </div>
        </div>
        <div class="mt-4 mb-4">
          <h3 class="blog-title text-2xl font-bold leading-tight transition-colors duration-300 font-amiri">${title}</h3>
        </div>
        <p class="blog-desc text-sm leading-relaxed mb-6 line-clamp-3 flex-grow">${desc}</p>
        <div class="blog-footer border-t pt-6 mt-auto flex items-center justify-between text-xs font-medium">
          <span class="blog-date flex items-center gap-2 px-3 py-1 rounded-lg"><i class="fa-regular fa-calendar text-teal-500"></i> ${new Date().getFullYear()}</span>
          <span class="blog-readmore group-hover:translate-x-[-5px] transition-transform duration-300 font-bold">${readMoreLabel}</span>
        </div>
      </div>
    `;

    card.addEventListener("click", () => openArticleById(item.id, { push: true }));
    frag.appendChild(card);
  });

  grid.appendChild(frag);
}

function waCourseMessage(courseName) {
  const dict = currentTranslations;
  const template = dict["wa-template"] || "Hello, I would like to enroll in the [COURSE] course.";
  return template.replace("[COURSE]", courseName);
}

let currentFilter = 'all';
let currentSearch = '';

function renderCourses(dict, filter = currentFilter, search = currentSearch) {
  currentFilter = filter;
  currentSearch = search;

  const grid = $("#courses-grid");
  if (!grid) return;

  let list = dict.coursesData || [];

  if (filter !== 'all') {
    list = list.filter(c => c.category === filter);
  }

  if (search) {
    const term = search.toLowerCase();
    list = list.filter(c => 
      c.title.toLowerCase().includes(term) || 
      (c.desc && c.desc.toLowerCase().includes(term))
    );
  }

  grid.innerHTML = "";

  if (list.length === 0) {
    const noResultMsg = dict.noResultMsg || "No courses found";
    grid.innerHTML = `
      <div role="listitem" class="col-span-full text-center py-12" data-aos="fade-in">
        <div class="inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 mb-4">
          <i class="fa-solid fa-search text-4xl"></i>
        </div>
        <p class="text-xl text-gray-500 dark:text-gray-400 font-bold">${escapeHtml(noResultMsg)}</p>
      </div>
    `;
    return;
  }

  const phone = "201095499267";
  const joinText = dict["course-join-direct"] || "Join Course Directly";
  const detailsText = dict["course-details"] || "Course Details";

  const catLabels = dict.catLabels || {};
  const courseFeatures = dict.courseFeatures || {};

  const styleMap = {
    quran: {
      gradient: "from-emerald-500 to-teal-700",
      icon: "fa-book-quran",
      textHover: "group-hover:text-teal-600 dark:group-hover:text-teal-400",
      btnGradient: "from-teal-500 to-emerald-600",
      shadow: "shadow-teal-500/20 hover:shadow-teal-500/40",
      badgeBorder: "border-white/30"
    },
    arabic: {
      gradient: "from-blue-500 to-indigo-700",
      icon: "fa-language",
      textHover: "group-hover:text-blue-600 dark:group-hover:text-blue-400",
      btnGradient: "from-blue-500 to-indigo-600",
      shadow: "shadow-blue-500/20 hover:shadow-blue-500/40",
      badgeBorder: "border-white/30"
    },
    islamic: {
      gradient: "from-yellow-500 to-amber-700",
      icon: "fa-kaaba",
      textHover: "group-hover:text-yellow-600 dark:group-hover:text-yellow-400",
      btnGradient: "from-yellow-500 to-amber-600",
      shadow: "shadow-yellow-500/20 hover:shadow-yellow-500/40",
      badgeBorder: "border-white/30"
    }
  };

  const frag = document.createDocumentFragment();
  list.forEach((c, index) => {
    const card = document.createElement("div");
    card.setAttribute("role", "listitem");
    card.className = "group relative bg-white dark:bg-gray-800 rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-100 dark:border-gray-700 flex flex-col h-full";
    card.dataset.aos = "fade-up";
    card.dataset.aosDelay = index * 100;

    const msg = encodeURIComponent(waCourseMessage(c.title));
    const href = `https://wa.me/${phone}?text=${msg}`;
    const catLabel = catLabels[c.category] || "";
    const styles = styleMap[c.category] || styleMap.quran;
    const tags = (courseFeatures[c.category] || []).map(tag => `<span class="course-tag">${escapeHtml(tag)}</span>`).join('');

    let detailsLink = `/course-details?id=${encodeURIComponent(c.id || "")}`;
    if (c.category === 'quran') {
      detailsLink = '/course-quran';
    } else if (c.category === 'arabic') {
      detailsLink = '/course-arabic';
    } else if (c.category === 'islamic') {
      detailsLink = '/course-islamic';
    }

    const imgSrc = c.img || "";
    const title = escapeHtml(c.title || "");
    const desc = escapeHtml(c.desc || "");

    card.innerHTML = `
      <div class="course-card-modern group h-full flex flex-col">
        <div class="course-img-wrapper relative h-60 overflow-hidden">
          <div class="absolute top-4 right-4 z-10">
            <span class="px-3 py-1 rounded-full text-xs font-bold bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-800 dark:text-white shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2">
              <i class="fa-solid ${styles.icon}"></i>
              ${catLabel}
            </span>
          </div>
          <img src="${imgSrc}" alt="${title}" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" decoding="async">
          <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>
        </div>
        <div class="course-content p-6 flex flex-col flex-grow">
          <div class="mb-3">
            <h3 class="text-xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">${title}</h3>
          </div>
          <div class="course-tags mb-4">${tags}</div>
          <p class="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 line-clamp-3 flex-grow">${desc}</p>
          <div class="flex flex-col gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50">
            <a href="${href}" target="_blank" rel="noopener noreferrer" class="course-btn-primary w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
              <span>${escapeHtml(joinText)}</span> <i class="fa-brands fa-whatsapp text-lg"></i>
            </a>
            <a href="${detailsLink}" class="course-btn-outline w-full py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">${escapeHtml(detailsText)}</a>
          </div>
        </div>
      </div>
    `;

    frag.appendChild(card);
  });

  grid.appendChild(frag);
}

const modal = $("#articleModal");
const modalTitle = $("#modalTitle");
const modalBody = $("#modalBody");
const modalImg = $("#modalImg");
const modalDate = $("#modalDate");
const modalClose = $("#modalClose");

function getArticleById(id) {
  const list = currentTranslations.blogData || [];
  return list.find((x) => x.id === id);
}

function openArticleById(id, opts = {
  push: false
}) {
  const article = getArticleById(id);
  if (!article || !modal) return;

  modalTitle.textContent = article.title;
  modalBody.innerHTML = article.longContent || `<p>${article.desc || ""}</p>`;
  
  const ctaSpan = modal.querySelector(".modal-cta span");
  if(ctaSpan) ctaSpan.textContent = currentTranslations["modal-cta-text"] || "Start your educational journey now";
  
  if (modalImg) modalImg.src = article.img;
  const lang = getLang();
  if (modalDate) modalDate.textContent = new Date().toLocaleDateString(lang, { year: 'numeric', month: 'long', day: 'numeric' });

  modal.classList.add("modal-open");
  document.body.classList.add("no-scroll");
  modal.setAttribute("aria-hidden", "false");
  setTimeout(() => modalClose.focus(), 0);

  if (opts.push) {
    const base = location.pathname + location.search;
    history.pushState(null, "", `${base}#article=${encodeURIComponent(id)}`);
    document.title =
      article.title + " — " + (currentTranslations["site-title"] || "");
  }
}

function closeArticle() {
  if (!modal) return;
  modal.classList.remove("modal-open");
  document.body.classList.remove("no-scroll");
  modal.setAttribute("aria-hidden", "true");
  if (location.hash.startsWith("#article=")) {
    history.replaceState(null, "", location.pathname + location.search);
    document.title = currentTranslations["site-title"] || "";
  }
}

function parseArticleHash() {
  const h = location.hash || "";
  if (h.startsWith("#article=")) {
    const id = decodeURIComponent(h.split("=")[1] || "");
    openArticleById(id, { push: false });
  }
}

document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#article="]');
  if (!a) return;
  const href = a.getAttribute("href");
  const id = decodeURIComponent(href.split("=")[1] || "");
  e.preventDefault();
  openArticleById(id, { push: true });
});

if (modalClose) modalClose.addEventListener("click", closeArticle);
if (modal) {
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeArticle();
  });
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal && modal.classList.contains("modal-open"))
    closeArticle();
});
window.addEventListener("hashchange", parseArticleHash);

function initTyped(dict) {
  const typedEl = document.querySelector("#typed");
  if (!typedEl) return;

  typedEl.textContent = "";

  if (window.heroTyped instanceof Typed) {
    window.heroTyped.destroy();
    window.heroTyped = null;
  }

  const strings = dict.typedStrings || [];
  if (!Array.isArray(strings) || strings.length === 0) return;

  window.heroTyped = new Typed("#typed", {
    strings,
    typeSpeed: 55,
    backSpeed: 35,
    backDelay: 1200,
    startDelay: 300,
    fadeOut: true,
    fadeOutClass: "typed-fade-out",
    loop: true,
    showCursor: true,
    cursorChar: "▌",
    smartBackspace: true,
  });
}

// initTyped is now called via applyTranslations

(function () {
  const btn = $("#modeToggle");
  const checkbox = $("#theme-checkbox");

  function applyTheme(isDark) {
    if (isDark) {
      document.body.classList.add("dark");
      document.documentElement.classList.add("dark");
      if (checkbox) checkbox.checked = true;
    } else {
      document.body.classList.remove("dark");
      document.documentElement.classList.remove("dark");
      if (checkbox) checkbox.checked = false;
    }

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#0f172a' : '#ffffff');
    }
    
    if (window.pJSDom && window.pJSDom.length) {
        window.pJSDom[0].pJS.fn.vendors.destroypJS();
        window.pJSDom = [];
    }
    if (typeof initParticles === "function") {
      setTimeout(() => initParticles(isDark), 50);
    }
  }

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    applyTheme(savedTheme === "dark");
  } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    applyTheme(true);
  }

  const toggleHandler = () => {
    const isDarkNow = document.body.classList.contains("dark");
    const newStatus = !isDarkNow;
    localStorage.setItem("theme", newStatus ? "dark" : "light");
    applyTheme(newStatus);
  };

  if (btn) btn.addEventListener("click", (e) => {
    e.preventDefault();
    toggleHandler();
  });

  if (checkbox) checkbox.addEventListener("change", () => {
    const isChecked = checkbox.checked;
    localStorage.setItem("theme", isChecked ? "dark" : "light");
    applyTheme(isChecked);
  });
})();

async function detectAndApplyLanguage() {
  const params = new URLSearchParams(window.location.search);
  const urlLang = params.get("lang");
  let langToApply = "ar";
  let persist = true;

  if (urlLang && supported.includes(urlLang)) {
    langToApply = urlLang;
  } else {
    let saved = localStorage.getItem("lang");
    if (saved && supported.includes(saved)) {
      langToApply = saved;
      persist = false;
    } else {
      let nav = (navigator.language || "ar").split("-")[0];
      if (!supported.includes(nav)) nav = "ar";
      langToApply = nav;
    }
  }
  
  await applyLanguage(langToApply, persist);
  
  // فحص رابط المقال بعد أن نتأكد أن الترجمات وبيانات المدونة تم تحميلها
  parseArticleHash();
}

async function applyLanguage(lang, persist = true) {
  const select = $("#langSelect");
  if (select) select.value = lang;
  if (persist) localStorage.setItem("lang", lang);
  await applyTranslations(lang);
  updateLangButtonUI(lang);
  updateLanguageUrl(lang);
}

const flags = {
  ar: "https://flagcdn.com/sa.svg",
  en: "https://flagcdn.com/us.svg",
  es: "https://flagcdn.com/es.svg",
  fr: "https://flagcdn.com/fr.svg",
  it: "https://flagcdn.com/it.svg",
  de: "https://flagcdn.com/de.svg",
};

const langNames = {
  ar: "العربية",
  en: "English",
  es: "Español",
  fr: "Français",
  it: "Italiano",
  de: "Deutsch",
};

function updateLangButtonUI(lang) {
  const langFlag = document.getElementById("langFlag");
  const langLabel = document.getElementById("langLabel");
  if (langFlag) langFlag.src = flags[lang];
  if (langLabel) langLabel.textContent = langNames[lang];
}

window.addEventListener("DOMContentLoaded", () => detectAndApplyLanguage());

const langBtn = document.getElementById("langBtn");
const langMenu = document.getElementById("langMenu");

if (langBtn && langMenu) {
  langBtn.addEventListener("click", (e) => {
    e.preventDefault();
    langMenu.style.display = langMenu.style.display === "block" ? "none" : "block";
  });

  langMenu.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const lang = btn.getAttribute("data-lang");
      applyLanguage(lang, true);
      langMenu.style.display = "none";
    });
  });

  document.addEventListener("click", (e) => {
    if (!langBtn.contains(e.target) && !langMenu.contains(e.target)) {
      langMenu.style.display = "none";
    }
  });
}

const langSelect = $("#langSelect");
if (langSelect) {
  langSelect.addEventListener("change", (e) => applyLanguage(e.target.value, true));
}

const fadeSections = $$(".fade-section");
if (fadeSections.length > 0 && 'IntersectionObserver' in window) {
  const fadeObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -120px 0px" });
  fadeSections.forEach(sec => fadeObserver.observe(sec));
}

const back = $("#backTop");
const siteHeader = $("#siteHeader");

let isScrolling = false;
function onScroll() {
  if (!isScrolling) {
    isScrolling = true;
    const y = window.scrollY || window.pageYOffset; // القراءة تتم أولاً في الخارج
    window.requestAnimationFrame(() => {
      if (siteHeader) siteHeader.classList.toggle("shrink", y > 10);
      if (back) back.style.display = y > 300 ? "flex" : "none";
      isScrolling = false;
    });
  }
}

if (back) {
  back.addEventListener("click", () =>
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    })
  );
}
window.addEventListener("scroll", onScroll, { passive: true });

function applyWhatsAppFloat(dict) {
  const msg = encodeURIComponent(
    dict["whatsapp-msg"] || "Peace be upon you. I would like to inquire about Sadid Academy programs."
  );
  const phone = "201095499267";
  const href = `https://wa.me/${phone}?text=${msg}`;
  const wa = $("#whatsappFloat");
  if (wa) wa.setAttribute("href", href);
}

function mountAnnounceBar() {
  const bar = $("#announceBar");
  if (!bar) return;
  // تم إيقاف حساب الارتفاع برمجياً لمنع الـ Forced Reflow (الـ CSS يتكفل بذلك الآن)
}
function initContactForm() {
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const t = currentTranslations;
      
      if (!window.navigator.onLine) {
        const errorMsg = document.getElementById("form-error");
        if (errorMsg) {
          errorMsg.textContent = t["error_offline"] || "لا يوجد اتصال بالإنترنت";
          errorMsg.classList.remove("hidden");
        }
        return;
      }

      const form = e.target;
      const successMsg = document.getElementById("form-success");
      const errorMsg = document.getElementById("form-error");
      const submitBtn = form.querySelector("button[type='submit']");
      const originalBtnText = submitBtn ? submitBtn.innerHTML : "";

      if (successMsg) successMsg.classList.add("hidden");
      if (errorMsg) errorMsg.classList.add("hidden");

          let isValid = true;
          let validationMessage = "";
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

          if (form.name && form.name.value.trim().length < 2) {
            isValid = false;
            validationMessage = t["error_name"] || "يرجى إدخال اسم صحيح.";
          } else if (form.email && !emailRegex.test(form.email.value.trim())) {
            isValid = false;
            validationMessage = t["error_email"] || "يرجى إدخال بريد إلكتروني صالح.";
          } else if (form.message && form.message.value.trim().length < 5) {
            isValid = false;
            validationMessage = t["error_message"] || "الرسالة قصيرة جداً.";
          }

          if (!isValid) {
            if (errorMsg) {
              errorMsg.textContent = validationMessage;
              errorMsg.classList.remove("hidden");
              setTimeout(() => { errorMsg.classList.add("hidden"); }, 5000);
            }
            return;
          }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = (t["enroll_sending"] || "...") + ' <i class="fas fa-spinner fa-spin"></i>';
      }

      const formData = new FormData(form);
      const data = new URLSearchParams();
      for (const pair of formData) {
        data.append(pair[0], pair[1]);
      }

      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: data.toString(),
      }).then(response => {
        if (!response.ok) throw new Error("Network error");
        if (successMsg) {
          successMsg.textContent = t["contact_success"] || "تم إرسال رسالتك بنجاح";
          successMsg.classList.remove("hidden");
        }
        
        form.reset();
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }

        setTimeout(() => {
            if (successMsg) successMsg.classList.add("hidden");
        }, 5000);

      }).catch(error => {
        if (errorMsg) {
          errorMsg.textContent = t["contact_error"] || "حدث خطأ أثناء الإرسال";
          errorMsg.classList.remove("hidden");
          setTimeout(() => { errorMsg.classList.add("hidden"); }, 5000);
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      });
    });
  }
}

function autoFillForm() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const name = urlParams.get('name') || localStorage.getItem('user_name');
    const email = urlParams.get('email') || localStorage.getItem('user_email');
    
    if (name) {
      const nameInput = document.getElementById('input-name');
      if (nameInput) nameInput.value = name;
    }
    
    if (email) {
      const emailInput = document.getElementById('input-email');
      if (emailInput) emailInput.value = email;
    }
  } catch (e) {
    // Silently ignore errors
  }
}

window.addEventListener("load", () => {
  const preloader = document.getElementById('preloader');
  initContactForm();

  const yearSpan = $("#year");
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  mountAnnounceBar();
  
  
  autoFillForm();

  // Initialize AOS after first paint / idle time to avoid blocking render and reduce forced reflows
  requestAnimationFrame(() => {
    $("#heroTitle")?.classList.add("show");
    $("#heroSub")?.classList.add("show");
    $("#heroCta")?.classList.add("show");

    if (preloader) {
      setTimeout(() => {
        preloader.classList.add('fade-out');
      }, 150);
    }
  });

  const scheduleAOSInit = () => {
    const initAOS = () => {
      if (window.AOS) {
        AOS.init({
          duration: 700,
          once: true
        });
      }
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(initAOS, { timeout: 2000 });
    } else {
      setTimeout(initAOS, 500);
    }
  };

  scheduleAOSInit();
});
const mobileBtn = $("#mobileMenuBtn");
const mobileMenu = $("#mobileMenu");

if (mobileBtn && mobileMenu) {
  mobileBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
    const isOpen = !mobileMenu.classList.contains("hidden");
    mobileBtn.setAttribute("aria-expanded", isOpen);
  });
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.add("hidden");
      mobileBtn.setAttribute("aria-expanded", "false");
    });
  });
}

function initParticles(isDark = false) {
  if (typeof particlesJS === "undefined" || !document.getElementById("particles-js")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const isMobile = window.innerWidth < 768;

  particlesJS("particles-js", {
    particles: {
      number: {
        value: isMobile ? 30 : 80
      },
      color: {
        value: isDark ? "#ffffff" : "#d4a017"
      },
      shape: {
        type: "circle"
      },
      opacity: {
        value: 0.5
      },
      size: {
        value: 3
      },
      line_linked: {
        enable: true,
        color: isDark ? "#ffffff" : "#d4a017",
        opacity: 0.35,
      },
      move: {
        enable: true,
        speed: 2
      },
    },
    interactivity: {
      events: {
        onhover: {
          enable: false,
          mode: "repulse"
        },
        onclick: {
          enable: false,
          mode: "push"
        }
      },
    },
    retina_detect: true,
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const isDark = document.documentElement.classList.contains("dark");
  setTimeout(() => initParticles(isDark), 150); // تأخير تشغيل الجزيئات لتسريع التحميل الأولي
});

function toggleTheme() {
  const isDark = document.documentElement.classList.contains("dark");

  if (window.pJSDom && window.pJSDom.length) {
    window.pJSDom[0].pJS.fn.vendors.destroypJS();
    window.pJSDom = [];
  }
  setTimeout(() => initParticles(isDark), 50);
}
