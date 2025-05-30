const { Empleado, Cargo, Calificacion } = require('../models');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');

module.exports = {
  async crear(req, res) {
    try {
      console.log('Datos recibidos:', req.body);
      const { CargoId, nombre, turno, estado, ...empleadoData } = req.body;

      // Validar campos requeridos
      if (!nombre) {
        return res.status(400).json({ error: 'El nombre del empleado es requerido' });
      }
      if (!turno) {
        return res.status(400).json({ error: 'El turno del empleado es requerido' });
      }
      if (!estado) {
        return res.status(400).json({ error: 'El estado del empleado es requerido' });
      }

      // Validar estado
      const estadosValidos = ['activo', 'pendiente', 'inactivo'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ 
          error: 'Estado inválido',
          detalles: `El estado debe ser uno de: ${estadosValidos.join(', ')}`
        });
      }

      // Verificar si el cargo existe
      if (CargoId) {
        const cargo = await Cargo.findByPk(CargoId);
        if (!cargo) {
          return res.status(400).json({ error: 'El cargo especificado no existe' });
        }
      }

      try {
        const empleado = await Empleado.create({
          nombre,
          turno,
          estado,
          CargoId: CargoId || null,
          ...empleadoData
        });

        // Obtener el empleado con relaciones
        const empleadoConCargo = await Empleado.findByPk(empleado.id, {
          include: {
            model: Cargo,
            as: 'Cargo'
          }
        });

        res.status(201).json(empleadoConCargo);
      } catch (dbError) {
        console.error('Error de base de datos:', dbError);
        return res.status(400).json({ 
          error: 'Error al crear empleado en la base de datos',
          detalles: dbError.message,
          tipo: dbError.name
        });
      }
    } catch (error) {
      console.error('Error al crear empleado:', error);
      res.status(400).json({ 
        error: 'Error al crear empleado',
        detalles: error.message,
        tipo: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  },

  async listar(req, res) {
    try {
      const empleados = await Empleado.findAll({
        include: {
          model: Cargo,
          as: 'Cargo',
          attributes: ['id', 'nombre', 'color']
        }
      });
      res.json(empleados);
    } catch (error) {
      res.status(500).json({ 
        error: 'Error al listar empleados',
        detalles: error.message 
      });
    }
  },

  async obtener(req, res) {
    try {
      const empleado = await Empleado.findByPk(req.params.id, {
        include: {
          model: Cargo,
          as: 'Cargo'
        }
      });
      
      if (!empleado) {
        return res.status(404).json({ error: 'Empleado no encontrado' });
      }
      
      res.json(empleado);
    } catch (error) {
      res.status(500).json({ 
        error: 'Error al obtener empleado',
        detalles: error.message 
      });
    }
  },

  async actualizar(req, res) {
    try {
      const { CargoId, ...datos } = req.body;

      // Verificar si el cargo existe
      if (CargoId) {
        const cargo = await Cargo.findByPk(CargoId);
        if (!cargo) {
          return res.status(400).json({ error: 'El cargo especificado no existe' });
        }
      }

      const [updated] = await Empleado.update(
        { ...datos, CargoId },
        { where: { id: req.params.id } }
      );

      if (!updated) {
        return res.status(404).json({ error: 'Empleado no encontrado' });
      }

      const empleadoActualizado = await Empleado.findByPk(req.params.id, {
        include: {
          model: Cargo,
          as: 'Cargo'
        }
      });

      res.json(empleadoActualizado);
    } catch (error) {
      res.status(400).json({ 
        error: 'Error al actualizar empleado',
        detalles: error.message 
      });
    }
  },

  async eliminar(req, res) {
    try {
      const empleado = await Empleado.findByPk(req.params.id);
      
      if (!empleado) {
        return res.status(404).json({ error: 'Empleado no encontrado' });
      }

      await empleado.destroy();
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ 
        error: 'Error al eliminar empleado',
        detalles: error.message 
      });
    }
  },

  async calificar(req, res) {
    try {
      const empleado = await Empleado.findByPk(req.params.id);
      if (!empleado) {
        return res.status(404).json({ error: 'Empleado no encontrado' });
      }
      const { calificaciones } = req.body;
      const nuevaCalificacion = await Calificacion.create({
        EmpleadoId: empleado.id,
        criterios: calificaciones,
        fecha: new Date()
      });
      res.status(201).json(nuevaCalificacion);
    } catch (error) {
      res.status(400).json({ error: 'Error al guardar calificación', detalles: error.message });
    }
  },

  async exportarTodasCalificaciones(req, res) {
    try {
      // Definir los criterios con texto completo y orden
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

      // Obtener todos los empleados con sus calificaciones
      const empleados = await Empleado.findAll({
        include: [
          { model: Cargo, as: 'Cargo' },
          { model: Calificacion, as: 'Calificaciones' }
        ]
      });

      // Crear directorio para los archivos si no existe
      const exportDir = path.join(__dirname, '../../exports');
      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }

      // Array para almacenar los archivos creados
      const archivos = [];

      // Crear un archivo Excel por cada empleado que tenga calificaciones
      for (const empleado of empleados) {
        if (empleado.Calificaciones && empleado.Calificaciones.length > 0) {
          // Crear un nuevo libro de Excel
          const wb = XLSX.utils.book_new();

          // Preparar los datos para la hoja de calificaciones
          const calificacionesData = [
            ['INFORMACIÓN DEL EMPLEADO'],
            ['Cédula:', empleado.cedula || 'No especificada'],
            ['Nombre:', empleado.nombre],
            ['Cargo:', empleado.Cargo ? empleado.Cargo.nombre : 'No asignado'],
            [], // Línea en blanco
            ['CRITERIOS DE CALIFICACIÓN'],
            ['Criterio', 'Calificación', 'Fecha']
          ];

          // Agregar las calificaciones
          empleado.Calificaciones.forEach(calificacion => {
            const fecha = new Date(calificacion.fecha).toLocaleDateString();
            criteriosCalificacion.forEach(criterio => {
              calificacionesData.push([
                criterio.nombre,
                calificacion.criterios[criterio.id] || 'No calificado',
                fecha
              ]);
            });
          });

          // Crear la hoja de calificaciones
          const ws = XLSX.utils.aoa_to_sheet(calificacionesData);

          // Ajustar el ancho de las columnas
          const wscols = [
            { wch: 100 }, // Ancho para la columna de criterios
            { wch: 20 },  // Ancho para la columna de calificación
            { wch: 15 }   // Ancho para la columna de fecha
          ];
          ws['!cols'] = wscols;

          // Agregar la hoja al libro
          XLSX.utils.book_append_sheet(wb, ws, 'Calificaciones');

          // Generar nombre de archivo
          const fileName = `calificaciones_${empleado.cedula || empleado.id}_${empleado.nombre.replace(/[^a-z0-9]/gi, '_')}.xlsx`;
          const filePath = path.join(exportDir, fileName);

          // Guardar el archivo Excel
          XLSX.writeFile(wb, filePath);
          archivos.push({ name: fileName, path: filePath });
        }
      }

      if (archivos.length === 0) {
        return res.status(404).json({ error: 'No hay calificaciones para exportar' });
      }

      // Crear archivo ZIP
      const zipPath = path.join(exportDir, 'calificaciones_empleados.zip');
      const output = fs.createWriteStream(zipPath);
      const archive = archiver('zip', {
        zlib: { level: 9 }
      });

      // Configurar el archivo ZIP
      output.on('close', () => {
        // Enviar el archivo ZIP
        res.download(zipPath, 'calificaciones_empleados.zip', (err) => {
          if (err) {
            console.error('Error al enviar el archivo:', err);
          }
          // Limpiar archivos después de enviarlos
          archivos.forEach(file => {
            if (fs.existsSync(file.path)) {
              fs.unlinkSync(file.path);
            }
          });
          if (fs.existsSync(zipPath)) {
            fs.unlinkSync(zipPath);
          }
        });
      });

      archive.on('error', (err) => {
        throw err;
      });

      archive.pipe(output);

      // Agregar cada archivo Excel al ZIP
      archivos.forEach(file => {
        archive.file(file.path, { name: file.name });
      });

      // Finalizar el archivo ZIP
      await archive.finalize();

    } catch (error) {
      console.error('Error al exportar:', error);
      res.status(500).json({ error: 'Error al exportar calificaciones', detalles: error.message });
    }
  },

  async listarCalificaciones(req, res) {
    try {
      const empleado = await Empleado.findByPk(req.params.id, {
        include: [
          { model: Calificacion, as: 'Calificaciones' }
        ]
      });
      if (!empleado) {
        return res.status(404).json({ error: 'Empleado no encontrado' });
      }
      res.json(empleado.Calificaciones || []);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener calificaciones', detalles: error.message });
    }
  }
};