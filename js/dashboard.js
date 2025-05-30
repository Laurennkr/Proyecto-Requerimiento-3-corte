let cargosGlobal = [];

document.addEventListener('DOMContentLoaded', async () => {
  await cargarCargos();
  const logoutBtn = document.querySelector('.logout');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  // Modal functionality
  const modal = document.getElementById('cargoModal');
  const btn = document.getElementById('nuevoCargoBtn');
  const span = document.querySelector('#cargoModal .close');

  btn.onclick = () => {
    document.getElementById('modalTitle').textContent = 'Nuevo Cargo';
    document.getElementById('cargoId').value = '';
    document.getElementById('cargoForm').reset();
    modal.style.display = 'block';
  };
  
  span.onclick = () => modal.style.display = 'none';

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

  // Form submission
  document.getElementById('cargoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const cargoId = document.getElementById('cargoId').value;
    const cargoData = {
      nombre: document.getElementById('nombreCargo').value,
      color: document.getElementById('colorCargo').value,
      descripcion: document.getElementById('descripcionCargo').value
    };

    try {
      const token = localStorage.getItem('token');
      const url = cargoId 
        ? `http://localhost:5000/cargos/${cargoId}`
        : 'http://localhost:5000/cargos';
      
      const response = await fetch(url, {
        method: cargoId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(cargoData)
      });

      if (!response.ok) throw new Error('Error al guardar cargo');
      
      modal.style.display = 'none';
      document.getElementById('cargoForm').reset();
      await cargarCargos();
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el cargo: ' + error.message);
    }
  });

  // Solo agregar event listener para la búsqueda
  const searchInput = document.querySelector('.search');
  if (searchInput) {
    searchInput.addEventListener('input', renderCargos);
  }
});

async function cargarCargos() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/cargos', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) throw new Error('Error al cargar cargos');
    cargosGlobal = await response.json();
    renderCargos();
  } catch (error) {
    document.getElementById('cargos-list').innerHTML = '<p>Error al cargar los cargos.</p>';
  }
}

function cargarCargosParaFiltro() {
  const filtro = document.getElementById('filtroCargoDashboard');
  if (!filtro) return;
  
  filtro.innerHTML = '<option value="">Todos los cargos</option>';
  cargosGlobal.forEach(cargo => {
    const option = document.createElement('option');
    option.value = cargo.id;
    option.textContent = cargo.nombre;
    filtro.appendChild(option);
  });
}

function renderCargos() {
  const contenedor = document.getElementById('cargos-list');
  contenedor.innerHTML = '';
  const busqueda = document.querySelector('.search')?.value.trim().toLowerCase() || '';
  
  cargosGlobal
    .filter(cargo => {
      return cargo.nombre.toLowerCase().includes(busqueda);
    })
    .forEach(cargo => {
      const card = document.createElement('div');
      card.className = `main-card cargo ${cargo.color}`;
      
      card.innerHTML = `
        <button class="delete-btn" onclick="eliminarCargo('${cargo.id}')">×</button>
        <div class="logo-circle-container">
          <div class="title">${cargo.nombre}</div>
          <div class="logo-circle">${cargo.icono || '💼'}</div>
        </div>
        <p class="description">${cargo.descripcion || 'Sin descripción'}</p>
        <div class="extra-info">
          <span>Empleados: ${cargo.Empleados ? cargo.Empleados.length : 0}</span>
          <button class="mini-btn" onclick="editarCargo('${cargo.id}')">Editar</button>
        </div>
      `;
      contenedor.appendChild(card);
    });
}

async function editarCargo(id) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/cargos/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Error al cargar datos del cargo');

    const cargo = await response.json();
    
    // Llenar el formulario con los datos del cargo
    document.getElementById('modalTitle').textContent = 'Editar Cargo';
    
    document.getElementById('cargoId').value = cargo.id;
    document.getElementById('nombreCargo').value = cargo.nombre;
    document.getElementById('colorCargo').value = cargo.color;
    document.getElementById('descripcionCargo').value = cargo.descripcion || '';

    // Mostrar el modal
    document.getElementById('cargoModal').style.display = 'block';
  } catch (error) {
    console.error('Error al cargar cargo:', error);
    alert('Error al cargar los datos del cargo');
  }
}

async function eliminarCargo(id) {
  if (!confirm('¿Estás seguro de eliminar este cargo?')) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/cargos/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('No se pudo eliminar el cargo');
    await cargarCargos();
  } catch (error) {
    console.error('Error al eliminar cargo:', error);
    alert('Ocurrió un error al eliminar el cargo.');
  }
}

function logout(event) {
  event.preventDefault();
  localStorage.clear();
  window.location.href = 'index.html';
} 