package com.ucacue.udipsai.modules.FichaSeguimientoSocial.dto;

import lombok.Data;

import java.time.LocalDate;


@Data
public class SeguimientoSocialFichaDTO {
    
    private Integer id;
    private Integer pacienteId;
    private String pacienteNombre; 
    private String areaAcompanamiento;
    private Integer numeroSeguimiento;
    private LocalDate fecha;
    private String pacienteCedula;
    
    
    
    private String nombreVisitador;
    private String apellidoVisitador;
    private String direccionVisita;
    
    private String objetivo;
    private String participantes;
    private String actividades;
    private String observaciones;
    
   
    private String lugarFirma;
    private String nombreRepresentante;
    private String rolEscuela;
    private String nombrePersonalEscuela;
    private String especificarOtro;
    
    private Boolean activo;
}