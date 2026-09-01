/**
 * Timothy Ododo Portfolio — Vanilla JavaScript
 * Zero external framework dependencies. Accessible, fast, responsive.
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeSwitcher();
  initMobileMenu();
  initProjectFiltering();
  initContactForm();
});

/* ==========================================
   1. Theme Switcher (Light / Dark / System)
   ========================================== */
function initThemeSwitcher() {
  const toggleBtn = document.getElementById('theme-toggle-btn');
  const mobileToggleBtn = document.getElementById('mobile-theme-btn');
  
  function updateThemeIcons(isDark) {
    document.querySelectorAll('.dark-icon').forEach(el => {
      el.classList.toggle('hidden', isDark);
    });
    document.querySelectorAll('.light-icon').forEach(el => {
      el.classList.toggle('hidden', !isDark);
    });
  }

  function applyTheme(theme) {
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    updateThemeIcons(isDark);
  }

  function toggleTheme() {
    const currentIsDark = document.documentElement.classList.contains('dark');
    const newTheme = currentIsDark ? 'light' : 'dark';
    localStorage.setItem('theme_preference', newTheme);
    applyTheme(newTheme);
  }

  const initialPreference = localStorage.getItem('theme_preference') || 'system';
  applyTheme(initialPreference);

  if (toggleBtn) toggleBtn.addEventListener('click', toggleTheme);
  if (mobileToggleBtn) mobileToggleBtn.addEventListener('click', toggleTheme);

  // Listen to OS system color-scheme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('theme_preference') || localStorage.getItem('theme_preference') === 'system') {
      applyTheme('system');
    }
  });
}

/* ==========================================
   2. Mobile Navigation Menu
   ========================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (!menuBtn || !mobileMenu) return;

  const openIcon = menuBtn.querySelector('.menu-open-icon');
  const closeIcon = menuBtn.querySelector('.menu-close-icon');

  function toggleMenu() {
    const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', !isExpanded);
    mobileMenu.classList.toggle('hidden');
    if (openIcon) openIcon.classList.toggle('hidden', !isExpanded);
    if (closeIcon) closeIcon.classList.toggle('hidden', isExpanded);
  }

  menuBtn.addEventListener('click', toggleMenu);

  // Close menu when clicking outside or pressing Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
      toggleMenu();
    }
  });
}

/* ==========================================
   3. Project Portfolio Category & Search Filter
   ========================================== */
function initProjectFiltering() {
  const filterButtons = document.querySelectorAll('#project-filter-buttons .filter-btn');
  const searchInput = document.getElementById('project-search-input');
  const projectCards = document.querySelectorAll('.project-item');
  const counter = document.getElementById('filter-counter');
  const noProjectsMsg = document.getElementById('no-projects-message');
  const resetBtn = document.getElementById('reset-filter-btn');

  if (!projectCards.length) return;

  let activeFilter = 'all';
  let searchQuery = '';

  function filterProjects() {
    let visibleCount = 0;

    projectCards.forEach(card => {
      const category = (card.getAttribute('data-category') || '').toLowerCase();
      const categories = (card.getAttribute('data-categories') || '').toLowerCase();
      const name = (card.getAttribute('data-name') || '').toLowerCase();
      const tech = (card.getAttribute('data-tech') || '').toLowerCase();

      const matchesFilter = activeFilter === 'all' || 
                            category.includes(activeFilter) || 
                            categories.includes(activeFilter);

      const matchesSearch = !searchQuery || 
                            name.includes(searchQuery) || 
                            category.includes(searchQuery) || 
                            tech.includes(searchQuery);

      if (matchesFilter && matchesSearch) {
        card.classList.remove('hidden');
        visibleCount++;
      } else {
        card.classList.add('hidden');
      }
    });

    // Update Counter & Empty State
    if (counter) {
      counter.textContent = `Showing ${visibleCount} of ${projectCards.length} projects`;
    }
    if (noProjectsMsg) {
      noProjectsMsg.classList.toggle('hidden', visibleCount > 0);
    }
  }

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => {
        b.classList.remove('filter-btn-active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('filter-btn-active');
      btn.setAttribute('aria-selected', 'true');

      activeFilter = (btn.getAttribute('data-filter') || 'all').toLowerCase();
      filterProjects();
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim().toLowerCase();
      filterProjects();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      searchQuery = '';
      const allBtn = document.querySelector('[data-filter="all"]');
      if (allBtn) allBtn.click();
    });
  }
}

/* ==========================================
   4. Contact Form Validation & AJAX Submission
   ========================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const msgInput = document.getElementById('message');
  const charCounter = document.getElementById('char-counter');
  const statusDiv = document.getElementById('form-status');
  const submitBtn = document.getElementById('contact-submit-btn');

  if (msgInput && charCounter) {
    msgInput.addEventListener('input', () => {
      charCounter.textContent = `${msgInput.value.length} / 2000`;
    });
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Client-side quick check
    const name = form.querySelector('#name').value.trim();
    const email = form.querySelector('#email').value.trim();
    const subject = form.querySelector('#subject').value.trim();
    const message = form.querySelector('#message').value.trim();
    const website = form.querySelector('#website') ? form.querySelector('#website').value.trim() : '';

    if (!name || !email || !subject || !message) {
      showStatus('Please complete all required fields.', 'error');
      return;
    }

    // Submit state
    const originalBtnText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Sending message...</span>';

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name,
          email,
          subject,
          message,
          website
        })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        showStatus('✓ ' + (data.message || 'Thank you! Your message has been sent successfully.'), 'success');
        form.reset();
        if (charCounter) charCounter.textContent = '0 / 2000';
      } else {
        const errorMsg = data.errors ? data.errors.join(', ') : (data.error || 'Failed to send message. Please try again.');
        showStatus(errorMsg, 'error');
      }
    } catch (err) {
      showStatus('Network error while transmitting message. Please email timothyododo@gmail.com directly.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalBtnText;
    }
  });

  function showStatus(text, type) {
    if (!statusDiv) return;
    statusDiv.classList.remove('hidden', 'bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400', 'border-emerald-500/20', 'bg-rose-500/10', 'text-rose-600', 'dark:text-rose-400', 'border-rose-500/20');
    
    if (type === 'success') {
      statusDiv.classList.add('bg-emerald-500/10', 'text-emerald-600', 'dark:text-emerald-400', 'border', 'border-emerald-500/20');
    } else {
      statusDiv.classList.add('bg-rose-500/10', 'text-rose-600', 'dark:text-rose-400', 'border', 'border-rose-500/20');
    }
    
    statusDiv.textContent = text;
    statusDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}
