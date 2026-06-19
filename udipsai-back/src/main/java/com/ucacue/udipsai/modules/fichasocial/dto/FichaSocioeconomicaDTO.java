package com.ucacue.udipsai.modules.fichasocial.dto;

import com.ucacue.udipsai.modules.paciente.dto.PacienteFichaDTO;
import com.ucacue.udipsai.modules.especialistas.dto.EspecialistaDTO;
import com.ucacue.udipsai.modules.fichasocial.domain.components.*;
import lombok.Data;
import java.util.Date;
import java.util.List;
import com.ucacue.udipsai.modules.familiar.dto.FamiliarDTO;
import com.ucacue.udipsai.modules.pasante.dto.PasanteDTO;

@Data
public class FichaSocioeconomicaDTO {
    private Integer id;
    private PacienteFichaDTO paciente;
    private EspecialistaDTO especialista;
    private PasanteDTO pasante;
    private Boolean activo;
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