package com.ucacue.udipsai.modules.FichaSeguimientoSocial.repository;

import com.ucacue.udipsai.modules.FichaSeguimientoSocial.domain.SeguimientoSocialFicha;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeguimientoSocialFichaRepository extends JpaRepository<SeguimientoSocialFicha, Integer> {

    List<SeguimientoSocialFicha> findByPacienteIdAndActivoTrue(Integer pacienteId);

    List<SeguimientoSocialFicha> findByActivoTrue();

    @Query("SELECT s FROM SeguimientoSocialFicha s JOIN FETCH s.paciente WHERE s.id = :id")
    Optional<SeguimientoSocialFicha> findByIdWithPaciente(@Param("id") Integer id);

}