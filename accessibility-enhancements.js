// Accessibility Enhancements for Modals and Keyboard Navigation
// تحسينات الوصولية للـ Modals والـ Keyboard Navigation

document.addEventListener('DOMContentLoaded', function() {
  // Enhanced Modal Accessibility
  const modals = document.querySelectorAll('[role="dialog"]');
  modals.forEach(modal => {
    // Add focus management for modals
    modal.addEventListener('keydown', handleModalKeyboard);
    
    // Update aria-hidden on open/close
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.attributeName === 'class' || mutation.attributeName === 'hidden') {
          const isHidden = modal.classList.contains('hidden') || modal.classList.contains('modal-hidden');
          modal.setAttribute('aria-hidden', isHidden);
        }
      });
    });
    
    observer.observe(modal, { attributes: true });
  });

  // Enhanced Keyboard Navigation
  const focusableElements = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  
  // Global keyboard navigation
  document.addEventListener('keydown', e => {
    // Keyboard shortcuts
    if (e.ctrlKey || e.metaKey) {
      // Ctrl+/ or Cmd+/ for Help
      if (e.key === '/') {
        e.preventDefault();
        // Could open help modal here
      }
    }

    // Skip to main content shortcut (Alt+M)
    if (e.altKey && e.key === 'm') {
      e.preventDefault();
      const mainContent = document.getElementById('main-content');
      if (mainContent) {
        mainContent.tabIndex = -1;
        mainContent.focus();
        mainContent.tabIndex = 0;
      }
    }
  });

  // Form validation enhancements
  enhanceFormValidation();

  // Image lazy loading with fallback
  initImageLazyLoading();

  // Reduce motion support
  applyReducedMotionPreferences();

  // Performance: Defer non-critical scripts
  deferNonCriticalScripts();
});

function handleModalKeyboard(e) {
  const modal = this;
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  const activeElement = document.activeElement;

  // Handle Tab and Shift+Tab
  if (e.key === 'Tab') {
    if (e.shiftKey) {
      // Shift+Tab
      if (activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      // Tab
      if (activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }
  
  // Handle Escape
  if (e.key === 'Escape') {
    modal.classList.add('hidden');
    modal.setAttribute('aria-hidden', 'true');
  }
}

function enhanceFormValidation() {
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    inputs.forEach(input => {
      // Add ARIA attributes
      if (!input.getAttribute('aria-required')) {
        input.setAttribute('aria-required', 'true');
      }

      // Validate on blur
      input.addEventListener('blur', () => {
        validateInput(input);
      });

      // Clear error on input
      input.addEventListener('input', () => {
        clearInputError(input);
      });
    });
  });
}

function validateInput(input) {
  const type = input.type;
  let isValid = true;
  let errorMessage = '';

  if (type === 'email') {
    isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value.trim());
    errorMessage = 'Invalid email address';
  } else if (type === 'tel') {
    isValid = /^\d{7,}$/.test(input.value.replace(/\D/g, ''));
    errorMessage = 'Invalid phone number';
  } else if (input.hasAttribute('minlength')) {
    const minLength = parseInt(input.getAttribute('minlength'));
    isValid = input.value.trim().length >= minLength;
    errorMessage = `Minimum ${minLength} characters required`;
  }

  if (!isValid && input.value.trim()) {
    input.setAttribute('aria-invalid', 'true');
    const existingError = input.parentElement.querySelector('.input-error');
    if (existingError) {
      existingError.textContent = errorMessage;
    }
  } else {
    input.setAttribute('aria-invalid', 'false');
  }
}

function clearInputError(input) {
  input.setAttribute('aria-invalid', 'false');
  const error = input.parentElement.querySelector('.input-error');
  if (error) {
    error.textContent = '';
  }
}

function initImageLazyLoading() {
  if ('IntersectionObserver' in window) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px'
    });

    images.forEach(img => imageObserver.observe(img));
  }
}

function applyReducedMotionPreferences() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    const animatedElements = document.querySelectorAll('[class*="animate-"], [class*="transition-"]');
    animatedElements.forEach(el => {
      el.style.animationDuration = '0.01ms';
      el.style.transitionDuration = '0.01ms';
    });
  }

  // Listen for changes
  window.matchMedia('(prefers-reduced-motion: reduce)').addListener(e => {
    if (e.matches) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
    }
  });
}

function deferNonCriticalScripts() {
  // Defer loading of non-critical libraries
  const deferScripts = [
    { src: 'https://cdn.jsdelivr.net/npm/typed.js@2.0.12', timeout: 3000 },
    { src: 'https://unpkg.com/aos@2.3.4/dist/aos.js', timeout: 5000 },
    { src: 'https://cdn.jsdelivr.net/npm/particles.js@2.0.0/particles.min.js', timeout: 5000 }
  ];

  deferScripts.forEach(script => {
    setTimeout(() => {
      const scriptEl = document.createElement('script');
      scriptEl.src = script.src;
      scriptEl.defer = true;
      document.body.appendChild(scriptEl);
    }, script.timeout);
  });
}

// Performance: Prefetch resources
function prefetchResources() {
  const links = [
    '/course-quran.html',
    '/course-arabic.html',
    '/course-islamic.html',
    '/courses.html'
  ];

  links.forEach(link => {
    const prefetch = document.createElement('link');
    prefetch.rel = 'prefetch';
    prefetch.href = link;
    document.head.appendChild(prefetch);
  });
}

// Call on idle
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => prefetchResources(), { timeout: 2000 });
} else {
  setTimeout(prefetchResources, 2000);
}

// Performance: Monitor Web Vitals
if ('web-vital' in window || navigator.sendBeacon) {
  const reportWebVitals = (metric) => {
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/analytics', JSON.stringify(metric));
    }
  };

  // CLS - Cumulative Layout Shift
  if ('PerformanceObserver' in window) {
    try {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            console.debug('CLS:', entry.value);
          }
        }
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      console.debug('CLS monitoring not available');
    }
  }
}

export { handleModalKeyboard, enhanceFormValidation, validateInput };
