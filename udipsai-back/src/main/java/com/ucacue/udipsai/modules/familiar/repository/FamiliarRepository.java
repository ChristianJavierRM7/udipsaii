package com.ucacue.udipsai.modules.familiar.repository;

import com.ucacue.udipsai.modules.familiar.domain.Familiar;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FamiliarRepository extends JpaRepository<Familiar, Long> {

    List<Familiar> findByPacienteIdAndActivoTrue(Integer pacienteId);

    Optional<Familiar> findByPacienteIdAndCedula(Integer pacienteId, String cedula);

    List<Familiar> findByRelacion(String relacion);

    @Query("SELECT f FROM Familiar f WHERE f.paciente.id = :pacienteId AND f.relacion = :relacion AND f.activo = true")
    List<Familiar> findByPacienteIdAndRelacionActivos(
            @Param("pacienteId") Integer pacienteId,
            @Param("relacion") String relacion);
}
