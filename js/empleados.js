let empleadosGlobal = [];
let cargosGlobal = [];

document.addEventListener('DOMContentLoaded', async () => {
  await cargarEmpleados();
  await cargarCargosParaSelect();
  const logoutBtn = document.querySelector('.logout');
  if (logoutBtn) logoutBtn.addEventListener('click', logout);

  // Modal functionality
  const modal = document.getElementById('empleadoModal');
  const btn = document.getElementById('nuevoEmpleadoBtn');
  const span = document.querySelector('#empleadoModal .close');

  btn.onclick = () => {
    document.getElementById('modalTitle').textContent = 'Nuevo Empleado';
    document.getElementById('empleadoId').value = '';
    document.getElementById('empleadoForm').reset();
    modal.style.display = 'block';
  };
  
  span.onclick = () => modal.style.display = 'none';

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

  // Form submission
  document.getElementById('empleadoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const modal = document.getElementById('empleadoModal');
    const empleadoId = document.getElementById('empleadoId').value;
    const token = localStorage.getItem('token');

    if (!token) {
      alert('No autorizado. Por favor inicia sesión.');
      window.location.href = 'index.html';
      return;
    }

    try {
      const empleadoData = {
        nombre: document.getElementById('nombreEmpleado').value,
        CargoId: document.getElementById('cargoEmpleado').value,
        turno: document.getElementById('turnoEmpleado').value,
        estado: document.getElementById('estadoEmpleado').value,
        icono: document.getElementById('iconoEmpleado').value,
        descripcion: document.getElementById('descripcionEmpleado').value,
        cedula: document.getElementById('cedulaEmpleado').value
      };

      // Validar campos requeridos
      if (!empleadoData.nombre) {
        throw new Error('El nombre del empleado es requerido');
      }
      if (!empleadoData.CargoId) {
        throw new Error('El cargo del empleado es requerido');
      }
      if (!empleadoData.turno) {
        throw new Error('El turno del empleado es requerido');
      }
      if (!empleadoData.estado) {
        throw new Error('El estado del empleado es requerido');
      }
      if (!empleadoData.cedula) {
        throw new Error('La cédula del empleado es requerida');
      }

      const url = empleadoId 
        ? `http://localhost:5000/empleados/${empleadoId}`
        : 'http://localhost:5000/empleados';

      const response = await fetch(url, {
        method: empleadoId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(empleadoData)
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Error response:', data);
        throw new Error(data.error || data.detalles || 'Error al guardar empleado');
      }
      
      modal.style.display = 'none';
      document.getElementById('empleadoForm').reset();
      await cargarEmpleados();
    } catch (error) {
      console.error('Error completo:', error);
      console.error('Datos del empleado:', empleadoData);
      alert(`Error al guardar el empleado: ${error.message}`);
    }
  });

  // Agregar botón de exportar todas las calificaciones
  const exportBtn = document.createElement('button');
  exportBtn.className = 'btn';
  exportBtn.textContent = 'Exportar Calificaciones';
  exportBtn.style.width = 'auto';
  exportBtn.onclick = exportarCalificaciones;
  const mainContent = document.querySelector('.main-content section');
  mainContent.insertBefore(exportBtn, mainContent.firstChild);

  // Filtros
  document.getElementById('filtroCargo').addEventListener('change', renderEmpleados);
  document.querySelector('.search').addEventListener('input', renderEmpleados);
});

async function cargarCargosParaSelect() {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/cargos', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      throw new Error('Error al cargar cargos');
    }

    const cargos = await response.json();
    cargosGlobal = cargos;
    const selectCargo = document.getElementById('cargoEmpleado');
    const filtroCargo = document.getElementById('filtroCargo');
    // Limpiar opciones existentes (excepto la primera)
    while (selectCargo && selectCargo.options.length > 1) selectCargo.remove(1);
    if (filtroCargo) filtroCargo.innerHTML = '<option value="">Todos los empleados</option>';
    // Agregar nuevas opciones
    cargos.forEach(cargo => {
      if (selectCargo) {
        const option = document.createElement('option');
        option.value = cargo.id;
        option.textContent = cargo.nombre;
        selectCargo.appendChild(option);
      }
      if (filtroCargo) {
        const option2 = document.createElement('option');
        option2.value = cargo.id;
        option2.textContent = cargo.nombre;
        filtroCargo.appendChild(option2);
      }
    });
  } catch (error) {
    console.error('Error al cargar cargos:', error);
    alert('Error al cargar la lista de cargos');
  }
}

