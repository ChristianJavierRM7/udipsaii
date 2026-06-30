package com.ucacue.udipsai.modules.wisc.repository;

import com.ucacue.udipsai.modules.wisc.model.Evaluacion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface EvaluacionRepository extends JpaRepository<Evaluacion, String>, JpaSpecificationExecutor<Evaluacion> {

    // Búsquedas para el historial clínico (psicólogos)
    Page<Evaluacion> findByNombreContainingIgnoreCaseOrderByTimestampDesc(String nombre, Pageable pageable);
    Page<Evaluacion> findAllByOrderByTimestampDesc(Pageable pageable);

    // Búsquedas para el panel de administrador
    Page<Evaluacion> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);
    Page<Evaluacion> findByTipoPrueba(String tipoPrueba, Pageable pageable);
    Page<Evaluacion> findByNombreContainingIgnoreCaseAndTipoPrueba(String nombre, String tipoPrueba, Pageable pageable);

    // Conteo para estadísticas
    long countByTipoPrueba(String tipoPrueba);
    long countByTimestampAfter(java.time.LocalDateTime fecha);
}
