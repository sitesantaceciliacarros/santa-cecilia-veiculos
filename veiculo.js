document.addEventListener('DOMContentLoaded', () => {

  // ---- Supabase Config ----
  const SUPABASE_URL = 'https://hmqucnhanrgjxfenjzaz.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcXVjbmhhbnJnanhmZW5qemF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNDAyMjIsImV4cCI6MjA4NzcxNjIyMn0.TmykuoD93fGNaHslx7Pubf8ZnYyBvb3VB28rrdiu5WU';
  const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  const params = new URLSearchParams(window.location.search);
  const vId = params.get('id');

  if (!vId) { window.location.href = '/'; return; }

  fetchVehicleData(vId);

  async function fetchVehicleData(id) {
    if (id === 'bmw-ix') {
      renderVehicleDetails({
        id: 'bmw-ix', name: "BMW iX", trim: "ELÉTRICO XDRIVE50 SPORT",
        price: 889990, year: 2024, km: 0, fuel: "Elétrico", trans: "Automática", type: "SUV",
        images: [
          "https://image.webmotors.com.br/_fotos/anunciousados/gigante/2026/202602/20260226/bmw-ix-eletrico-xdrive50-sport-wmimagem13052135373.jpg?s=fill&w=1920&h=1440&q=100",
          "https://image.webmotors.com.br/_fotos/anunciousados/gigante/2026/202602/20260226/bmw-ix-eletrico-xdrive50-sport-wmimagem13073021913.jpg?s=fill&w=1920&h=1440&q=100",
          "https://image.webmotors.com.br/_fotos/anunciousados/gigante/2026/202602/20260226/bmw-ix-eletrico-xdrive50-sport-wmimagem13092349320.jpg?s=fill&w=1920&h=1440&q=100",
          "https://image.webmotors.com.br/_fotos/anunciousados/gigante/2026/202602/20260226/bmw-ix-eletrico-xdrive50-sport-wmimagem13112321871.jpg?s=fill&w=1920&h=1440&q=100",
          "https://image.webmotors.com.br/_fotos/anunciousados/gigante/2026/202602/20260226/bmw-ix-eletrico-xdrive50-sport-wmimagem13132297988.jpg?s=fill&w=1920&h=1440&q=100"
        ],
        badge: "Oferta Destaque", installment: "R$ 12.990",
        description: "Veículo em excelente estado. Único dono, todas as revisões na concessionária. Manual e chave reserva. IPVA pago.",
        color: "Preto", plate: "3"
      });
      return;
    }
    try {
      const { data, error } = await _supabase.from('vehicles').select('*').eq('id', id).single();
      if (error || !data) throw new Error('Veículo não encontrado');
      renderVehicleDetails(data);
    } catch (err) {
      console.error(err);
      document.querySelector('.vd-container').innerHTML = '<h2 style="padding:40px;text-align:center;">Veículo não encontrado.</h2>';
    }
  }

  function renderVehicleDetails(v) {
    // Title with model highlight
    const titleEl = document.getElementById('vName');
    const nameParts = v.name.split(' ');
    if (nameParts.length > 1) {
      titleEl.innerHTML = nameParts[0] + ' <span class="model-highlight">' + nameParts.slice(1).join(' ') + '</span>';
    } else {
      titleEl.textContent = v.name;
    }

    document.getElementById('vTrim').textContent = v.trim || '';
    document.getElementById('vYear').textContent = v.year || '--';
    document.getElementById('vKm').textContent = v.km === 0 ? '0' : (v.km ? v.km.toLocaleString('pt-BR') : '--');
    document.getElementById('vTrans').textContent = v.trans || '--';
    document.getElementById('vFuel').textContent = v.fuel || '--';
    document.getElementById('vType').textContent = v.type || '--';
    document.getElementById('vColor').textContent = v.color || '--';
    document.getElementById('vPlate').textContent = v.plate || '--';

    // Price
    const priceFormatted = v.price ? v.price.toLocaleString('pt-BR') : '0';
    document.getElementById('vPrice').textContent = priceFormatted;
    const desktopPrice = document.getElementById('vPriceDesktop');
    if (desktopPrice) desktopPrice.textContent = 'R$ ' + priceFormatted;

    // Installment
    const inst = document.getElementById('vInstallment');
    if (inst) inst.textContent = v.installment || '--';

    // Description
    document.getElementById('vDesc').textContent = v.description || 'Veículo em excelente estado de conservação.';

    // Breadcrumb
    document.getElementById('breadcrumbModel').textContent = v.name;
    document.title = `${v.name} - Santa Cecília Veículos`;

    // WhatsApp links
    const phone = '5511999999999';
    const msg = encodeURIComponent(`Olá! Tenho interesse no ${v.name} anunciado no site.`);
    const waUrl = `https://wa.me/${phone}?text=${msg}`;
    const btnWA = document.getElementById('btnWhatsapp');
    if (btnWA) btnWA.href = waUrl;
    const mabWA = document.getElementById('mabWhatsapp');
    if (mabWA) mabWA.href = waUrl;

    // ---- CAROUSEL ----
    const track = document.getElementById('carouselTrack');
    const dotsContainer = document.getElementById('carouselDots');
    const images = (v.images && v.images.length > 0) ? v.images : (v.img ? [v.img] : []);

    if (images.length === 0) {
      track.innerHTML = '<div class="carousel-slide"><div style="display:flex;align-items:center;justify-content:center;height:100%;color:#999;">Sem imagens</div></div>';
      return;
    }

    document.getElementById('totalIdx').textContent = images.length;

    track.innerHTML = images.map((img, idx) =>
      `<div class="carousel-slide"><img src="${img}" alt="${v.name}" loading="${idx === 0 ? 'eager' : 'lazy'}"></div>`
    ).join('');

    // Create dots
    dotsContainer.innerHTML = images.map((_, i) =>
      `<button class="dot ${i === 0 ? 'active' : ''}" data-idx="${i}"></button>`
    ).join('');

    let currentIndex = 0;
    const slides = track.querySelectorAll('.carousel-slide');
    const dots = dotsContainer.querySelectorAll('.dot');

    function goToSlide(idx) {
      currentIndex = idx;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
      document.getElementById('currentIdx').textContent = currentIndex + 1;
    }

    // Dots click
    dots.forEach(dot => {
      dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.idx)));
    });

    // Prev/Next
    document.getElementById('nextBtn').addEventListener('click', () => {
      goToSlide((currentIndex + 1) % images.length);
    });
    document.getElementById('prevBtn').addEventListener('click', () => {
      goToSlide((currentIndex - 1 + images.length) % images.length);
    });

    // Touch/Swipe
    let startX = 0, startY = 0, isDragging = false;
    const carousel = document.getElementById('vehicleCarousel');

    carousel.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isDragging = true;
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const diffX = startX - endX;
      const diffY = Math.abs(startY - endY);

      if (Math.abs(diffX) > 50 && diffY < 100) {
        if (diffX > 0 && currentIndex < images.length - 1) {
          goToSlide(currentIndex + 1);
        } else if (diffX < 0 && currentIndex > 0) {
          goToSlide(currentIndex - 1);
        }
      }
    }, { passive: true });

    // Resize
    window.addEventListener('resize', () => goToSlide(currentIndex));
    setTimeout(() => goToSlide(0), 100);


  }

  // ---- Mobile menu ----
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');
  const overlay = document.querySelector('.mobile-menu-overlay');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      overlay.classList.toggle('visible');
    });
    overlay.addEventListener('click', () => {
      hamburger.classList.remove('active');
      mobileMenu.classList.remove('open');
      overlay.classList.remove('visible');
    });
  }
});
