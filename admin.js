document.addEventListener('DOMContentLoaded', async () => {
  // Uses centralized supabase client from vault.js (window.sb)
  const supabase = window.sb;

  if (!supabase) {
    console.error("Supabase client not found. Ensure vault.js is loaded.");
    return;
  }

  // 1. Auth Check - RESTORED SECURITY
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = 'acesso-scv-9f82.html';
    return;
  }

  // 2. Tabs Navigation
  document.querySelectorAll('nav.admin-nav a[data-target]').forEach(link => {
    link.addEventListener('click', (e) => {
      document.querySelectorAll('nav.admin-nav a').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
      document.getElementById(link.dataset.target).classList.add('active');
    });
  });

  // 3. Logout
  document.getElementById('btnSair').addEventListener('click', async () => {
    await supabase.auth.signOut();
    window.location.href = 'acesso-scv-9f82.html';
  });

  // ---- TOAST SYSTEM ----
  function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    let icon = '🔔';
    if(type === 'success') icon = '✅';
    if(type === 'error') icon = '❌';

    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
  window.showToast = showToast; // Global access

  // 4. Load Inventories (Carros and Motos)
  const vehicleTableBody = document.getElementById('vehicleTableBody');
  const motosTableBody = document.getElementById('motosTableBody');
  let vehiclesList = [];
  let motosList = [];

  async function loadInventories() {
    // ... Carros/Motos loading logic (kept same as original)
    vehicleTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: rgba(255,255,255,0.3); padding: 40px;">Carregando...</td></tr>';
    motosTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: rgba(255,255,255,0.3); padding: 40px;">Carregando...</td></tr>';

    const { data: allVehicles, error } = await supabase.from('vehicles').select('*').order('id', { ascending: false });
    
    if (error) {
      console.error(error);
      const errorMsg = '<tr><td colspan="5" style="text-align:center; color:#ff4d4d; padding: 40px;">Erro ao carregar dados.</td></tr>';
      vehicleTableBody.innerHTML = errorMsg;
      motosTableBody.innerHTML = errorMsg;
      return;
    }
    
    vehiclesList = allVehicles.filter(v => (v.type || '').toLowerCase() !== 'moto');
    motosList = allVehicles.filter(v => (v.type || '').toLowerCase() === 'moto');

    renderTable(vehicleTableBody, vehiclesList, "Nenhum carro encontrado. Clique em '+ Novo Carro'!");
    renderTable(motosTableBody, motosList, "Nenhuma moto encontrada. Clique em '+ Nova Moto'!");

    updateStats(vehiclesList, 'statTotal', 'statAvgPrice', 'statLastAdded');
    updateStats(motosList, 'statTotalMotos', 'statAvgPriceMotos', 'statLastAddedMotos');
  }

  // ---- CRM LOGIC ----
  const stageLists = {
    'lead': document.getElementById('list-lead'),
    'nao-qualificado': document.getElementById('list-nao-qualificado'),
    'qualificado': document.getElementById('list-qualificado'),
    'contato': document.getElementById('list-contato'),
    'compro': document.getElementById('list-compro'),
    'nao-compro': document.getElementById('list-nao-compro')
  };

  const stageCounts = {
    'lead': document.getElementById('count-lead'),
    'nao-qualificado': document.getElementById('count-nao-qualificado'),
    'qualificado': document.getElementById('count-qualificado'),
    'contato': document.getElementById('count-contato'),
    'compro': document.getElementById('count-compro'),
    'nao-compro': document.getElementById('count-nao-compro')
  };
  let allLeads = []; // Global lead cache for filtering

  async function loadLeads() {
    // Clear lists and show loading
    Object.values(stageLists).forEach(list => { 
      if(list) list.innerHTML = '<div class="empty-column-msg">Carregando...</div>'; 
    });

    const { data: leads, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });

    if (error) {
      showToast("Erro ao carregar leads: " + error.message, 'error');
      return;
    }

    allLeads = leads;
    updateCrmStats(leads);
    renderCrmBoard(leads);
  }
  window.loadLeads = loadLeads;

  function updateCrmStats(leads) {
    const total = leads.length;
    const today = leads.filter(l => new Date(l.created_at).toDateString() === new Date().toDateString()).length;
    const pending = leads.filter(l => l.stage === 'lead').length;

    if (document.getElementById('crm-stat-total')) document.getElementById('crm-stat-total').textContent = total;
    if (document.getElementById('crm-stat-today')) document.getElementById('crm-stat-today').textContent = today;
    if (document.getElementById('crm-stat-pending')) document.getElementById('crm-stat-pending').textContent = pending;
  }

  function renderCrmBoard(leadsToRender) {
    // Clear lists
    Object.values(stageLists).forEach(list => { if(list) list.innerHTML = ''; });

    const counts = { 'lead':0, 'nao-qualificado':0, 'qualificado':0, 'contato':0, 'compro':0, 'nao-compro':0 };

    leadsToRender.forEach(lead => {
      const stage = lead.stage || 'lead';
      const listEl = stageLists[stage];
      if (listEl) {
        listEl.innerHTML += renderLeadCard(lead);
        counts[stage]++;
      }
    });

    // Update counts on column headers
    Object.keys(stageCounts).forEach(s => { if(stageCounts[s]) stageCounts[s].textContent = counts[s]; });

    // Show empty message if no leads in column
    Object.values(stageLists).forEach(list => {
      if(list && list.children.length === 0) {
        list.innerHTML = '<div class="empty-column-msg">Vazio</div>';
      }
    });
  }

  function handleCrmSearch(term) {
    const cleanTerm = term.toLowerCase().trim();
    if (!cleanTerm) {
      renderCrmBoard(allLeads);
      return;
    }

    const filtered = allLeads.filter(l => 
      l.name.toLowerCase().includes(cleanTerm) || 
      (l.phone || '').includes(cleanTerm) ||
      (l.vehicle_interest || '').toLowerCase().includes(cleanTerm)
    );
    renderCrmBoard(filtered);
  }
  window.handleCrmSearch = handleCrmSearch;

  function getRelativeTime(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInSeconds = Math.floor((now - then) / 1000);

    if (diffInSeconds < 60) return 'Agora';
    if (diffInSeconds < 3600) return `Há ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `Há ${Math.floor(diffInSeconds / 3600)} h`;
    return then.toLocaleDateString('pt-BR');
  }

  function renderLeadCard(lead) {
    const timeAgo = getRelativeTime(lead.created_at);
    const waPhone = (lead.phone || '').replace(/\D/g, '');
    const waLink = `https://wa.me/55${waPhone}`;
    const isNew = (new Date() - new Date(lead.created_at)) < 1800000; // 30 min

    return `
      <div class="lead-card ${isNew ? 'new-pulse' : ''}" data-id="${lead.id}">
        <div class="lead-date">
          <span style="opacity: 0.6;">#${lead.id.toString().slice(-4)}</span>
          <span style="color: var(--color-brand-blue); font-weight: 800;">${timeAgo}</span>
        </div>
        <div class="lead-name">${lead.name}</div>
        <div class="lead-info">
          <a href="tel:${lead.phone}" style="color:rgba(255,255,255,0.7); text-decoration:none; display:flex; align-items:center; gap:6px;">
            <span style="opacity:0.5;">📞</span> ${lead.phone}
          </a>
          ${lead.vehicle_interest ? `<div class="lead-tag"><span>🚗</span> ${lead.vehicle_interest}</div>` : ''}
          <div style="margin-top:10px; font-size:10px; font-weight:700; color:rgba(255,255,255,0.3); border-top:1px solid rgba(255,255,255,0.03); padding-top:10px; display:flex; justify-content:space-between;">
             <div>${lead.payment_method.toUpperCase()}</div>
             <div style="color:rgba(255,255,255,0.5);">${lead.when_buy.toUpperCase()}</div>
          </div>
        </div>
        <div class="lead-actions">
          <select class="stage-select" onchange="updateLeadStage('${lead.id}', this.value)">
            <option value="lead" ${lead.stage === 'lead' ? 'selected' : ''}>LEAD</option>
            <option value="nao-qualificado" ${lead.stage === 'nao-qualificado' ? 'selected' : ''}>NÃO QUALIF.</option>
            <option value="qualificado" ${lead.stage === 'qualificado' ? 'selected' : ''}>QUALIFICADO</option>
            <option value="contato" ${lead.stage === 'contato' ? 'selected' : ''}>CONTATO</option>
            <option value="compro" ${lead.stage === 'compro' ? 'selected' : ''}>COMPRO</option>
            <option value="nao-compro" ${lead.stage === 'nao-compro' ? 'selected' : ''}>NÃO COMPRO</option>
          </select>
          <a href="${waLink}" target="_blank" class="btn-wa-lead" title="WhatsApp">
             <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.431 5.63 1.432h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          </a>
        </div>
      </div>
    `;
  }


  async function updateLeadStage(id, newStage) {
    const { error } = await supabase.from('leads').update({ stage: newStage }).eq('id', id);
    if (error) {
      showToast("Erro ao mover lead: " + error.message, 'error');
    } else {
      showToast("Lead movido com sucesso!");
      loadLeads(); // Refresh board
    }
  }
  window.updateLeadStage = updateLeadStage;

  // Modify Tab Click to support CRM loading
  document.querySelectorAll('nav.admin-nav a[data-target]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = link.dataset.target;
      document.querySelectorAll('nav.admin-nav a').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
      document.getElementById(target).classList.add('active');
      
      if (target === 'tab-crm') loadLeads();
    });
  });

  function renderTable(container, list, emptyMsg) {
    if (list.length === 0) {
      container.innerHTML = `<tr><td colspan="5" style="text-align:center; color: rgba(255,255,255,0.3); padding: 40px;">${emptyMsg}</td></tr>`;
      return;
    }

    container.innerHTML = list.map(v => `
      <tr>
        <td><img src="${v.img}" alt="${v.name}"/></td>
        <td>
          <strong>${v.name}</strong>
          <span>${v.trim}</span>
        </td>
        <td>${v.year}</td>
        <td>R$ ${v.price.toLocaleString('pt-BR')}</td>
        <td>
          <div class="action-links">
            <a onclick="editVehicle(${v.id})">Editar</a>
            <a class="delete" onclick="deleteVehicle(${v.id})">Excluir</a>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function updateStats(list, totalId, avgId, lastId) {
    const elTotal = document.getElementById(totalId);
    const elAvg = document.getElementById(avgId);
    const elLast = document.getElementById(lastId);

    if (elTotal) elTotal.textContent = list.length;

    if (list.length > 0) {
      const avg = list.reduce((sum, v) => sum + (v.price || 0), 0) / list.length;
      if (elAvg) elAvg.textContent = 'R$ ' + Math.round(avg).toLocaleString('pt-BR');
      if (elLast) elLast.textContent = list[0].name || '—';
    } else {
      if (elAvg) elAvg.textContent = '—';
      if (elLast) elLast.textContent = '—';
    }
  }

  await loadInventories();

  // Load leads if we start on CRM tab (unlikely but safe)
  if (document.querySelector('nav.admin-nav a.active').dataset.target === 'tab-crm') {
    loadLeads();
  }

  // .... (rest of existing modal logic kept the same) ....

  // ---- SEARCH LOGIC ----
  const setupSearch = (inputId, tableBody) => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach(row => {
          if (row.querySelector('td[colspan]')) return;
          const text = row.innerText.toLowerCase();
          row.style.display = text.includes(term) ? '' : 'none';
        });
      });
    }
  };

  setupSearch('adminSearch', vehicleTableBody);
  setupSearch('adminSearchMotos', motosTableBody);

  // 5. Modal Logic
  const modal = document.getElementById('modalVehicle');
  const btnClose = document.getElementById('btnCloseModal');
  const btnCancel = document.getElementById('btnCancelModal');
  const vehicleForm = document.getElementById('vehicleForm');

  function openModal(title = "Adicionar Veículo") {
    document.getElementById('modalTitle').innerText = title;
    modal.classList.add('active');
  }

  // Generalized modal opener
  window.openModalFor = function(type) {
    const title = type === 'moto' ? "Adicionar Nova Moto" : "Adicionar Novo Carro";
    openModal(title);
    document.getElementById('vType').value = type === 'moto' ? 'Moto' : '';
    // If it's a car, we leave it empty for the user to type or it might get a default later
  };

  function closeModal() {
    modal.classList.remove('active');
    vehicleForm.reset();
    document.getElementById('vId').value = '';
    document.getElementById('progressBar').style.width = '0%';
    selectedFiles = [];
    existingImages = [];
    renderGalleryPreview();
  }

  btnClose.addEventListener('click', closeModal);
  btnCancel.addEventListener('click', closeModal);

  const uploadArea = document.getElementById('uploadArea');
  const uploadGalleryPreview = document.getElementById('uploadGalleryPreview');
  const fileInput = document.getElementById('vFile');
  let selectedFiles = [];
  let existingImages = [];

  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) handleFilesSelected(files);
  });

  uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
  });
  uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
  });
  uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) handleFilesSelected(files);
  });

  function handleFilesSelected(files) {
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`A imagem ${file.name} excede o limite de 5MB.`);
        return false;
      }
      return true;
    });
    selectedFiles = [...selectedFiles, ...validFiles];
    renderGalleryPreview();
  }

  function renderGalleryPreview() {
    let html = '';
    html += existingImages.map((url, index) => `
      <div style="position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 2px solid var(--color-brand-blue);">
        <img src="${url}" style="width:100%; height:100%; object-fit:cover;" />
        <button type="button" onclick="removeExistingFile(${index})" style="position: absolute; top: 5px; right: 5px; width: 24px; height: 24px; background: #ff5050; color: #fff; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>
        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: var(--color-brand-blue); color: #fff; font-size: 9px; text-align: center; padding: 2px;">EXISTENTE</div>
      </div>
    `).join('');

    html += selectedFiles.map((file, index) => `
      <div style="position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
        <img src="${URL.createObjectURL(file)}" style="width:100%; height:100%; object-fit:cover;" />
        <button type="button" onclick="removeFile(${index})" style="position: absolute; top: 5px; right: 5px; width: 24px; height: 24px; background: rgba(0,0,0,0.7); color: #fff; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;">&times;</button>
        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: #00c853; color: #fff; font-size: 9px; text-align: center; padding: 2px;">NOVA</div>
      </div>
    `).join('');
    uploadGalleryPreview.innerHTML = html;
  }

  window.removeFile = function(index) {
    selectedFiles.splice(index, 1);
    renderGalleryPreview();
  };

  window.removeExistingFile = function(index) {
    existingImages.splice(index, 1);
    renderGalleryPreview();
  };

  async function uploadImageToStorage(file) {
    const progressEl = document.getElementById('uploadProgress');
    const progressBar = document.getElementById('progressBar');
    progressEl.style.display = 'block';
    progressBar.style.width = '30%';

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
    const filePath = `vehicles/${fileName}`;

    const { data, error } = await supabase.storage
      .from('vehicle-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false });

    if (error) {
      progressEl.style.display = 'none';
      throw new Error('Erro ao enviar imagem: ' + error.message);
    }

    const { data: publicData } = supabase.storage.from('vehicle-images').getPublicUrl(filePath);
    progressBar.style.width = '100%';
    setTimeout(() => { progressEl.style.display = 'none'; }, 500);
    return publicData.publicUrl;
  }

  // 6. Create / Update
  vehicleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSave = document.getElementById('btnSaveVehicle');
    const originalText = btnSave.innerText;
    btnSave.innerText = 'Salvando...';
    btnSave.disabled = true;

    try {
      let imagesArray = [...existingImages];

      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const url = await uploadImageToStorage(file);
          imagesArray.push(url);
        }
      }

      const urlInput = document.getElementById('vImg').value.trim();
      if (urlInput && imagesArray.indexOf(urlInput) === -1) {
        imagesArray.unshift(urlInput);
      }

      if (imagesArray.length === 0) {
        alert('Por favor, envie pelo menos uma imagem.');
        btnSave.innerText = originalText;
        btnSave.disabled = false;
        return;
      }

      const vId = document.getElementById('vId').value;
      const typeVal = document.getElementById('vType').value.trim();

      const payload = {
        name: document.getElementById('vName').value.trim(),
        trim: document.getElementById('vTrim').value.trim(),
        img: imagesArray[0] || '',
        image_gallery: imagesArray,
        price: parseFloat(document.getElementById('vPrice').value.replace(/[^0-9.-]+/g, "")),
        installment: document.getElementById('vInstallment').value.trim(),
        year: parseInt(document.getElementById('vYear').value, 10),
        km: parseInt(document.getElementById('vKm').value, 10),
        fuel: document.getElementById('vFuel').value,
        trans: document.getElementById('vTrans').value,
        type: typeVal || 'Hatch', // Custom or fallback
        badge: document.getElementById('vBadge').value,
        tag: document.getElementById('vTag').value,
      };

      let result;
      if (vId) {
        result = await supabase.from('vehicles').update(payload).eq('id', vId);
      } else {
        result = await supabase.from('vehicles').insert([payload]);
      }

      if (result.error) {
        showToast("Erro ao salvar: " + result.error.message, 'error');
      } else {
        closeModal();
        await loadInventories();
        showToast(vId ? "Atualizado com sucesso!" : "Cadastrado com sucesso!", 'success');
      }
    } catch (err) {
      alert(err.message);
    }

    btnSave.innerText = originalText;
    btnSave.disabled = false;
  });

  // Global functions
  window.editVehicle = function(id) {
    const v = [...vehiclesList, ...motosList].find(x => x.id === id);
    if (!v) return;

    document.getElementById('vId').value = v.id;
    document.getElementById('vName').value = v.name;
    document.getElementById('vTrim').value = v.trim;
    document.getElementById('vImg').value = v.img;
    document.getElementById('vPrice').value = v.price;
    document.getElementById('vInstallment').value = v.installment;
    document.getElementById('vYear').value = v.year;
    document.getElementById('vKm').value = v.km;
    document.getElementById('vFuel').value = v.fuel;
    document.getElementById('vTrans').value = v.trans;
    document.getElementById('vType').value = v.type || '';
    document.getElementById('vBadge').value = v.badge || '';
    document.getElementById('vTag').value = v.tag || '';

    existingImages = v.image_gallery || (v.img ? [v.img] : []);
    renderGalleryPreview();

    openModal("Editar Veículo");
  };

  window.deleteVehicle = async function(id) {
    if (confirm("Tem certeza que deseja excluir?")) {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      if (error) {
        showToast("Erro ao excluir: " + error.message, 'error');
      } else {
        await loadInventories();
        showToast("Excluído com sucesso!", 'success');
      }
    }
  };

});
