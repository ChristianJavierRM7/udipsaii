package com.ucacue.udipsai.modules.paciente.dto;

import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PacienteFichaDTO {
    private Integer id;
    private String nombresApellidos;
    private String cedula;

    private java.time.LocalDate fechaNacimiento;
    private String lugarNacimiento;
    private String domicilio;
    private String numeroTelefono;
    private String numeroCelular;
    private Boolean tieneDiscapacidad;
    private String tipoDiscapacidad;
    private Integer porcentajeDiscapacidad;
    private Boolean portadorCarnet;
    private String nivelEducativo;
    private String email;
    private String ocupacion;

    // Custom constructor for backward compatibility with 3-argument calls in other modules
    public PacienteFichaDTO(Integer id, String nombresApellidos, String cedula) {
        this.id = id;
        this.nombresApellidos = nombresApellidos;
        this.cedula = cedula;
    }

    // Constructor with all fields for builder / custom instantiate
    public PacienteFichaDTO(Integer id, String nombresApellidos, String cedula,
                            java.time.LocalDate fechaNacimiento, String lugarNacimiento,
                            String domicilio, String numeroTelefono, String numeroCelular,
                            Boolean tieneDiscapacidad, String tipoDiscapacidad,
                            Integer porcentajeDiscapacidad, Boolean portadorCarnet) {
        this.id = id;
        this.nombresApellidos = nombresApellidos;
        this.cedula = cedula;
        this.fechaNacimiento = fechaNacimiento;
        this.lugarNacimiento = lugarNacimiento;
        this.domicilio = domicilio;
        this.numeroTelefono = numeroTelefono;
        this.numeroCelular = numeroCelular;
        this.tieneDiscapacidad = tieneDiscapacidad;
        this.tipoDiscapacidad = tipoDiscapacidad;
        this.porcentajeDiscapacidad = porcentajeDiscapacidad;
        this.portadorCarnet = portadorCarnet;
    }

    public int getEdad() {
        if (fechaNacimiento == null)
            return 0;
        return java.time.Period.between(fechaNacimiento, java.time.LocalDate.now()).getYears();
    }
}
