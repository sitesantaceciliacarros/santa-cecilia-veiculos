/* ========================================
   SANTA CECÍLIA VEÍCULOS — Script
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {

  // ---- Database Connection (from vault.js) ----
  const _supabase = window.sb;

  if (!_supabase) {
    console.error("Database connection failed. Ensure vault.js is correctly loaded.");
    return;
  }

  let vehicles = [];

  // ---- Fetch Vehicle Data ----
  async function fetchVehicles() {
    try {
      const { data, error } = await _supabase.from('vehicles').select('*');
      if (error) throw error;
      vehicles = data || [];
      renderCards(vehicles);
    } catch (err) {
      console.error('Erro ao buscar veículos:', err);
      // Fallback or message if needed
    }
  }

  const grid = document.getElementById('listingGrid');
  const compareState = [];

  // ---- Vehicle Toggle ----
  const vehicleToggles = document.querySelectorAll('.vehicle-type-btn');
  vehicleToggles.forEach(btn => {
    btn.addEventListener('click', () => {
      vehicleToggles.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // ---- Render Cards ----
  function renderCards(list) {
    grid.innerHTML = list.map(v => {
      const badgeHTML = v.badge ? `<div class="vehicle-card-badges"><span class="badge badge-${v.badge}">${v.tag}</span></div>` : '';
      const isSelected = compareState.includes(v.id);
      const kmText = v.km === 0 ? '0 km' : v.km.toLocaleString('pt-BR') + ' km';
      return `
      <div class="vehicle-card" data-id="${v.id}">
        ${badgeHTML}
        <div class="vehicle-card-img">
          <img src="${v.img}" alt="${v.name}" loading="lazy"/>
          <button class="vehicle-card-compare ${isSelected?'selected':''}" data-id="${v.id}" title="Comparar">
            <svg viewBox="0 0 24 24"><path d="M10 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h5v-2H5V5h5V3zm4 18h5c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-5v2h5v14h-5v2zm-3-8l-4 4h3v4h2v-4h3l-4-4zm0-2l4-4h-3V3h-2v4H7l4 4z"/></svg>
          </button>
        </div>
        <div class="vehicle-card-body">
          <div class="vehicle-card-title">${v.name}</div>
          <div class="vehicle-card-trim">${v.trim} · ${v.year}</div>
          <div class="vehicle-card-specs">
            <span class="spec-tag"><svg viewBox="0 0 24 24"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7z"/></svg>${kmText}</span>
            <span class="spec-tag"><svg viewBox="0 0 24 24"><path d="M19.77 7.23l.01-.01-3.72-3.72L15 4.56l2.11 2.11c-.94.36-1.61 1.26-1.61 2.33 0 1.38 1.12 2.5 2.5 2.5.36 0 .69-.08 1-.21v7.21c0 .55-.45 1-1 1s-1-.45-1-1V14c0-1.1-.9-2-2-2h-1V5c0-1.1-.9-2-2-2H6c-1.1 0-2 .9-2 2v16h10v-7.5h1.5v5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V9c0-.69-.28-1.32-.73-1.77zM12 10H6V5h6v5z"/></svg>${v.fuel}</span>
            <span class="spec-tag"><svg viewBox="0 0 24 24"><path d="M12.5 6.9c1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85z"/></svg>${v.trans}</span>
          </div>
          <div class="vehicle-card-price-row">
            <div class="vehicle-card-price">R$ ${v.price.toLocaleString('pt-BR')}</div>
          </div>
          <div class="vehicle-card-installment">ou <strong>${v.installment}x sem juros</strong></div>
          <div class="vehicle-card-actions">
            <a href="veiculo.html?id=${v.id}" class="btn-card btn-card-primary">Ver oferta</a>
          </div>
        </div>
      </div>`;
    }).join('');
    attachCompareListeners();
  }

  fetchVehicles();

  // ---- Filter Pills ----
  document.querySelectorAll('.pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const text = pill.textContent.trim().toLowerCase();
      if (text.includes('todos')) { renderCards(vehicles); }
      else if (text.includes('suv')) { renderCards(vehicles.filter(v => v.type === 'suv')); }
      else if (text.includes('hatch')) { renderCards(vehicles.filter(v => v.type === 'hatch')); }
      else if (text.includes('híbrido')) { renderCards(vehicles.filter(v => v.fuel === 'Híbrido')); }
      else if (text.includes('automático')) { renderCards(vehicles.filter(v => v.trans === 'Automático')); }
      else if (text.includes('100k')) { renderCards(vehicles.filter(v => v.price <= 100000)); }
      else { renderCards(vehicles); }
      document.querySelector('.listing-count span').textContent = document.querySelectorAll('.vehicle-card').length;
    });
  });

  // ---- Search Tabs ----
  document.querySelectorAll('.search-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.search-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // ---- Sidebar Accordion ----
  document.querySelectorAll('.filter-block-header').forEach(header => {
    header.addEventListener('click', () => {
      header.parentElement.classList.toggle('open');
    });
  });

  // ---- Comparison Bar ----
  const compBar = document.getElementById('comparisonBar');
  const compItems = document.getElementById('comparisonItems');
  const btnCompare = document.getElementById('btnCompare');

  function attachCompareListeners() {
    document.querySelectorAll('.vehicle-card-compare').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = parseInt(btn.dataset.id);
        const idx = compareState.indexOf(id);
        if (idx > -1) { compareState.splice(idx, 1); btn.classList.remove('selected'); }
        else if (compareState.length < 3) { compareState.push(id); btn.classList.add('selected'); }
        updateCompBar();
      });
    });
  }

  function updateCompBar() {
    if (compareState.length > 0) {
      compBar.classList.add('visible');
      compItems.innerHTML = compareState.map(id => {
        const v = vehicles.find(x => x.id === id);
        return `<div class="comparison-bar-item">${v.name} ${v.trim.split(' ')[0]}<span class="remove-compare" data-id="${id}">✕</span></div>`;
      }).join('');
      btnCompare.disabled = compareState.length < 2;
      compItems.querySelectorAll('.remove-compare').forEach(btn => {
        btn.addEventListener('click', () => {
          const rid = parseInt(btn.dataset.id);
          compareState.splice(compareState.indexOf(rid), 1);
          document.querySelectorAll(`.vehicle-card-compare[data-id="${rid}"]`).forEach(b => b.classList.remove('selected'));
          updateCompBar();
        });
      });
    } else {
      compBar.classList.remove('visible');
    }
  }

  // ---- Mobile Menu ----
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.mobile-menu-overlay');
  
  function toggleMenu() {
    const isOpen = mobileMenu.classList.toggle('open');
    overlay.classList.toggle('visible');
    hamburger.classList.toggle('active');
    
    // Travar scroll do fundo de forma robusta para mobile/iOS
    if (isOpen) {
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none'; // Evita scroll em telas touch
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
  }
  
  if (hamburger) hamburger.addEventListener('click', toggleMenu);
  
  if (overlay) {
    overlay.addEventListener('click', toggleMenu);
    // Bloqueia qualquer tentativa de scroll ou arraste invisível na área do overlay
    overlay.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });
  }

  // ---- LEAD MODAL LOGIC (Global) ----
  const leadModal = document.getElementById('leadModal');
  const closeLeadBtn = document.getElementById('closeLeadModal');
  const leadForm = document.getElementById('leadForm');
  if (leadModal && leadForm) {
      const tradeRadios = document.querySelectorAll('input[name="hasTrade"]');
      const tradeDetails = document.getElementById('tradeDetails');

      function closeModal() {
        leadModal.classList.remove('visible');
        document.body.style.overflow = '';
      }

      if (closeLeadBtn) closeLeadBtn.addEventListener('click', closeModal);
      leadModal.addEventListener('click', (e) => { if (e.target === leadModal) closeModal(); });

      tradeRadios.forEach(r => {
        r.addEventListener('change', () => {
          tradeDetails.style.display = (r.value === 'Sim') ? 'block' : 'none';
        });
      });

      leadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('leadName').value;
        const phone = document.getElementById('leadPhone').value;
        const type = document.querySelector('input[name="vType"]:checked').value;
        const payment = document.querySelector('input[name="payMethod"]:checked').value;
        const when = document.querySelector('input[name="whenBuy"]:checked').value;
        const hasTrade = document.querySelector('input[name="hasTrade"]:checked').value;
        const tradeTxt = tradeDetails.value;

        const fullMsg = `📋 *Formulário de Interesse*\n\n` +
                        `👤 *Nome:* ${name}\n` +
                        `📱 *Zap:* ${phone}\n` +
                        `🔹 *Tipo:* ${type}\n` +
                        `💰 *Pagamento:* ${payment}\n` +
                        `📅 *Quando:* ${when}\n` +
                        `🔄 *Troca:* ${hasTrade}${hasTrade === 'Sim' ? ' (' + tradeTxt + ')' : ''}`;

        const waCleanPhone = '5511999999999';
        window.open(`https://wa.me/${waCleanPhone}?text=${encodeURIComponent(fullMsg)}`, '_blank');
        closeModal();
      });
  }

  // ---- Scroll Animations ----
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('animate-in'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.deal-card, .service-item').forEach(el => obs.observe(el));
});
