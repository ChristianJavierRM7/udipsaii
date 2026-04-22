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

// ─────────────────────────────────────────────────────────────────────────────
// El Controller "escucha" las peticiones HTTP que llegan desde el frontend
// (React) y llama al Service para procesarlas.
//
// Rutas disponibles:
//   GET    /api/informes                    → lista todos los informes
//   GET    /api/informes/paciente/{id}      → informes de un paciente
//   GET    /api/informes/{id}               → un informe específico
//   POST   /api/informes                    → crear informe nuevo
//   PUT    /api/informes/{id}               → actualizar informe
//   DELETE /api/informes/{id}               → desactivar informe
//   GET    /api/informes/{id}/pdf           → DESCARGAR el PDF ← el importante
// ─────────────────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/informes")
@Slf4j
public class InformeController {

    @Autowired
    private InformeService service;

    @GetMapping
    @PreAuthorize("hasAuthority('PERM_INFORMES')")
    public ResponseEntity<List<InformeDTO>> listar() {
        log.info("GET /api/informes");
        return ResponseEntity.ok(service.listarInformes());
    }

    @GetMapping("/paciente/{pacienteId}")
    @PreAuthorize("hasAuthority('PERM_INFORMES')")
    public ResponseEntity<List<InformeDTO>> listarPorPaciente(@PathVariable Integer pacienteId) {
        log.info("GET /api/informes/paciente/{}", pacienteId);
        return ResponseEntity.ok(service.listarInformesPorPaciente(pacienteId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('PERM_INFORMES')")
    public ResponseEntity<InformeDTO> obtener(@PathVariable Integer id) {
        log.info("GET /api/informes/{}", id);
        return ResponseEntity.ok(service.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAuthority('PERM_INFORMES_CREAR')")
    public ResponseEntity<InformeDTO> crear(@RequestBody InformeRequest request) {
        log.info("POST /api/informes para paciente ID: {}", request.getPacienteId());
        try {
            return ResponseEntity.ok(service.crearInforme(request));
        } catch (Exception e) {
            log.error("Error al crear informe: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('PERM_INFORMES_EDITAR')")
    public ResponseEntity<InformeDTO> actualizar(@PathVariable Integer id,
                                                  @RequestBody InformeRequest request) {
        log.info("PUT /api/informes/{}", id);
        try {
            return ResponseEntity.ok(service.actualizarInforme(id, request));
        } catch (Exception e) {
            log.error("Error al actualizar informe: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('PERM_INFORMES_ELIMINAR')")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        log.info("DELETE /api/informes/{}", id);
        service.eliminarInforme(id);
        return ResponseEntity.noContent().build();
    }

    // ── ENDPOINT DEL PDF ─────────────────────────────────────────────────────
    // Cuando el navegador llama a GET /api/informes/5/pdf,
    // este método genera el PDF y lo envía como descarga.
    @GetMapping("/{id}/pdf")
    @PreAuthorize("hasAuthority('PERM_INFORMES')")
    public ResponseEntity<byte[]> descargarPdf(@PathVariable Integer id) {
        log.info("Generando PDF para informe ID: {}", id);
        try {
            byte[] pdf = service.generarPdf(id);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=informe-psicopedagogico-" + id + ".pdf")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdf);
        } catch (Exception e) {
            log.error("Error al generar PDF del informe {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}