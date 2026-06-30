package com.ucacue.udipsai.modules.wisc.dto;

import com.fasterxml.jackson.annotation.JsonAnySetter;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluacionGuardarDTO {
    private String id;
    
    @NotBlank(message = "El tipo de evaluación es obligatorio")
    private String tipo;
    
    @NotBlank(message = "El tipo de prueba es obligatorio")
    private String tipoPrueba;
    
    @Valid
    @NotNull(message = "Los datos del paciente son obligatorios")
    private PacienteDTO paciente;
    
    @Builder.Default
    private Map<String, Object> datosRestantes = new HashMap<>();

    @JsonAnySetter
    public void setDatosRestantes(String key, Object value) {
        this.datosRestantes.put(key, value);
    }
}
