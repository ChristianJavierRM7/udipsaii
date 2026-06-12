package com.ucacue.udipsai.modules.paciente.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PacienteCriteriaDTO {
    private String search;
    private Boolean activo;
    private Integer sedeId;
    private Integer institucionEducativaId;
    private String sexo;
    private Integer edadMin;
    private Integer edadMax;
    private String nivelEducativo;
    private Integer anioFicha;
    private String areaAtendida;
}
