package com.ucacue.udipsai.modules.informesocial.repository;

import com.ucacue.udipsai.modules.informesocial.domain.InformeSocial;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InformeSocialRepository extends JpaRepository<InformeSocial, Integer> {
    List<InformeSocial> findByPacienteIdAndActivoTrue(Integer pacienteId);
    List<InformeSocial> findByPacienteIdOrderByFechaElaboracionDesc(Integer pacienteId);
}