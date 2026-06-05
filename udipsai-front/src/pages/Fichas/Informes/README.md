# Carpeta `Informes` (Front)

Esta carpeta contiene los componentes que implementan el módulo de informes psicopedagógicos dentro de `Fichas`.

## Archivos principales

- `SelectorPacienteInformes.tsx`
  - Página inicial del módulo.
  - Permite buscar y filtrar pacientes.
  - Redirige a la lista de informes de un paciente.

- `ListaInformes.tsx`
  - Lista los informes del paciente seleccionado.
  - Permite descargar PDF y Word.
  - Permite editar y eliminar informes.

- `NuevoInforme.tsx`
  - Formulario para crear un informe nuevo.
  - Usa `informesService.crear(...)`.

- `EditarInforme.tsx`
  - Formulario para editar un informe existente.
  - Usa `informesService.actualizar(...)`.

## Servicio asociado

- `udipsai-front/src/services/informes.ts`
  - Define DTO/Request.
  - Maneja llamadas HTTP a `/api/informes`.
  - Genera descargas de `PDF` y `Word`.

## Ruta

Las rutas están configuradas en `udipsai-front/src/routes/config.tsx`:

- `/fichas/informes`
- `/fichas/informes/:pacienteId`
- `/fichas/informes/nuevo/:pacienteId`
- `/fichas/informes/editar/:id`

## Referencias

- Ver documentación general en `docs/INFORMES_PSICOPEDAGOGICOS.md`.
