# Proceso de Levantamiento de Información - Informes Psicopedagógicos

## 1. Objetivo

Documentar el proceso para identificar datos, fuentes y requerimientos del módulo de informes psicopedagógicos.

## 2. Actividades del levantamiento

### 2.1 Identificar stakeholders

- Profesionales que elaboran informes.
- Personal administrativo que gestiona fichas.
- Equipo de desarrollo que construye el módulo.
- Usuarios que consumen el documento final (instituciones, representantes).

### 2.2 Definir fuentes de información

- Formularios internos del sistema.
- Plantillas de informes actuales en Word/PDF.
- Reuniones con responsables de psicopedagogía.
- Revisar la base de datos de pacientes y fichas existentes.

### 2.3 Recopilar campos requeridos

Campos mínimos por informe:

- Datos básicos del paciente: nombre, cédula, fecha de nacimiento, nivel educativo, institución.
- Información de la ficha: número de ficha, fechas de evaluación, fecha de elaboración, fecha de lectura.
- Texto narrativo: motivo de consulta, historia escolar, psicobiografía, observación de la consulta.
- Resultados/Reactivos: psicología educativa, psicología clínica.
- Conclusiones y recomendaciones.
- Equipo responsable: evaluador, profesional, coordinadora.

### 2.4 Validación de datos

- Verificar que los campos guardados en la base de datos coincidan con la plantilla de PDF.
- Confirmar que el contenido se muestra correctamente en la descarga PDF y Word.
- Validar el flujo de creación y edición con el usuario final.

## 3. Preguntas clave para el levantamiento

- ¿Qué datos del paciente son imprescindibles en el informe?
- ¿Qué campos se deben llenar manualmente en cada informe?
- ¿Qué formato debe tener la fecha de evaluación en el PDF?
- ¿Cuáles son los criterios para separar Psicología Educativa y Clínica?
- ¿Qué contenido va en recomendaciones para institución y representante?
- ¿Cómo debe manejarse la firma y la entrega del informe?
- ¿Qué nivel de detalle se espera en la historia escolar y psicobiografía?

## 4. Producto del levantamiento

- Lista de campos del formulario.
- Requerimientos funcionales y no funcionales.
- Diagramas de flujo y casos de uso.
- Plantilla de informe final (`informe-psicopedagogico.html`).
- Identificación de permisos y roles necesarios.

## 5. Recomendaciones para el equipo

- Mantener la plantilla PDF separada de la lógica de generación.
- Documentar cualquier cambio en la estructura de datos en `docs/levantamiento`.
- Validar nuevas secciones con los usuarios antes de implementarlas.
- Guardar un historial de cambios de campos si se agrega un formulario más complejo.
