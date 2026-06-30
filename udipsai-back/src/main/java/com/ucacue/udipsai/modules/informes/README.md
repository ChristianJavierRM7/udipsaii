# Carpeta `informes` (Back)

Módulo backend que gestiona los informes psicopedagógicos.

## Archivos principales

- `controller/InformeController.java`
  - Expone la API REST para CRUD de informes.
  - Controla descargas de PDF y Word.
  - Protege las rutas con `PERM_PACIENTES`.

- `service/InformeService.java`
  - Lógica de negocio para creación, edición, listado y eliminación.
  - Genera el PDF usando la plantilla Thymeleaf.

- `service/InformeWordService.java`
  - Generación del documento Word.

- `repository/InformeRepository.java`
  - Acceso a datos con Spring Data JPA.

- `domain/InformePsicopedagogico.java`
  - Entidad JPA que representa los informes.

- `dto/InformeDTO.java`
  - Respuesta para el frontend.

- `dto/InformeRequest.java`
  - Petición de creación y actualización.

## Plantilla PDF

- `udipsai-back/src/main/resources/templates/reportes/informe-psicopedagogico.html`
  - Define el diseño y contenido del PDF.
  - Usa Thymeleaf para inyectar datos.

## Servicio de PDF

- `udipsai-back/src/main/java/com/ucacue/udipsai/common/report/PdfService.java`
  - Convierte HTML a PDF con `openhtmltopdf`.
  - Carga logos como Base64.

## Referencias

- Ver documentación general en [GUIA_COMPLETA_INFORMES.md](../../../../../../../../../docs/documentacion-tecnica-informes-psicopedagogicos/GUIA_COMPLETA_INFORMES.md).