async function cargarEmpleados() {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('No autorizado. Por favor inicia sesión.');
      window.location.href = 'index.html';
      return;
    }
    const response = await fetch('http://localhost:5000/empleados?_expand=cargo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!response.ok) {
      alert('No autorizado. Inicia sesión de nuevo.');
      localStorage.clear();
      window.location.href = 'index.html';
      return;
    }
    empleadosGlobal = await response.json();
    renderEmpleados();
  } catch (error) {
    console.error('Error al cargar empleados:', error);
    document.getElementById('empleados-list').innerHTML = '<p>Error al cargar los empleados.</p>';
  }
}

function renderEmpleados() {
  const contenedor = document.getElementById('empleados-list');
  contenedor.innerHTML = '';
  const filtroCargo = document.getElementById('filtroCargo')?.value || '';
  const busqueda = document.querySelector('.search')?.value.trim().toLowerCase() || '';
  empleadosGlobal
    .filter(emp => {
      // Filtrar por cargo
      if (filtroCargo && String(emp.CargoId || (emp.cargo && emp.cargo.id)) !== filtroCargo) return false;
      // Filtrar por búsqueda (nombre empleado o nombre cargo)
      const nombre = emp.nombre?.toLowerCase() || '';
      const cargoNombre = (emp.cargo?.nombre || emp.Cargo?.nombre || '').toLowerCase();
      return nombre.includes(busqueda) || cargoNombre.includes(busqueda);
    })
    .forEach(emp => {
      const cargoInfo = emp.cargo || emp.Cargo;
      const cargoNombre = cargoInfo ? cargoInfo.nombre : 'Sin asignar';
      const cargoColor = cargoInfo ? cargoInfo.color : 'green';
      const card = document.createElement('div');
      card.className = `main-card empleado ${cargoColor}`;
      card.innerHTML = `
        <button class="delete-btn" onclick="eliminarEmpleado('${emp.id}')">×</button>
        <div class="status-indicators">
          <div class="status-indicator green ${emp.estado === 'activo' ? 'active' : ''}"></div>
          <div class="status-indicator yellow ${emp.estado === 'pendiente' ? 'active' : ''}"></div>
          <div class="status-indicator red ${emp.estado === 'inactivo' ? 'active' : ''}"></div>
        </div>
        <div class="logo-circle-container">
          <div class="title">${emp.nombre}</div>
          <div class="logo-circle">${emp.icono || '👤'}</div>
        </div>
        <p class="description">${emp.descripcion || 'Sin descripción'}</p>
        <div class="extra-info info-blocks">
          <div><span class="label-info">Cargo:</span> <span>${cargoNombre}</span></div>
          <div><span class="label-info">Turno:</span> <span>${emp.turno || 'No especificado'}</span></div>
        </div>
        <div class="card-overlay">
          <div class="button-group">
            <button class="mini-btn" onclick="editarEmpleado('${emp.id}')">Editar</button>
            <button class="mini-btn" onclick="calificarEmpleado('${emp.id}')">Calificar</button>
          </div>
        </div>
      `;
      contenedor.appendChild(card);
    });
}

async function eliminarEmpleado(id) {
  if (!confirm('¿Estás seguro de eliminar este empleado?')) return;

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/empleados/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('No se pudo eliminar el empleado');
    await cargarEmpleados();
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    alert('Ocurrió un error al eliminar el empleado.');
  }
}

function logout(event) {
  event.preventDefault();
  localStorage.clear();
  window.location.href = 'index.html';
}

async function editarEmpleado(id) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/empleados/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Error al cargar datos del empleado');

    const empleado = await response.json();
    
    // Llenar el formulario con los datos del empleado
    document.getElementById('modalTitle').textContent = 'Editar Empleado';
    document.getElementById('empleadoId').value = empleado.id;
    document.getElementById('nombreEmpleado').value = empleado.nombre;
    document.getElementById('cedulaEmpleado').value = empleado.cedula;
    document.getElementById('cargoEmpleado').value = empleado.CargoId;
    document.getElementById('turnoEmpleado').value = empleado.turno;
    document.getElementById('estadoEmpleado').value = empleado.estado;
    document.getElementById('iconoEmpleado').value = empleado.icono;
    document.getElementById('descripcionEmpleado').value = empleado.descripcion || '';

    // Mostrar el modal
    document.getElementById('empleadoModal').style.display = 'block';
  } catch (error) {
    console.error('Error al cargar empleado:', error);
    alert('Error al cargar los datos del empleado');
  }
}

