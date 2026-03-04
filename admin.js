document.addEventListener('DOMContentLoaded', async () => {
  const SUPABASE_URL = 'https://hmqucnhanrgjxfenjzaz.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtcXVjbmhhbnJnanhmZW5qemF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxNDAyMjIsImV4cCI6MjA4NzcxNjIyMn0.TmykuoD93fGNaHslx7Pubf8ZnYyBvb3VB28rrdiu5WU';
  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  // 1. Auth Check - Redirect if not logged in (REMOVIDO PARA DEMONSTRAÇÃO)
  // const { data: { session } } = await supabase.auth.getSession();
  // if (!session) {
  //   window.location.href = 'admin-login.html';
  //   return;
  // }

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
    window.location.href = 'admin-login.html';
  });

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
  }

  btnAdd.addEventListener('click', () => {
    openModal("Adicionar Novo Veículo");
  });
  btnClose.addEventListener('click', closeModal);
  btnCancel.addEventListener('click', closeModal);

  // 6. Create / Update
  vehicleForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSave = document.getElementById('btnSaveVehicle');
    btnSave.innerText = 'Salvando...';
    btnSave.disabled = true;

    const vId = document.getElementById('vId').value;
    const payload = {
      name: document.getElementById('vName').value,
      trim: document.getElementById('vTrim').value,
      img: document.getElementById('vImg').value,
      price: parseFloat(document.getElementById('vPrice').value),
      installment: document.getElementById('vInstallment').value,
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
      // Update
      result = await supabase.from('vehicles').update(payload).eq('id', vId);
    } else {
      // Insert
      result = await supabase.from('vehicles').insert([payload]);
    }

    if (result.error) {
      alert("Erro ao salvar: " + result.error.message);
    } else {
      closeModal();
      await loadVehicles();
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

    openModal("Editar Veículo");
  };

  window.deleteVehicle = async function(id) {
    if (confirm("Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.")) {
      const { error } = await supabase.from('vehicles').delete().eq('id', id);
      if (error) {
        alert("Erro ao excluir: " + error.message);
      } else {
        await loadVehicles();
      }
    }
  };

  // ========================================
  // SECTIONS CRUD
  // ========================================

  const sectionsGrid = document.getElementById('sectionsGrid');
  let sectionsList = [];

  async function loadSections() {
    sectionsGrid.innerHTML = '<div class="section-empty"><div class="empty-icon">📝</div><h3>Carregando seções...</h3></div>';
    const { data: sections, error } = await supabase.from('sections').select('*').order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      sectionsGrid.innerHTML = '<div class="section-empty"><div class="empty-icon">⚠️</div><h3 style="color:#ff5050;">Erro ao carregar seções</h3><p>' + error.message + '</p></div>';
      return;
    }

    sectionsList = sections;

    if (sectionsList.length === 0) {
      sectionsGrid.innerHTML = '<div class="section-empty"><div class="empty-icon">📝</div><h3>Nenhuma seção cadastrada</h3><p style="color: rgba(255,255,255,0.3);">Clique em "+ Nova Seção" para começar!</p></div>';
      return;
    }

    sectionsGrid.innerHTML = sectionsList.map(s => `
      <div class="section-card">
        <div class="section-card-header">
          <h3>${s.name}</h3>
          <span class="status-badge ${s.is_active ? 'active' : 'inactive'}">${s.is_active ? 'Ativo' : 'Inativo'}</span>
        </div>
        <div class="section-card-content">${s.content || '<em>Sem conteúdo</em>'}</div>
        <div class="section-card-footer">
          <label class="toggle-switch">
            <input type="checkbox" ${s.is_active ? 'checked' : ''} onchange="toggleSection(${s.id}, this.checked)" />
            <span class="toggle-slider"></span>
          </label>
          <div class="action-links">
            <a onclick="editSection(${s.id})">Editar</a>
            <a class="delete" onclick="deleteSection(${s.id})">Excluir</a>
          </div>
        </div>
      </div>
    `).join('');
  }

  await loadSections();

  // Section Modal Logic
  const sectionModal = document.getElementById('modalSection');
  const btnAddSection = document.getElementById('btnAddSection');
  const btnCloseSectionModal = document.getElementById('btnCloseSectionModal');
  const btnCancelSectionModal = document.getElementById('btnCancelSectionModal');
  const sectionForm = document.getElementById('sectionForm');

  function openSectionModal(title = "Adicionar Seção") {
    document.getElementById('sectionModalTitle').innerText = title;
    sectionModal.classList.add('active');
  }

  function closeSectionModal() {
    sectionModal.classList.remove('active');
    sectionForm.reset();
    document.getElementById('sId').value = '';
    document.getElementById('sActive').checked = true;
  }

  btnAddSection.addEventListener('click', () => {
    openSectionModal("Nova Seção");
  });
  btnCloseSectionModal.addEventListener('click', closeSectionModal);
  btnCancelSectionModal.addEventListener('click', closeSectionModal);

  // Section Create / Update
  sectionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btnSave = document.getElementById('btnSaveSection');
    btnSave.innerText = 'Salvando...';
    btnSave.disabled = true;

    const sId = document.getElementById('sId').value;
    const payload = {
      name: document.getElementById('sName').value,
      content: document.getElementById('sContent').value,
      is_active: document.getElementById('sActive').checked,
    };

    let result;
    if (sId) {
      result = await supabase.from('sections').update(payload).eq('id', sId);
    } else {
      result = await supabase.from('sections').insert([payload]);
    }

    if (result.error) {
      alert("Erro ao salvar: " + result.error.message);
    } else {
      closeSectionModal();
      await loadSections();
    }

    btnSave.innerText = 'Salvar Seção';
    btnSave.disabled = false;
  });

  // Global section functions
  window.editSection = function(id) {
    const s = sectionsList.find(x => x.id === id);
    if (!s) return;

    document.getElementById('sId').value = s.id;
    document.getElementById('sName').value = s.name;
    document.getElementById('sContent').value = s.content || '';
    document.getElementById('sActive').checked = s.is_active;

    openSectionModal("Editar Seção");
  };

  window.deleteSection = async function(id) {
    if (confirm("Tem certeza que deseja excluir esta seção? Esta ação não pode ser desfeita.")) {
      const { error } = await supabase.from('sections').delete().eq('id', id);
      if (error) {
        alert("Erro ao excluir: " + error.message);
      } else {
        await loadSections();
      }
    }
  };

  window.toggleSection = async function(id, isActive) {
    const { error } = await supabase.from('sections').update({ is_active: isActive }).eq('id', id);
    if (error) {
      alert("Erro ao atualizar: " + error.message);
      await loadSections(); // revert visual
    }
  };

});
