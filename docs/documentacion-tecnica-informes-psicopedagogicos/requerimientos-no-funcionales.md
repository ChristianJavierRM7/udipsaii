# Requerimientos No Funcionales - Informes Psicopedagógicos

## 1. Rendimiento

- El listado de pacientes debe cargarse en menos de 2 segundos para un máximo de 1000 registros.
- El listado de informes de un paciente debe cargarse en menos de 1.5 segundos.
- La generación de PDF/Word debe completarse en un tiempo razonable (< 10 segundos) para un informe estándar.

## 2. Seguridad

- Solo usuarios con permiso `PERM_PACIENTES` pueden acceder a las rutas de informes.
- Las llamadas a la API deben validar el token del usuario.
- La descarga de archivos no debe exponer datos de pacientes no autorizados.
- El back-end debe manejar errores con respuestas HTTP adecuadas y evitar filtraciones de stack trace.

## 3. Usabilidad

- La interfaz debe ser clara y consistente con el módulo de `Fichas`.
- Los botones de generación de PDF y Word deben ser visibles y comprensibles.
- El formulario de informe debe permitir texto libre en secciones narrativas.
- El usuario debe recibir mensajes claros en caso de error o éxito.

## 4. Mantenibilidad

- El código debe estar organizado en capas: controlador, servicio, repositorio y DTO.
- El HTML de plantilla debe ser modular y permitir cambios de diseño sin tocar la lógica de negocio.
- Las rutas del frontend deben ser coherentes y documentadas.
- Se debe usar un servicio compartido para las llamadas a la API (`informesService`).

## 5. Compatibilidad

- El PDF generado debe ser compatible con lectores de PDF estándar.
- El Word generado debe abrirse correctamente en Microsoft Word y LibreOffice.
- La aplicación debe funcionar en navegadores modernos compatibles con React.

## 6. Disponibilidad

- El módulo debe soportar carga concurrente de múltiples usuarios sin degradar significativamente la experiencia.
- La generación de PDF no debe bloquear el hilo principal del servidor.

## 7. Calidad de datos

- Los campos de texto largos deben guardarse en columnas `TEXT` en la base de datos.
- Las fechas deben almacenarse correctamente como `LocalDate`.
- El sistema debe normalizar datos de texto en la presentación del PDF.
