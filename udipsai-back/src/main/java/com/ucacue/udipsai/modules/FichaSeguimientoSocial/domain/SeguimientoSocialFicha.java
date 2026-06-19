package com.ucacue.udipsai.modules.FichaSeguimientoSocial.domain;

import com.ucacue.udipsai.modules.paciente.domain.Paciente;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;


@Data
@Entity
@Table(name = "seguimiento_social")
public class SeguimientoSocialFicha {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    private String areaAcompanamiento;
    private Integer numeroSeguimiento;
    private LocalDate fecha;

    // Datos del Visitador
    private String nombreVisitador;
    private String apellidoVisitador;

    // Ubicación
    private String direccionVisita;

    // Contenido técnico (TEXT para evitar límites de caracteres)
    @Column(columnDefinition = "TEXT")
    private String objetivo;
    
    @Column(columnDefinition = "TEXT")
    private String participantes;
    
    @Column(columnDefinition = "TEXT")
    private String actividades;
    
    @Column(columnDefinition = "TEXT")
    private String observaciones;

    // Responsable de la Firma (Para imprimir en el PDF)
    private String lugarFirma; // CASA, ESCUELA, OTRO
    private String nombreRepresentante;
    private String rolEscuela;
    private String nombrePersonalEscuela;
    private String especificarOtro;

    private Boolean activo = true;
}