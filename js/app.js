/**
 * Victoria Fashion — Pure Vanilla JavaScript Controller
 * Handcrafted in Akwa Ibom, Nigeria
 * Zero Build Tools Required
 */

(function () {
  'use strict';

  // Ensure datasets exist
  const DATA = window.VICTORIA_DATA || {
    catalogue: { men: [], women: [], children: [], occasions: [] },
    weddingLooks: [],
    celebrationLooks: [],
    menLooks: [],
    womenLooks: [],
    childrenLooks: [],
    serviceVideos: []
  };

  // State
  const state = {
    activeTab: 'home',
    // Occasions state
    occasionsMode: 'celebrations', // 'celebrations' | 'weddings' | 'portal'
    weddingIndex: 0,
    weddingView: 'front', // 'front' | 'back'
    celebrationIndex: 0,
    // Men / Women / Children lookbook states
    menIndex: 0,
    womenIndex: 0,
    childrenIndex: 0,
    // Catalogue state
    catalogueFilter: 'all',
    // Full-page booking state
    previousTab: 'home',
    bookingDepartment: 'Men',
    bookingNotes: ''
  };

  // DOM Elements
  const header = document.getElementById('main-header');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileDrawer = document.getElementById('mobile-drawer');

  // ==========================================
  // MOBILE DRAWER CONTROLS (Apple Standard)
  // ==========================================
  function openMobileDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('is-open');
    if (header) {
      header.classList.add('bg-black');
      header.classList.remove('bg-black/90');
    }
    if (mobileMenuToggle) {
      mobileMenuToggle.setAttribute('aria-expanded', 'true');
      mobileMenuToggle.classList.add('is-active');
    }
    document.body.classList.add('overflow-hidden');
  }

  function closeMobileDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('is-open');
    if (header && window.scrollY <= 20) {
      header.classList.add('bg-black/90');
      header.classList.remove('bg-black');
    }
    if (mobileMenuToggle) {
      mobileMenuToggle.setAttribute('aria-expanded', 'false');
      mobileMenuToggle.classList.remove('is-active');
    }
    document.body.classList.remove('overflow-hidden');
  }

  function toggleMobileDrawer() {
    if (!mobileDrawer) return;
    if (mobileDrawer.classList.contains('is-open')) {
      closeMobileDrawer();
    } else {
      openMobileDrawer();
    }
  }

  // ==========================================
  // 1. ROUTING & TAB NAVIGATION
  // ==========================================
  function navigateTo(tabId, subMode = null) {
    state.activeTab = tabId;

    if (tabId === 'occasions') {
      state.occasionsMode = subMode || 'celebrations';
      window.location.hash = state.occasionsMode === 'celebrations' ? 'occasions' : `occasions/${state.occasionsMode}`;
    } else {
      window.location.hash = tabId === 'home' ? '' : tabId;
    }

    renderActiveView();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close mobile drawer if open
    closeMobileDrawer();
  }

  function renderActiveView() {
    // Hide all view sections
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.classList.remove('active');
    });

    // Update desktop nav tab active colors
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      const target = btn.getAttribute('data-tab');
      if (target === state.activeTab) {
        btn.classList.add('text-white', 'font-semibold');
        btn.classList.remove('text-[#a1a1a6]');
      } else {
        btn.classList.remove('text-white', 'font-semibold');
        btn.classList.add('text-[#a1a1a6]');
      }
    });

    // Update mobile drawer nav link active colors
    document.querySelectorAll('#mobile-drawer .mobile-nav-link').forEach(btn => {
      const target = btn.getAttribute('data-nav-target');
      if (target === state.activeTab) {
        btn.classList.add('is-active');
      } else {
        btn.classList.remove('is-active');
      }
    });

    // Activate the targeted section
    const targetSection = document.getElementById(`view-${state.activeTab}`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // View-specific render hooks
    if (state.activeTab === 'catalogue') {
      renderCatalogue();
    } else if (state.activeTab === 'occasions') {
      renderOccasions();
    } else if (state.activeTab === 'men') {
      renderMen();
    } else if (state.activeTab === 'women') {
      renderWomen();
    } else if (state.activeTab === 'children') {
      renderChildren();
    } else if (state.activeTab === 'experience') {
      initVideos();
    } else if (state.activeTab === 'booking') {
      renderBooking();
    }
  }

  function handleHashChange() {
    const rawHash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
    
    if (rawHash.startsWith('occasions')) {
      state.activeTab = 'occasions';
      if (rawHash.includes('/weddings')) {
        state.occasionsMode = 'weddings';
        const parts = rawHash.split('/');
        if (parts[2]) {
          const idx = parseInt(parts[2], 10) - 1;
          if (!isNaN(idx) && idx >= 0 && idx < DATA.weddingLooks.length) {
            state.weddingIndex = idx;
          }
        }
      } else if (rawHash.includes('/celebrations')) {
        state.occasionsMode = 'celebrations';
        const parts = rawHash.split('/');
        if (parts[2]) {
          const idx = parseInt(parts[2], 10) - 1;
          if (!isNaN(idx) && idx >= 0 && idx < DATA.celebrationLooks.length) {
            state.celebrationIndex = idx;
          }
        }
      } else if (rawHash.includes('/portal')) {
        state.occasionsMode = 'portal';
      } else {
        state.occasionsMode = 'celebrations';
        const parts = rawHash.split('/');
        if (parts[2]) {
          const idx = parseInt(parts[2], 10) - 1;
          if (!isNaN(idx) && idx >= 0 && idx < DATA.celebrationLooks.length) {
            state.celebrationIndex = idx;
          }
        }
      }
    } else if (rawHash.startsWith('men')) {
      state.activeTab = 'men';
    } else if (rawHash.startsWith('women')) {
      state.activeTab = 'women';
    } else if (rawHash.startsWith('children')) {
      state.activeTab = 'children';
    } else if (rawHash.startsWith('catalogue')) {
      state.activeTab = 'catalogue';
    } else if (rawHash.startsWith('experience')) {
      state.activeTab = 'experience';
    } else if (rawHash.startsWith('booking')) {
      state.activeTab = 'booking';
    } else {
      state.activeTab = 'home';
    }

    renderActiveView();
  }

  window.addEventListener('hashchange', handleHashChange);

  // Scroll listener for sticky glass header
  window.addEventListener('scroll', () => {
    if (!header) return;
    if (window.scrollY > 20) {
      header.classList.add('apple-glass-nav', 'border-b', 'border-white/10', 'shadow-lg');
      header.classList.remove('bg-black/90');
    } else {
      header.classList.remove('apple-glass-nav', 'border-b', 'border-white/10', 'shadow-lg');
      header.classList.add('bg-black/90');
    }
  });

  // Mobile drawer events (Apple Standard)
  if (mobileMenuToggle && mobileDrawer) {
    mobileMenuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMobileDrawer();
    });
  }
  if (mobileMenuClose && mobileDrawer) {
    mobileMenuClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeMobileDrawer();
    });
  }

  // Close drawer on ESC key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('is-open')) {
      closeMobileDrawer();
    }
  });

  // Bind nav buttons
  document.querySelectorAll('[data-nav-target]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault();
      const target = btn.getAttribute('data-nav-target');
      const mode = btn.getAttribute('data-nav-mode');
      navigateTo(target, mode);
    });
  });

  // ==========================================
  // 2. CATALOGUE VIEW (80 Creations Grid)
  // ==========================================
  function renderCatalogue() {

    const grid = document.getElementById('catalogue-grid');
    if (!grid) return;

    let items = [];
    const cat = DATA.catalogue;

    if (state.catalogueFilter === 'all') {
      items = [
        ...cat.men.map(i => ({ ...i, section: 'Men Wears' })),
        ...cat.women.map(i => ({ ...i, section: 'Female Wears' })),
        ...cat.children.map(i => ({ ...i, section: 'Children Wears' })),
        ...cat.occasions.map(i => ({ ...i, section: 'Occasions' })),
      ];
    } else if (state.catalogueFilter === 'men') {
      items = cat.men.map(i => ({ ...i, section: 'Men Wears' }));
    } else if (state.catalogueFilter === 'women') {
      items = cat.women.map(i => ({ ...i, section: 'Female Wears' }));
    } else if (state.catalogueFilter === 'children') {
      items = cat.children.map(i => ({ ...i, section: 'Children Wears' }));
    } else if (state.catalogueFilter === 'occasions') {
      items = cat.occasions.map(i => ({ ...i, section: 'Occasions' }));
    }

    // Update count indicator
    const countEl = document.getElementById('catalogue-count-indicator');
    if (countEl) {
      countEl.textContent = `${items.length} Handcrafted Designs · Victoria Fashion`;
    }

    if (items.length === 0) {
      const deptName = state.catalogueFilter === 'occasions' ? 'Occasions & Aso-Ebi' : (state.catalogueFilter === 'men' ? 'Men' : 'Bespoke Atelier');
      grid.innerHTML = `
        <div class="col-span-full w-full py-28 text-center text-[#86868b] flex flex-col items-center justify-center mx-auto" style="grid-column: 1 / -1; width: 100%; min-height: 45vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center;">
          <p class="font-apple text-xl sm:text-2xl text-white font-semibold mb-3">Collection Updating</p>
          <p class="text-sm sm:text-base text-[#86868b] max-w-lg mx-auto mb-8 leading-relaxed">More bespoke designs are being added to this collection. Browse our available Collections or chat directly with Victoria for custom orders.</p>
          <button onclick="window.VictoriaApp.openBooking('', '${deptName}')" class="bg-white/10 hover:bg-white/20 hover:border-white/40 text-white border border-white/20 text-sm px-8 py-3 rounded-full font-medium transition-all shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            Inquire on WhatsApp
          </button>
        </div>
      `;
      document.querySelectorAll('.cat-filter-btn').forEach(btn => {
        const f = btn.getAttribute('data-filter');
        if (f === state.catalogueFilter) {
          btn.classList.add('text-white', 'font-semibold', 'border-b-2', 'border-white');
          btn.classList.remove('text-[#86868b]');
        } else {
          btn.classList.remove('text-white', 'font-semibold', 'border-b-2', 'border-white');
          btn.classList.add('text-[#86868b]');
        }
      });
      return;
    }

    // Render cards (Backgroundless feathered edges & Style Name overlay like Front View / Back View)
    grid.innerHTML = items.map(item => `
      <div
        onclick="window.VictoriaApp.openBooking('${escapeQuotes(item.name)}', '${getDeptBySection(item.section)}')"
        class="catalogue-card group ${item.section === 'Children Wears' ? 'children-card' : ''}"
        title="Click to order ${escapeQuotes(item.name)} on WhatsApp"
      >
        <img
          src="${item.image}"
          alt="${item.name}"
          class="${item.section === 'Children Wears' ? '!object-contain p-2' : ''}"
          loading="lazy"
        />
        <!-- Seamless feathered edges into black (vignetted like Service Experience videos) -->
        <div class="catalogue-card-scrim"></div>

        <!-- Large Faint Copyright Protection Watermark -->
        <div class="catalogue-watermark">
          <img
            src="./images/watermark-logo.png"
            alt="Victoria Fashion Copyright Protection"
            class="catalogue-watermark-logo"
            loading="lazy"
            draggable="false"
          />
        </div>

        <!-- Style Name written directly on the image matching Front View / Back View style -->
        <div class="absolute inset-x-0 bottom-4 sm:bottom-6 flex flex-col items-center justify-center text-center px-3 pointer-events-none">
          <span class="font-apple font-bold text-xs xs:text-sm sm:text-base tracking-[0.12em] sm:tracking-[0.16em] text-[#f5e396] uppercase drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] line-clamp-2">
            ${item.name}
          </span>
        </div>
      </div>
    `).join('');

    // Update active tab buttons in catalogue filter
    document.querySelectorAll('.cat-filter-btn').forEach(btn => {
      const f = btn.getAttribute('data-filter');
      if (f === state.catalogueFilter) {
        btn.classList.add('text-white', 'font-semibold', 'border-b-2', 'border-white');
        btn.classList.remove('text-[#86868b]');
      } else {
        btn.classList.remove('text-white', 'font-semibold', 'border-b-2', 'border-white');
        btn.classList.add('text-[#86868b]');
      }
    });
  }

  function getDeptBySection(section) {
    if (section.includes('Men')) return 'Men';
    if (section.includes('Female') || section.includes('Women')) return 'Women';
    if (section.includes('Children')) return 'Children & School Uniforms';
    return 'Occasions & Aso-Ebi';
  }

  document.querySelectorAll('.cat-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.catalogueFilter = btn.getAttribute('data-filter');
      renderCatalogue();
    });
  });

  // =========================================================================
  // 3. OCCASIONS SHOWCASE (Option A Cathedral Archways & Front/Back Toggles)
  // =========================================================================
  function renderOccasions() {
    const portalSec = document.getElementById('occasions-portal-section');
    const weddingsSec = document.getElementById('occasions-weddings-section');
    const celebrationsSec = document.getElementById('occasions-celebrations-section');
    const breadcrumbLabel = document.getElementById('occasions-breadcrumb-label');
    const backBtnText = document.getElementById('occasions-back-btn-text');

    const tabCelebrations = document.getElementById('occasions-tab-celebrations');
    const tabWeddings = document.getElementById('occasions-tab-weddings');

    if (tabCelebrations && tabWeddings) {
      if (state.occasionsMode === 'celebrations') {
        tabCelebrations.className = "px-3 sm:px-4 py-1.5 rounded-full transition-all text-amber-300 font-bold bg-amber-400/20 shadow-[0_0_12px_rgba(203,161,53,0.3)]";
        tabWeddings.className = "px-3 sm:px-4 py-1.5 rounded-full transition-all text-neutral-400 hover:text-white";
      } else if (state.occasionsMode === 'weddings') {
        tabCelebrations.className = "px-3 sm:px-4 py-1.5 rounded-full transition-all text-neutral-400 hover:text-white";
        tabWeddings.className = "px-3 sm:px-4 py-1.5 rounded-full transition-all text-amber-300 font-bold bg-amber-400/20 shadow-[0_0_12px_rgba(203,161,53,0.3)]";
      }
    }

    if (state.occasionsMode === 'portal') {
      if (portalSec) portalSec.classList.remove('hidden');
      if (weddingsSec) weddingsSec.classList.add('hidden');
      if (celebrationsSec) celebrationsSec.classList.add('hidden');
      if (breadcrumbLabel) breadcrumbLabel.textContent = "Occasions & Celebrations";
      if (backBtnText) backBtnText.textContent = "Back to Home";
    } else if (state.occasionsMode === 'weddings') {
      if (portalSec) portalSec.classList.add('hidden');
      if (weddingsSec) weddingsSec.classList.remove('hidden');
      if (celebrationsSec) celebrationsSec.classList.add('hidden');
      if (breadcrumbLabel) breadcrumbLabel.textContent = "Weddings & Bridal";
      if (backBtnText) backBtnText.textContent = "Back to Home";
      renderWeddingSlide();
    } else if (state.occasionsMode === 'celebrations') {
      if (portalSec) portalSec.classList.add('hidden');
      if (weddingsSec) weddingsSec.classList.add('hidden');
      if (celebrationsSec) celebrationsSec.classList.remove('hidden');
      if (breadcrumbLabel) breadcrumbLabel.textContent = "Occasions Lookbook";
      if (backBtnText) backBtnText.textContent = "Back to Home";
      renderCelebrationSlide();
    }
  }

  // 3A. WEDDINGS SLIDE (Dual Archways: Front & Back Views)
  function renderWeddingSlide() {
    const item = DATA.weddingLooks[state.weddingIndex];
    if (!item) return;

    const frontImg = document.getElementById('wedding-front-img');
    const backImg = document.getElementById('wedding-back-img');
    const imgEl = document.getElementById('wedding-main-img');
    const titleEl = document.getElementById('wedding-title');
    const subtitleEl = document.getElementById('wedding-subtitle');
    const fabricEl = document.getElementById('wedding-fabric');
    const dotsContainer = document.getElementById('wedding-dots');
    const counterEl = document.getElementById('wedding-counter');

    if (frontImg) {
      frontImg.src = item.frontImage;
      frontImg.alt = `${item.title} - Front View`;
    }
    if (backImg) {
      backImg.src = item.backImage;
      backImg.alt = `${item.title} - Back View`;
    }
    if (imgEl) {
      imgEl.src = state.weddingView === 'front' ? item.frontImage : item.backImage;
      imgEl.alt = `${item.title} - ${state.weddingView} view`;
    }

    if (titleEl) titleEl.textContent = (item.title || '').replace(/^Look\s+\d+(\s*&\s*\d+)?\s*[—–-]\s*/i, '');
    if (subtitleEl) subtitleEl.textContent = '';
    if (fabricEl) fabricEl.textContent = `Fabric: ${item.fabric}`;

    // Dots
    if (dotsContainer) {
      dotsContainer.innerHTML = DATA.weddingLooks.map((w, idx) => `
        <button
          onclick="window.VictoriaApp.setWeddingIndex(${idx})"
          class="h-1.5 transition-all rounded-full ${state.weddingIndex === idx ? 'w-8 bg-amber-400 shadow-[0_0_12px_rgba(203,161,53,0.8)]' : 'w-2 bg-white/20 hover:bg-white/40'}"
          aria-label="Slide ${idx + 1}"
        ></button>
      `).join('');
    }

    if (counterEl) {
      counterEl.textContent = `0${state.weddingIndex + 1} / 0${DATA.weddingLooks.length}`;
    }
  }

  // 3B. CELEBRATIONS SLIDE (Coordinated Male & Female Pairs)
  function renderCelebrationSlide() {
    const item = DATA.celebrationLooks[state.celebrationIndex];
    if (!item) return;

    const catBadge = document.getElementById('celebration-category-badge');
    const maleImg = document.getElementById('celebration-male-img');
    const maleTitle = document.getElementById('celebration-male-title');
    const femaleImg = document.getElementById('celebration-female-img');
    const femaleTitle = document.getElementById('celebration-female-title');
    const titleEl = document.getElementById('celebration-title');
    const subtitleEl = document.getElementById('celebration-subtitle');
    const dotsContainer = document.getElementById('celebration-dots');
    const counterEl = document.getElementById('celebration-counter');

    if (catBadge) catBadge.textContent = item.eventCategory;
    if (maleImg) {
      maleImg.src = item.maleImage;
      maleImg.alt = `${item.title} - Male`;
    }
    if (femaleImg) {
      femaleImg.src = item.femaleImage;
      femaleImg.alt = `${item.title} - Female`;
    }

    if (titleEl) titleEl.textContent = (item.title || '').replace(/^Look\s+\d+(\s*&\s*\d+)?\s*[—–-]\s*/i, '');
    if (subtitleEl) subtitleEl.textContent = '';

    // Dots & Counter
    if (dotsContainer) {
      if (DATA.celebrationLooks.length > 1) {
        dotsContainer.innerHTML = DATA.celebrationLooks.map((c, idx) => `
          <button
            onclick="window.VictoriaApp.setCelebrationIndex(${idx})"
            class="h-1.5 transition-all rounded-full ${state.celebrationIndex === idx ? 'w-8 bg-amber-400 shadow-[0_0_12px_rgba(203,161,53,0.8)]' : 'w-2 bg-white/20 hover:bg-white/40'}"
            aria-label="Slide ${idx + 1}"
          ></button>
        `).join('');
      } else {
        dotsContainer.innerHTML = '';
      }
    }

    if (counterEl) {
      counterEl.textContent = DATA.celebrationLooks.length > 1 ? `0${state.celebrationIndex + 1} / 0${DATA.celebrationLooks.length}` : '';
    }

    // Render mobile feed for occasions
    renderCelebrationsMobileFeed();
  }

  // ==========================================
  // 4. MEN LOOKBOOK VIEW
  // ==========================================
  function renderMen() {
    const item = DATA.menLooks[state.menIndex];
    if (!item) return;

    const frontImg = document.getElementById('men-front-img');
    const backImg = document.getElementById('men-back-img');
    const titleEl = document.getElementById('men-title');
    const subtitleEl = document.getElementById('men-subtitle');
    const dotsContainer = document.getElementById('men-dots');
    const counterEl = document.getElementById('men-counter');

    if (frontImg) frontImg.src = item.frontImage;
    if (backImg) backImg.src = item.backImage;
    if (titleEl) titleEl.textContent = (item.title || '').replace(/^Look\s+\d+(\s*&\s*\d+)?\s*[—–-]\s*/i, '');
    if (subtitleEl) subtitleEl.textContent = '';

    if (dotsContainer) {
      dotsContainer.innerHTML = DATA.menLooks.map((m, idx) => `
        <button
          onclick="window.VictoriaApp.setMenIndex(${idx})"
          class="h-1.5 transition-all rounded-full ${state.menIndex === idx ? 'w-8 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]' : 'w-2 bg-white/20 hover:bg-white/40'}"
          aria-label="Slide ${idx + 1}"
        ></button>
      `).join('');
    }

    if (counterEl) {
      counterEl.textContent = `0${state.menIndex + 1} / 0${DATA.menLooks.length}`;
    }

    // Render mobile feed for men
    renderMenMobileFeed();
  }

  // ==========================================
  // 5. WOMEN LOOKBOOK VIEW
  // ==========================================
  function renderWomen() {
    const item = DATA.womenLooks[state.womenIndex];
    if (!item) return;

    const frontImg = document.getElementById('women-front-img');
    const backImg = document.getElementById('women-back-img');
    const titleEl = document.getElementById('women-title');
    const subtitleEl = document.getElementById('women-subtitle');
    const dotsContainer = document.getElementById('women-dots');
    const counterEl = document.getElementById('women-counter');

    if (frontImg) frontImg.src = item.card1Image || item.frontImage;
    if (backImg) backImg.src = item.card2Image || item.backImage;
    if (titleEl) titleEl.textContent = (item.title || '').replace(/^Look\s+\d+(\s*&\s*\d+)?\s*[—–-]\s*/i, '');
    if (subtitleEl) subtitleEl.textContent = '';

    if (dotsContainer) {
      dotsContainer.innerHTML = DATA.womenLooks.map((w, idx) => `
        <button
          onclick="window.VictoriaApp.setWomenIndex(${idx})"
          class="h-1.5 transition-all rounded-full ${state.womenIndex === idx ? 'w-8 bg-pink-400 shadow-[0_0_12px_rgba(244,114,182,0.8)]' : 'w-2 bg-white/20 hover:bg-white/40'}"
          aria-label="Slide ${idx + 1}"
        ></button>
      `).join('');
    }

    if (counterEl) {
      counterEl.textContent = `${String(state.womenIndex + 1).padStart(2, '0')} / ${String(DATA.womenLooks.length).padStart(2, '0')}`;
    }

    // Render mobile feed for women
    renderWomenMobileFeed();
  }

  // ==========================================
  // 6. CHILDREN LOOKBOOK VIEW
  // ==========================================
  function renderChildren() {
    const item = DATA.childrenLooks[state.childrenIndex];
    if (!item) return;

    const boyImg = document.getElementById('children-boy-img');
    const girlImg = document.getElementById('children-girl-img');
    const titleEl = document.getElementById('children-title');
    const subtitleEl = document.getElementById('children-subtitle');
    const dotsContainer = document.getElementById('children-dots');
    const counterEl = document.getElementById('children-counter');

    if (boyImg) boyImg.src = item.boyImage;
    if (girlImg) girlImg.src = item.girlImage;
    if (titleEl) titleEl.textContent = (item.title || '').replace(/^Look\s+\d+(\s*&\s*\d+)?\s*[—–-]\s*/i, '');
    if (subtitleEl) subtitleEl.textContent = '';

    if (dotsContainer) {
      dotsContainer.innerHTML = DATA.childrenLooks.map((c, idx) => `
        <button
          onclick="window.VictoriaApp.setChildrenIndex(${idx})"
          class="h-1.5 transition-all rounded-full ${state.childrenIndex === idx ? 'w-8 bg-white shadow-[0_0_12px_rgba(255,255,255,0.8)]' : 'w-2 bg-white/20 hover:bg-white/40'}"
          aria-label="Slide ${idx + 1}"
        ></button>
      `).join('');
    }

    if (counterEl) {
      counterEl.textContent = `0${state.childrenIndex + 1} / 0${DATA.childrenLooks.length}`;
    }

    // Render mobile feed for children
    renderChildrenMobileFeed();
  }

  // ==========================================
  // MOBILE SHOWCASE FEEDS (Apple Editorial Scrolling)
  // First image UP, Other image BENEATH, smooth vertical feed
  // ==========================================
  function escapeAttr(str) {
    if (!str) return '';
    return String(str).replace(/'/g, "\\'").replace(/"/g, '&quot;');
  }

  function escapeText(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderMenMobileFeed() {
    const container = document.getElementById('men-mobile-feed');
    if (!container || !DATA.menLooks || !DATA.menLooks.length) return;

    const total = DATA.menLooks.length;
    const itemsHtml = DATA.menLooks.map((look, idx) => {
      const cleanTitle = (look.title || '').replace(/^Look\s+\d+(\s*&\s*\d+)?\s*[—–-]\s*/i, '');
      const safeTitle = escapeAttr(cleanTitle);
      const frontLabel = look.frontLabel || 'FRONT VIEW';
      const backLabel = look.backLabel || 'BACK VIEW';

      return `
        <article class="relative p-4 sm:p-5 rounded-3xl bg-[#0c0c0e] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.85)] mb-8 overflow-hidden">
          <!-- Card Header: Look Index & Badge -->
          <div class="flex items-center justify-between gap-2 mb-2.5">
            <span class="text-[11px] font-mono tracking-[0.2em] uppercase text-[#86868b]">LOOK ${String(idx + 1).padStart(2, '0')} OF ${String(total).padStart(2, '0')}</span>
            <span class="text-[9px] font-mono tracking-widest uppercase text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full">MEN'S BESPOKE</span>
          </div>

          <!-- Look Title -->
          <h3 class="capitalize font-apple text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug mb-3.5">${escapeText(cleanTitle)}</h3>

          <!-- First Image UP (Front View) -->
          <div onclick="window.VictoriaApp.openBooking('${safeTitle} (Front View)', 'Men')" class="group relative w-full aspect-[4/5] max-h-[380px] rounded-2xl overflow-hidden bg-[#121215] border border-white/[0.08] flex items-center justify-center p-2.5 shadow-inner cursor-pointer active:scale-[0.99] transition-transform">
            <img src="${look.frontImage}" alt="${safeTitle} - Front" loading="lazy" class="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]" />
            <div class="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 pointer-events-none">
              <span class="w-1.5 h-1.5 rounded-full bg-[#f5e396]"></span>
              <span class="text-[10px] font-bold text-[#f5e396] tracking-[0.14em] uppercase">${escapeText(frontLabel)}</span>
            </div>
          </div>

          <!-- Other Image BENEATH (Back View) -->
          <div onclick="window.VictoriaApp.openBooking('${safeTitle} (Back View)', 'Men')" class="group relative w-full aspect-[4/5] max-h-[380px] rounded-2xl overflow-hidden bg-[#121215] border border-white/[0.08] flex items-center justify-center p-2.5 shadow-inner cursor-pointer active:scale-[0.99] transition-transform mt-3">
            <img src="${look.backImage}" alt="${safeTitle} - Back" loading="lazy" class="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]" />
            <div class="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 pointer-events-none">
              <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span class="text-[10px] font-bold text-[#f5e396] tracking-[0.14em] uppercase">${escapeText(backLabel)}</span>
            </div>
          </div>

          <!-- WhatsApp Action Pill -->
          <button onclick="window.VictoriaApp.openBooking('${safeTitle}', 'Men')" class="w-full mt-4 py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(37,211,102,0.3)] transition-all">
            <svg class="w-4 h-4 fill-black" viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.02 8.48 7.02 9.68C7.02 10.88 7.89 12.04 8.01 12.2C8.13 12.37 9.72 14.82 12.16 15.87C12.74 16.12 13.19 16.27 13.55 16.38C14.13 16.57 14.66 16.54 15.08 16.48C15.55 16.41 16.52 15.89 16.72 15.33C16.92 14.77 16.92 14.29 16.86 14.2C16.8 14.1 16.64 14.04 16.4 13.92C16.16 13.8 15.01 13.23 14.8 13.15C14.59 13.07 14.43 13.03 14.27 13.27C14.11 13.51 13.65 14.04 13.51 14.2C13.37 14.36 13.23 14.38 12.99 14.26C12.75 14.14 11.98 13.89 11.07 13.08C10.36 12.45 9.88 11.67 9.74 11.43C9.6 11.19 9.73 11.06 9.85 10.94C9.96 10.83 10.09 10.66 10.21 10.52C10.33 10.38 10.37 10.28 10.45 10.12C10.53 9.96 10.49 9.82 10.43 9.7C10.37 9.58 9.91 8.45 9.72 7.99C9.53 7.54 9.34 7.6 9.19 7.59C9.05 7.58 8.89 7.58 8.73 7.58L8.53 7.33Z"/></svg>
            <span>Order This Look on WhatsApp</span>
          </button>
        </article>
      `;
    }).join('');

    container.innerHTML = `
      <!-- Apple Editorial Collection Header -->
      <div class="mb-6 pt-2 pb-4 text-center sm:text-left border-b border-white/[0.08]">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] font-mono tracking-widest uppercase mb-2">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>AKWA IBOM ATELIER</span>
        </div>
        <h2 class="font-apple text-2xl sm:text-3xl font-bold text-white tracking-tight">Men's Lookbook</h2>
        <p class="text-xs text-[#86868b] mt-1 max-w-sm">Handcrafted traditional senators, grand agbadas & bespoke English wool suiting.</p>
      </div>

      ${itemsHtml}

      <!-- Mobile Bottom Bespoke Card -->
      <div class="mt-4 p-6 rounded-3xl bg-[#0c0c0e] border border-white/[0.08] text-center shadow-lg">
        <span class="text-[10px] font-mono tracking-widest text-amber-400 uppercase">AKWA IBOM ATELIER</span>
        <h4 class="text-base font-semibold text-white mt-1 mb-2">Have a custom fabric or suiting cut in mind?</h4>
        <p class="text-xs text-[#86868b] mb-4">Victoria crafts bespoke senators, agbadas, and English wool suiting to your precise measurements.</p>
        <button onclick="window.VictoriaApp.openBooking('Custom Native/Suiting', 'Men')" class="w-full py-3.5 rounded-full bg-[#25D366] text-black font-semibold text-xs tracking-wide flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,211,102,0.3)]">
          <span>Chat with Victoria on WhatsApp</span>
          <span>→</span>
        </button>
      </div>
    `;
  }

  function renderWomenMobileFeed() {
    const container = document.getElementById('women-mobile-feed');
    if (!container || !DATA.womenLooks || !DATA.womenLooks.length) return;

    const total = DATA.womenLooks.length;
    const itemsHtml = DATA.womenLooks.map((look, idx) => {
      const cleanTitle = (look.title || look.card1Title || '').replace(/^Look\s+\d+(\s*&\s*\d+)?\s*[—–-]\s*/i, '');
      const safeTitle = escapeAttr(cleanTitle);
      const img1 = look.card1Image || look.frontImage;
      const img2 = look.card2Image || look.backImage;
      const label1 = look.card1Label || 'FRONT VIEW';
      const label2 = look.card2Label || 'PERSPECTIVE VIEW';

      return `
        <article class="relative p-4 sm:p-5 rounded-3xl bg-[#0c0c0e] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.85)] mb-8 overflow-hidden">
          <!-- Card Header: Look Index & Badge -->
          <div class="flex items-center justify-between gap-2 mb-2.5">
            <span class="text-[11px] font-mono tracking-[0.2em] uppercase text-pink-300/80">LOOK ${String(idx + 1).padStart(2, '0')} OF ${String(total).padStart(2, '0')}</span>
            <span class="text-[9px] font-mono tracking-widest uppercase text-pink-300 bg-pink-500/10 border border-pink-500/25 px-2.5 py-0.5 rounded-full">WOMEN'S COUTURE</span>
          </div>

          <!-- Look Title -->
          <h3 class="capitalize font-apple text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug mb-3.5">${escapeText(cleanTitle)}</h3>

          <!-- First Image UP (Top) Stage -->
          <div onclick="window.VictoriaApp.openBooking('${safeTitle} (Look 1)', 'Women')" class="group relative w-full aspect-[4/5] max-h-[380px] rounded-2xl overflow-hidden bg-[#121215] border border-white/[0.08] flex items-center justify-center p-2.5 shadow-inner cursor-pointer active:scale-[0.99] transition-transform">
            <img src="${img1}" alt="${safeTitle} - Look 1" loading="lazy" class="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]" />
            <div class="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 pointer-events-none">
              <span class="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
              <span class="text-[10px] font-bold text-pink-200 tracking-[0.14em] uppercase">${escapeText(label1)}</span>
            </div>
          </div>

          <!-- Other Image BENEATH (Bottom) Stage -->
          <div onclick="window.VictoriaApp.openBooking('${safeTitle} (Look 2)', 'Women')" class="group relative w-full aspect-[4/5] max-h-[380px] rounded-2xl overflow-hidden bg-[#121215] border border-white/[0.08] flex items-center justify-center p-2.5 shadow-inner cursor-pointer active:scale-[0.99] transition-transform mt-3">
            <img src="${img2}" alt="${safeTitle} - Look 2" loading="lazy" class="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]" />
            <div class="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 pointer-events-none">
              <span class="w-1.5 h-1.5 rounded-full bg-fuchsia-400"></span>
              <span class="text-[10px] font-bold text-pink-200 tracking-[0.14em] uppercase">${escapeText(label2)}</span>
            </div>
          </div>

          <!-- WhatsApp Action Pill -->
          <button onclick="window.VictoriaApp.openBooking('${safeTitle}', 'Women')" class="w-full mt-4 py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(37,211,102,0.3)] transition-all">
            <svg class="w-4 h-4 fill-black" viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.02 8.48 7.02 9.68C7.02 10.88 7.89 12.04 8.01 12.2C8.13 12.37 9.72 14.82 12.16 15.87C12.74 16.12 13.19 16.27 13.55 16.38C14.13 16.57 14.66 16.54 15.08 16.48C15.55 16.41 16.52 15.89 16.72 15.33C16.92 14.77 16.92 14.29 16.86 14.2C16.8 14.1 16.64 14.04 16.4 13.92C16.16 13.8 15.01 13.23 14.8 13.15C14.59 13.07 14.43 13.03 14.27 13.27C14.11 13.51 13.65 14.04 13.51 14.2C13.37 14.36 13.23 14.38 12.99 14.26C12.75 14.14 11.98 13.89 11.07 13.08C10.36 12.45 9.88 11.67 9.74 11.43C9.6 11.19 9.73 11.06 9.85 10.94C9.96 10.83 10.09 10.66 10.21 10.52C10.33 10.38 10.37 10.28 10.45 10.12C10.53 9.96 10.49 9.82 10.43 9.7C10.37 9.58 9.91 8.45 9.72 7.99C9.53 7.54 9.34 7.6 9.19 7.59C9.05 7.58 8.89 7.58 8.73 7.58L8.53 7.33Z"/></svg>
            <span>Order This Look on WhatsApp</span>
          </button>
        </article>
      `;
    }).join('');

    container.innerHTML = `
      <!-- Apple Editorial Collection Header -->
      <div class="mb-6 pt-2 pb-4 text-center sm:text-left border-b border-white/[0.08]">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/25 text-pink-300 text-[10px] font-mono tracking-widest uppercase mb-2">
          <span class="w-1.5 h-1.5 rounded-full bg-pink-400"></span>
          <span>HAUTE COUTURE ARCHIVE</span>
        </div>
        <h2 class="font-apple text-2xl sm:text-3xl font-bold text-white tracking-tight">Women's Couture</h2>
        <p class="text-xs text-[#86868b] mt-1 max-w-sm">Sculpted silhouettes, structured corsetry & hand-beaded lace gowns.</p>
      </div>

      ${itemsHtml}

      <!-- Mobile Bottom Bespoke Card -->
      <div class="mt-4 p-6 rounded-3xl bg-[#0c0c0e] border border-white/[0.08] text-center shadow-lg">
        <span class="text-[10px] font-mono tracking-widest text-pink-400 uppercase">AKWA IBOM ATELIER</span>
        <h4 class="text-base font-semibold text-white mt-1 mb-2">Have a custom evening dress or gown in mind?</h4>
        <p class="text-xs text-[#86868b] mb-4">Victoria designs and tailors bespoke couture gowns, corsets, and beaded lace to your exact silhouette.</p>
        <button onclick="window.VictoriaApp.openBooking('Custom Evening Gown', 'Women')" class="w-full py-3.5 rounded-full bg-[#25D366] text-black font-semibold text-xs tracking-wide flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,211,102,0.3)]">
          <span>Chat with Victoria on WhatsApp</span>
          <span>→</span>
        </button>
      </div>
    `;
  }

  function renderChildrenMobileFeed() {
    const container = document.getElementById('children-mobile-feed');
    if (!container || !DATA.childrenLooks || !DATA.childrenLooks.length) return;

    const total = DATA.childrenLooks.length;
    const itemsHtml = DATA.childrenLooks.map((look, idx) => {
      const cleanTitle = (look.title || '').replace(/^Look\s+\d+(\s*&\s*\d+)?\s*[—–-]\s*/i, '');
      const safeTitle = escapeAttr(cleanTitle);
      const boyImg = look.boyImage;
      const girlImg = look.girlImage;
      const boyLabel = look.boyLabel || 'LOOK 01';
      const girlLabel = look.girlLabel || 'LOOK 02';

      return `
        <article class="relative p-4 sm:p-5 rounded-3xl bg-[#0c0c0e] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.85)] mb-8 overflow-hidden">
          <!-- Card Header: Look Index & Badge -->
          <div class="flex items-center justify-between gap-2 mb-2.5">
            <span class="text-[11px] font-mono tracking-[0.2em] uppercase text-neutral-400">LOOK ${String(idx + 1).padStart(2, '0')} OF ${String(total).padStart(2, '0')}</span>
            <span class="text-[9px] font-mono tracking-widest uppercase text-white/90 bg-neutral-900 border border-white/20 px-2.5 py-0.5 rounded-full">CHILDREN'S ATELIER</span>
          </div>

          <!-- Look Title -->
          <h3 class="capitalize font-apple text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug mb-3.5">${escapeText(cleanTitle)}</h3>

          <!-- First Image UP (Top) Stage -->
          <div onclick="window.VictoriaApp.openBooking('${safeTitle} (Look 1)', 'Children')" class="group relative w-full aspect-[4/5] max-h-[380px] rounded-2xl overflow-hidden bg-[#121215] border border-white/[0.08] flex items-center justify-center p-2.5 shadow-inner cursor-pointer active:scale-[0.99] transition-transform">
            <img src="${boyImg}" alt="${safeTitle} - Look 1" loading="lazy" class="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]" />
            <div class="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 pointer-events-none">
              <span class="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
              <span class="text-[10px] font-bold text-white tracking-[0.14em] uppercase">${escapeText(boyLabel)}</span>
            </div>
          </div>

          <!-- Other Image BENEATH (Bottom) Stage -->
          <div onclick="window.VictoriaApp.openBooking('${safeTitle} (Look 2)', 'Children')" class="group relative w-full aspect-[4/5] max-h-[380px] rounded-2xl overflow-hidden bg-[#121215] border border-white/[0.08] flex items-center justify-center p-2.5 shadow-inner cursor-pointer active:scale-[0.99] transition-transform mt-3">
            <img src="${girlImg}" alt="${safeTitle} - Look 2" loading="lazy" class="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]" />
            <div class="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 pointer-events-none">
              <span class="w-1.5 h-1.5 rounded-full bg-yellow-400"></span>
              <span class="text-[10px] font-bold text-white tracking-[0.14em] uppercase">${escapeText(girlLabel)}</span>
            </div>
          </div>

          <!-- WhatsApp Action Pill -->
          <button onclick="window.VictoriaApp.openBooking('${safeTitle}', 'Children')" class="w-full mt-4 py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(37,211,102,0.3)] transition-all">
            <svg class="w-4 h-4 fill-black" viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.02 8.48 7.02 9.68C7.02 10.88 7.89 12.04 8.01 12.2C8.13 12.37 9.72 14.82 12.16 15.87C12.74 16.12 13.19 16.27 13.55 16.38C14.13 16.57 14.66 16.54 15.08 16.48C15.55 16.41 16.52 15.89 16.72 15.33C16.92 14.77 16.92 14.29 16.86 14.2C16.8 14.1 16.64 14.04 16.4 13.92C16.16 13.8 15.01 13.23 14.8 13.15C14.59 13.07 14.43 13.03 14.27 13.27C14.11 13.51 13.65 14.04 13.51 14.2C13.37 14.36 13.23 14.38 12.99 14.26C12.75 14.14 11.98 13.89 11.07 13.08C10.36 12.45 9.88 11.67 9.74 11.43C9.6 11.19 9.73 11.06 9.85 10.94C9.96 10.83 10.09 10.66 10.21 10.52C10.33 10.38 10.37 10.28 10.45 10.12C10.53 9.96 10.49 9.82 10.43 9.7C10.37 9.58 9.91 8.45 9.72 7.99C9.53 7.54 9.34 7.6 9.19 7.59C9.05 7.58 8.89 7.58 8.73 7.58L8.53 7.33Z"/></svg>
            <span>Order This Look on WhatsApp</span>
          </button>
        </article>
      `;
    }).join('');

    container.innerHTML = `
      <!-- Apple Editorial Collection Header -->
      <div class="mb-6 pt-2 pb-4 text-center sm:text-left border-b border-white/[0.08]">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/25 text-teal-300 text-[10px] font-mono tracking-widest uppercase mb-2">
          <span class="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
          <span>YOUNG ROYALS</span>
        </div>
        <h2 class="font-apple text-2xl sm:text-3xl font-bold text-white tracking-tight">Children's Atelier</h2>
        <p class="text-xs text-[#86868b] mt-1 max-w-sm">Festive birthday dresses, bespoke junior suits & celebratory outfits.</p>
      </div>

      ${itemsHtml}

      <!-- Mobile Bottom Bespoke Card -->
      <div class="mt-4 p-6 rounded-3xl bg-[#0c0c0e] border border-white/[0.08] text-center shadow-lg">
        <span class="text-[10px] font-mono tracking-widest text-white/80 uppercase">AKWA IBOM ATELIER</span>
        <h4 class="text-base font-semibold text-white mt-1 mb-2">Bespoke Children's Festive Outfits</h4>
        <p class="text-xs text-[#86868b] mb-4">Tailored dresses and boy suites handcrafted for birthday ceremonies, church, and school galas.</p>
        <button onclick="window.VictoriaApp.openBooking('Custom Children Style', 'Children')" class="w-full py-3.5 rounded-full bg-[#25D366] text-black font-semibold text-xs tracking-wide flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,211,102,0.3)]">
          <span>Chat with Victoria on WhatsApp</span>
          <span>→</span>
        </button>
      </div>
    `;
  }

  function renderCelebrationsMobileFeed() {
    const container = document.getElementById('celebrations-mobile-feed');
    if (!container || !DATA.celebrationLooks || !DATA.celebrationLooks.length) return;

    const total = DATA.celebrationLooks.length;
    const itemsHtml = DATA.celebrationLooks.map((look, idx) => {
      const cleanTitle = (look.title || '').replace(/^Look\s+\d+(\s*&\s*\d+)?\s*[—–-]\s*/i, '');
      const safeTitle = escapeAttr(cleanTitle);
      const img1 = look.maleImage;
      const img2 = look.femaleImage;
      const label1 = look.maleLabel || 'COORDINATED LOOK 01';
      const label2 = look.femaleLabel || 'COORDINATED LOOK 02';
      const subCategory = look.eventCategory || 'OCCASIONS & CELEBRATIONS';

      return `
        <article class="relative p-4 sm:p-5 rounded-3xl bg-[#0c0c0e] border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.85)] mb-8 overflow-hidden">
          <!-- Card Header: Look Index & Badge -->
          <div class="flex items-center justify-between gap-2 mb-2.5">
            <span class="text-[11px] font-mono tracking-[0.2em] uppercase text-amber-300/80">PAIR ${String(idx + 1).padStart(2, '0')} OF ${String(total).padStart(2, '0')}</span>
            <span class="text-[9px] font-mono tracking-widest uppercase text-amber-300 bg-amber-500/10 border border-amber-500/25 px-2.5 py-0.5 rounded-full truncate max-w-[200px]">${escapeText(subCategory)}</span>
          </div>

          <!-- Look Title -->
          <h3 class="capitalize font-apple text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug mb-3.5">${escapeText(cleanTitle)}</h3>

          <!-- First Image UP (Top) Stage -->
          <div onclick="window.VictoriaApp.openBooking('${safeTitle} (Look 1)', 'Occasions')" class="group relative w-full aspect-[4/5] max-h-[380px] rounded-2xl overflow-hidden bg-[#121215] border border-white/[0.08] flex items-center justify-center p-2.5 shadow-inner cursor-pointer active:scale-[0.99] transition-transform">
            <img src="${img1}" alt="${safeTitle} - Look 1" loading="lazy" class="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]" />
            <div class="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 pointer-events-none">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
              <span class="text-[10px] font-bold text-[#f5e396] tracking-[0.14em] uppercase">${escapeText(label1)}</span>
            </div>
          </div>

          <!-- Other Image BENEATH (Bottom) Stage -->
          <div onclick="window.VictoriaApp.openBooking('${safeTitle} (Look 2)', 'Occasions')" class="group relative w-full aspect-[4/5] max-h-[380px] rounded-2xl overflow-hidden bg-[#121215] border border-white/[0.08] flex items-center justify-center p-2.5 shadow-inner cursor-pointer active:scale-[0.99] transition-transform mt-3">
            <img src="${img2}" alt="${safeTitle} - Look 2" loading="lazy" class="w-full h-full object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]" />
            <div class="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-white/15 pointer-events-none">
              <span class="w-1.5 h-1.5 rounded-full bg-orange-400"></span>
              <span class="text-[10px] font-bold text-[#f5e396] tracking-[0.14em] uppercase">${escapeText(label2)}</span>
            </div>
          </div>

          <!-- WhatsApp Action Pill -->
          <button onclick="window.VictoriaApp.openBooking('${safeTitle}', 'Occasions')" class="w-full mt-4 py-3.5 px-4 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.98] text-black font-semibold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(37,211,102,0.3)] transition-all">
            <svg class="w-4 h-4 fill-black" viewBox="0 0 24 24"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M8.53 7.33C8.37 7.33 8.1 7.39 7.87 7.64C7.65 7.89 7.02 8.48 7.02 9.68C7.02 10.88 7.89 12.04 8.01 12.2C8.13 12.37 9.72 14.82 12.16 15.87C12.74 16.12 13.19 16.27 13.55 16.38C14.13 16.57 14.66 16.54 15.08 16.48C15.55 16.41 16.52 15.89 16.72 15.33C16.92 14.77 16.92 14.29 16.86 14.2C16.8 14.1 16.64 14.04 16.4 13.92C16.16 13.8 15.01 13.23 14.8 13.15C14.59 13.07 14.43 13.03 14.27 13.27C14.11 13.51 13.65 14.04 13.51 14.2C13.37 14.36 13.23 14.38 12.99 14.26C12.75 14.14 11.98 13.89 11.07 13.08C10.36 12.45 9.88 11.67 9.74 11.43C9.6 11.19 9.73 11.06 9.85 10.94C9.96 10.83 10.09 10.66 10.21 10.52C10.33 10.38 10.37 10.28 10.45 10.12C10.53 9.96 10.49 9.82 10.43 9.7C10.37 9.58 9.91 8.45 9.72 7.99C9.53 7.54 9.34 7.6 9.19 7.59C9.05 7.58 8.89 7.58 8.73 7.58L8.53 7.33Z"/></svg>
            <span>Order This Look on WhatsApp</span>
          </button>
        </article>
      `;
    }).join('');

    container.innerHTML = `
      <!-- Apple Editorial Collection Header -->
      <div class="mb-6 pt-2 pb-4 text-center sm:text-left border-b border-white/[0.08]">
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-[10px] font-mono tracking-widest uppercase mb-2">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>CEREMONIAL ARCHIVE</span>
        </div>
        <h2 class="font-apple text-2xl sm:text-3xl font-bold text-white tracking-tight">Occasions & Celebrations</h2>
        <p class="text-xs text-[#86868b] mt-1 max-w-sm">Coordinated bridal pairs, Aso-Ebi, coronation & grand milestone ensembles.</p>
      </div>

      ${itemsHtml}

      <!-- Mobile Bottom Bespoke Card -->
      <div class="mt-4 p-6 rounded-3xl bg-[#0c0c0e] border border-white/[0.08] text-center shadow-lg">
        <span class="text-[10px] font-mono tracking-widest text-amber-400 uppercase">AKWA IBOM ATELIER</span>
        <h4 class="text-base font-semibold text-white mt-1 mb-2">Planning a Wedding, Coronation, or Gala?</h4>
        <p class="text-xs text-[#86868b] mb-4">Victoria coordinates full ceremonial suites for couples, bridal parties, and families across Akwa Ibom & worldwide.</p>
        <button onclick="window.VictoriaApp.openBooking('Ceremonial Package Consultation', 'Occasions')" class="w-full py-3.5 rounded-full bg-[#25D366] text-black font-semibold text-xs tracking-wide flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(37,211,102,0.3)]">
          <span>Chat with Victoria on WhatsApp</span>
          <span>→</span>
        </button>
      </div>
    `;
  }

  // ==========================================
  // 7. SERVICE VIDEOS (Autoplay helper)
  // ==========================================
  function initVideos() {
    document.querySelectorAll('#view-experience video').forEach(v => {
      v.muted = true;
      v.play().catch(() => {
        // Autoplay policy fallback
      });
    });
  }

  // ==========================================
  // 8. CONSULTATION / BOOKING (Full Page)
  // ==========================================
  function renderBooking() {
    const selectedStyleContainer = document.getElementById('booking-selected-style');
    const generalDesc = document.getElementById('booking-general-desc');
    const itemTitle = document.getElementById('booking-item-title');

    if (state.bookingNotes && itemTitle) {
      itemTitle.textContent = state.bookingNotes;
      if (selectedStyleContainer) selectedStyleContainer.classList.remove('hidden');
      if (generalDesc) generalDesc.classList.add('hidden');
    } else {
      if (selectedStyleContainer) selectedStyleContainer.classList.add('hidden');
      if (generalDesc) generalDesc.classList.remove('hidden');
    }
  }

  function openBooking(initialItem = '', department = 'Men') {
    if (state.activeTab !== 'booking') {
      state.previousTab = state.activeTab;
    }
    state.bookingDepartment = department;
    state.bookingNotes = initialItem;

    renderBooking();
    navigateTo('booking');
  }

  function closeBooking() {
    navigateTo(state.previousTab || 'home');
  }

  const bookingSubmitBtn = document.getElementById('booking-submit-btn');
  if (bookingSubmitBtn) {
    bookingSubmitBtn.addEventListener('click', () => {
      const item = state.bookingNotes ? state.bookingNotes.trim() : '';
      const dept = state.bookingDepartment || '';
      const lines = [
        `*VICTORIA FASHION (AKWA IBOM) — BESPOKE CONSULTATION*`,
        `---------------------------------------------`,
      ];

      if (item) {
        lines.push(`*Selected Style:* ${item}`);
      }
      if (dept) {
        lines.push(`*Department:* ${dept}`);
      }

      lines.push(`---------------------------------------------`);
      lines.push(`Hello Victoria, I saw your website and would like to chat with you regarding bespoke tailoring.`);

      const message = encodeURIComponent(lines.join('\n'));
      window.open(`https://wa.me/2348000000000?text=${message}`, '_blank');
    });
  }

  document.querySelectorAll('.close-booking-modal').forEach(btn => {
    btn.addEventListener('click', closeBooking);
  });

  // ==========================================
  // 9. KEYBOARD & TOUCH NAVIGATION
  // ==========================================
  window.addEventListener('keydown', (e) => {
    if (state.activeTab === 'booking') {
      if (e.key === 'Escape') closeBooking();
      return;
    }

    if (state.activeTab === 'occasions') {
      if (state.occasionsMode === 'weddings') {
        if (e.key === 'ArrowLeft') prevWedding();
        if (e.key === 'ArrowRight') nextWedding();
        if (e.key === 'f' || e.key === 'F') setWeddingView('front');
        if (e.key === 'b' || e.key === 'B') setWeddingView('back');
      } else if (state.occasionsMode === 'celebrations') {
        if (e.key === 'ArrowLeft') prevCelebration();
        if (e.key === 'ArrowRight') nextCelebration();
      }
    } else if (state.activeTab === 'men') {
      if (e.key === 'ArrowLeft') prevMen();
      if (e.key === 'ArrowRight') nextMen();
    } else if (state.activeTab === 'women') {
      if (e.key === 'ArrowLeft') prevWomen();
      if (e.key === 'ArrowRight') nextWomen();
    } else if (state.activeTab === 'children') {
      if (e.key === 'ArrowLeft') prevChildren();
      if (e.key === 'ArrowRight') nextChildren();
    }
  });

  // Next / Prev Helpers
  function nextWedding() {
    state.weddingIndex = (state.weddingIndex + 1) % DATA.weddingLooks.length;
    renderWeddingSlide();
  }
  function prevWedding() {
    state.weddingIndex = (state.weddingIndex - 1 + DATA.weddingLooks.length) % DATA.weddingLooks.length;
    renderWeddingSlide();
  }
  function setWeddingView(view) {
    state.weddingView = view;
    renderWeddingSlide();
  }

  function nextCelebration() {
    state.celebrationIndex = (state.celebrationIndex + 1) % DATA.celebrationLooks.length;
    renderCelebrationSlide();
  }
  function prevCelebration() {
    state.celebrationIndex = (state.celebrationIndex - 1 + DATA.celebrationLooks.length) % DATA.celebrationLooks.length;
    renderCelebrationSlide();
  }

  function nextMen() {
    state.menIndex = (state.menIndex + 1) % DATA.menLooks.length;
    renderMen();
  }
  function prevMen() {
    state.menIndex = (state.menIndex - 1 + DATA.menLooks.length) % DATA.menLooks.length;
    renderMen();
  }

  function nextWomen() {
    state.womenIndex = (state.womenIndex + 1) % DATA.womenLooks.length;
    renderWomen();
  }
  function prevWomen() {
    state.womenIndex = (state.womenIndex - 1 + DATA.womenLooks.length) % DATA.womenLooks.length;
    renderWomen();
  }

  function nextChildren() {
    state.childrenIndex = (state.childrenIndex + 1) % DATA.childrenLooks.length;
    renderChildren();
  }
  function prevChildren() {
    state.childrenIndex = (state.childrenIndex - 1 + DATA.childrenLooks.length) % DATA.childrenLooks.length;
    renderChildren();
  }

  function escapeQuotes(str) {
    return str.replace(/'/g, "\\'");
  }

  // Global API exposed for HTML onclick handlers
  window.VictoriaApp = {
    navigateTo,
    openBooking,
    closeBooking,
    // Weddings
    setWeddingView,
    setWeddingIndex: idx => { state.weddingIndex = idx; renderWeddingSlide(); },
    nextWedding,
    prevWedding,
    // Celebrations
    setCelebrationIndex: idx => { state.celebrationIndex = idx; renderCelebrationSlide(); },
    nextCelebration,
    prevCelebration,
    // Men
    setMenIndex: idx => { state.menIndex = idx; renderMen(); },
    nextMen,
    prevMen,
    // Women
    setWomenIndex: idx => { state.womenIndex = idx; renderWomen(); },
    nextWomen,
    prevWomen,
    // Children
    setChildrenIndex: idx => { state.childrenIndex = idx; renderChildren(); },
    nextChildren,
    prevChildren,
    // Current Look Getters for Bookings
    bookCurrentWedding: (perspective = '') => {
      const item = DATA.weddingLooks[state.weddingIndex];
      const view = perspective || state.weddingView.toUpperCase() + ' VIEW';
      openBooking(`${item.title} (${view})`, 'Occasions & Aso-Ebi');
    },
    bookCurrentCelebration: (specificType = '') => {
      const item = DATA.celebrationLooks[state.celebrationIndex];
      let desc = item.title;
      if (specificType === 'Male Version' || specificType === 'Card1' || specificType === 'Emerald Boubou') {
        desc = item.maleTitle || item.title;
      } else if (specificType === 'Female Version' || specificType === 'Card2' || specificType === 'Batik Maxi Gown') {
        desc = item.femaleTitle || item.title;
      }
      openBooking(desc, 'Occasions & Aso-Ebi');
    },
    bookCurrentMen: (perspective = '') => {
      const item = DATA.menLooks[state.menIndex];
      openBooking(`${item.title} ${perspective ? `(${perspective})` : ''}`, 'Men');
    },
    bookCurrentWomen: (slot = '') => {
      const item = DATA.womenLooks[state.womenIndex];
      let pieceTitle = item.title;
      if (slot === 'Card1' || slot === 'Front View') pieceTitle = item.card1Title || item.title;
      else if (slot === 'Card2' || slot === 'Back View') pieceTitle = item.card2Title || item.title;
      else if (slot) pieceTitle = `${item.title} (${slot})`;
      openBooking(pieceTitle, 'Women');
    },
    bookCurrentChildren: (slot = '') => {
      const item = DATA.childrenLooks[state.childrenIndex];
      let role = '';
      if (slot === 'Card1' || slot === 'Boy') role = item.boySublabel || 'Look 01';
      else if (slot === 'Card2' || slot === 'Girl') role = item.girlSublabel || 'Look 02';
      else role = slot;
      openBooking(`${item.title} (${role})`, "Children's Bespoke");
    }
  };

  // Touch Swipe for mobile gestures
  let touchStartX = 0;
  window.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  window.addEventListener('touchend', e => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) < 50) return;

    if (state.activeTab === 'occasions') {
      if (state.occasionsMode === 'weddings') {
        diff > 0 ? nextWedding() : prevWedding();
      } else if (state.occasionsMode === 'celebrations') {
        diff > 0 ? nextCelebration() : prevCelebration();
      }
    } else if (state.activeTab === 'men') {
      diff > 0 ? nextMen() : prevMen();
    } else if (state.activeTab === 'women') {
      diff > 0 ? nextWomen() : prevWomen();
    } else if (state.activeTab === 'children') {
      diff > 0 ? nextChildren() : prevChildren();
    }
  }, { passive: true });


  // ==========================================
  // SUPABASE DYNAMIC GALLERY SYNC
  // ==========================================
  async function syncSupabaseGallery() {
    try {
      const url = "https://pseyowecodortdepdcgu.supabase.co/storage/v1/object/public/victoria-images/manifest.json?t=" + Date.now();
      const res = await fetch(url);
      if (!res.ok) return;
      const uploadedItems = await res.json();
      if (!Array.isArray(uploadedItems) || uploadedItems.length === 0) return;

      uploadedItems.forEach(item => {
        const cat = (item.category || '').toLowerCase();
        const catItem = {
          id: item.id,
          name: item.title,
          desc: item.description || 'Bespoke creation by Victoria Fashion.',
          image: item.image_url
        };

        if (cat === 'women') {
          if (!DATA.catalogue.women.some(x => x.id === item.id)) {
            DATA.catalogue.women.unshift(catItem);
          }
          if (!DATA.womenLooks.some(x => x.id === item.id)) {
            DATA.womenLooks.unshift({
              id: item.id,
              title: item.title,
              subtitle: item.description || '',
              card1Image: item.image_url,
              card2Image: item.image_url,
              card1Title: item.title,
              card2Title: item.title
            });
          }
        } else if (cat === 'men') {
          if (!DATA.catalogue.men.some(x => x.id === item.id)) {
            DATA.catalogue.men.unshift(catItem);
          }
          if (!DATA.menLooks.some(x => x.id === item.id)) {
            DATA.menLooks.unshift({
              id: item.id,
              title: item.title,
              subtitle: item.description || '',
              frontImage: item.image_url,
              backImage: item.image_url,
              frontLabel: 'FRONT VIEW',
              backLabel: 'PERSPECTIVE'
            });
          }
        } else if (cat === 'children') {
          if (!DATA.catalogue.children.some(x => x.id === item.id)) {
            DATA.catalogue.children.unshift(catItem);
          }
          if (!DATA.childrenLooks.some(x => x.id === item.id)) {
            DATA.childrenLooks.unshift({
              id: item.id,
              title: item.title,
              subtitle: item.description || '',
              boyImage: item.image_url,
              girlImage: item.image_url
            });
          }
        } else if (cat === 'occasions') {
          if (!DATA.catalogue.occasions.some(x => x.id === item.id)) {
            DATA.catalogue.occasions.unshift(catItem);
          }
          if (!DATA.celebrationLooks.some(x => x.id === item.id)) {
            DATA.celebrationLooks.unshift({
              id: item.id,
              title: item.title,
              subtitle: item.description || '',
              maleImage: item.image_url,
              femaleImage: item.image_url,
              maleTitle: item.title,
              femaleTitle: item.title
            });
          }
        }
      });

      renderActiveView();
    } catch (err) {
      console.warn('Supabase gallery sync notice:', err);
    }
  }

  // Initial startup
  closeMobileDrawer();
  handleHashChange();
  syncSupabaseGallery();

  // Auto-sync when returning to the tab so newly uploaded outfits appear immediately
  window.addEventListener('focus', syncSupabaseGallery);
})();
