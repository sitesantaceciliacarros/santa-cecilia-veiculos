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
    vehicleTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;">Carregando...</td></tr>';
    const { data: vehicles, error } = await supabase.from('vehicles').select('*').order('id', { ascending: false });
    
    if (error) {
      console.error(error);
      vehicleTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:#ff4d4d;">Erro ao carregar veículos. Verifique as permissões (RLS) no Supabase.</td></tr>';
      return;
    }
    
    vehiclesList = vehicles;

    if (vehiclesList.length === 0) {
      vehicleTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-muted);">Nenhum veículo encontrado.</td></tr>';
      return;
    }

    vehicleTableBody.innerHTML = vehiclesList.map(v => `
      <tr>
        <td><img src="${v.img}" alt="${v.name}"/></td>
        <td>
          <strong style="display:block; font-size:16px;">${v.name}</strong>
          <span style="color:var(--text-muted); font-size:14px;">${v.trim}</span>
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

});
