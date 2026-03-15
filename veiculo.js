document.addEventListener('DOMContentLoaded', () => {

  // Uses centralized supabase client from vault.js (window.sb)
  const _supabase = window.sb;

  if (!_supabase) {
    console.error("Database connection failed. Ensure vault.js is correctly loaded.");
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const vId = params.get('id');

  if (!vId) { window.location.href = '/'; return; }

  fetchVehicleData(vId);

  async function fetchVehicleData(id) {
    if (id === 'bmw-ix') {
      renderVehicleDetails({
        id: 'bmw-ix', name: "BMW iX", trim: "ELÉTRICO XDRIVE50 SPORT",
        price: 889990, year: 2024, km: 0, fuel: "Elétrico", trans: "Automática", type: "SUV",
        image_gallery: [
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
    document.title = `${v.name} - Santa Cecilia Veículos`;

    // Fetch related vehicles
    fetchRelatedVehicles(v.id);


    // ---- FEATURE PILLS (com ícones) ----
    const featuresContainer = document.getElementById('vFeatures');
    if (featuresContainer) {
      const featureIcons = {
        'ar-condicionado': '<svg viewBox="0 0 24 24"><path d="M22 11h-4.17l3.24-3.24-1.41-1.42L15 11h-2V9l4.66-4.66-1.42-1.41L13 6.17V2h-2v4.17L7.76 2.93 6.34 4.34 11 9v2H9L4.34 6.34 2.93 7.76 6.17 11H2v2h4.17l-3.24 3.24 1.41 1.42L9 13h2v2l-4.66 4.66 1.42 1.41L11 17.83V22h2v-4.17l3.24 3.24 1.42-1.41L13 15v-2h2l4.66 4.66 1.41-1.42L17.83 13H22z"/></svg>',
        'direção elétrica': '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-4h2v-2h2v-2h-2V8h-2v4H9v2h2z"/></svg>',
        'central multimídia': '<svg viewBox="0 0 24 24"><path d="M21 3H3c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H3V5h18v14zM9.5 13l2.5 3.01L14.5 13l2.5 3H7z"/></svg>',
        'câmera de ré': '<svg viewBox="0 0 24 24"><path d="M12 10.9c-.61 0-1.1.49-1.1 1.1s.49 1.1 1.1 1.1c.61 0 1.1-.49 1.1-1.1s-.49-1.1-1.1-1.1zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-1.25 0-2.43-.31-3.47-.85L12 16.09l3.47 3.06A7.94 7.94 0 0112 20z"/></svg>',
        'sensor estacionamento': '<svg viewBox="0 0 24 24"><path d="M1 11v10h6v-5h2v5h6V11L8 6z"/></svg>',
        'rodas de liga leve': '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/></svg>',
      };
      const defaultIcon = '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>';
      const features = ['Ar-condicionado', 'Direção Elétrica', 'Central Multimídia', 'Câmera de Ré', 'Sensor Estacionamento', 'Rodas de Liga Leve'];
      featuresContainer.innerHTML = features.map(f => {
        const icon = featureIcons[f.toLowerCase()] || defaultIcon;
        return `<span class="feature-pill">${icon} ${f}</span>`;
      }).join('');
    }

    // ---- FIPE BAR ----
    const fipeMarker = document.getElementById('fipeMarker');
    const fipeMarkerLabel = document.getElementById('fipeMarkerLabel');
    if (fipeMarker && v.price) {
      const position = Math.min(Math.max(Math.random() * 30 + 10, 5), 45);
      fipeMarker.style.left = position + '%';
      fipeMarkerLabel.textContent = 'R$ ' + v.price.toLocaleString('pt-BR');
    }

    // ---- FINANCING SIMULATOR ----
    const simCalcBtn = document.getElementById('simCalcBtn');
    const simEntrada = document.getElementById('simEntrada');
    const simParcelas = document.getElementById('simParcelas');
    if (simCalcBtn && v.price) {
      function calcInstallment() {
        const entradaStr = (simEntrada.value || '0').replace(/\D/g, '');
        const entrada = parseInt(entradaStr) || 0;
        const parcelas = parseInt(simParcelas.value) || 48;
        const taxa = 0.0179;
        const restante = Math.max(v.price - entrada, 0);
        const parcela = restante * (taxa * Math.pow(1 + taxa, parcelas)) / (Math.pow(1 + taxa, parcelas) - 1);
        const inst = document.getElementById('vInstallment');
        if (inst) inst.textContent = 'R$ ' + Math.round(parcela).toLocaleString('pt-BR');
      }
      simCalcBtn.addEventListener('click', calcInstallment);
      simParcelas.addEventListener('change', calcInstallment);
      calcInstallment();
    }

    // WhatsApp links
    const phone = '5594984419080';
    const msg = encodeURIComponent(`Olá! Tenho interesse no ${v.name} anunciado no site.`);
    const waUrl = `https://wa.me/${phone}?text=${msg}`;
    const btnWA = document.getElementById('btnWhatsapp');
    if (btnWA) btnWA.href = waUrl;

    // ---- OPEN LEAD MODAL FROM BUTTONS ----
    const mabContact = document.getElementById('mabContact');

    function openLeadModal(e) {
      if (e) e.preventDefault();
      const lm = document.getElementById('leadModal');
      if (lm) {
        lm.classList.add('visible');
        document.body.style.overflow = 'hidden';
      }
    }

    // Mobile "Enviar mensagem" button
    if (mabContact) {
      mabContact.addEventListener('click', openLeadModal);
    }
    // Desktop "Estou interessado" button
    if (btnWA) {
      btnWA.removeAttribute('href');
      btnWA.addEventListener('click', openLeadModal);
    }

    // ---- CAROUSEL ----
    const track = document.getElementById('carouselTrack');
    const dotsContainer = document.getElementById('carouselDots');
    const images = (v.image_gallery && v.image_gallery.length > 0) ? v.image_gallery : (v.img ? [v.img] : []);

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

    // ---- THUMBNAILS ----
    const thumbsContainer = document.getElementById('carouselThumbs');
    if (thumbsContainer) {
      thumbsContainer.innerHTML = images.map((img, i) =>
        `<div class="carousel-thumb ${i === 0 ? 'active' : ''}" data-idx="${i}"><img src="${img}" alt="Foto ${i+1}" loading="lazy"></div>`
      ).join('');
    }
    const thumbs = thumbsContainer ? thumbsContainer.querySelectorAll('.carousel-thumb') : [];

    function goToSlide(idx) {
      currentIndex = idx;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
      thumbs.forEach((t, i) => t.classList.toggle('active', i === currentIndex));
      document.getElementById('currentIdx').textContent = currentIndex + 1;
    }

    // Thumb clicks
    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => goToSlide(parseInt(thumb.dataset.idx)));
    });

    // Dots click
    dots.forEach(dot => {
      dot.addEventListener('click', () => goToSlide(parseInt(dot.dataset.idx)));
    });

    // Prev/Next
    const nextBtn = document.getElementById('nextBtn');
    const prevBtn = document.getElementById('prevBtn');
    if (images.length <= 1) {
      if (nextBtn) nextBtn.style.display = 'none';
      if (prevBtn) prevBtn.style.display = 'none';
      const counter = document.querySelector('.carousel-counter');
      if (counter) counter.style.display = 'none';
    } else {
      if (nextBtn) {
        nextBtn.style.display = 'flex';
        nextBtn.addEventListener('click', () => goToSlide((currentIndex + 1) % images.length));
      }
      if (prevBtn) {
        prevBtn.style.display = 'flex';
        prevBtn.addEventListener('click', () => goToSlide((currentIndex - 1 + images.length) % images.length));
      }
    }

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

    // ---- LEAD MODAL LOGIC ----
    const leadModal = document.getElementById('leadModal');
    const closeLeadBtn = document.getElementById('closeLeadModal');
    const leadForm = document.getElementById('leadForm');
    const tradeRadios = document.querySelectorAll('input[name="hasTrade"]');
    const tradeDetails = document.getElementById('tradeDetails');

    if (leadModal && leadForm) {
      function openModal() {
        leadModal.classList.add('visible');
        document.body.style.overflow = 'hidden';
      }

      function closeModal() {
        leadModal.classList.remove('visible');
        document.body.style.overflow = '';
      }

      if (closeLeadBtn) closeLeadBtn.addEventListener('click', closeModal);
      leadModal.addEventListener('click', (e) => { if (e.target === leadModal) closeModal(); });

      // Open by triggers
      const triggerParcelas = document.getElementById('btnVerParcelas');
      const triggerWhatsapp = document.getElementById('btnWhatsapp');
      const mabParcelas = document.querySelector('.mab-parcelas');
      const mabInterest = document.getElementById('mabInterest');
      
      if (triggerParcelas) triggerParcelas.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
      if (triggerWhatsapp) triggerWhatsapp.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
      if (mabParcelas) mabParcelas.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
      if (mabInterest) mabInterest.addEventListener('click', (e) => { e.preventDefault(); openModal(); });

      // Handle trade details visibility
      tradeRadios.forEach(r => {
        r.addEventListener('change', () => {
          if (tradeDetails) {
            tradeDetails.style.display = (r.value === 'Sim') ? 'block' : 'none';
            tradeDetails.required = (r.value === 'Sim');
          }
        });
      });

      // Form submission
      leadForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nameInput = document.getElementById('leadName');
        const phoneInput = document.getElementById('leadPhone');
        const vTypeChecked = document.querySelector('input[name="vType"]:checked');
        const payChecked = document.querySelector('input[name="payMethod"]:checked');
        const whenChecked = document.querySelector('input[name="whenBuy"]:checked');
        const tradeChecked = document.querySelector('input[name="hasTrade"]:checked');

        if (!nameInput || !phoneInput ) return;

        // Collect data
        const leadData = {
          name: nameInput.value,
          phone: phoneInput.value,
          vehicle_type: vTypeChecked?.value || '--',
          payment_method: payChecked?.value || '--',
          when_buy: whenChecked?.value || '--',
          has_trade: tradeChecked?.value || 'Não',
          trade_details: tradeChecked?.value === 'Sim' ? (tradeDetails?.value || '') : '',
          vehicle_interest: v.name,
          stage: 'lead'
        };

        // Save to Supabase (Background)
        if (window.sb) {
          window.sb.from('leads').insert([leadData]).then(({ error }) => {
            if (error) console.error("❌ Erro ao salvar lead no Supabase:", error.message);
            else console.log("✅ Lead salvo no CRM com sucesso.");
          });
        }
        
        // UI Feedback: Show Success State
        const formHeader = document.querySelector('.modal-header-form');
        const successHeader = document.querySelector('.modal-header-success');
        
        if (leadForm) leadForm.classList.add('success-hidden');
        if (formHeader) formHeader.style.display = 'none';
        if (successHeader) successHeader.style.display = 'block';

        const fullMsg = `📋 *Formulário de Interesse*\n\n` +
                        `🚗 *Veículo:* ${leadData.vehicle_interest}\n` +
                        `👤 *Nome:* ${leadData.name}\n` +
                        `📱 *Zap:* ${leadData.phone}\n` +
                        `🔹 *Tipo:* ${leadData.vehicle_type}\n` +
                        `💰 *Pagamento:* ${leadData.payment_method}\n` +
                        `📅 *Quando:* ${leadData.when_buy}\n` +
                        `🔄 *Troca:* ${leadData.has_trade}${leadData.has_trade === 'Sim' ? ' (' + leadData.trade_details + ')' : ''}`;

        const waCleanPhone = '5594984419080'; 
        
        // Wait 1.5 seconds then redirect
        setTimeout(() => {
          const waFinalUrl = `https://wa.me/${waCleanPhone}?text=${encodeURIComponent(fullMsg)}`;
          
          if (window.innerWidth <= 768) {
             window.location.assign(waFinalUrl);
          } else {
             window.open(waFinalUrl, '_blank');
          }
          
          // Reset Modal after transition
          setTimeout(() => {
            closeModal();
            // Reset state for next opening
            if (leadForm) leadForm.classList.remove('success-hidden');
            if (formHeader) formHeader.style.display = 'block';
            if (successHeader) successHeader.style.display = 'none';
            leadForm.reset();
          }, 1000);
        }, 1500);
      });
    }
  }

  async function fetchRelatedVehicles(currentId) {
    try {
      const { data, error } = await _supabase
        .from('vehicles')
        .select('id, name, trim, price, year, km, img')
        .neq('id', currentId)
        .limit(8);

      if (error) throw error;
      if (data) renderRelatedGrid(data);
    } catch (err) {
      console.error("Error fetching related vehicles:", err);
    }
  }

  function renderRelatedGrid(vehicles) {
    const grid = document.getElementById('relatedGrid');
    if (!grid) return;

    grid.innerHTML = vehicles.map(v => `
      <a href="veiculo.html?id=${v.id}" class="card-suggestion">
        <div class="cs-img">
          <img src="${v.img}" alt="${v.name}" loading="lazy">
        </div>
        <div class="cs-content">
          <div class="cs-title">${v.name}</div>
          <div class="cs-trim">${v.trim || ''}</div>
          <div class="cs-price">R$ ${v.price ? v.price.toLocaleString('pt-BR') : '0'}</div>
          <div class="cs-footer">
            <span>${v.year || ''}</span>
            <span>${v.km ? v.km.toLocaleString('pt-BR') + ' KM' : '0 KM'}</span>
          </div>
          <div class="cs-footer" style="margin-top: 8px; border-top:none; padding-top:0;">
             <span style="display:flex; align-items:center; gap:4px;">
                <svg viewBox="0 0 24 24" style="width:12px;height:12px;fill:currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
                São Paulo - SP
             </span>
          </div>
        </div>
      </a>
    `).join('');
  }

  // ---- SCROLL ANIMATIONS ----
  const fadeEls = document.querySelectorAll('.anim-fade');
  if (fadeEls.length > 0) {
    const scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          scrollObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    fadeEls.forEach(el => scrollObserver.observe(el));
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
