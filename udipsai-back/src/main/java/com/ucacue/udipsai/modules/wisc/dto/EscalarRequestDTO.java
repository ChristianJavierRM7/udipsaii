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
public class EscalarRequestDTO {
    @NotBlank(message = "La subprueba es obligatoria")
    private String subprueba;
    
    @NotNull(message = "La edad en meses es obligatoria")
    private Integer edadMeses;
    
    @NotNull(message = "La puntuación directa es obligatoria")
    private Integer directa;
}
