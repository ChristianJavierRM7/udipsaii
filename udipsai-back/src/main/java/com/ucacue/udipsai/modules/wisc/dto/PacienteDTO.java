package com.ucacue.udipsai.modules.wisc.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PacienteDTO {
    @NotBlank(message = "El nombre del paciente es obligatorio")
    private String nombre;
    
    @NotBlank(message = "El examinador es obligatorio")
    private String examinador;
    
    @NotNull(message = "La edad en meses es obligatoria")
    private Integer edadMeses;

    private String fechaEval;
    private String fechaNac;
}
