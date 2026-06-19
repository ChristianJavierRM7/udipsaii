package com.ucacue.udipsai.modules.informesocial.dto;

import lombok.Data;
import java.util.List;
import com.ucacue.udipsai.modules.familiar.dto.FamiliarDTO;

@Data
public class InformeSocialRequest {
    private Integer pacienteId;
    private Integer especialistaId;
    private String numFicha;
    private String tipoFamilia;
    private String tipoFamiliaEspecificar;

    private String pacienteEstadoCivil;
    private String pacienteNacionalidad;
    private String pacienteSexo;

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
    

    private List<InformeSocialFamiliarDTO> familiares;
}