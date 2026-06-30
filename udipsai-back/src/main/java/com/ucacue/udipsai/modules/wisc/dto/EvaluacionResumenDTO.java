package com.ucacue.udipsai.modules.wisc.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvaluacionResumenDTO {
    private String id;
    private String tipo;
    private String tipoPrueba;
    private String timestamp;
    private String nombre;
    private String examinador;
    private Integer edadMeses;
}
