# Casos de Uso - Informes Psicopedagógicos

## 1. Actores

- Profesional psicopedagógico / técnico de ficha
- Usuario administrador con permisos de pacientes
- Paciente (datos asociados)

## 2. Casos de uso clave

### 2.1 Seleccionar paciente para informes

- Actor: profesional
- Descripción: El profesional busca un paciente por nombre o cédula y filtra la lista para ver los pacientes con una ficha activa.
- Resultado: Se muestra la lista de pacientes y al seleccionar uno se navega a los informes.

### 2.2 Ver lista de informes

- Actor: profesional
- Descripción: El profesional visualiza todos los informes psicopedagógicos activos del paciente seleccionado.
- Resultado: Se muestra una tabla con los informes y opciones para descargar, editar o eliminar.

### 2.3 Crear un informe psicopedagógico

- Actor: profesional
- Descripción: El profesional completa el formulario de informe con datos narrativos y técnicos.
- Resultado: El informe se guarda y aparece en la lista de informes.

### 2.4 Editar un informe existente

- Actor: profesional
- Descripción: El profesional modifica un informe previamente creado, manteniendo su ID y fecha de creación.
- Resultado: El informe se actualiza en la base de datos y la lista refleja los cambios.

### 2.5 Eliminar un informe

- Actor: profesional
- Descripción: El profesional elimina un informe luego de confirmar la acción.
- Resultado: El informe se marca como inactivo y no aparece en la lista.

### 2.6 Descargar informe en PDF

- Actor: profesional
- Descripción: El profesional solicita la generación y descarga del informe en formato PDF.
- Resultado: Se descarga un archivo PDF con la plantilla `informe-psicopedagogico`.

### 2.7 Descargar informe en Word

- Actor: profesional
- Descripción: El profesional solicita la descarga en formato Word.
- Resultado: Se descarga un archivo `.docx` con el contenido del informe.

## 3. Diagrama de casos de uso

```mermaid
usecaseDiagram
  actor Profesional
  actor Administrador

  Profesional --> (Seleccionar paciente)
  Profesional --> (Ver lista de informes)
  Profesional --> (Crear informe)
  Profesional --> (Editar informe)
  Profesional --> (Eliminar informe)
  Profesional --> (Descargar PDF)
  Profesional --> (Descargar Word)

  Administrador --> (Ver lista de informes)
  Administrador --> (Eliminar informe)
```

## 4. Escenarios de validación

### Escenario 1: Paciente sin informes

- Dado que el paciente no tiene informes activos
- Cuando el profesional abre la lista de informes
- Entonces el sistema muestra un mensaje de `Sin informes registrados`

### Escenario 2: Creación exitosa

- Dado que el profesional completa todos los campos obligatorios
- Cuando envía el formulario
- Entonces se guarda el informe y se muestra un mensaje de éxito

### Escenario 3: Descarga de PDF

- Dado que el informe existe y es activo
- Cuando el profesional hace clic en `PDF`
- Entonces se descarga el archivo con el nombre del paciente y formato PDF
