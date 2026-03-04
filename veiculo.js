document.addEventListener('DOMContentLoaded', () => {

  // ---- Supabase Config ----
  const SUPABASE_URL = 'https://hmqucnhanrgjxfenjzaz.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcXVjbmhhbnJnanhmZW5qemF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNDAyMjIsImV4cCI6MjA4NzcxNjIyMn0.TmykuoD93fGNaHslx7Pubf8ZnYyBvb3VB28rrdiu5WU';
  const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // Parse ID from URL
  const params = new URLSearchParams(window.location.search);
  const vId = params.get('id');

  if (!vId) {
    document.querySelector('.vd-container').innerHTML = '<div style="color:#fff; padding:40px; text-align:center;"><h3>Veículo não encontrado ou ID inválido.</h3><a href="/" class="vd-btn vd-btn-primary" style="display:inline-block; margin-top:20px; width:auto; text-decoration:none;">Voltar para o Início</a></div>';
    return;
  }

  fetchVehicleData(vId);

  async function fetchVehicleData(id) {
    try {
      const { data, error } = await _supabase
        .from('vehicles')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error || !data) {
        throw new Error('Vehicle not found');
      }

      renderVehicleDetails(data);
    } catch (err) {
      console.error(err);
      document.querySelector('.vd-container').innerHTML = '<div style="color:#fff; padding:40px; text-align:center;"><h3>Erro ao carregar o veículo. Ele pode ter sido removido.</h3><a href="/" class="vd-btn vd-btn-primary" style="display:inline-block; margin-top:20px; width:auto; text-decoration:none;">Voltar para o Início</a></div>';
    }
  }

  function renderVehicleDetails(v) {
    // Populate Carousel
    const track = document.getElementById('carouselTrack');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const currentIdxEl = document.getElementById('currentIdx');
    const totalIdxEl = document.getElementById('totalIdx');
    
    // Images array logic
    const images = (v.images && v.images.length > 0) ? v.images : (v.img ? [v.img] : []);
    
    if (track && images.length > 0) {
      track.innerHTML = images.map((imgUrl, idx) => `
        <div class="carousel-slide ${idx === 0 ? 'active' : ''}">
          <img src="${imgUrl}" alt="${v.name}" loading="lazy">
        </div>
      `).join('');
      
      totalIdxEl.textContent = images.length;
      
      let currentIndex = 0;
      const slides = track.querySelectorAll('.carousel-slide');
      
      const updateCarousel = () => {
        // Calculation for Panorama centering:
        // Slides are 70%, Gap is 10px. 
        // We moved by percentage of slide width? 
        // Better: use direct transform based on slide index.
        const slideWidth = slides[0].offsetWidth;
        const gap = 10;
        const offset = currentIndex * (slideWidth + gap);
        
        track.style.transform = `translateX(-${offset}px)`;
        currentIdxEl.textContent = currentIndex + 1;
        
        // Update active class for focus effect
        slides.forEach((s, idx) => {
          if (idx === currentIndex) s.classList.add('active');
          else s.classList.remove('active');
        });

        // Hide buttons if only 1 image
        if (images.length <= 1) {
          prevBtn.style.display = 'none';
          nextBtn.style.display = 'none';
          document.querySelector('.carousel-counter').style.display = 'none';
        } else {
          prevBtn.style.display = 'flex';
          nextBtn.style.display = 'flex';
          document.querySelector('.carousel-counter').style.display = 'block';
        }
      };

      prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : images.length - 1;
        updateCarousel();
      });

      nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex < images.length - 1) ? currentIndex + 1 : 0;
        updateCarousel();
      });

      // Window resize adjustment
      window.addEventListener('resize', updateCarousel);

      // Keyboard navigation
      document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') prevBtn.click();
        if (e.key === 'ArrowRight') nextBtn.click();
      });

      // Initial state
      setTimeout(updateCarousel, 100); // Small delay to ensuring offsetWidth is ready
    } else if (track) {
      track.innerHTML = '<div class="carousel-slide active"><span>Sem imagem disponível</span></div>';
    }

    // Header Info (Overlay Card)
    document.title = `${v.name} - Santa Cecília Veículos`;
    document.getElementById('detailName').textContent = v.name;
    document.getElementById('detailTrim').textContent = v.trim || 'Versão não informada';
    
    // Badge
    const badgeEl = document.getElementById('detailBadge');
    if (v.tag) {
      badgeEl.textContent = v.tag;
      badgeEl.style.display = 'block';
      if (v.badge) {
         // Map database badge colors if needed, but defaults to 'offer' (red)
      }
    } else {
      badgeEl.style.display = 'none';
    }

    // Favorite Button Toggle
    const favBtn = document.querySelector('.vd-favorite-btn');
    if (favBtn) {
      favBtn.addEventListener('click', () => {
        favBtn.classList.toggle('active');
      });
    }

    // Specs
    document.getElementById('detailYear').textContent = v.year;
    const kmText = v.km === 0 ? '0 km' : (v.km || 0).toLocaleString('pt-BR') + ' km';
    document.getElementById('detailKm').textContent = kmText;
    document.getElementById('detailFuel').textContent = v.fuel || '-';
    document.getElementById('detailTrans').textContent = v.trans || '-';
    document.getElementById('detailType').textContent = v.type || '-';

    // Prices
    document.getElementById('detailPrice').textContent = `R$ ${(v.price || 0).toLocaleString('pt-BR')}`;
    const installmentEl = document.getElementById('detailInstallment');
    if (installmentEl && v.installment) {
      installmentEl.textContent = v.installment + '/mês';
    } else if (installmentEl) {
       installmentEl.parentElement.style.display = 'none';
    }
    
    // Setup WhatsApp Button
    const wppBtn = document.querySelector('.vd-btn-whatsapp');
    if (wppBtn) {
        wppBtn.addEventListener('click', () => {
             const phoneNumber = '5511999999999'; // Replace with actual shop number
             const message = `Olá! Gostaria de mais informações sobre o veículo ${v.name} (${v.year}), listado por R$ ${(v.price || 0).toLocaleString('pt-BR')}. Vi no site.`;
             const waLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
             window.open(waLink, '_blank');
        });
    }
  }

  // Mobile Menu handling (same as index.js so it works here)
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
});
