package com.ucacue.udipsai.modules.fichasocial.domain.components;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class RiesgosSociales {

    @Column(name = "problemas_sociales_texto", columnDefinition = "TEXT")
    private String problemasSociales; 

    @Column(name = "vulnerabilidad_texto", columnDefinition = "TEXT")
    private String vulnerabilidades; 

    @Column(name = "migro_exterior")
    private Boolean migroExterior;

    @Column(name = "lugar_migracion")
    private String lugarMigracion;

    @Column(name = "tiempo_migracion")
    private String tiempoMigracion;

    @Column(name = "afectacion_familiar_migracion", columnDefinition = "TEXT")
    private String afectacionFamiliar;
}