package com.ucacue.udipsai.modules.familiar.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamiliarDTO {
    private Long id;
    private Integer pacienteId;
    private String relacion;
    private String nombresApellidos;
    private Integer edad;
    private String estadoCivil;
    private String instruccion;
    private String ocupacion;
    private Double ingresoMensual;
    private String cedula;
    private String numeroTelefono;
    private String correoElectronico;
    private Boolean problemasSalud;
    private String descripProblemasSalud;
    private Boolean enfermedadCatastrofica;
    private String descripEnfermedadCatastrofica;
    private Boolean discapacidad;
    private String descripDiscapacidad;
    private Boolean activo;
}
