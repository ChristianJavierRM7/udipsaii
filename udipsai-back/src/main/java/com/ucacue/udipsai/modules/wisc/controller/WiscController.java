package com.ucacue.udipsai.modules.wisc.controller;

import com.ucacue.udipsai.modules.wisc.dto.EscalarRequestDTO;
import com.ucacue.udipsai.modules.wisc.service.WiscConversionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/wisc")
@CrossOrigin(origins = "*")
public class WiscController {

    private final WiscConversionService wiscService;

    public WiscController(WiscConversionService wiscService) {
        this.wiscService = wiscService;
    }

    @PostMapping("/escalar")
    public ResponseEntity<Map<String, Integer>> calcularEscalar(@Valid @RequestBody EscalarRequestDTO dto) {
        Integer escalar = wiscService.getEscalarSubprueba(dto.getSubprueba(), dto.getEdadMeses(), dto.getDirecta());
        if (escalar == null) {
            throw new IllegalArgumentException(String.format("Sin mapeo para esos parámetros en WISC (subprueba: '%s', edadMeses: %d, directa: %d)", dto.getSubprueba(), dto.getEdadMeses(), dto.getDirecta()));
        }
        return ResponseEntity.ok(Map.of("escalar", escalar));
    }

    @PostMapping("/calcular")
    public ResponseEntity<Map<String, Object>> calcularIndices(@RequestBody Map<String, Object> payload) {
        int edadMeses = payload.containsKey("edadMeses") ? ((Number) payload.get("edadMeses")).intValue() : 0;
        Map<String, Object> resultado = new LinkedHashMap<>();

        for (Map.Entry<String, Object> entry : payload.entrySet()) {
            if (entry.getKey().equals("edadMeses")) continue;

            String nombre = entry.getKey();
            Object value = entry.getValue();

            if (value instanceof Number) {
                int suma = ((Number) value).intValue();
                Map<String, Object> datos = wiscService.getConversionClinica(nombre, suma);
                Map<String, Object> indexResult = new HashMap<>();
                indexResult.put("suma", suma);
                if (datos != null) {
                    indexResult.put("ci", datos.get("ci"));
                    indexResult.put("percentil", datos.get("percentil"));
                    indexResult.put("ic_95_min", datos.get("ic_95_min"));
                    indexResult.put("ic_95_max", datos.get("ic_95_max"));
                } else {
                    indexResult.put("error", "No encontrada");
                    indexResult.put("ci", null);
                    indexResult.put("percentil", null);
                }
                resultado.put(nombre, indexResult);
            }
        }
        return ResponseEntity.ok(Map.of("edadMeses", edadMeses, "indices", resultado));
    }

    // Endpoint residual (Mantenido por compatibilidad si se usa en JS)
    @PostMapping("/guardar")
    public ResponseEntity<Map<String, Object>> guardarWisc() {
        return ResponseEntity.ok(Map.of("ok", true, "id", "WISC-" + System.currentTimeMillis()));
    }
}
