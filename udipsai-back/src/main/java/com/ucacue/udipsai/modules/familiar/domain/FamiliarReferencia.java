package com.ucacue.udipsai.modules.familiar.domain;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.databind.JsonNode;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.time.LocalDateTime;

@Entity
@Table(name = "familiar_referencias", indexes = {
    @Index(name = "idx_familiar_id", columnList = "familiar_id"),
    @Index(name = "idx_entidad", columnList = "entidad_tipo,entidad_id"),
    @Index(name = "idx_fecha", columnList = "fecha_creacion")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FamiliarReferencia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "familiar_id", nullable = false)
    private Familiar familiar;

    @Column(name = "entidad_tipo", nullable = false, length = 50)
    private String entidadTipo;

    @Column(name = "entidad_id", nullable = false)
    private Long entidadId;

    @JdbcTypeCode(SqlTypes.JSON)
    private JsonNode contextoDatos;

    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();
}
