package com.ucacue.udipsai.modules.informes.service;

import com.ucacue.udipsai.common.report.PdfService;
import com.ucacue.udipsai.modules.informes.domain.InformePsicopedagogico;
import com.ucacue.udipsai.modules.informes.dto.InformeDTO;
import com.ucacue.udipsai.modules.informes.dto.InformeRequest;
import com.ucacue.udipsai.modules.informes.repository.InformeRepository;
import com.ucacue.udipsai.modules.paciente.domain.Paciente;
import com.ucacue.udipsai.modules.paciente.dto.PacienteFichaDTO;
import com.ucacue.udipsai.modules.paciente.repository.PacienteRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Slf4j
public class InformeService {

    @Autowired
    private InformeRepository repository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private PdfService pdfService;

    // ── Listar todos ─────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<InformeDTO> listarInformes() {
        return repository.findByActivo(true)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ── Listar por paciente ───────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public List<InformeDTO> listarInformesPorPaciente(Integer pacienteId) {
        return repository.findByPacienteIdAndActivo(pacienteId, true)
                .stream().map(this::toDTO).collect(Collectors.toList());
    }

    // ── Obtener uno ───────────────────────────────────────────────────────────
    @Transactional(readOnly = true)
    public InformeDTO obtenerPorId(Integer id) {
        return toDTO(repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Informe no encontrado: " + id)));
    }

    // ── Crear ─────────────────────────────────────────────────────────────────
    @Transactional
    public InformeDTO crearInforme(InformeRequest r) {
        Paciente paciente = pacienteRepository.findById(r.getPacienteId())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
        InformePsicopedagogico e = new InformePsicopedagogico();
        e.setPaciente(paciente);
        mapToEntity(r, e);
        return toDTO(repository.save(e));
    }

    // ── Actualizar ────────────────────────────────────────────────────────────
    @Transactional
    public InformeDTO actualizarInforme(Integer id, InformeRequest r) {
        InformePsicopedagogico e = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Informe no encontrado: " + id));
        mapToEntity(r, e);
        return toDTO(repository.save(e));
    }

    // ── Eliminar (lógico) ─────────────────────────────────────────────────────
    @Transactional
    public void eliminarInforme(Integer id) {
        repository.findById(id).ifPresent(i -> { i.setActivo(false); repository.save(i); });
    }

    // ── Generar PDF ───────────────────────────────────────────────────────────
    // IMPORTANTE: usamos @Transactional para que la sesión JPA esté abierta
    // mientras Thymeleaf accede a las relaciones LAZY (institucionEducativa).
    // Además pasamos los datos como strings simples para evitar cualquier
    // acceso lazy dentro del template.
    @Transactional(readOnly = true)
    public byte[] generarPdf(Integer id) throws Exception {
        log.info("Generando PDF informe ID={}", id);

        InformePsicopedagogico informe = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Informe no encontrado: " + id));

        Paciente p = informe.getPaciente();

        // Resolvemos todos los datos como strings DENTRO de la transacción
        // así ningún acceso lazy puede fallar fuera de sesión
        String nombreInstitucion = "";
        try {
            nombreInstitucion = (p.getInstitucionEducativa() != null)
                    ? p.getInstitucionEducativa().getNombre() : "";
        } catch (Exception ex) {
            log.warn("No se pudo cargar institución educativa: {}", ex.getMessage());
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern(
                "dd 'de' MMMM 'de' yyyy", new Locale("es", "EC"));

        Map<String, Object> datos = new HashMap<>();

        // Datos del paciente como strings simples (sin objetos JPA en el template)
        datos.put("pacienteNombre",       p.getNombresApellidos() != null ? p.getNombresApellidos() : "");
        datos.put("pacienteFechaNac",     p.getFechaNacimiento() != null ? p.getFechaNacimiento().toString() : "");
        datos.put("pacienteEdad",         p.getFechaNacimiento() != null ? p.getEdad() + " años" : "N/A");
        datos.put("pacienteTelefono",     p.getNumeroCelular() != null ? p.getNumeroCelular()
                                        : (p.getNumeroTelefono() != null ? p.getNumeroTelefono() : ""));
        datos.put("pacienteInstitucion",  nombreInstitucion);
        datos.put("pacienteNivel",        p.getNivelEducativo() != null ? p.getNivelEducativo() : "");
        datos.put("pacienteAnio",         p.getAnioEducacion() != null ? p.getAnioEducacion() : "");

        // Datos del informe
        datos.put("informe", informe);
        datos.put("fechaElaboracion", informe.getFechaElaboracionInforme() != null
                ? informe.getFechaElaboracionInforme().format(fmt) : "");
        datos.put("fechaLectura", informe.getFechaLecturaInforme() != null
                ? informe.getFechaLecturaInforme().format(fmt) : "");

        return pdfService.generatePdfFromHtml("reportes/informe-psicopedagogico", datos);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void mapToEntity(InformeRequest r, InformePsicopedagogico e) {
        e.setNumeroFicha(r.getNumeroFicha());
        e.setRepresentante(r.getRepresentante());
        e.setParentesco(r.getParentesco());
        e.setFechasEvaluacion(r.getFechasEvaluacion());
        e.setFechaElaboracionInforme(r.getFechaElaboracionInforme());
        e.setFechaLecturaInforme(r.getFechaLecturaInforme());
        e.setMotivoConsulta(r.getMotivoConsulta());
        e.setHistoriaEscolar(r.getHistoriaEscolar());
        e.setPsicobiografia(r.getPsicobiografia());
        e.setObservacionConsulta(r.getObservacionConsulta());
        e.setReactivosPsicologiaEducativa(r.getReactivosPsicologiaEducativa());
        e.setReactivosPsicologiaClinica(r.getReactivosPsicologiaClinica());
        e.setConclusiones(r.getConclusiones());
        e.setRecomendacionesInstitucion(r.getRecomendacionesInstitucion());
        e.setRecomendacionesRepresentante(r.getRecomendacionesRepresentante());
        e.setAreaPsicologiaEducativa(r.getAreaPsicologiaEducativa());
        e.setEvaluadorPsicologiaEducativa(r.getEvaluadorPsicologiaEducativa());
        e.setProfesionalPsicologiaEducativa(r.getProfesionalPsicologiaEducativa());
        e.setAreaPsicologiaClinica(r.getAreaPsicologiaClinica());
        e.setEvaluadorPsicologiaClinica(r.getEvaluadorPsicologiaClinica());
        e.setProfesionalPsicologiaClinica(r.getProfesionalPsicologiaClinica());
        e.setCoordinadora(r.getCoordinadora());
    }

    private InformeDTO toDTO(InformePsicopedagogico i) {
        InformeDTO dto = new InformeDTO();
        dto.setId(i.getId());
        if (i.getPaciente() != null) {
            dto.setPaciente(new PacienteFichaDTO(
                    i.getPaciente().getId(),
                    i.getPaciente().getNombresApellidos(),
                    i.getPaciente().getCedula()));
        }
        dto.setNumeroFicha(i.getNumeroFicha());
        dto.setRepresentante(i.getRepresentante());
        dto.setParentesco(i.getParentesco());
        dto.setFechasEvaluacion(i.getFechasEvaluacion());
        dto.setFechaElaboracionInforme(i.getFechaElaboracionInforme());
        dto.setFechaLecturaInforme(i.getFechaLecturaInforme());
        dto.setMotivoConsulta(i.getMotivoConsulta());
        dto.setHistoriaEscolar(i.getHistoriaEscolar());
        dto.setPsicobiografia(i.getPsicobiografia());
        dto.setObservacionConsulta(i.getObservacionConsulta());
        dto.setReactivosPsicologiaEducativa(i.getReactivosPsicologiaEducativa());
        dto.setReactivosPsicologiaClinica(i.getReactivosPsicologiaClinica());
        dto.setConclusiones(i.getConclusiones());
        dto.setRecomendacionesInstitucion(i.getRecomendacionesInstitucion());
        dto.setRecomendacionesRepresentante(i.getRecomendacionesRepresentante());
        dto.setAreaPsicologiaEducativa(i.getAreaPsicologiaEducativa());
        dto.setEvaluadorPsicologiaEducativa(i.getEvaluadorPsicologiaEducativa());
        dto.setProfesionalPsicologiaEducativa(i.getProfesionalPsicologiaEducativa());
        dto.setAreaPsicologiaClinica(i.getAreaPsicologiaClinica());
        dto.setEvaluadorPsicologiaClinica(i.getEvaluadorPsicologiaClinica());
        dto.setProfesionalPsicologiaClinica(i.getProfesionalPsicologiaClinica());
        dto.setCoordinadora(i.getCoordinadora());
        dto.setActivo(i.getActivo());
        dto.setFechaCreacion(i.getFechaCreacion());
        return dto;
    }
}