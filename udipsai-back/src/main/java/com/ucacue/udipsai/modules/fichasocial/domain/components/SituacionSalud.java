package com.ucacue.udipsai.modules.fichasocial.domain.components;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class SituacionSalud {

    @Column(name = "atencion_medica_donde", columnDefinition = "TEXT")
    private String lugarAtencionMedica;

    @Column(name = "estudiante_problemas_salud_tipo", columnDefinition = "TEXT")
    private String saludEstudiante;

    @Column(name = "ayudas_tecnicas_texto", columnDefinition = "TEXT")
    private String ayudasTecnicas;
}