package com.ucacue.udipsai.modules.fichasocial.domain.components;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class VulnerabilidadDetalle {

    @Column(name = "vulnerabilidad_movilidad_humana")
    private Boolean movilidadHumana;

    @Column(name = "vulnerabilidad_enfermedad_catastrofica")
    private Boolean enfermedadCatastrofica;

    @Column(name = "vulnerabilidad_embarazo_adolescente")
    private Boolean embarazoAdolescente;

    @Column(name = "vulnerabilidad_abuso_sexual")
    private Boolean abusoSexual;

    @Column(name = "vulnerabilidad_agresion_fisica")
    private Boolean agresionFisica;

    @Column(name = "vulnerabilidad_agresion_psicologica")
    private Boolean agresionPsicologica;

    private String lugarAgresion;
}