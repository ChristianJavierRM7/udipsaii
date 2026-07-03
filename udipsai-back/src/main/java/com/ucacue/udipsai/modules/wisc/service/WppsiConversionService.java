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
public class WppsiConversionService {

    private final ObjectMapper objectMapper = new ObjectMapper();

    private JsonNode etapa1EscalaresNode;
    private JsonNode etapa1IndicesNode;
    private JsonNode etapa2Node;

    @PostConstruct
    public void init() {
        try {
            InputStream e1s = new ClassPathResource("data/wisc/wppsi_etapa1_escalares_2-6_a_3-11_anos.json").getInputStream();
            etapa1EscalaresNode = objectMapper.readTree(e1s);

            InputStream e1i = new ClassPathResource("data/wisc/wppsi_etapa1_indices_2-6_a_3-11_anos.json").getInputStream();
            etapa1IndicesNode = objectMapper.readTree(e1i);

            InputStream e2 = new ClassPathResource("data/wisc/wppsi_etapa2_completo_4-0_a_5-11_anos.json").getInputStream();
            etapa2Node = objectMapper.readTree(e2);
            
            System.out.println("[WppsiConversionService] Archivos JSON WPPSI cargados correctamente.");
        } catch (Exception e) {
            System.err.println("[WppsiConversionService] Error cargando JSON WPPSI: " + e.getMessage());
        }
    }

    private static class RangoWPPSI {
        String jsonType;
        String rangoKey;

        RangoWPPSI(String jsonType, String rangoKey) {
            this.jsonType = jsonType;
            this.rangoKey = rangoKey;
        }
    }

    private RangoWPPSI resolverRangoWPPSI(int edadMeses) {
        if (edadMeses >= 30 && edadMeses <= 47) {
            String rangoKey = "";
            if (edadMeses <= 32) rangoKey = "30-32";
            else if (edadMeses <= 35) rangoKey = "33-35";
            else if (edadMeses <= 38) rangoKey = "36-38";
            else if (edadMeses <= 41) rangoKey = "39-41";
            else if (edadMeses <= 44) rangoKey = "42-44";
            else rangoKey = "45-47";
            return new RangoWPPSI("ETAPA1", rangoKey);
        } else if (edadMeses >= 48 && edadMeses <= 71) {
            String rangoKey = "";
            if (edadMeses <= 50) rangoKey = "48-50";
            else if (edadMeses <= 53) rangoKey = "51-53";
            else if (edadMeses <= 56) rangoKey = "54-56";
            else if (edadMeses <= 59) rangoKey = "57-59";
            else if (edadMeses <= 62) rangoKey = "60-62";
            else if (edadMeses <= 65) rangoKey = "63-65";
            else if (edadMeses <= 68) rangoKey = "66-68";
            else rangoKey = "69-71";
            return new RangoWPPSI("ETAPA2", rangoKey);
        }
        return null;
    }

    public Integer getEscalarSubpruebaWPPSI(int edadMeses, String subprueba, int directa) {
        try {
            RangoWPPSI rango = resolverRangoWPPSI(edadMeses);
            if (rango == null) return null;

            JsonNode data = "ETAPA1".equals(rango.jsonType) ? etapa1EscalaresNode : etapa2Node;
            if (data == null) return null;

            JsonNode tablaSubprueba = null;
            if (data.has("escalares") && data.get("escalares").has(rango.rangoKey)) {
                tablaSubprueba = data.get("escalares").get(rango.rangoKey).get(subprueba);
            } else if (data.has(rango.rangoKey)) {
                tablaSubprueba = data.get(rango.rangoKey).get(subprueba);
            }

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
            System.err.println("Error en getEscalarSubpruebaWPPSI: " + e.getMessage());
            return null;
        }
    }

    public Map<String, Object> getConversionClinicaWPPSI(String nombre, int suma, String etapa) {
        try {
            JsonNode data = "ETAPA1".equals(etapa) ? etapa1IndicesNode : etapa2Node;
            if (data == null || !data.has("indices") || !data.get("indices").has(nombre)) return null;

            JsonNode indiceData = data.get("indices").get(nombre);

            if (indiceData.isArray()) {
                for (JsonNode i : indiceData) {
                    if (i.get("suma").asInt() == suma) {
                        Map<String, Object> result = new HashMap<>();
                        result.put("ci", i.get("ci").asText());
                        result.put("percentil", i.get("percentil").asText());
                        
                        String ic_95_min = null;
                        String ic_95_max = null;
                        if (i.has("ic95") && !i.get("ic95").asText().equals("—")) {
                            String[] parts = i.get("ic95").asText().split("-");
                            if (parts.length == 2) {
                                ic_95_min = parts[0].trim();
                                ic_95_max = parts[1].trim();
                            }
                        }
                        result.put("ic_95_min", ic_95_min);
                        result.put("ic_95_max", ic_95_max);
                        return result;
                    }
                }
            } else if (indiceData.isObject()) {
                JsonNode resultado = indiceData.get(String.valueOf(suma));
                if (resultado != null) {
                    Map<String, Object> result = new HashMap<>();
                    result.put("ci", resultado.get("compuesta").asText());
                    result.put("percentil", resultado.get("percentil").asText());

                    String ic_95_min = null;
                    String ic_95_max = null;
                    if (resultado.has("ic95") && !resultado.get("ic95").asText().equals("—")) {
                        String[] parts = resultado.get("ic95").asText().split("-");
                        if (parts.length == 2) {
                            ic_95_min = parts[0].trim();
                            ic_95_max = parts[1].trim();
                        }
                    }
                    result.put("ic_95_min", ic_95_min);
                    result.put("ic_95_max", ic_95_max);
                    return result;
                }
            }
            return null;
        } catch (Exception e) {
            System.err.println("Error en getConversionClinicaWPPSI: " + e.getMessage());
            return null;
        }
    }
}
