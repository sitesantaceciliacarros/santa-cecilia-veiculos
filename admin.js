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

  // 4. Load Vehicles
  const vehicleTableBody = document.getElementById('vehicleTableBody');
  let vehiclesList = [];

  async function loadVehicles() {
    vehicleTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: rgba(255,255,255,0.3); padding: 40px;">Carregando...</td></tr>';
    const { data: vehicles, error } = await supabase.from('vehicles').select('*').order('id', { ascending: false });
    
    if (error) {
      console.error(error);
      vehicleTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#ff4d4d; padding: 40px;">Erro ao carregar veículos. Verifique as permissões (RLS) no Supabase.</td></tr>';
      updateStats([]);
      return;
    }
    
    vehiclesList = vehicles;
    updateStats(vehiclesList);

    if (vehiclesList.length === 0) {
      vehicleTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color: rgba(255,255,255,0.3); padding: 40px;">Nenhum veículo encontrado. Clique em "+ Novo Veículo" para começar!</td></tr>';
      return;
    }

    vehicleTableBody.innerHTML = vehiclesList.map(v => `
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

  function updateStats(list) {
    const statTotal = document.getElementById('statTotal');
    const statAvgPrice = document.getElementById('statAvgPrice');
    const statLastAdded = document.getElementById('statLastAdded');

    statTotal.textContent = list.length;

    if (list.length > 0) {
      const avg = list.reduce((sum, v) => sum + (v.price || 0), 0) / list.length;
      statAvgPrice.textContent = 'R$ ' + Math.round(avg).toLocaleString('pt-BR');
      statLastAdded.textContent = list[0].name || '—';
    } else {
      statAvgPrice.textContent = '—';
      statLastAdded.textContent = '—';
    }
  }

  await loadVehicles();

  // ---- SEARCH LOGIC ----
  const adminSearch = document.getElementById('adminSearch');
  if (adminSearch) {
    adminSearch.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const rows = vehicleTableBody.querySelectorAll('tr');
      
      rows.forEach(row => {
        if (row.querySelector('td[colspan]')) return; // Ignore "loading" row
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(term) ? '' : 'none';
      });
    });
  }

  // 5. Modal Logic
  const modal = document.getElementById('modalVehicle');
  const btnAdd = document.getElementById('btnAddVehicle');
  const btnClose = document.getElementById('btnCloseModal');
  const btnCancel = document.getElementById('btnCancelModal');
  const vehicleForm = document.getElementById('vehicleForm');

  function openModal(title = "Adicionar Veículo") {
    document.getElementById('modalTitle').innerText = title;
    modal.classList.add('active');
  }

  function closeModal() {
    modal.classList.remove('active');
    vehicleForm.reset();
    document.getElementById('vId').value = '';
    document.getElementById('progressBar').style.width = '0%';
    // Reset gallery
    selectedFiles = [];
    existingImages = [];
    renderGalleryPreview();
  }

  btnAdd.addEventListener('click', () => {
    openModal("Adicionar Novo Veículo");
  });
  btnClose.addEventListener('click', closeModal);
  btnCancel.addEventListener('click', closeModal);

  const uploadArea = document.getElementById('uploadArea');
  const uploadGalleryPreview = document.getElementById('uploadGalleryPreview');
  const fileInput = document.getElementById('vFile');
  let selectedFiles = [];
  let existingImages = [];

  // Handle file selection
  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) handleFilesSelected(files);
  });

  // Drag and drop
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
    
    // Render existing images
    html += existingImages.map((url, index) => `
      <div style="position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 2px solid var(--color-brand-blue);">
        <img src="${url}" style="width:100%; height:100%; object-fit:cover;" />
        <button type="button" onclick="removeExistingFile(${index})" style="position: absolute; top: 5px; right: 5px; width: 20px; height: 20px; background: #ff5050; color: #fff; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px;">&times;</button>
        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: var(--color-brand-blue); color: #fff; font-size: 8px; text-align: center; padding: 2px;">EXISTENTE</div>
      </div>
    `).join('');

    // Render new files
    html += selectedFiles.map((file, index) => `
      <div style="position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
        <img src="${URL.createObjectURL(file)}" style="width:100%; height:100%; object-fit:cover;" />
        <button type="button" onclick="removeFile(${index})" style="position: absolute; top: 5px; right: 5px; width: 20px; height: 20px; background: rgba(0,0,0,0.7); color: #fff; border: none; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 12px;">&times;</button>
        <div style="position: absolute; bottom: 0; left: 0; right: 0; background: #00c853; color: #fff; font-size: 8px; text-align: center; padding: 2px;">NOVA</div>
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

    progressBar.style.width = '60%';

    const { data, error } = await supabase.storage
      .from('vehicle-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      progressEl.style.display = 'none';
      throw new Error('Erro ao enviar imagem: ' + error.message);
    }

    progressBar.style.width = '90%';

    const { data: publicData } = supabase.storage
      .from('vehicle-images')
      .getPublicUrl(filePath);

    progressBar.style.width = '100%';
    
    setTimeout(() => {
      progressEl.style.display = 'none';
    }, 500);

    return publicData.publicUrl;
  }

  // 6. Create / Update
  vehicleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSave = document.getElementById('btnSaveVehicle');
    btnSave.innerText = 'Salvando...';
    btnSave.disabled = true;

    try {
      let imagesArray = [...existingImages];

      // Upload new files
      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const url = await uploadImageToStorage(file);
          imagesArray.push(url);
        }
      }

      // Fallback to URL field if no files added and imagesArray is empty
      const urlInput = document.getElementById('vImg').value.trim();
      if (urlInput && imagesArray.indexOf(urlInput) === -1) {
        imagesArray.unshift(urlInput); // Add URL input as first image
      }

      if (imagesArray.length === 0) {
        alert('Por favor, envie pelo menos uma imagem.');
        btnSave.innerText = 'Salvar Veículo';
        btnSave.disabled = false;
        return;
      }

      const vId = document.getElementById('vId').value;
      const payload = {
        name: document.getElementById('vName').value.trim(),
        trim: document.getElementById('vTrim').value.trim(),
        img: imagesArray[0] || '', // First image as main thumbnail
        image_gallery: imagesArray, // Store all images in the new JSONB column
        price: parseFloat(document.getElementById('vPrice').value.replace(/[^0-9.-]+/g, "")),
        installment: document.getElementById('vInstallment').value.trim(),
        year: parseInt(document.getElementById('vYear').value, 10),
        km: parseInt(document.getElementById('vKm').value, 10),
        fuel: document.getElementById('vFuel').value,
        trans: document.getElementById('vTrans').value,
        type: document.getElementById('vType').value,
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
        await loadVehicles();
        showToast(vId ? "Veículo atualizado com sucesso!" : "Veículo cadastrado com sucesso!", 'success');
      }
    } catch (err) {
      alert(err.message);
    }

    btnSave.innerText = 'Salvar Veículo';
    btnSave.disabled = false;
  });

  // Global functions to be accessed via onclick attributes
  window.editVehicle = function(id) {
    const v = vehiclesList.find(x => x.id === id);
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
    document.getElementById('vType').value = v.type;
    document.getElementById('vBadge').value = v.badge || '';
    document.getElementById('vTag').value = v.tag || '';

    // Load existing images into gallery
    existingImages = v.image_gallery || (v.img ? [v.img] : []);
    renderGalleryPreview();

    openModal("Editar Veículo");
  };

  window.deleteVehicle = async function(id) {
    if (confirm("Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.")) {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      if (error) {
        showToast("Erro ao excluir: " + error.message, 'error');
      } else {
        await loadVehicles();
        showToast("Veículo excluído com sucesso!", 'success');
      }
    }
  };

});
