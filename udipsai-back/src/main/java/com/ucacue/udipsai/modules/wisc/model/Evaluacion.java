package com.ucacue.udipsai.modules.wisc.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "wisc_evaluaciones")
@EntityListeners(AuditingEntityListener.class)
public class Evaluacion {

    @Id
    @Column(name = "id", nullable = false, unique = true)
    private String id; // Ejemplo: WISC-1681234567890 (UUID)

    @Column(name = "tipo")
    private String tipo;

    @Column(name = "tipo_prueba")
    private String tipoPrueba;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Se mantiene timestamp por compatibilidad con el front
    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    @Column(length = 200)
    private String nombre;

    @Column(length = 200)
    private String examinador;

    private Integer edadMeses;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private String datosJson;
}
