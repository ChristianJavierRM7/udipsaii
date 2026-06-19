package com.ucacue.udipsai.modules.fichasocial.repository;

import com.ucacue.udipsai.modules.fichasocial.domain.FichaSocioeconomica;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FichaSocioeconomicaRepository extends JpaRepository<FichaSocioeconomica, Integer> {


    FichaSocioeconomica findFirstByPacienteIdAndActivoOrderByIdDesc(Integer idPaciente, boolean activo);
    java.util.List<FichaSocioeconomica> findByPacienteIdAndActivoTrue(Integer pacienteId);
}