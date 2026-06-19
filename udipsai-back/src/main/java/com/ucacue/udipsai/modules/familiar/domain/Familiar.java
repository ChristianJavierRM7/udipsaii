package com.ucacue.udipsai.modules.familiar.domain;

import com.ucacue.udipsai.modules.paciente.domain.Paciente;
import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "familiares", indexes = {
    @Index(name = "idx_paciente_id", columnList = "paciente_id"),
    @Index(name = "idx_cedula_paciente", columnList = "paciente_id,cedula"),
    @Index(name = "idx_relacion", columnList = "relacion"),
    @Index(name = "idx_activo", columnList = "activo")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Familiar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "paciente_id", nullable = false)
    private Paciente paciente;

    @Column(nullable = false, length = 50)
    private String relacion;

    @Column(nullable = false, length = 255)
    private String nombresApellidos;

    private Integer edad;

    @Column(length = 35)
    private String estadoCivil;

    @Column(length = 100)
    private String instruccion;

    @Column(length = 100)
    private String ocupacion;

    @Column(name = "ingreso_mensual")
    private Double ingresoMensual;

    @Column(length = 15)
    private String cedula;

    @Column(name = "numero_telefono", length = 20)
    private String numeroTelefono;

    @Column(name = "correo_electronico", length = 100)
    private String correoElectronico;

    @Column(name = "problemas_salud")
    private Boolean problemasSalud = false;

    @Column(name = "descrip_problemas_salud", columnDefinition = "TEXT")
    private String descripProblemasSalud;

    @Column(name = "enfermedad_catastrofica")
    private Boolean enfermedadCatastrofica = false;

    @Column(name = "descrip_enfermedad_catastrofica", columnDefinition = "TEXT")
    private String descripEnfermedadCatastrofica;

    @Column(name = "discapacidad")
    private Boolean discapacidad = false;

    @Column(name = "descrip_discapacidad", columnDefinition = "TEXT")
    private String descripDiscapacidad;

    @Column(nullable = false)
    private Boolean activo = true;

    @OneToMany(mappedBy = "familiar", cascade = CascadeType.ALL, orphanRemoval = true)
    @ToString.Exclude
    private List<FamiliarReferencia> referencias = new ArrayList<>();
}
