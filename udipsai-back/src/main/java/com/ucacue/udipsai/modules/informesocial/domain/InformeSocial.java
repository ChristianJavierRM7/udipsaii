package com.ucacue.udipsai.modules.informesocial.domain;

import com.ucacue.udipsai.modules.paciente.domain.Paciente;
import com.ucacue.udipsai.modules.especialistas.domain.Especialista;
import com.ucacue.udipsai.modules.pasante.domain.Pasante;
import jakarta.persistence.*;
import lombok.Data;
import java.util.Date;

@Entity
@Table(name = "informes_sociales")
@Data
public class InformeSocial {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id")
    private Paciente paciente;

    @Column(name = "num_ficha")
    private String numFicha;

    @Column(name = "fecha_elaboracion")
    private Date fechaElaboracion;

    @Column(name = "activo")
    private Boolean activo = true;

    private String genogramaUrl;
    private String ecomapaUrl;

    @Column(name = "tipo_familia")
    private String tipoFamilia;

    @Column(name = "tipo_familia_especificar")
    private String tipoFamiliaEspecificar;

    
    @Column(columnDefinition = "TEXT")
    private String descripcionDinamicaFamiliar;
    
    @Column(columnDefinition = "TEXT")
    private String situacionEconomica;
    
    @Column(columnDefinition = "TEXT")
    private String situacionHabitabilidad;
    
    @Column(columnDefinition = "TEXT")
    private String situacionLaboral;
    
    @Column(columnDefinition = "TEXT")
    private String situacionEntorno;
    
    @Column(columnDefinition = "TEXT")
    private String situacionEducativoCultural;
    
    @Column(columnDefinition = "TEXT")
    private String situacionSalud;

    @Column(columnDefinition = "TEXT")
    private String situacionLegal;
    
    @Column(columnDefinition = "TEXT")
    private String valoracionProfesional;
    
    @Column(columnDefinition = "TEXT")
    private String recomendaciones;

    private String elaboradoPor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "especialista_id")
    private Especialista especialista;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pasante_id")
    private Pasante pasante;
}