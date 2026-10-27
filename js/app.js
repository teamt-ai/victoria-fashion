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
    occasionsMode: 'portal', // 'portal' | 'weddings' | 'celebrations'
    weddingIndex: 0,
    weddingView: 'front', // 'front' | 'back'
    celebrationIndex: 0,
    // Men / Women / Children lookbook states
    menIndex: 0,
    womenIndex: 0,
    childrenIndex: 0,
    // Catalogue state
    catalogueFilter: 'all',
    // Modal state
    bookingDepartment: 'Men',
    bookingNotes: ''
  };

  // DOM Elements
  const header = document.getElementById('main-header');
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const bookingModal = document.getElementById('booking-modal');
  const bookingDeptButtons = document.querySelectorAll('.booking-dept-btn');
  const bookingNotesInput = document.getElementById('booking-notes');
  const bookingSubmitBtn = document.getElementById('booking-submit-btn');

  // ==========================================
  // 1. ROUTING & TAB NAVIGATION
  // ==========================================
  function navigateTo(tabId, subMode = null) {
    state.activeTab = tabId;

    if (tabId === 'occasions') {
      state.occasionsMode = subMode || 'portal';
      window.location.hash = state.occasionsMode === 'portal' ? 'occasions' : `occasions/${state.occasionsMode}`;
    } else {
      window.location.hash = tabId === 'home' ? '' : tabId;
    }

    renderActiveView();
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Close mobile drawer if open
    if (mobileDrawer) {
      mobileDrawer.classList.add('hidden');
    }
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
      } else {
        state.occasionsMode = 'portal';
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

  // Mobile drawer events
  if (mobileMenuToggle && mobileDrawer) {
    mobileMenuToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('hidden');
    });
  }
  if (mobileMenuClose && mobileDrawer) {
    mobileMenuClose.addEventListener('click', () => {
      mobileDrawer.classList.add('hidden');
    });
  }

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
      grid.innerHTML = `
        <div class="col-span-full py-20 text-center text-[#86868b] flex flex-col items-center justify-center">
          <p class="font-apple text-lg text-white font-semibold mb-2">Collection Updating</p>
          <p class="text-sm text-[#86868b] max-w-md mx-auto mb-6">More bespoke designs are being added to this collection. Browse our Women Collections or chat directly with Victoria for custom orders.</p>
          <button onclick="window.VictoriaApp.openBooking('', 'Men')" class="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs sm:text-sm px-6 py-2.5 rounded-full font-medium transition-all">
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
      if (breadcrumbLabel) breadcrumbLabel.textContent = "Weddings";
      if (backBtnText) backBtnText.textContent = "Back to Occasions";
      renderWeddingSlide();
    } else if (state.occasionsMode === 'celebrations') {
      if (portalSec) portalSec.classList.add('hidden');
      if (weddingsSec) weddingsSec.classList.add('hidden');
      if (celebrationsSec) celebrationsSec.classList.remove('hidden');
      if (breadcrumbLabel) breadcrumbLabel.textContent = "Other Celebrations";
      if (backBtnText) backBtnText.textContent = "Back to Occasions";
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

    if (titleEl) titleEl.textContent = item.title;
    if (subtitleEl) subtitleEl.textContent = item.subtitle;
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
    if (maleTitle) maleTitle.textContent = item.maleTitle;

    if (femaleImg) {
      femaleImg.src = item.femaleImage;
      femaleImg.alt = `${item.title} - Female`;
    }
    if (femaleTitle) femaleTitle.textContent = item.femaleTitle;

    if (titleEl) titleEl.textContent = item.title;
    if (subtitleEl) subtitleEl.textContent = item.subtitle;

    // Dots
    if (dotsContainer) {
      dotsContainer.innerHTML = DATA.celebrationLooks.map((c, idx) => `
        <button
          onclick="window.VictoriaApp.setCelebrationIndex(${idx})"
          class="h-1.5 transition-all rounded-full ${state.celebrationIndex === idx ? 'w-8 bg-amber-400 shadow-[0_0_12px_rgba(203,161,53,0.8)]' : 'w-2 bg-white/20 hover:bg-white/40'}"
          aria-label="Slide ${idx + 1}"
        ></button>
      `).join('');
    }

    if (counterEl) {
      counterEl.textContent = `0${state.celebrationIndex + 1} / 0${DATA.celebrationLooks.length}`;
    }
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
    if (titleEl) titleEl.textContent = item.title;
    if (subtitleEl) subtitleEl.textContent = item.subtitle;

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

    if (frontImg) frontImg.src = item.frontImage;
    if (backImg) backImg.src = item.backImage;
    if (titleEl) titleEl.textContent = item.title;
    if (subtitleEl) subtitleEl.textContent = item.subtitle;

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
    if (titleEl) titleEl.textContent = item.title;
    if (subtitleEl) subtitleEl.textContent = item.subtitle;

    const card1Label = document.getElementById('children-card1-label');
    const card1Sublabel = document.getElementById('children-card1-sublabel');
    const card2Label = document.getElementById('children-card2-label');
    const card2Sublabel = document.getElementById('children-card2-sublabel');
    if (card1Label) card1Label.textContent = item.boyLabel || 'LOOK 01';
    if (card1Sublabel) card1Sublabel.textContent = item.boySublabel || 'Mosaic Flutter Dress';
    if (card2Label) card2Label.textContent = item.girlLabel || 'LOOK 02';
    if (card2Sublabel) card2Sublabel.textContent = item.girlSublabel || 'Solar Peplum Dress';

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
  // 8. CONSULTATION / BOOKING MODAL
  // ==========================================
  function openBooking(initialItem = '', department = 'Men') {
    state.bookingDepartment = department;
    state.bookingNotes = initialItem ? `Style: ${initialItem}` : '';

    if (bookingNotesInput) {
      bookingNotesInput.value = state.bookingNotes;
    }

    updateDeptButtonUI();

    if (bookingModal) {
      bookingModal.classList.remove('hidden');
      bookingModal.classList.add('flex');
    }
  }

  function closeBooking() {
    if (bookingModal) {
      bookingModal.classList.add('hidden');
      bookingModal.classList.remove('flex');
    }
  }

  function updateDeptButtonUI() {
    bookingDeptButtons.forEach(btn => {
      const dept = btn.getAttribute('data-dept');
      if (dept === state.bookingDepartment) {
        btn.className = 'booking-dept-btn p-2.5 rounded-xl border text-left transition-colors border-white text-white font-medium bg-white/10';
      } else {
        btn.className = 'booking-dept-btn p-2.5 rounded-xl border text-left transition-colors border-white/10 text-[#86868b] hover:text-white';
      }
    });
  }

  bookingDeptButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      state.bookingDepartment = btn.getAttribute('data-dept');
      updateDeptButtonUI();
    });
  });

  if (bookingSubmitBtn) {
    bookingSubmitBtn.addEventListener('click', () => {
      const notes = bookingNotesInput ? bookingNotesInput.value.trim() : '';
      const lines = [
        `*VICTORIA FASHION (AKWA IBOM) — CONSULTATION*`,
        `---------------------------------------------`,
        `*Department:* ${state.bookingDepartment}`,
      ];

      if (notes) {
        lines.push(`*Style / Request:* ${notes}`);
      }

      lines.push(`---------------------------------------------`);
      lines.push(`Hello Victoria, I saw your website and would like to chat with you regarding sewing my clothes.`);

      const message = encodeURIComponent(lines.join('\n'));
      window.open(`https://wa.me/2348000000000?text=${message}`, '_blank');
      closeBooking();
    });
  }

  // Modal backdrop close
  if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) {
        closeBooking();
      }
    });
  }

  document.querySelectorAll('.close-booking-modal').forEach(btn => {
    btn.addEventListener('click', closeBooking);
  });

  // ==========================================
  // 9. KEYBOARD & TOUCH NAVIGATION
  // ==========================================
  window.addEventListener('keydown', (e) => {
    if (bookingModal && !bookingModal.classList.contains('hidden')) {
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
      const desc = specificType ? `${item.title} (${specificType})` : `${item.title} (Matching Couple Set)`;
      openBooking(desc, 'Occasions & Aso-Ebi');
    },
    bookCurrentMen: (perspective = '') => {
      const item = DATA.menLooks[state.menIndex];
      openBooking(`${item.title} ${perspective ? `(${perspective})` : ''}`, 'Men');
    },
    bookCurrentWomen: (perspective = '') => {
      const item = DATA.womenLooks[state.womenIndex];
      openBooking(`${item.title} ${perspective ? `(${perspective})` : ''}`, 'Women');
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

  // Initial startup
  handleHashChange();

})();
