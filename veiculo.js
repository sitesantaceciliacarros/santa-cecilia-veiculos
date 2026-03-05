document.addEventListener('DOMContentLoaded', () => {

  // ---- Supabase Config ----
  const SUPABASE_URL = 'https://hmqucnhanrgjxfenjzaz.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcXVjbmhhbnJnanhmZW5qemF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNDAyMjIsImV4cCI6MjA4NzcxNjIyMn0.TmykuoD93fGNaHslx7Pubf8ZnYyBvb3VB28rrdiu5WU';
  const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // Parse ID from URL
  const params = new URLSearchParams(window.location.search);
  const vId = params.get('id');

  if (!vId) {
    window.location.href = '/';
    return;
  }

  fetchVehicleData(vId);

  async function fetchVehicleData(id) {
    // ---- Mock/Demo Mode for BMW iX Simulation ----
    if (id === 'bmw-ix') {
      const mockVehicle = {
        id: 'bmw-ix',
        name: "BMW iX",
        trim: "ELÉTRICO XDRIVE50 SPORT",
        price: 889990,
        year: 2024,
        km: 0,
        fuel: "Elétrico",
        trans: "Automática",
        type: "SUV",
        img: "https://image.webmotors.com.br/_fotos/anunciousados/gigante/2026/202602/20260226/bmw-ix-eletrico-xdrive50-sport-wmimagem13052135373.jpg?s=fill&w=1200",
        images: [
            "https://image.webmotors.com.br/_fotos/anunciousados/gigante/2026/202602/20260226/bmw-ix-eletrico-xdrive50-sport-wmimagem13052135373.jpg?s=fill&w=1920&h=1440&q=100",
            "https://image.webmotors.com.br/_fotos/anunciousados/gigante/2026/202602/20260226/bmw-ix-eletrico-xdrive50-sport-wmimagem13073021913.jpg?s=fill&w=1920&h=1440&q=100",
            "https://image.webmotors.com.br/_fotos/anunciousados/gigante/2026/202602/20260226/bmw-ix-eletrico-xdrive50-sport-wmimagem13092349320.jpg?s=fill&w=1920&h=1440&q=100",
            "https://image.webmotors.com.br/_fotos/anunciousados/gigante/2026/202602/20260226/bmw-ix-eletrico-xdrive50-sport-wmimagem13112321871.jpg?s=fill&w=1920&h=1440&q=100",
            "https://image.webmotors.com.br/_fotos/anunciousados/gigante/2026/202602/20260226/bmw-ix-eletrico-xdrive50-sport-wmimagem13132297988.jpg?s=fill&w=1920&h=1440&q=100"
        ],
        tag: "OFERTA",
        badge: "Oferta Destaque",
        installment: "R$ 12.990"
      };
      renderVehicleDetails(mockVehicle);
      return;
    }

    try {
      const { data, error } = await _supabase.from('vehicles').select('*').eq('id', id).single();
      if (error || !data) throw new Error('Veículo não encontrado');
      renderVehicleDetails(data);
    } catch (err) {
      console.error(err);
      document.querySelector('.vd-container').innerHTML = '<h2>Veículo não encontrado.</h2>';
    }
  }

  function renderVehicleDetails(v) {
    // Fill Text
    document.getElementById('vName').textContent = v.name;
    document.getElementById('vTrim').textContent = v.trim;
    document.getElementById('vYear').textContent = v.year;
    document.getElementById('vKm').textContent = v.km === 0 ? 'Zero KM' : v.km.toLocaleString('pt-BR') + ' km';
    document.getElementById('vTrans').textContent = v.trans;
    document.getElementById('vFuel').textContent = v.fuel;
    document.getElementById('vType').textContent = v.type || '--';
    document.getElementById('vPrice').textContent = 'R$ ' + v.price.toLocaleString('pt-BR');
    document.getElementById('vInstallment').textContent = v.installment || '--';
    document.getElementById('breadcrumbModel').textContent = v.name;
    document.title = `${v.name} - Santa Cecília Veículos`;

    // Carousel Logic
    const track = document.getElementById('carouselTrack');
    const images = (v.images && v.images.length > 0) ? v.images : [v.img];
    
    document.getElementById('totalIdx').textContent = images.length;

    track.innerHTML = images.map((img, idx) => `
      <div class="carousel-slide ${idx === 0 ? 'active' : ''}">
        <img src="${img}" alt="${v.name}">
      </div>
    `).join('');

    const slides = track.querySelectorAll('.carousel-slide');
    let currentIndex = 0;

    const updateCarousel = () => {
      const slideWidth = slides[0].offsetWidth;
      const gap = 10;
      const offset = currentIndex * (slideWidth + gap);
      track.style.transform = `translateX(-${offset}px)`;
      
      slides.forEach((s, i) => s.classList.toggle('active', i === currentIndex));
      document.getElementById('currentIdx').textContent = currentIndex + 1;
    };

    document.getElementById('nextBtn').addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % images.length;
      updateCarousel();
    });

    document.getElementById('prevBtn').addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateCarousel();
    });

    // Resize listener to fix transform on window change
    window.addEventListener('resize', updateCarousel);
    
    // Initial update
    setTimeout(updateCarousel, 100);
  }
});
