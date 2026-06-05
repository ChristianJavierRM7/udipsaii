# Requerimientos Funcionales - Informes Psicopedagógicos

## 1. Descripción general

El sistema debe permitir registrar, consultar, editar, eliminar y descargar informes psicopedagógicos asociados a pacientes.

## 2. Requerimientos principales

### RF-1: Selección de paciente

- El usuario debe ver una lista de pacientes activos.
- Debe poder buscar al paciente por nombre o cédula.
- Debe poder aplicar filtros por edad mínima, edad máxima, nivel educativo, año de ficha y área atendida.
- Al seleccionar un paciente, el sistema debe mostrar la lista de informes asociados.

### RF-2: Listado de informes

- El sistema debe mostrar los informes del paciente seleccionado.
- Debe incluir número de ficha, nombre del paciente, fecha de elaboración y fecha de lectura.
- Debe permitir generar un PDF y un Word para cada informe.
- Debe permitir editar o eliminar el informe.

### RF-3: Creación de informe

- El sistema debe permitir crear un nuevo informe psicopedagógico para un paciente.
- El formulario debe capturar al menos los siguientes campos:
  - número de ficha
  - representante
  - parentesco
  - fechas de evaluación
  - fecha de elaboración de informe
  - fecha de lectura del informe
  - motivo de consulta
  - historia escolar
  - psicobiografía
  - observación en la consulta
  - reactivos de psicología educativa
  - reactivos de psicología clínica
  - conclusiones
  - recomendaciones para institución
  - recomendaciones para representante
  - área/evaluador/profesional de Psicología Educativa
  - área/evaluador/profesional de Psicología Clínica
  - coordinadora

### RF-4: Edición de informe

- El usuario debe poder actualizar los datos de un informe existente.
- El sistema debe conservar el historial de la fecha de creación y solo modificar los campos del informe.

### RF-5: Eliminación de informe

- La eliminación debe marcar el informe como inactivo y no mostrarlo en el listado.
- Debe solicitar confirmación antes de eliminar.

### RF-6: Descarga de informes

- El sistema debe generar un PDF basado en la plantilla `informe-psicopedagogico.html`.
- El sistema debe generar un documento Word (`.docx`).
- La descarga debe usar el nombre seguro del paciente.

### RF-7: API REST

- Debe exponer endpoints para listar, obtener, crear, actualizar y eliminar informes.
- Debe exponer endpoints para descargar PDF y Word.
- Las rutas deben estar protegidas por permisos de usuario.

## 3. Criterios de aceptación

- El módulo solo debe mostrar informes activos.
- Los campos obligatorios no deben quedar vacíos en la creación del informe.
- Las descargas deben devolverse como `application/pdf` y `application/vnd.openxmlformats-officedocument.wordprocessingml.document`.
- La plantilla PDF debe incluir los datos del paciente, fechas, contenido del informe y responsables.
- La creación y edición no deben romper otras funcionalidades de `Fichas`.
