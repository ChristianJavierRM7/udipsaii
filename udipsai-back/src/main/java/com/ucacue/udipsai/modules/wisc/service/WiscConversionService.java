package com.ucacue.udipsai.modules.wisc.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@Service
public class WiscConversionService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private JsonNode escalaresNode;
    private JsonNode indicesNode;

    @PostConstruct
    public void init() {
        try {
            InputStream escalaresStream = new ClassPathResource("data/wisc/wisc_escalares_6-0_a_16-11_anos.json").getInputStream();
            escalaresNode = objectMapper.readTree(escalaresStream);
            
            InputStream indicesStream = new ClassPathResource("data/wisc/wisc_indices_6-0_a_16-11_anos.json").getInputStream();
            indicesNode = objectMapper.readTree(indicesStream);
            System.out.println("[WiscConversionService] Archivos JSON cargados correctamente.");
        } catch (Exception e) {
            System.err.println("[WiscConversionService] Error cargando JSON: " + e.getMessage());
        }
    }

    private String resolverBandaWISC(int edadMeses) {
        if (escalaresNode == null || !escalaresNode.has("escalares")) return null;
        
        JsonNode escalares = escalaresNode.get("escalares");
        Iterable<String> fieldNames = escalares::fieldNames;
        for (String key : fieldNames) {
            String[] parts = key.split("-");
            if (parts.length == 2) {
                int min = Integer.parseInt(parts[0]);
                int max = Integer.parseInt(parts[1]);
                if (edadMeses >= min && edadMeses <= max) {
                    return key;
                }
            }
        }
        return null;
    }

    public Integer getEscalarSubprueba(String subprueba, int edadMeses, int directa) {
        try {
            String bandaKey = resolverBandaWISC(edadMeses);
            if (bandaKey == null) return null;

            JsonNode tablaSubprueba = escalaresNode.get("escalares").get(bandaKey).get(subprueba);
            if (tablaSubprueba == null || !tablaSubprueba.isArray() || tablaSubprueba.isEmpty()) return null;

            Integer bestPe = null;
            int minDiff = Integer.MAX_VALUE;

            for (JsonNode row : tablaSubprueba) {
                int min = row.get("min").asInt();
                int max = row.get("max").asInt();
                int pe = row.get("pe").asInt();
                
                if (directa >= min && directa <= max) {
                    return pe;
                }
                
                // Track closest for fallback
                if (directa < min && (min - directa) < minDiff) {
                    minDiff = min - directa;
                    bestPe = pe;
                } else if (directa > max && (directa - max) < minDiff) {
                    minDiff = directa - max;
                    bestPe = pe;
                }
            }

            return bestPe;
        } catch (Exception e) {
            System.err.println("Error en getEscalarSubprueba WISC: " + e.getMessage());
            return null;
        }
    }

    public Map<String, Object> getConversionClinica(String indice, int suma) {
        try {
            if (indicesNode == null || !indicesNode.has("indices")) return null;
            JsonNode indiceData = indicesNode.get("indices").get(indice);
            if (indiceData == null) return null;

            JsonNode resultado = indiceData.get(String.valueOf(suma));
            if (resultado == null) return null;

            Map<String, Object> result = new HashMap<>();
            result.put("ci", resultado.get("ci").asText());
            result.put("percentil", resultado.get("rango_percentil").asText());
            
            if (resultado.has("ic_90") && resultado.get("ic_90").isArray() && resultado.get("ic_90").size() == 2) {
                result.put("ic_90_min", resultado.get("ic_90").get(0).asText());
                result.put("ic_90_max", resultado.get("ic_90").get(1).asText());
            } else {
                result.put("ic_90_min", null);
                result.put("ic_90_max", null);
            }

            if (resultado.has("ic_95") && resultado.get("ic_95").isArray() && resultado.get("ic_95").size() == 2) {
                result.put("ic_95_min", resultado.get("ic_95").get(0).asText());
                result.put("ic_95_max", resultado.get("ic_95").get(1).asText());
            } else {
                result.put("ic_95_min", null);
                result.put("ic_95_max", null);
            }

            return result;
        } catch (Exception e) {
            System.err.println("Error en getConversionClinica WISC: " + e.getMessage());
            return null;
        }
    }
}
