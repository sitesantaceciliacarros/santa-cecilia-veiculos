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

  // ---- Vehicle Type Tabs Logic (Carros / Motos) ----
  const typeTabs = document.querySelectorAll('.type-tab');
  typeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      typeTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filterType = tab.dataset.type;
      
      let filtered = vehicles;
      if (filterType === 'car') {
        filtered = vehicles.filter(v => (v.type || '').toLowerCase() !== 'moto');
      } else if (filterType === 'moto') {
        filtered = vehicles.filter(v => (v.type || '').toLowerCase() === 'moto');
      }
      
      renderCards(filtered);
      updateListingHeader(filtered.length);
    });
  });

  function updateListingHeader(count) {
    const countEl = document.querySelector('.listing-count span');
    if (countEl) countEl.textContent = count;
  }

  // ---- Render Cards ----
  function renderCards(list) {
    if (!grid) return;
    updateListingHeader(list.length);

    grid.innerHTML = list.map(v => {
      const isMoto = (v.type || '').toLowerCase() === 'moto';
      const badgeHTML = v.badge ? `<div class="vehicle-card-badges"><span class="badge badge-${v.badge}">${v.tag || v.badge}</span></div>` : '';
      const isSelected = compareState.includes(v.id);
      const kmText = v.km === 0 ? 'Zero KM' : v.km.toLocaleString('pt-BR') + ' km';
      
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
            <span class="spec-tag">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              ${kmText}
            </span>
            <span class="spec-tag">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              ${v.trans}
            </span>
          </div>

          <div class="vehicle-card-price-row">
            <div class="vehicle-card-price">R$ ${v.price.toLocaleString('pt-BR')}</div>
          </div>
          
          <div class="vehicle-card-installment">
            Financiamento em até <strong>60x</strong>
          </div>

          <div class="vehicle-card-actions">
            <a href="veiculo.html?id=${v.id}" class="btn-card btn-card-primary">Ver Detalhes</a>
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
      
      let filtered = vehicles;
      if (text.includes('suv')) filtered = vehicles.filter(v => (v.type || '').toLowerCase() === 'suv');
      else if (text.includes('hatch')) filtered = vehicles.filter(v => (v.type || '').toLowerCase() === 'hatch');
      else if (text.includes('híbrido')) filtered = vehicles.filter(v => v.fuel === 'Híbrido');
      else if (text.includes('automático')) filtered = vehicles.filter(v => v.trans === 'Automático');
      else if (text.includes('100k')) filtered = vehicles.filter(v => v.price <= 100000);
      
      renderCards(filtered);
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
