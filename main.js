
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
  const alternateUrls = Object.fromEntries(
    supported.map((item) => [item, getLangUrl(item)])
  );

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
  ogLocale.setAttribute("content", Reflect.get(langRegions, lang) || Reflect.get(langRegions, defaultLang));

  // Remove old og:locale:alternate tags and recreate them
  document.querySelectorAll('meta[property="og:locale:alternate"]').forEach(el => el.remove());
  
  // Add og:locale:alternate for all other languages
  supported.forEach((item) => {
    if (item !== lang) {
      const altMeta = document.createElement("meta");
      altMeta.setAttribute("property", "og:locale:alternate");
      altMeta.setAttribute("content", Reflect.get(langRegions, item));
      document.head.appendChild(altMeta);
    }
  });

  // Update hreflang links
  supported.forEach((item) => {
    const hreflangValue = Reflect.get(langRegions, item);
    const selector = `link[rel="alternate"][hreflang="${hreflangValue}"]`;
    let alternateLink = document.querySelector(selector);
    if (!alternateLink) {
      alternateLink = document.createElement("link");
      alternateLink.rel = "alternate";
      alternateLink.setAttribute("hreflang", hreflangValue);
      document.head.appendChild(alternateLink);
    }
    alternateLink.href = Reflect.get(alternateUrls, item);
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
  ogTitle.setAttribute("content", Reflect.get(dict, ogTitleKey) || Reflect.get(dict, titleKey) || document.title);

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
  twitterTitle.setAttribute("content", Reflect.get(dict, ogTitleKey) || Reflect.get(dict, titleKey) || document.title);

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
  const ogImageUrl = Reflect.get(dict, `og_image_${pageKey}`) || "https://sadid-academy.vercel.app/assets/images/logo.webp";
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
            item.name = Reflect.get(dict, `page_title_${pageKey}`) || document.title;
            item.description = Reflect.get(dict, `meta_desc_${pageKey}`) || '';
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
  if (Reflect.get(translationsCache, lang)) return Reflect.get(translationsCache, lang);
  
  try {
    const response = await fetch(`locales/${lang}.json`);
    if (response.ok) {
      const data = await response.json();
      Reflect.set(translationsCache, lang, data);
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
    }, m)
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
      if (key === "page-hero-title" || key === "courses_header_desc") {
        el.textContent = "";
        const doc = new DOMParser().parseFromString(dict[key], "text/html");
        const nodes = Array.from(doc.body.childNodes);
        for (const n of nodes) el.appendChild(n);
      } else {
        el.textContent = dict[key];
      }
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
  if (promoText) {
    promoText.textContent = "";
    const doc = new DOMParser().parseFromString(dict["promo-text"] || "", "text/html");
    const nodes = Array.from(doc.body.childNodes);
    for (const n of nodes) promoText.appendChild(n);
  }

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
    const icon = step.icon || "";
    
    const iconDiv = document.createElement("div");
    iconDiv.className = "text-5xl text-yellow-500 dark:text-yellow-400 mb-6";
    const iEl = document.createElement("i");
    iEl.className = `fas ${icon}`;
    iconDiv.appendChild(iEl);

    const titleEl = document.createElement("h3");
    titleEl.className = "text-2xl font-bold mb-4";
    titleEl.textContent = step.title || "";

    const descEl = document.createElement("p");
    descEl.className = "muted";
    descEl.textContent = step.desc || "";

    el.appendChild(iconDiv);
    el.appendChild(titleEl);
    el.appendChild(descEl);

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
    const title = item.title || "";
    const desc = item.desc || "";

    const imgContainer = document.createElement("div");
    imgContainer.className = "relative h-64 overflow-hidden";
    
    const overlay = document.createElement("div");
    overlay.className = "absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-500 z-10";
    
    const imgEl = document.createElement("img");
    imgEl.src = imgSrc;
    imgEl.alt = title;
    imgEl.className = "w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out";
    imgEl.loading = "lazy";
    imgEl.decoding = "async";
    
    const badgeContainer = document.createElement("div");
    badgeContainer.className = "absolute top-4 right-4 z-20";
    const badgeSpan = document.createElement("span");
    badgeSpan.className = "blog-badge backdrop-blur-md text-xs font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5";
    const badgeIcon = document.createElement("i");
    badgeIcon.className = "fa-solid fa-feather-pointed text-teal-500";
    badgeSpan.appendChild(badgeIcon);
    badgeSpan.appendChild(document.createTextNode(" " + articleLabel));
    badgeContainer.appendChild(badgeSpan);
    
    imgContainer.appendChild(overlay);
    imgContainer.appendChild(imgEl);
    imgContainer.appendChild(badgeContainer);

    const contentContainer = document.createElement("div");
    contentContainer.className = "p-8 flex flex-col flex-grow relative";

    const floatBtnContainer = document.createElement("div");
    floatBtnContainer.className = "absolute -top-8 left-8 z-20";
    const floatBtn = document.createElement("div");
    floatBtn.className = "blog-floating-btn w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 group-hover:rotate-6 group-hover:-translate-y-1 transition-all duration-300";
    const floatIcon = document.createElement("i");
    floatIcon.className = "fa-solid fa-arrow-left text-2xl transform -rotate-45 group-hover:rotate-0 transition-transform duration-300";
    floatBtn.appendChild(floatIcon);
    floatBtnContainer.appendChild(floatBtn);

    const titleContainer = document.createElement("div");
    titleContainer.className = "mt-4 mb-4";
    const titleEl = document.createElement("h3");
    titleEl.className = "blog-title text-2xl font-bold leading-tight transition-colors duration-300 font-amiri";
    titleEl.textContent = title;
    titleContainer.appendChild(titleEl);

    const descEl = document.createElement("p");
    descEl.className = "blog-desc text-sm leading-relaxed mb-6 line-clamp-3 flex-grow";
    descEl.textContent = desc;

    const footer = document.createElement("div");
    footer.className = "blog-footer border-t pt-6 mt-auto flex items-center justify-between text-xs font-medium";
    
    const dateSpan = document.createElement("span");
    dateSpan.className = "blog-date flex items-center gap-2 px-3 py-1 rounded-lg";
    const dateIcon = document.createElement("i");
    dateIcon.className = "fa-regular fa-calendar text-teal-500";
    dateSpan.appendChild(dateIcon);
    dateSpan.appendChild(document.createTextNode(" " + new Date().getFullYear()));
    
    const readMoreSpan = document.createElement("span");
    readMoreSpan.className = "blog-readmore group-hover:translate-x-[-5px] transition-transform duration-300 font-bold";
    readMoreSpan.textContent = readMoreLabel;
    
    footer.appendChild(dateSpan);
    footer.appendChild(readMoreSpan);

    contentContainer.appendChild(floatBtnContainer);
    contentContainer.appendChild(titleContainer);
    contentContainer.appendChild(descEl);
    contentContainer.appendChild(footer);

    card.appendChild(imgContainer);
    card.appendChild(contentContainer);

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
    grid.innerHTML = "";
    
    const noResultDiv = document.createElement("div");
    noResultDiv.setAttribute("role", "listitem");
    noResultDiv.className = "col-span-full text-center py-12";
    noResultDiv.dataset.aos = "fade-in";
    
    const iconContainer = document.createElement("div");
    iconContainer.className = "inline-block p-4 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-400 mb-4";
    const icon = document.createElement("i");
    icon.className = "fa-solid fa-search text-4xl";
    iconContainer.appendChild(icon);
    
    const textEl = document.createElement("p");
    textEl.className = "text-xl text-gray-500 dark:text-gray-400 font-bold";
    textEl.textContent = noResultMsg;
    
    noResultDiv.appendChild(iconContainer);
    noResultDiv.appendChild(textEl);
    grid.appendChild(noResultDiv);
    
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
    const catLabel = Reflect.get(catLabels, c.category) || "";
    const styles = Reflect.get(styleMap, c.category) || Reflect.get(styleMap, 'quran');

    let detailsLink = `/course-details?id=${encodeURIComponent(c.id || "")}`;
    if (c.category === 'quran') {
      detailsLink = '/course-quran';
    } else if (c.category === 'arabic') {
      detailsLink = '/course-arabic';
    } else if (c.category === 'islamic') {
      detailsLink = '/course-islamic';
    }

    const imgSrc = c.img || "";
    const title = c.title || "";
    const desc = c.desc || "";

    const courseCard = document.createElement("div");
    courseCard.className = "course-card-modern group h-full flex flex-col";

    const imgWrapper = document.createElement("div");
    imgWrapper.className = "course-img-wrapper relative h-60 overflow-hidden";
    
    const badgeContainer = document.createElement("div");
    badgeContainer.className = "absolute top-4 right-4 z-10";
    const badgeSpan = document.createElement("span");
    badgeSpan.className = "px-3 py-1 rounded-full text-xs font-bold bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm text-gray-800 dark:text-white shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2";
    const badgeIcon = document.createElement("i");
    badgeIcon.className = `fa-solid ${styles.icon}`;
    badgeSpan.appendChild(badgeIcon);
    badgeSpan.appendChild(document.createTextNode(" " + catLabel));
    badgeContainer.appendChild(badgeSpan);
    
    const imgEl = document.createElement("img");
    imgEl.src = imgSrc;
    imgEl.alt = title;
    imgEl.className = "w-full h-full object-cover transition-transform duration-700 group-hover:scale-110";
    imgEl.loading = "lazy";
    imgEl.decoding = "async";
    
    const gradientOverlay = document.createElement("div");
    gradientOverlay.className = "absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60";
    
    imgWrapper.appendChild(badgeContainer);
    imgWrapper.appendChild(imgEl);
    imgWrapper.appendChild(gradientOverlay);

    const contentWrapper = document.createElement("div");
    contentWrapper.className = "course-content p-6 flex flex-col flex-grow";

    const titleContainer = document.createElement("div");
    titleContainer.className = "mb-3";
    const titleEl = document.createElement("h3");
    titleEl.className = "text-xl font-bold text-gray-900 dark:text-white leading-tight group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors";
    titleEl.textContent = title;
    titleContainer.appendChild(titleEl);

    const tagsContainer = document.createElement("div");
    tagsContainer.className = "course-tags mb-4";
    (Reflect.get(courseFeatures, c.category) || []).forEach(tag => {
      const span = document.createElement("span");
      span.className = "course-tag";
      span.textContent = tag;
      tagsContainer.appendChild(span);
    });

    const descEl = document.createElement("p");
    descEl.className = "text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 line-clamp-3 flex-grow";
    descEl.textContent = desc;

    const actionsContainer = document.createElement("div");
    actionsContainer.className = "flex flex-col gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700/50";
    
    const joinBtn = document.createElement("a");
    joinBtn.href = href;
    joinBtn.target = "_blank";
    joinBtn.rel = "noopener noreferrer";
    joinBtn.className = "course-btn-primary w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5";
    const joinSpan = document.createElement("span");
    joinSpan.textContent = joinText;
    const joinIcon = document.createElement("i");
    joinIcon.className = "fa-brands fa-whatsapp text-lg";
    joinBtn.appendChild(joinSpan);
    joinBtn.appendChild(joinIcon);

    const detailsBtn = document.createElement("a");
    detailsBtn.href = detailsLink;
    detailsBtn.className = "course-btn-outline w-full py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors";
    detailsBtn.textContent = detailsText;

    actionsContainer.appendChild(joinBtn);
    actionsContainer.appendChild(detailsBtn);

    contentWrapper.appendChild(titleContainer);
    contentWrapper.appendChild(tagsContainer);
    contentWrapper.appendChild(descEl);
    contentWrapper.appendChild(actionsContainer);

    courseCard.appendChild(imgWrapper);
    courseCard.appendChild(contentWrapper);
    card.appendChild(courseCard);

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
  modalBody.innerHTML = "";
  if (article.longContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(article.longContent, 'text/html');
    const nodes = Array.from(doc.body.childNodes);
    for (const node of nodes) {
      modalBody.appendChild(node);
    }
  } else {
    const p = document.createElement("p");
    p.textContent = article.desc || "";
    modalBody.appendChild(p);
  }
  
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
  if (langFlag) langFlag.src = Reflect.get(flags, lang);
  if (langLabel) langLabel.textContent = Reflect.get(langNames, lang);
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
      const originalBtnNodes = submitBtn ? Array.from(submitBtn.childNodes).map(n => n.cloneNode(true)) : [];

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
        submitBtn.textContent = (t["enroll_sending"] || "...") + " ";
        const spinIcon = document.createElement("i");
        spinIcon.className = "fas fa-spinner fa-spin";
        submitBtn.appendChild(spinIcon);
      }

      const formData = new FormData(form);
      const data = new URLSearchParams();
      for (const pair of formData) {
        data.append(pair[0], pair[1]);
      }

      fetch(form.action || "https://formspree.io/f/xdaqgejl", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "Accept": "application/json" },
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
          submitBtn.textContent = "";
          for (const n of originalBtnNodes) submitBtn.appendChild(n);
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
          submitBtn.textContent = "";
          for (const n of originalBtnNodes) submitBtn.appendChild(n);
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
const closeMobileMenuBtn = $("#closeMobileMenuBtn");
const sidebarOverlay = $("#sidebarOverlay");

if (mobileBtn && mobileMenu) {
  const openSidebar = () => {
    mobileMenu.classList.add("sidebar-open");
    if (sidebarOverlay) sidebarOverlay.classList.add("active");
    document.body.classList.add("sidebar-locked");
    mobileBtn.setAttribute("aria-expanded", "true");
    mobileMenu.setAttribute("aria-hidden", "false");
    // إخفاء الأزرار العائمة عند فتح القائمة
    const whatsappFloat = document.getElementById("whatsappFloat");
    const giftBtn = document.getElementById("giftBtn");
    if (whatsappFloat) whatsappFloat.style.opacity = "0";
    if (whatsappFloat) whatsappFloat.style.pointerEvents = "none";
    if (giftBtn) giftBtn.style.opacity = "0";
    if (giftBtn) giftBtn.style.pointerEvents = "none";
  };

  const closeSidebar = () => {
    mobileMenu.classList.remove("sidebar-open");
    if (sidebarOverlay) sidebarOverlay.classList.remove("active");
    document.body.classList.remove("sidebar-locked");
    mobileBtn.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
    // إعادة إظهار الأزرار العائمة عند إغلاق القائمة
    const whatsappFloat = document.getElementById("whatsappFloat");
    const giftBtn = document.getElementById("giftBtn");
    if (whatsappFloat) whatsappFloat.style.opacity = "";
    if (whatsappFloat) whatsappFloat.style.pointerEvents = "";
    if (giftBtn) giftBtn.style.opacity = "";
    if (giftBtn) giftBtn.style.pointerEvents = "";
  };


  mobileBtn.addEventListener("click", openSidebar);

  if (closeMobileMenuBtn) {
    closeMobileMenuBtn.addEventListener("click", closeSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
  }

  // Close on link click
  mobileMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeSidebar);
  });

  // Close on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && mobileMenu.classList.contains("sidebar-open")) {
      closeSidebar();
    }
  });

  // Swipe to close (RTL: swipe right to close, LTR: swipe left to close)
  let touchStartX = 0;
  let touchStartY = 0;
  mobileMenu.addEventListener("touchstart", (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  mobileMenu.addEventListener("touchend", (e) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const diffX = touchEndX - touchStartX;
    const diffY = Math.abs(touchEndY - touchStartY);
    const isRtl = document.documentElement.dir === "rtl";
    // Swipe threshold: 80px horizontal, less than 100px vertical
    if (Math.abs(diffX) > 80 && diffY < 100) {
      if (isRtl && diffX > 0) closeSidebar();
      if (!isRtl && diffX < 0) closeSidebar();
    }
  }, { passive: true });

  // Update sidebar year
  const sidebarYear = document.getElementById("sidebarYear");
  if (sidebarYear) sidebarYear.textContent = new Date().getFullYear();
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
