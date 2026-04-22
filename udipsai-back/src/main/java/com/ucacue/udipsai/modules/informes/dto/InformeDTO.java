package com.ucacue.udipsai.modules.informes.dto;

import com.ucacue.udipsai.modules.paciente.dto.PacienteFichaDTO;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

// ─────────────────────────────────────────────────────────────────────────────
// DTO = Data Transfer Object
// Es el "molde" de los datos que el backend le envía al frontend (React).
// No tiene lógica, solo campos con sus tipos.
// ─────────────────────────────────────────────────────────────────────────────

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InformeDTO {

    private Integer id;
    private PacienteFichaDTO paciente;   // solo id, nombre y cédula del paciente
    private String numeroFicha;
    private String representante;
    private String parentesco;
    private String fechasEvaluacion;
    private LocalDate fechaElaboracionInforme;
    private LocalDate fechaLecturaInforme;
    private String motivoConsulta;
    private String historiaEscolar;
    private String psicobiografia;
    private String observacionConsulta;
    private String reactivosPsicologiaEducativa;
    private String reactivosPsicologiaClinica;
    private String conclusiones;
    private String recomendacionesInstitucion;
    private String recomendacionesRepresentante;
    private String areaPsicologiaEducativa;
    private String evaluadorPsicologiaEducativa;
    private String profesionalPsicologiaEducativa;
    private String areaPsicologiaClinica;
    private String evaluadorPsicologiaClinica;
    private String profesionalPsicologiaClinica;
    private String coordinadora;
    private Boolean activo;
    private LocalDateTime fechaCreacion;
}