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

// ─────────────────────────────────────────────────────────────────────────────
// El Service contiene toda la lógica del módulo:
//   - guardar un informe nuevo
//   - actualizar uno existente
//   - generar el PDF
//   - convertir entre entidad y DTO
// ─────────────────────────────────────────────────────────────────────────────

@Service
@Slf4j
public class InformeService {

    @Autowired
    private InformeRepository repository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private PdfService pdfService;   // ya existe en tu proyecto, lo reutilizamos

    // ── Listar todos los informes activos ────────────────────────────────────
    @Transactional(readOnly = true)
    public List<InformeDTO> listarInformes() {
        log.info("Listando todos los informes psicopedagógicos activos");
        return repository.findByActivo(true)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // ── Listar informes de un paciente específico ────────────────────────────
    @Transactional(readOnly = true)
    public List<InformeDTO> listarInformesPorPaciente(Integer pacienteId) {
        log.info("Listando informes del paciente ID: {}", pacienteId);
        return repository.findByPacienteIdAndActivo(pacienteId, true)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    // ── Obtener un informe por su ID ─────────────────────────────────────────
    @Transactional(readOnly = true)
    public InformeDTO obtenerPorId(Integer id) {
        log.info("Buscando informe ID: {}", id);
        InformePsicopedagogico informe = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Informe no encontrado con ID: " + id));
        return convertirADTO(informe);
    }

    // ── Crear un informe nuevo ───────────────────────────────────────────────
    @Transactional
    public InformeDTO crearInforme(InformeRequest request) {
        log.info("Creando informe para paciente ID: {}", request.getPacienteId());

        Paciente paciente = pacienteRepository.findById(request.getPacienteId())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

        InformePsicopedagogico informe = new InformePsicopedagogico();
        informe.setPaciente(paciente);
        mapRequestToEntity(request, informe);

        InformePsicopedagogico guardado = repository.save(informe);
        log.info("Informe creado con ID: {}", guardado.getId());
        return convertirADTO(guardado);
    }

    // ── Actualizar un informe existente ──────────────────────────────────────
    @Transactional
    public InformeDTO actualizarInforme(Integer id, InformeRequest request) {
        log.info("Actualizando informe ID: {}", id);

        InformePsicopedagogico informe = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Informe no encontrado"));

        mapRequestToEntity(request, informe);
        return convertirADTO(repository.save(informe));
    }

    // ── Desactivar (borrado lógico) ──────────────────────────────────────────
    @Transactional
    public void eliminarInforme(Integer id) {
        log.info("Desactivando informe ID: {}", id);
        repository.findById(id).ifPresent(i -> {
            i.setActivo(false);
            repository.save(i);
        });
    }

    // ── Generar PDF ──────────────────────────────────────────────────────────
    // Aquí es donde ocurre la magia:
    //   1. Buscamos el informe en la base de datos
    //   2. Preparamos un mapa con todos los datos
    //   3. PdfService toma el template HTML y lo convierte a PDF
    //   4. Devolvemos los bytes del PDF para que el controller los envíe al navegador
    public byte[] generarPdf(Integer id) throws Exception {
        log.info("Generando PDF para informe ID: {}", id);

        InformePsicopedagogico informe = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Informe no encontrado"));

        // Preparamos todos los datos que el template HTML va a necesitar
        Map<String, Object> datos = new HashMap<>();
        datos.put("informe", informe);
        datos.put("paciente", informe.getPaciente());

        // Calcular edad del paciente para el informe
        if (informe.getPaciente().getFechaNacimiento() != null) {
            datos.put("edad", informe.getPaciente().getEdad() + " años");
        } else {
            datos.put("edad", "N/A");
        }

        // Formatear fechas para mostrarlas en español
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy", new Locale("es", "EC"));
        datos.put("fechaElaboracionFormateada",
            informe.getFechaElaboracionInforme() != null
                ? informe.getFechaElaboracionInforme().format(fmt) : "");
        datos.put("fechaLecturaFormateada",
            informe.getFechaLecturaInforme() != null
                ? informe.getFechaLecturaInforme().format(fmt) : "");

        // "reportes/informe-psicopedagogico" apunta al archivo HTML en:
        // src/main/resources/templates/reportes/informe-psicopedagogico.html
        return pdfService.generatePdfFromHtml("reportes/informe-psicopedagogico", datos);
    }

    // ── Método auxiliar: copiar datos del request a la entidad ───────────────
    private void mapRequestToEntity(InformeRequest r, InformePsicopedagogico e) {
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

    // ── Método auxiliar: convertir entidad a DTO ─────────────────────────────
    private InformeDTO convertirADTO(InformePsicopedagogico i) {
        InformeDTO dto = new InformeDTO();
        dto.setId(i.getId());
        dto.setPaciente(i.getPaciente() != null
            ? new PacienteFichaDTO(i.getPaciente().getId(),
                                   i.getPaciente().getNombresApellidos(),
                                   i.getPaciente().getCedula())
            : null);
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