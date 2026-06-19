package com.ucacue.udipsai.modules.informesocial.dto;

import com.ucacue.udipsai.modules.paciente.dto.PacienteFichaDTO;
import com.ucacue.udipsai.modules.especialistas.dto.EspecialistaDTO;
import com.ucacue.udipsai.modules.pasante.dto.PasanteDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;
import com.ucacue.udipsai.modules.familiar.dto.FamiliarDTO;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InformeSocialDTO {
    private Integer id;
    private PacienteFichaDTO paciente;
    private String numFicha;
    private Date fechaElaboracion;
    private Boolean activo;
    
    
    private String genogramaUrl;
    private String ecomapaUrl;
    private String tipoFamilia;
    private String tipoFamiliaEspecificar;

    private FamiliarDTO informante;

    private String descripcionDinamicaFamiliar;
    private String situacionEconomica;
    private String situacionHabitabilidad;
    private String situacionLaboral;
    private String situacionEntorno;
    private String situacionEducativoCultural;
    private String situacionSalud;
    private String situacionLegal;
    private String valoracionProfesional;
    private String recomendaciones;

    private String elaboradoPor;
    private EspecialistaDTO especialista;
    private PasanteDTO pasante;
    private List<InformeSocialFamiliarDTO> familiares;
}