package com.ucacue.udipsai.modules.wisc.controller;

import com.ucacue.udipsai.modules.wisc.dto.EvaluacionGuardarDTO;
import com.ucacue.udipsai.modules.wisc.dto.EvaluacionResumenDTO;
import com.ucacue.udipsai.modules.wisc.service.EvaluacionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.Map;

@RestController
@RequestMapping("/api/wisc/evaluaciones")
@CrossOrigin(origins = "*")
public class EvaluacionController {

    private final EvaluacionService evaluacionService;

    public EvaluacionController(EvaluacionService evaluacionService) {
        this.evaluacionService = evaluacionService;
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> guardarEvaluacion(@Valid @RequestBody EvaluacionGuardarDTO dto) {
        Map<String, Object> response = evaluacionService.guardarEvaluacion(dto);
        return ResponseEntity.ok(response);
    }

    // El endpoint de busqueda usaba un payload POST en el diseño anterior.
    // Lo mantenemos en POST a /buscar para facilitar la migración temporal del cliente JS
    @PostMapping("/buscar")
    public ResponseEntity<org.springframework.data.domain.Page<EvaluacionResumenDTO>> buscarEvaluaciones(@RequestBody Map<String, String> payload) {
        String nombreQ = payload.containsKey("nombre") ? payload.get("nombre") : "";
        String fechaQ = payload.containsKey("fecha") ? payload.get("fecha") : "";
        int page = payload.containsKey("page") ? Integer.parseInt(payload.get("page")) : 0;
        int size = payload.containsKey("size") ? Integer.parseInt(payload.get("size")) : 50;
        
        org.springframework.data.domain.Page<EvaluacionResumenDTO> result = evaluacionService.buscarEvaluaciones(nombreQ, fechaQ, page, size);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> leerEvaluacion(@PathVariable @org.springframework.lang.NonNull String id) {
        Map<String, Object> data = evaluacionService.leerEvaluacion(id);
        return ResponseEntity.ok(data);
    }

    @DeleteMapping("/{id}")

    public ResponseEntity<Map<String, Boolean>> eliminarEvaluacion(@PathVariable @org.springframework.lang.NonNull String id) {
        evaluacionService.eliminarEvaluacion(id);
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
