(() => {
  'use strict';

  const products = [
    {
      id: 'gather-table',
      category: 'dining',
      categoryLabel: 'Dining',
      title: 'Dastarkhwan Dining Table',
      urdu: 'دسترخوان',
      image: 'assets/dastarkhwan-dining.jpg',
      alt: 'Illustrative carved timber dining table with six wooden chairs, cream upholstery and an indigo runner',
      description: 'For family dinners, Eid gatherings and one more seat at the table. Plan the dimensions, wood and finish around your dining space, with room for the way your family comes together.',
      features: ['Dimensions planned around your space', 'Your choice of timber and finish', 'Matching seating can be discussed'],
    },
    {
      id: 'everyday-chair',
      category: 'living',
      categoryLabel: 'Living',
      title: 'Mehfil Living Collection',
      urdu: 'محفل',
      image: 'assets/pakistani-courtyard.jpg',
      alt: 'Illustrative Pakistani courtyard with carved wooden armchairs, a low table and a woven charpai',
      description: 'Make room for a good mehfil—chai, conversation and guests who feel at home. Discuss coordinated tables, seating and wood detailing for a drawing room or family lounge that suits your space.',
      features: ['Custom tables and coordinated woodwork', 'Seating and upholstery options to discuss', 'Proportions tailored to your room'],
    },
    {
      id: 'haven-bed',
      category: 'bedroom',
      categoryLabel: 'Bedroom',
      title: 'Sukoon Bedroom',
      urdu: 'سکون',
      image: 'assets/bedroom.jpg',
      alt: 'A wooden bed with a simple timber headboard and neutral bedding',
      description: 'A quiet place to unwind after a busy day. Shape your bed, headboard and bedside furniture around your mattress, room proportions and preferred wood finish for a bedroom with a sense of sukoon.',
      features: ['Built to your mattress dimensions', 'Custom headboard design', 'Matching bedside furniture available to discuss'],
    },
    {
      id: 'welcome-door',
      category: 'interiors',
      categoryLabel: 'Interiors',
      title: 'Dehleez Entrance Door',
      urdu: 'دہلیز',
      image: 'assets/doors.jpg',
      alt: 'A richly textured wooden entrance door with refined architectural details',
      description: 'A thoughtful welcome at the dehleez of your home. Share your doorway measurements and preferred style to explore panel details, wood options and hardware suited to your entrance.',
      features: ['Sized for your doorway', 'Panel and carving details to your brief', 'Hardware and finish options to discuss'],
    },
    {
      id: 'tailored-kitchen',
      category: 'interiors',
      categoryLabel: 'Interiors',
      title: 'Ghar Kitchen Cabinetry',
      urdu: 'گھر',
      image: 'assets/kitchen.jpg',
      alt: 'A warm contemporary kitchen with wooden cabinets and practical storage',
      description: 'From the morning chai to preparing a family feast, a kitchen should make daily life easier. Plan cabinets, storage and finishes around your utensils, appliances and the way your ghar works.',
      features: ['Cabinet layout planned for your space', 'Storage designed around your needs', 'Material, hardware and finish choices'],
    },
    {
      id: 'focus-desk',
      category: 'office',
      categoryLabel: 'Office',
      title: 'Kaam Writing Desk',
      urdu: 'کام',
      image: 'assets/office.jpg',
      alt: 'A white writing desk and shelving in a bright home office',
      description: 'A considered corner for focused kaam, study and new ideas. Choose the dimensions, storage and wood detailing for a home office, study room or professional workspace.',
      features: ['Dimensions suited to your workspace', 'Drawer and storage options to discuss', 'Your choice of timber tone and finish'],
    },
  ];

  const byId = (id) => document.getElementById(id);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const scrollBehavior = () => reducedMotion.matches ? 'auto' : 'smooth';
  const arrow = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const escapeHTML = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

  const grid = byId('product-grid');
  const filters = byId('collection-filters');
  const count = byId('collection-count');
  const emptyState = byId('empty-state');
  const productDialog = byId('product-dialog');
  const inquiryDialog = byId('inquiry-dialog');
  const focusOrigins = new WeakMap();
  const skipFocusReturn = new WeakSet();
  let selectedProduct = null;
  let preparedInquiry = '';

  function renderProducts(filter = 'all') {
    const visibleProducts = products.filter((product) => filter === 'all' || product.category === filter);
    if (grid) {
      grid.innerHTML = visibleProducts.map((product) => `
        <article class="product-card">
          <div class="product-image">
            <button class="product-open product-image-button" type="button" data-id="${product.id}" title="View ${escapeHTML(product.title)}" aria-label="View ${escapeHTML(product.title)}">
              <img src="${product.image}" alt="${escapeHTML(product.alt)}" loading="lazy" decoding="async" width="900" height="1050">
              <span class="product-urdu" lang="ur" dir="rtl">${product.urdu}</span>
              <span class="product-image-icon">${arrow}</span>
            </button>
          </div>
          <div class="product-info">
            <div class="product-meta"><small>${product.categoryLabel}</small><span>Made to order</span></div>
            <h3><button class="product-open product-title-button" type="button" data-id="${product.id}" aria-label="View ${escapeHTML(product.title)}">${product.title}</button></h3>
            <div class="product-footer"><span>Custom-built for you</span><button class="product-open product-arrow" type="button" data-id="${product.id}" aria-label="View ${escapeHTML(product.title)}" title="View details">${arrow}</button></div>
          </div>
        </article>
      `).join('');
    }
    if (count) count.textContent = `${visibleProducts.length} ${visibleProducts.length === 1 ? 'piece' : 'pieces'}`;
    if (emptyState) emptyState.hidden = visibleProducts.length > 0;
    filters?.querySelectorAll('[data-filter]').forEach((button) => {
      const active = button.dataset.filter === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  function openDialog(dialog, opener = document.activeElement) {
    if (!dialog || dialog.open) return;
    focusOrigins.set(dialog, opener);
    dialog.showModal();
  }

  function closeDialog(dialog, returnFocus = true) {
    if (!dialog?.open) return;
    if (!returnFocus) skipFocusReturn.add(dialog);
    dialog.close();
  }

  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.querySelectorAll('[data-close-dialog]').forEach((button) => {
      button.addEventListener('click', () => closeDialog(dialog));
    });
    dialog.addEventListener('click', (event) => {
      if (event.target !== dialog) return;
      const bounds = dialog.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDialog(dialog);
    });
    dialog.addEventListener('close', () => {
      if (skipFocusReturn.has(dialog)) {
        skipFocusReturn.delete(dialog);
        return;
      }
      const opener = focusOrigins.get(dialog);
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus({ preventScroll: true });
    });
  });

  filters?.addEventListener('click', (event) => {
    const button = event.target.closest?.('[data-filter]');
    if (button && filters.contains(button)) renderProducts(button.dataset.filter);
  });

  grid?.addEventListener('click', (event) => {
    const button = event.target.closest?.('.product-open');
    if (!button) return;
    selectedProduct = products.find((product) => product.id === button.dataset.id);
    if (!selectedProduct || !productDialog) return;
    const photo = byId('product-dialog-image');
    if (photo) {
      photo.src = selectedProduct.image;
      photo.alt = selectedProduct.alt;
    }
    const details = {
      'product-dialog-category': selectedProduct.categoryLabel,
      'product-dialog-title': selectedProduct.title,
      'product-dialog-description': selectedProduct.description,
    };
    Object.entries(details).forEach(([id, value]) => { if (byId(id)) byId(id).textContent = value; });
    const features = byId('product-dialog-features');
    if (features) features.replaceChildren(...selectedProduct.features.map((feature) => {
      const item = document.createElement('li');
      item.textContent = feature;
      return item;
    }));
    openDialog(productDialog, button);
  });

  byId('product-dialog-inquire')?.addEventListener('click', () => {
    if (!selectedProduct) return;
    const category = byId('inquiry-category');
    const message = byId('inquiry-message');
    if (category) category.value = selectedProduct.category;
    if (message) message.value = `I am interested in ${selectedProduct.title}. My preferred dimensions, timber and finish are: `;
    closeDialog(productDialog, false);
    byId('inquiry')?.scrollIntoView({ behavior: scrollBehavior(), block: 'start' });
    byId('inquiry-name')?.focus({ preventScroll: true });
  });

  const form = byId('inquiry-form');
  const woodButtons = document.querySelectorAll('.wood-select[data-wood]');
  function selectWood(wood = '') {
    const woodField = byId('inquiry-wood');
    if (woodField) woodField.value = wood;
    woodButtons.forEach((button) => {
      const selected = button.dataset.wood === wood;
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('is-selected', selected);
    });
    const status = byId('wood-selection-status');
    if (status) status.textContent = wood
      ? `Selected: ${wood}. Include your preferred finish in the inquiry.`
      : 'No material selected. We can help you choose.';
  }
  woodButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const selected = button.getAttribute('aria-pressed') === 'true';
      selectWood(selected ? '' : button.dataset.wood);
    });
  });
  form?.addEventListener('reset', () => selectWood());
  form?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const field = (name) => String(values.get(name) ?? '').trim();
    const categorySelect = byId('inquiry-category');
    const categoryLabel = categorySelect?.selectedOptions[0]?.textContent.trim() || field('category');
    preparedInquiry = [
      'SHAHBAZ FURNITURE — PROJECT INQUIRY',
      '',
      `Name: ${field('name')}`,
      `Phone: ${field('phone')}`,
      `City: ${field('city') || 'Not specified'}`,
      `Project category: ${categoryLabel}`,
      ...(field('wood') ? [`Preferred wood: ${field('wood')}`] : []),
      '',
      'Project details:',
      field('message'),
      '',
      'This inquiry was prepared on your device. Share it directly with the business through a verified contact channel.',
    ].join('\n');
    const summary = byId('inquiry-summary');
    if (summary) summary.textContent = preparedInquiry;
    const status = byId('inquiry-form-status');
    if (status) status.textContent = 'Inquiry prepared. Review it before sharing.';
    const actionStatus = byId('inquiry-action-status');
    if (actionStatus) actionStatus.textContent = '';
    openDialog(inquiryDialog, form.querySelector('[type="submit"]'));
  });

  function inquiryActionStatus(message) {
    const status = byId('inquiry-action-status');
    if (status) status.textContent = message;
  }

  byId('download-inquiry')?.addEventListener('click', () => {
    if (!preparedInquiry) return;
    const file = new Blob([preparedInquiry], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'shahbaz-furniture-project-inquiry.txt';
    document.body.append(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    inquiryActionStatus('Download prepared. Share the file through a verified business contact.');
  });

  function copyWithSelection(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.setAttribute('aria-label', 'Inquiry text for copying');
    textarea.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;';
    // Keep the fallback inside the active dialog so it remains focusable.
    (inquiryDialog?.open ? inquiryDialog : document.body).append(textarea);
    textarea.focus();
    textarea.select();
    let success = false;
    try { success = document.execCommand('copy'); } finally { textarea.remove(); }
    return success;
  }

  byId('copy-inquiry')?.addEventListener('click', async (event) => {
    if (!preparedInquiry) return;
    const button = event.currentTarget;
    try {
      if (navigator.clipboard?.writeText) {
        try { await navigator.clipboard.writeText(preparedInquiry); }
        catch { if (!copyWithSelection(preparedInquiry)) throw new Error('Copy unavailable'); }
      } else if (!copyWithSelection(preparedInquiry)) {
        throw new Error('Copy unavailable');
      }
      inquiryActionStatus('Inquiry copied. Paste it into your preferred messaging app.');
    } catch {
      inquiryActionStatus('Copy is unavailable in this browser. Download the inquiry or select the text above.');
    }
    if (button instanceof HTMLElement) button.focus({ preventScroll: true });
  });

  const menuToggle = byId('menu-toggle');
  const navigation = byId('site-nav');
  function closeMenu() {
    navigation?.classList.remove('is-open');
    menuToggle?.setAttribute('aria-expanded', 'false');
    menuToggle?.setAttribute('aria-label', 'Open navigation');
  }
  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    navigation?.classList.toggle('is-open', open);
  });
  navigation?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuToggle.focus();
    }
  });
  document.addEventListener('click', (event) => {
    if (menuToggle?.getAttribute('aria-expanded') === 'true' && !navigation?.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
  });

  const header = document.querySelector('.site-header');
  const backToTop = byId('back-to-top');
  let scrollQueued = false;
  function updateScrollState() {
    header?.classList.toggle('is-scrolled', window.scrollY > 24);
    if (backToTop) backToTop.hidden = window.scrollY < 800;
    scrollQueued = false;
  }
  window.addEventListener('scroll', () => {
    if (!scrollQueued) {
      scrollQueued = true;
      window.requestAnimationFrame(updateScrollState);
    }
  }, { passive: true });
  backToTop?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: scrollBehavior() });
    document.querySelector('.brand')?.focus({ preventScroll: true });
  });

  const faqItems = document.querySelectorAll('.faq-list details');
  faqItems.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (item.open) faqItems.forEach((other) => { if (other !== item) other.open = false; });
    });
  });

  const year = byId('year');
  if (year) year.textContent = String(new Date().getFullYear());
  renderProducts();
  updateScrollState();

  const reveals = document.querySelectorAll('.reveal');
  if (!reducedMotion.matches && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach((element) => observer.observe(element));
  } else {
    reveals.forEach((element) => element.classList.add('is-visible'));
  }
  document.documentElement.classList.add('js-ready');
})();