// Definir los criterios de calificación
const criteriosCalificacion = [
  { 
    id: 'innovacion_motivacion', 
    nombre: 'Innovar estrategias permanentes para mantener la motivación, alegría y amor por la institución o modalidad de atención integral'
  },
  { 
    id: 'evaluacion_proactividad', 
    nombre: 'Evaluar el estado de pro actividad y motivación de las niñas y niños con la institución, los ambientes educativos, el talento humano y la rutina pedagógica'
  },
  { 
    id: 'valoracion_cualitativa', 
    nombre: 'Apoyar el diseño y aplicación de valoración cualitativa del desarrollo de los niños y niñas'
  },
  { 
    id: 'deteccion_temprana', 
    nombre: 'Detección temprana de atrasos en el desarrollo y diseño de estrategias de apoyo para trabajar con los niños y sus familias'
  },
  { 
    id: 'proyectos_pedagogicos', 
    nombre: 'Apoyar el diseño e implementación de proyectos pedagógicos que respondan a una educación inclusiva y pertinente'
  },
  { 
    id: 'planeacion_seguimiento', 
    nombre: 'Participar en las estrategias de planeación, seguimiento y evaluación del proceso'
  },
  { 
    id: 'sistematizacion', 
    nombre: 'Organizar y sistematizar información sobre las acciones adelantadas con los niños, niñas familias y comunidades'
  },
  { 
    id: 'mejora_practicas', 
    nombre: 'Liderar procesos de trabajo para el mejoramiento permanente de las prácticas pedagógicas con los niños'
  },
  { 
    id: 'remision_casos', 
    nombre: 'Remisión a las autoridades competentes los casos de maltrato infantil'
  }
];

// Función para mostrar el modal de calificación
async function calificarEmpleado(id) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/empleados/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) throw new Error('Error al cargar datos del empleado');

    const empleado = await response.json();
    document.getElementById('calificacionEmpleadoId').value = empleado.id;

    // Obtener la última calificación si existe
    let ultimaCalificacion = null;
    try {
      const califRes = await fetch(`http://localhost:5000/empleados/${id}/calificaciones`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (califRes.ok) {
        const calificaciones = await califRes.json();
        if (Array.isArray(calificaciones) && calificaciones.length > 0) {
          ultimaCalificacion = calificaciones[calificaciones.length - 1];
        }
      }
    } catch {}

    // Generar los criterios de calificación
    const criteriosContainer = document.querySelector('.criterios-container');
    criteriosContainer.innerHTML = criteriosCalificacion.map(criterio => {
      const valor = ultimaCalificacion && ultimaCalificacion.criterios[criterio.id] ? ultimaCalificacion.criterios[criterio.id] : '';
      return `
      <div class="criterio-item">
        <label>${criterio.nombre}</label>
        <div class="criterio-options">
          <div class="criterio-option">
            <input type="radio" id="${criterio.id}_cumple" name="${criterio.id}" value="cumple" ${valor === 'cumple' ? 'checked' : ''} required>
            <label for="${criterio.id}_cumple">Cumple</label>
          </div>
          <div class="criterio-option">
            <input type="radio" id="${criterio.id}_no_cumple" name="${criterio.id}" value="no_cumple" ${valor === 'no_cumple' ? 'checked' : ''}>
            <label for="${criterio.id}_no_cumple">No Cumple</label>
          </div>
          <div class="criterio-option">
            <input type="radio" id="${criterio.id}_na" name="${criterio.id}" value="na" ${valor === 'na' ? 'checked' : ''}>
            <label for="${criterio.id}_na">N/A</label>
          </div>
        </div>
      </div>
      `;
    }).join('');

    document.getElementById('calificacionModal').style.display = 'block';
  } catch (error) {
    console.error('Error al cargar empleado:', error);
    alert('Error al cargar los datos del empleado');
  }
}

// Agregar el manejo del formulario de calificación
document.getElementById('calificacionForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const empleadoId = document.getElementById('calificacionEmpleadoId').value;
  const calificaciones = {};
  
  // Recolectar todas las calificaciones
  criteriosCalificacion.forEach(criterio => {
    const selectedOption = document.querySelector(`input[name="${criterio.id}"]:checked`);
    calificaciones[criterio.id] = selectedOption ? selectedOption.value : null;
  });

  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/empleados/${empleadoId}/calificar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ calificaciones })
    });

    if (!response.ok) throw new Error('Error al guardar calificación');
    
    document.getElementById('calificacionModal').style.display = 'none';
    document.getElementById('calificacionForm').reset();
    alert('Calificación guardada exitosamente');
  } catch (error) {
    console.error('Error:', error);
    alert('Error al guardar la calificación: ' + error.message);
  }
});

// Agregar el manejo del cierre del modal de calificación
document.querySelector('#calificacionModal .close').onclick = function() {
  document.getElementById('calificacionModal').style.display = 'none';
}

async function exportarCalificaciones() {
  try {
    const response = await fetch('http://localhost:5000/empleados/calificaciones/exportar', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Error al exportar calificaciones');
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'calificaciones_empleados.zip';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Error:', error);
    alert('Error al exportar calificaciones');
  }
}