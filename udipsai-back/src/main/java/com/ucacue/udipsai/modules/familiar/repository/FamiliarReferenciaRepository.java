package com.ucacue.udipsai.modules.familiar.repository;

import com.ucacue.udipsai.modules.familiar.domain.FamiliarReferencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FamiliarReferenciaRepository extends JpaRepository<FamiliarReferencia, Long> {

    List<FamiliarReferencia> findByEntidadTipoAndEntidadId(String entidadTipo, Long entidadId);

    List<FamiliarReferencia> findByFamiliarId(Long familiarId);

    Optional<FamiliarReferencia> findByFamiliarIdAndEntidadTipoAndEntidadId(
            Long familiarId, String entidadTipo, Long entidadId);
}
