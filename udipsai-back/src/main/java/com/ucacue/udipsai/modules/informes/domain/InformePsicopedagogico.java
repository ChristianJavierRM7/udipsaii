package com.ucacue.udipsai.modules.informes.domain;

import com.ucacue.udipsai.modules.paciente.domain.Paciente;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "informes_psicopedagogicos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InformePsicopedagogico {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // ─── Relación con el paciente ───────────────────────────────────────────
    // Cada informe pertenece a un paciente. La FK "paciente_id" se crea
    // automáticamente en la tabla gracias a @JoinColumn.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    // ─── Sección 1: Datos de identificación (complementarios) ───────────────
    // Los datos básicos del paciente ya están en la tabla "pacientes".
    // Aquí guardamos los que son propios del informe en sí.
    @Column(name = "numero_ficha", length = 20)
    private String numeroFicha;

    @Column(name = "representante", length = 150)
    private String representante;

    @Column(name = "parentesco", length = 50)
    private String parentesco;

    // ─── Fechas de evaluación ────────────────────────────────────────────────
    // Se guarda como texto porque puede ser un rango como:
    // "31 de octubre, 02, 07, 08, 09 y 10 de noviembre de 2022"
    @Column(name = "fechas_evaluacion", columnDefinition = "TEXT")
    private String fechasEvaluacion;

    @Column(name = "fecha_elaboracion_informe")
    private LocalDate fechaElaboracionInforme;

    @Column(name = "fecha_lectura_informe")
    private LocalDate fechaLecturaInforme;

    // ─── Sección 2: Motivo de consulta ──────────────────────────────────────
    @Column(name = "motivo_consulta", columnDefinition = "TEXT")
    private String motivoConsulta;

    // ─── Sección 3: Historia escolar ────────────────────────────────────────
    @Column(name = "historia_escolar", columnDefinition = "TEXT")
    private String historiaEscolar;

    // ─── Sección 4: Psicobiografía ──────────────────────────────────────────
    @Column(name = "psicobiografia", columnDefinition = "TEXT")
    private String psicobiografia;

    // ─── Sección 5: Observación en la consulta ──────────────────────────────
    @Column(name = "observacion_consulta", columnDefinition = "TEXT")
    private String observacionConsulta;

    // ─── Sección 6: Reactivos aplicados (resumen narrativo) ─────────────────
    // Los puntajes detallados de cada test pueden vivir aquí como texto
    // estructurado, o puedes crear tablas separadas en el futuro.
    @Column(name = "reactivos_psicologia_educativa", columnDefinition = "TEXT")
    private String reactivosPsicologiaEducativa;

    @Column(name = "reactivos_psicologia_clinica", columnDefinition = "TEXT")
    private String reactivosPsicologiaClinica;

    // ─── Sección 7: Conclusiones ────────────────────────────────────────────
    @Column(name = "conclusiones", columnDefinition = "TEXT")
    private String conclusiones;

    // ─── Sección 8: Recomendaciones para la institución ─────────────────────
    @Column(name = "recomendaciones_institucion", columnDefinition = "TEXT")
    private String recomendacionesInstitucion;

    // ─── Sección 9: Recomendaciones para el representante ───────────────────
    @Column(name = "recomendaciones_representante", columnDefinition = "TEXT")
    private String recomendacionesRepresentante;

    // ─── Sección 10: Profesionales responsables ─────────────────────────────
    @Column(name = "area_psicologia_educativa", length = 100)
    private String areaPsicologiaEducativa;

    @Column(name = "evaluador_psicologia_educativa", length = 150)
    private String evaluadorPsicologiaEducativa;

    @Column(name = "profesional_psicologia_educativa", length = 150)
    private String profesionalPsicologiaEducativa;

    @Column(name = "area_psicologia_clinica", length = 100)
    private String areaPsicologiaClinica;

    @Column(name = "evaluador_psicologia_clinica", length = 150)
    private String evaluadorPsicologiaClinica;

    @Column(name = "profesional_psicologia_clinica", length = 150)
    private String profesionalPsicologiaClinica;

    @Column(name = "coordinadora", length = 200)
    private String coordinadora;

    // ─── Control interno ────────────────────────────────────────────────────
    @Column(name = "activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}