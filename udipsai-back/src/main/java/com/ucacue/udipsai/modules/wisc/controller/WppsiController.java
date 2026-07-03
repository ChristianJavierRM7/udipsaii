package com.ucacue.udipsai.modules.wisc.controller;

import com.ucacue.udipsai.modules.wisc.dto.EscalarRequestDTO;
import com.ucacue.udipsai.modules.wisc.service.WppsiConversionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/wppsi")
@CrossOrigin(origins = "*")
public class WppsiController {

    private final WppsiConversionService wppsiService;

    public WppsiController(WppsiConversionService wppsiService) {
        this.wppsiService = wppsiService;
    }

    @PostMapping("/escalar")
    public ResponseEntity<Map<String, Integer>> calcularEscalar(@Valid @RequestBody EscalarRequestDTO dto) {
        Integer escalar = wppsiService.getEscalarSubpruebaWPPSI(dto.getEdadMeses(), dto.getSubprueba(), dto.getDirecta());
        if (escalar == null) {
            throw new IllegalArgumentException("Sin mapeo para esos parámetros en WPPSI");
        }
        return ResponseEntity.ok(Map.of("escalar", escalar));
    }

    @PostMapping("/calcular/etapa1")
    public ResponseEntity<Map<String, Object>> calcularEtapa1(@RequestBody Map<String, Object> payload) {
        return procesarCalculo(payload, "ETAPA1");
    }

    @PostMapping("/calcular/etapa2")
    public ResponseEntity<Map<String, Object>> calcularEtapa2(@RequestBody Map<String, Object> payload) {
        return procesarCalculo(payload, "ETAPA2");
    }

    private ResponseEntity<Map<String, Object>> procesarCalculo(Map<String, Object> payload, String etapa) {
        int edadMeses = payload.containsKey("edadMeses") ? ((Number) payload.get("edadMeses")).intValue() : 0;
        Map<String, Object> resultado = new LinkedHashMap<>();

        for (Map.Entry<String, Object> entry : payload.entrySet()) {
            if (entry.getKey().equals("edadMeses")) continue;

            String nombre = entry.getKey();
            Object value = entry.getValue();

            if (value instanceof Number) {
                int suma = ((Number) value).intValue();
                Map<String, Object> datos = wppsiService.getConversionClinicaWPPSI(nombre, suma, etapa);
                if (datos != null) {
                    Map<String, Object> indexResult = new HashMap<>();
                    indexResult.put("suma", suma);
                    indexResult.put("ci", datos.get("ci"));
                    indexResult.put("percentil", datos.get("percentil"));
                    indexResult.put("ic_95_min", datos.get("ic_95_min"));
                    indexResult.put("ic_95_max", datos.get("ic_95_max"));
                    resultado.put(nombre, indexResult);
                }
            }
        }
        return ResponseEntity.ok(Map.of("edadMeses", edadMeses, "indices", resultado));
    }

    // Endpoint residual (Mantenido por compatibilidad)
    @PostMapping("/etapa1/guardar")
    public ResponseEntity<Map<String, Object>> guardarWppsiEtapa1() {
        return ResponseEntity.ok(Map.of("ok", true, "id", "WPPSI1-" + System.currentTimeMillis()));
    }
}
