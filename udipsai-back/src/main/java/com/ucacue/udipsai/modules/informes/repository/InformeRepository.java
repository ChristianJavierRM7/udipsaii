package com.ucacue.udipsai.modules.informes.repository;

import com.ucacue.udipsai.modules.informes.domain.InformePsicopedagogico;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// ─────────────────────────────────────────────────────────────────────────────
// Este archivo le dice a Spring cómo buscar informes en la base de datos.
// No necesitas escribir SQL — Spring genera las consultas automáticamente
// a partir del nombre de los métodos.
// ─────────────────────────────────────────────────────────────────────────────

@Repository
public interface InformeRepository extends JpaRepository<InformePsicopedagogico, Integer> {

    // Busca todos los informes activos de un paciente específico
    // Spring traduce esto a: SELECT * FROM informes WHERE paciente_id=? AND activo=?
    List<InformePsicopedagogico> findByPacienteIdAndActivo(Integer pacienteId, Boolean activo);

    // Busca todos los informes activos (para listar en pantalla)
    List<InformePsicopedagogico> findByActivo(Boolean activo);
}