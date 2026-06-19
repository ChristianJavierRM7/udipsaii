package com.ucacue.udipsai.modules.fichasocial.domain.components;


import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class DesgloseEconomico {

  
    private Double ingresoPadre;
    private Double ingresoMadre;
    private Double ingresoFamiliares;
    private Double ingresoOtros;

    
    private Double egresoAlimentacion;
    private Double egresoArriendo;
    private Double egresoServiciosBasicos; 
    private Double egresoSalud;
    private Double egresoEducacion;
    private Double egresoPrestamos;
    private Double egresoOtros;
}