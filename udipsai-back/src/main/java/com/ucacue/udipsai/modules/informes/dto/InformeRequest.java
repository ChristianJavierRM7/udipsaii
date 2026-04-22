package com.ucacue.udipsai.modules.informes.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDate;

// ─────────────────────────────────────────────────────────────────────────────
// InformeRequest = los datos que el frontend (React) envía al backend
// cuando el psicólogo llena el formulario y hace clic en "Guardar".
// ─────────────────────────────────────────────────────────────────────────────

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InformeRequest {

    private Integer pacienteId;          // obligatorio: ¿de qué paciente es este informe?
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
}