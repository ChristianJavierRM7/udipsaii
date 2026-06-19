package com.ucacue.udipsai.modules.fichasocial.domain.components;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class SituacionEconomica {

    @Column(name = "total_ingresos")
    private Double totalIngresos;

    @Column(name = "total_egresos")
    private Double totalEgresos;

    @Column(name = "condicion_economica_evaluacion")
    private String condicionEconomica;

    @Column(name = "gasto_evaluacion_estimado")
    private String capacidadGastoEvaluacion;

    @Column(name = "tiempo_libre_texto", columnDefinition = "TEXT")
    private String actividadesTiempoLibre;

    @Column(name = "ingreso_per_capita")
    private Double ingresoPerCapita;

    @Column(name = "categoria_socioeconomica")
    private String categoriaSocioeconomica;

    @Column(name = "grupo_socioeconomico")
    private Integer grupoSocioeconomico;
}