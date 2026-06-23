package com.ucacue.udipsai.modules.informesocial.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ucacue.udipsai.modules.informesocial.dto.InformeSocialDTO;
import com.ucacue.udipsai.modules.informesocial.dto.InformeSocialRequest;
import com.ucacue.udipsai.modules.informesocial.dto.InformeSocialFamiliarDTO;
import com.ucacue.udipsai.modules.informesocial.service.InformeSocialReportService;
import com.ucacue.udipsai.modules.informesocial.service.InformeSocialService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.prepost.PreAuthorize;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/informes-sociales")
@CrossOrigin(origins = "*")
public class InformeSocialController {

    @Autowired
    private InformeSocialService informeService;

    @Autowired
    private InformeSocialReportService reportService;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private com.ucacue.udipsai.modules.asignacion.service.AsignacionSecurityService asignacionSecurity;

    @GetMapping
    @PreAuthorize("hasAuthority('PERM_INFORME_SOCIAL')")
    public ResponseEntity<List<InformeSocialDTO>> listar() {
        return ResponseEntity.ok(informeService.listarInformes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InformeSocialDTO> obtenerPorId(@PathVariable Integer id) {
        InformeSocialDTO dto = informeService.obtenerPorId(id);
        if (dto != null && dto.getPaciente() != null) {
            if (!asignacionSecurity.checkPasanteAcceso(dto.getPaciente().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean canView = auth.getAuthorities().contains(new org.springframework.security.core.authority.SimpleGrantedAuthority("PERM_INFORME_SOCIAL"));
        if (!canView) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/paciente/{cedula}")
    public ResponseEntity<InformeSocialDTO> obtenerPorPaciente(@PathVariable String cedula) {
        InformeSocialDTO dto = informeService.obtenerPorPacienteCedula(cedula);
        if (dto != null && dto.getPaciente() != null) {
            if (!asignacionSecurity.checkPasanteAcceso(dto.getPaciente().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean canView = auth.getAuthorities().contains(new org.springframework.security.core.authority.SimpleGrantedAuthority("PERM_INFORME_SOCIAL"));
        if (!canView) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return (dto != null) ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @GetMapping("/paciente/id/{pacienteId}")
    @PreAuthorize("hasAuthority('PERM_INFORME_SOCIAL') and @asignacionSecurity.checkPasanteAcceso(#pacienteId)")
    public ResponseEntity<InformeSocialDTO> obtenerPorPacienteId(@PathVariable Integer pacienteId) {
        InformeSocialDTO dto = informeService.obtenerPorPacienteId(pacienteId);
        return (dto != null) ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @GetMapping("/paciente/id/{pacienteId}/historial")
    @PreAuthorize("hasAuthority('PERM_INFORME_SOCIAL') and @asignacionSecurity.checkPasanteAcceso(#pacienteId)")
    public ResponseEntity<List<InformeSocialDTO>> obtenerHistorialPorPacienteId(@PathVariable Integer pacienteId) {
        return ResponseEntity.ok(informeService.obtenerHistorialPorPacienteId(pacienteId));
    }

    @GetMapping("/siguiente-numero")
    @PreAuthorize("hasAuthority('PERM_INFORME_SOCIAL')")
    public ResponseEntity<String> obtenerSiguienteNumeroFicha() {
        return ResponseEntity.ok(informeService.obtenerSiguienteNumeroFicha());
    }

    @PostMapping(value = "/crear", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<InformeSocialDTO> crearInforme(
            @RequestPart("informe") String informeJson,
            @RequestPart(value = "genograma", required = false) MultipartFile genograma,
            @RequestPart(value = "ecomapa", required = false) MultipartFile ecomapa) {

        try {
            InformeSocialRequest request = objectMapper.readValue(informeJson, InformeSocialRequest.class);
            if (!asignacionSecurity.checkPasanteAcceso(request.getPacienteId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            boolean canCreate = auth.getAuthorities().contains(new org.springframework.security.core.authority.SimpleGrantedAuthority("PERM_INFORME_SOCIAL_CREAR"));
            if (!canCreate) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(informeService.crearInforme(request, genograma, ecomapa));
        } catch (Exception e) {
            throw new IllegalArgumentException(e.getMessage(), e);
        }
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<InformeSocialDTO> actualizarInforme(
            @PathVariable Integer id,
            @RequestPart("informe") String informeJson,
            @RequestPart(value = "genograma", required = false) MultipartFile genograma,
            @RequestPart(value = "ecomapa", required = false) MultipartFile ecomapa) {

        try {
            InformeSocialRequest request = objectMapper.readValue(informeJson, InformeSocialRequest.class);
            if (!asignacionSecurity.checkPasanteAcceso(request.getPacienteId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            boolean canEdit = auth.getAuthorities().contains(new org.springframework.security.core.authority.SimpleGrantedAuthority("PERM_INFORME_SOCIAL_EDITAR"));
            if (!canEdit) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            return ResponseEntity.ok(informeService.actualizarInforme(id, request, genograma, ecomapa));
        } catch (Exception e) {
            throw new IllegalArgumentException(e.getMessage(), e);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        InformeSocialDTO dto = informeService.obtenerPorId(id);
        if (dto != null && dto.getPaciente() != null) {
            if (!asignacionSecurity.checkPasanteAcceso(dto.getPaciente().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean canDelete = auth.getAuthorities().contains(new org.springframework.security.core.authority.SimpleGrantedAuthority("PERM_INFORME_SOCIAL_ELIMINAR"));
        if (!canDelete) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        informeService.eliminarInforme(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{informeId}/familiares/{familiarId}")
    public ResponseEntity<InformeSocialDTO> actualizarFamiliar(
            @PathVariable Integer informeId,
            @PathVariable Integer familiarId,
            @RequestBody InformeSocialFamiliarDTO familiarDTO) {
        InformeSocialDTO dto = informeService.obtenerPorId(informeId);
        if (dto != null && dto.getPaciente() != null) {
            if (!asignacionSecurity.checkPasanteAcceso(dto.getPaciente().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean canEdit = auth.getAuthorities().contains(new org.springframework.security.core.authority.SimpleGrantedAuthority("PERM_INFORME_SOCIAL_EDITAR"));
        if (!canEdit) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(informeService.actualizarFamiliarEspecifico(informeId, familiarId, familiarDTO));
    }

    @GetMapping("/reporte/excel")
    @PreAuthorize("hasAuthority('PERM_INFORME_SOCIAL') and (#pacienteId == null or @asignacionSecurity.checkPasanteAcceso(#pacienteId))")
    public ResponseEntity<Resource> descargarExcel(
            @RequestParam(required = false) Integer pacienteId)
            throws IOException {

        ByteArrayInputStream in = reportService.exportarExcel(pacienteId);

        HttpHeaders headers = new HttpHeaders();
        headers.add(
                "Content-Disposition",
                "attachment; filename=informe_social.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(
                        MediaType.parseMediaType(
                                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }

    @GetMapping("/reporte/pdf")
    @PreAuthorize("hasAuthority('PERM_INFORME_SOCIAL') and @asignacionSecurity.checkPasanteAcceso(#pacienteId)")
    public ResponseEntity<Resource> descargarPdf(
            @RequestParam Integer pacienteId)
            throws Exception {

        byte[] pdf = reportService.exportarPdf(pacienteId);

        HttpHeaders headers = new HttpHeaders();
        headers.add(
                "Content-Disposition",
                "attachment; filename=informe_social.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new ByteArrayResource(pdf));
    }

    @GetMapping("/reporte/pdf/id/{id}")
    public ResponseEntity<Resource> descargarPdfPorId(
            @PathVariable Integer id)
            throws Exception {
        InformeSocialDTO dto = informeService.obtenerPorId(id);
        if (dto != null && dto.getPaciente() != null) {
            if (!asignacionSecurity.checkPasanteAcceso(dto.getPaciente().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        byte[] pdf = reportService.exportarPdfPorInformeId(id);

        HttpHeaders headers = new HttpHeaders();
        headers.add(
                "Content-Disposition",
                "attachment; filename=informe_social_" + id + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new ByteArrayResource(pdf));
    }

    @GetMapping("/paciente/{pacienteId}/genograma")
    @PreAuthorize("hasAuthority('PERM_INFORME_SOCIAL') and @asignacionSecurity.checkPasanteAcceso(#pacienteId)")
    public ResponseEntity<Resource> descargarGenograma(@PathVariable Integer pacienteId) {
        Resource file = informeService.cargarGenogramaComoRecurso(pacienteId);
        if (file == null) {
            return ResponseEntity.notFound().build();
        }
        MediaType mediaType = getMediaTypeForFileName(file.getFilename());
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }

    @GetMapping("/id/{id}/genograma")
    public ResponseEntity<Resource> descargarGenogramaPorInformeId(@PathVariable Integer id) {
        InformeSocialDTO dto = informeService.obtenerPorId(id);
        if (dto != null && dto.getPaciente() != null) {
            if (!asignacionSecurity.checkPasanteAcceso(dto.getPaciente().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        Resource file = informeService.cargarGenogramaPorInformeIdComoRecurso(id);
        if (file == null) {
            return ResponseEntity.notFound().build();
        }
        MediaType mediaType = getMediaTypeForFileName(file.getFilename());
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }

    @GetMapping("/paciente/{pacienteId}/ecomapa")
    @PreAuthorize("hasAuthority('PERM_INFORME_SOCIAL') and @asignacionSecurity.checkPasanteAcceso(#pacienteId)")
    public ResponseEntity<Resource> descargarEcomapa(@PathVariable Integer pacienteId) {
        Resource file = informeService.cargarEcomapaComoRecurso(pacienteId);
        if (file == null) {
            return ResponseEntity.notFound().build();
        }
        MediaType mediaType = getMediaTypeForFileName(file.getFilename());
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }

    @GetMapping("/id/{id}/ecomapa")
    public ResponseEntity<Resource> descargarEcomapaPorInformeId(@PathVariable Integer id) {
        InformeSocialDTO dto = informeService.obtenerPorId(id);
        if (dto != null && dto.getPaciente() != null) {
            if (!asignacionSecurity.checkPasanteAcceso(dto.getPaciente().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }
        Resource file = informeService.cargarEcomapaPorInformeIdComoRecurso(id);
        if (file == null) {
            return ResponseEntity.notFound().build();
        }
        MediaType mediaType = getMediaTypeForFileName(file.getFilename());
        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + file.getFilename() + "\"")
                .body(file);
    }

    private MediaType getMediaTypeForFileName(String filename) {
        if (filename == null) return MediaType.APPLICATION_OCTET_STREAM;
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) return MediaType.IMAGE_PNG;
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return MediaType.IMAGE_JPEG;
        if (lower.endsWith(".gif")) return MediaType.IMAGE_GIF;
        if (lower.endsWith(".pdf")) return MediaType.APPLICATION_PDF;
        return MediaType.APPLICATION_OCTET_STREAM;
    }
}