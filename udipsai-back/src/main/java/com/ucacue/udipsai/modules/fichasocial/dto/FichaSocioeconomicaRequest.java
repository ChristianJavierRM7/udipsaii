package com.ucacue.udipsai.modules.fichasocial.dto;

import com.ucacue.udipsai.modules.fichasocial.domain.components.*;
import lombok.Data;
import java.util.Date;
import java.util.List;
import com.ucacue.udipsai.modules.familiar.dto.FamiliarDTO;

@Data
public class FichaSocioeconomicaRequest {
    private Integer pacienteId;
    private Integer especialistaId;
    private Date fechaElaboracion;

    private RiesgosSociales riesgosSociales;
    private VulnerabilidadDetalle vulnerabilidad;
    private DinamicaFamiliar dinamicaFamiliar;
    private ViviendaHabitabilidad vivienda;
    private SituacionSalud salud;
    private DesgloseEconomico desgloseEconomico;
    private SituacionEconomica situacionEconomica;

    private String pacienteInstruccion;
    private String pacienteOcupacion;
    private String pacienteEmail;
    private String pacienteNumCarne;

    private String conclusiones;
    private String recomendaciones;
    private String responsable;
    private List<FamiliarDTO> familiares;
}