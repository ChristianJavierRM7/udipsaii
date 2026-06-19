package com.ucacue.udipsai.modules.fichasocial.controller;

import com.ucacue.udipsai.modules.fichasocial.dto.FichaSocioeconomicaDTO;
import com.ucacue.udipsai.modules.fichasocial.dto.FichaSocioeconomicaRequest;
import com.ucacue.udipsai.modules.fichasocial.Service.FichaSocioeconomicaService;
import com.ucacue.udipsai.modules.fichasocial.Service.FichaSocioeconomicaReportService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.util.List;

@RestController

@RequestMapping("/api/fichas-socioeconomicas")
@CrossOrigin(origins = "*")

public class FichaSocioeconomicaController {

    @Autowired
    private FichaSocioeconomicaService fichaService;

    @Autowired
    private FichaSocioeconomicaReportService reportService;

    @Autowired
    private com.ucacue.udipsai.modules.asignacion.service.AsignacionSecurityService asignacionSecurity;

    @GetMapping
    @PreAuthorize("hasAuthority('PERM_SOCIOECONOMICA')")
    public ResponseEntity<List<FichaSocioeconomicaDTO>> listar() {
        return ResponseEntity.ok(fichaService.listarFichas());
    }

    @GetMapping("/paciente/{pacienteId}")
    @PreAuthorize("hasAuthority('PERM_SOCIOECONOMICA') and @asignacionSecurity.checkPasanteAcceso(#pacienteId)")
    public ResponseEntity<FichaSocioeconomicaDTO> obtenerPorPaciente(@PathVariable Integer pacienteId) {
        FichaSocioeconomicaDTO dto = fichaService.obtenerFichaActivaPorPacienteId(pacienteId);
        return (dto != null) ? ResponseEntity.ok(dto) : ResponseEntity.notFound().build();
    }

    @GetMapping("/paciente/id/{pacienteId}/historial")
    @PreAuthorize("hasAuthority('PERM_SOCIOECONOMICA') and @asignacionSecurity.checkPasanteAcceso(#pacienteId)")
    public ResponseEntity<List<FichaSocioeconomicaDTO>> obtenerHistorialPorPacienteId(@PathVariable Integer pacienteId) {
        return ResponseEntity.ok(fichaService.obtenerHistorialPorPacienteId(pacienteId));
    }

    @GetMapping("/reporte/pdf/id/{id}")
    public ResponseEntity<Resource> descargarPdfPorId(@PathVariable Integer id) throws Exception {
        FichaSocioeconomicaDTO dto = fichaService.obtenerPorId(id);
        if (dto != null && dto.getPaciente() != null) {
            if (!asignacionSecurity.checkPasanteAcceso(dto.getPaciente().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        byte[] pdf = reportService.exportarPdfPorFichaId(id);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=ficha_socioeconomica_" + id + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new ByteArrayResource(pdf));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FichaSocioeconomicaDTO> obtenerPorId(@PathVariable Integer id) {
        FichaSocioeconomicaDTO dto = fichaService.obtenerPorId(id);
        if (dto != null && dto.getPaciente() != null) {
            if (!asignacionSecurity.checkPasanteAcceso(dto.getPaciente().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean canView = auth.getAuthorities().contains(new org.springframework.security.core.authority.SimpleGrantedAuthority("PERM_SOCIOECONOMICA"));
        if (!canView) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(dto);
    }

    @PostMapping("/crearFicha")
    public ResponseEntity<FichaSocioeconomicaDTO> crear(@RequestBody FichaSocioeconomicaRequest request) {
        if (!asignacionSecurity.checkPasanteAcceso(request.getPacienteId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean canCreate = auth.getAuthorities().contains(new org.springframework.security.core.authority.SimpleGrantedAuthority("PERM_SOCIOECONOMICA_CREAR"));
        if (!canCreate) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(fichaService.crearFicha(request));
    }

    @PutMapping("/socioeconomicas/{id}")
    public ResponseEntity<FichaSocioeconomicaDTO> actualizar(@PathVariable Integer id,
            @RequestBody FichaSocioeconomicaRequest request) {
        if (!asignacionSecurity.checkPasanteAcceso(request.getPacienteId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean canEdit = auth.getAuthorities().contains(new org.springframework.security.core.authority.SimpleGrantedAuthority("PERM_SOCIOECONOMICA_EDITAR"));
        if (!canEdit) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(fichaService.actualizarFicha(id, request));
    }

    @DeleteMapping("/socioeconomicas/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        FichaSocioeconomicaDTO dto = fichaService.obtenerPorId(id);
        if (dto != null && dto.getPaciente() != null) {
            if (!asignacionSecurity.checkPasanteAcceso(dto.getPaciente().getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }
        }

        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        boolean canDelete = auth.getAuthorities().contains(new org.springframework.security.core.authority.SimpleGrantedAuthority("PERM_SOCIOECONOMICA_ELIMINAR"));
        if (!canDelete) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        fichaService.desactivarFicha(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/reporte/excel")
    @PreAuthorize("hasAuthority('PERM_SOCIOECONOMICA') and (#pacienteId == null or @asignacionSecurity.checkPasanteAcceso(#pacienteId))")
    public ResponseEntity<Resource> descargarExcel(@RequestParam(required = false) Integer pacienteId)
            throws IOException {

        ByteArrayInputStream in = reportService.exportarExcel(pacienteId);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=ficha_socioeconomica.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))

                .body(new InputStreamResource(in));
    }

    @GetMapping("/reporte/pdf")
    @PreAuthorize("hasAuthority('PERM_SOCIOECONOMICA') and @asignacionSecurity.checkPasanteAcceso(#pacienteId)")
    public ResponseEntity<Resource> descargarPdf(
            @RequestParam Integer pacienteId) throws Exception {

        byte[] pdf = reportService.exportarPdf(pacienteId);

        HttpHeaders headers = new HttpHeaders();
        headers.add(
                "Content-Disposition",
                "attachment; filename=ficha_socioeconomica.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new ByteArrayResource(pdf));
    }
}