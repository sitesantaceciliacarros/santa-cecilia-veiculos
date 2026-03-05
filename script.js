/* ========================================
   SANTA CECÍLIA VEÍCULOS — Script
   ======================================== */
document.addEventListener('DOMContentLoaded', () => {

  // ---- Supabase Config ----
  const SUPABASE_URL = 'https://hmqucnhanrgjxfenjzaz.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcXVjbmhhbnJnanhmZW5qemF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNDAyMjIsImV4cCI6MjA4NzcxNjIyMn0.TmykuoD93fGNaHslx7Pubf8ZnYyBvb3VB28rrdiu5WU';
  const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
          <div class="vehicle-card-installment">ou <strong>${v.installment}/mês</strong></div>
          <div class="vehicle-card-actions">
            <a href="veiculo.html?id=${v.id}" class="btn-card btn-card-primary">Ver detalhes</a>
            <a href="https://wa.me/5511999999999?text=Ol%C3%A1%2C%20tenho%20interesse%20no%20${encodeURIComponent(v.name)}." target="_blank" class="btn-card btn-card-whatsapp"><svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.955 9.955 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.66 0-3.203-.51-4.484-1.375l-.3-.188-3.091.918.918-3.091-.188-.3A7.962 7.962 0 014 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/></svg>WhatsApp</a>
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
    mobileMenu.classList.toggle('open');
    overlay.classList.toggle('visible');
    hamburger.classList.toggle('active');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  }
  if (hamburger) hamburger.addEventListener('click', toggleMenu);
  if (overlay) overlay.addEventListener('click', toggleMenu);

  // ---- Scroll Animations ----
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('animate-in'); obs.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.deal-card, .service-item').forEach(el => obs.observe(el));
});
