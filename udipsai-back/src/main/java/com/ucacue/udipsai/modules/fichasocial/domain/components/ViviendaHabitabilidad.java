package com.ucacue.udipsai.modules.fichasocial.domain.components;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class ViviendaHabitabilidad {

    @Column(name = "vivienda_tipo")
    private String tipoTenencia; 

    @Column(name = "vivienda_material")
    private String materialParedes;

    @Column(name = "vivienda_piso")
    private String materialPiso;

    @Column(name = "vivienda_techo")
    private String materialTecho;

    @Column(name = "num_cuartos")
    private Integer numeroCuartos;

    @Column(name = "num_dormitorios")
    private Integer numeroDormitorios;

    @Column(name = "num_camas")
    private Integer numeroCamas;

    @Column(name = "num_sanitarios")
    private Integer numeroSanitarios;

    @Column(name = "agua_procedencia")
    private String procedenciaAgua;

    @Column(name = "tipo_sanitario")
    private String tipoSanitario;

    @Column(name = "energia_electrica_focos")
    private String detalleElectricidad; 

    @Column(name = "tiene_electricidad")
    private Boolean tieneElectricidad;

    @Column(name = "num_focos")
    private Integer numeroFocos;

    @Column(name = "otros_detalles_electricidad", columnDefinition = "TEXT")
    private String otrosDetallesElectricidad;

    @Column(name = "tiene_internet")
    private Boolean tieneInternet;

    @Column(name = "tiene_ducha")
    private Boolean tieneDucha;
}