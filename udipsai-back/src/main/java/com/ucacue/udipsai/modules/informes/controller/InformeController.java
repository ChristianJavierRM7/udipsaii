package com.ucacue.udipsai.modules.informes.controller;

import com.ucacue.udipsai.modules.informes.dto.InformeDTO;
import com.ucacue.udipsai.modules.informes.dto.InformeRequest;
import com.ucacue.udipsai.modules.informes.service.InformeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/informes")
@Slf4j
public class InformeController {

    @Autowired
    private InformeService service;

    @GetMapping
    @PreAuthorize("hasAuthority('PERM_PACIENTES')")
    public ResponseEntity<List<InformeDTO>> listar() {
        return ResponseEntity.ok(service.listarInformes());
    }

    @GetMapping("/paciente/{pacienteId}")
    @PreAuthorize("hasAuthority('PERM_PACIENTES')")
    public ResponseEntity<List<InformeDTO>> listarPorPaciente(@PathVariable Integer pacienteId) {
        return ResponseEntity.ok(service.listarInformesPorPaciente(pacienteId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PERM_PACIENTES')")
    public ResponseEntity<InformeDTO> obtener(@PathVariable Integer id) {
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PERM_PACIENTES')")
    public ResponseEntity<InformeDTO> crear(@RequestBody InformeRequest request) {
        log.info("POST /api/informes pacienteId={}", request.getPacienteId());
        try {
            return ResponseEntity.ok(service.crearInforme(request));
        } catch (Exception e) {
            log.error("Error al crear informe: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PERM_PACIENTES')")
    public ResponseEntity<InformeDTO> actualizar(@PathVariable Integer id,
                                                  @RequestBody InformeRequest request) {
        try {
            return ResponseEntity.ok(service.actualizarInforme(id, request));
        } catch (Exception e) {
            log.error("Error al actualizar informe: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PERM_PACIENTES')")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        service.eliminarInforme(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAuthority('PERM_PACIENTES')")
    public ResponseEntity<byte[]> descargarPdf(@PathVariable Integer id) {
        log.info("Generando PDF informe ID={}", id);
        try {
            byte[] pdf = service.generarPdf(id);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=informe-" + id + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            log.error("Error PDF informe {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}