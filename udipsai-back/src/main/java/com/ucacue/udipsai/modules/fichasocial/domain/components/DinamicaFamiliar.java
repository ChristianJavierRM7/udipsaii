package com.ucacue.udipsai.modules.fichasocial.domain.components;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class DinamicaFamiliar {

    @Column(name = "opinion_familiar")
    @JsonProperty("opinionfamiliar")
    private Boolean opinionFamiliar;

    @Column(name = "union_familiar")
    @JsonProperty("unionfamiliar")
    private Boolean unionFamiliar;

    @Column(name = "cumplen_reglas")
    private Boolean cumplenReglas;

    @Column(name = "tiene_actividades_familiares")
    private Boolean tieneActividadesFamiliares;

    @Column(name = "resolucion_conflictos_familiares", columnDefinition = "TEXT")
    private String resolucionConflictos;

    @Column(name = "quienes_incumplen_reglas", columnDefinition = "TEXT")
    private String quienesIncumplenReglas;

    @Column(name = "actividades_hogar_compartidas", columnDefinition = "TEXT")
    private String actividadesCompartidas;

    @Column(name = "relacion_hermanos")
    private String relacionHermanos; 

    @Column(name = "relacion_padres_hijos")
    private String relacionPadresHijos;

    @Column(name = "comunicacion_familiar")
    private String comunicacionFamiliar;

    @Column(name = "tipo_hogar_descripcion")
    private String tipoHogar;
}