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
    // Loading states
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
    
    // Split the data. If category is 'moto' (case insensitive), goes to Motos tab.
    vehiclesList = allVehicles.filter(v => (v.type || '').toLowerCase() !== 'moto');
    motosList = allVehicles.filter(v => (v.type || '').toLowerCase() === 'moto');

    renderTable(vehicleTableBody, vehiclesList, "Nenhum carro encontrado. Clique em '+ Novo Carro'!");
    renderTable(motosTableBody, motosList, "Nenhuma moto encontrada. Clique em '+ Nova Moto'!");

    updateStats(vehiclesList, 'statTotal', 'statAvgPrice', 'statLastAdded');
    updateStats(motosList, 'statTotalMotos', 'statAvgPriceMotos', 'statLastAddedMotos');
  }

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
