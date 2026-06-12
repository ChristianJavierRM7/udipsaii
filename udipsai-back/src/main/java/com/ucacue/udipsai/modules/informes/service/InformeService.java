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

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
@Slf4j
public class InformeService {

    private static final String COORDINADORA_DEFAULT = "Lcda. Gabriela Jara S., Mgtr.";

    @Autowired
    private InformeRepository repository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private PdfService pdfService;

    @Transactional(readOnly = true)
    public List<InformeDTO> listarInformes() {
        return repository.findByActivo(true)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InformeDTO> listarInformesPorPaciente(Integer pacienteId) {
        return repository.findByPacienteIdAndActivo(pacienteId, true)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InformeDTO obtenerPorId(Integer id) {
        return toDTO(
                repository.findById(id)
                        .orElseThrow(() -> new RuntimeException("Informe no encontrado: " + id))
        );
    }

    @Transactional
    public InformeDTO crearInforme(InformeRequest r) {
        Paciente paciente = pacienteRepository.findById(r.getPacienteId())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

        InformePsicopedagogico e = new InformePsicopedagogico();
        e.setPaciente(paciente);
        mapToEntity(r, e);

        return toDTO(repository.save(e));
    }

    @Transactional
    public InformeDTO actualizarInforme(Integer id, InformeRequest r) {
        InformePsicopedagogico e = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Informe no encontrado: " + id));

        mapToEntity(r, e);
        return toDTO(repository.save(e));
    }

    @Transactional
    public void eliminarInforme(Integer id) {
        repository.findById(id).ifPresent(i -> {
            i.setActivo(false);
            repository.save(i);
        });
    }

    @Transactional(readOnly = true)
    public byte[] generarPdf(Integer id) throws Exception {
        log.info("Generando PDF informe ID={}", id);

        InformePsicopedagogico informe = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Informe no encontrado: " + id));

        Paciente p = informe.getPaciente();

        String nombreInstitucion = "";
        try {
            nombreInstitucion = (p.getInstitucionEducativa() != null)
                    ? p.getInstitucionEducativa().getNombre()
                    : "";
        } catch (Exception ex) {
            log.warn("No se pudo cargar institución educativa: {}", ex.getMessage());
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern(
                "dd 'de' MMMM 'de' yyyy",
                new Locale("es", "EC")
        );

        Map<String, Object> datos = new HashMap<>();

        datos.put("pacienteNombre", safe(p.getNombresApellidos()));
        datos.put("pacienteFechaNacTexto", p.getFechaNacimiento() != null ? p.getFechaNacimiento().format(fmt) : "");
        datos.put("pacienteEdad", p.getFechaNacimiento() != null ? p.getEdad() + " años" : "");
        datos.put("pacienteTelefono", safe(
                p.getNumeroCelular() != null ? p.getNumeroCelular() : p.getNumeroTelefono()
        ));
        datos.put("pacienteInstitucion", safe(nombreInstitucion));
        datos.put("pacienteNivel", safe(p.getNivelEducativo()));
        datos.put("pacienteAnio", safe(p.getAnioEducacion()));

        datos.put("informe", informe);
        datos.put("fechasEvaluacionTexto", formatearFechaFlexible(informe.getFechasEvaluacion(), fmt));
        datos.put("fechaElaboracion", informe.getFechaElaboracionInforme() != null
                ? informe.getFechaElaboracionInforme().format(fmt)
                : "");
        datos.put("fechaLectura", informe.getFechaLecturaInforme() != null
                ? informe.getFechaLecturaInforme().format(fmt)
                : "");

        List<Map<String, String>> reactivosSeccion = new ArrayList<>();
        agregarReactivoOpcional(
            reactivosSeccion,
            safe(informe.getAreaPsicologiaEducativa()).isBlank() ? "PSICOLOGÍA EDUCATIVA" : informe.getAreaPsicologiaEducativa(),
            informe.getReactivosPsicologiaEducativa()
        );
        agregarReactivoOpcional(
            reactivosSeccion,
            safe(informe.getAreaPsicologiaClinica()).isBlank() ? "PSICOLOGÍA CLÍNICA" : informe.getAreaPsicologiaClinica(),
            informe.getReactivosPsicologiaClinica()
        );
        agregarReactivoOpcional(reactivosSeccion, "FONOAUDIOLOGÍA", informe.getReactivosFonoaudiologia());
        agregarReactivoOpcional(reactivosSeccion, "TRABAJO SOCIAL", informe.getReactivosTrabajoSocial());
        datos.put("reactivosSeccion", reactivosSeccion);

        return pdfService.generatePdfFromHtml("reportes/informe-psicopedagogico", datos);
    }

    @Transactional(readOnly = true)
    public byte[] generarZipPorRango(Integer pacienteId, LocalDate desde, LocalDate hasta) throws Exception {
        log.info("Generando ZIP informes pacienteId={} desde={} hasta={}", pacienteId, desde, hasta);

        List<InformePsicopedagogico> informes = repository.findByPacienteIdAndActivo(pacienteId, true)
                .stream()
                .filter(i -> {
                    LocalDate fecha = i.getFechaElaboracionInforme();
                    if (fecha == null) return false;
                    if (desde != null && fecha.isBefore(desde)) return false;
                    if (hasta != null && fecha.isAfter(hasta)) return false;
                    return true;
                })
                .collect(Collectors.toList());

        if (informes.isEmpty()) {
            throw new RuntimeException("No hay informes en el rango de fechas indicado");
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ZipOutputStream zos = new ZipOutputStream(baos)) {
            for (InformePsicopedagogico informe : informes) {
                byte[] pdf = generarPdf(informe.getId());
                String nombreArchivo = String.format("Informe_%s_%s.pdf",
                        informe.getNumeroFicha() != null ? informe.getNumeroFicha() : informe.getId(),
                        informe.getPaciente().getNombresApellidos().replaceAll("[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ ]", "").trim()
                );
                zos.putNextEntry(new ZipEntry(nombreArchivo));
                zos.write(pdf);
                zos.closeEntry();
            }
        }

        return baos.toByteArray();
    }

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
        e.setReactivosFonoaudiologia(r.getReactivosFonoaudiologia());
        e.setReactivosTrabajoSocial(r.getReactivosTrabajoSocial());
        e.setConclusiones(r.getConclusiones());
        e.setRecomendacionesInstitucion(r.getRecomendacionesInstitucion());
        e.setRecomendacionesRepresentante(r.getRecomendacionesRepresentante());
        e.setAreaPsicologiaEducativa(r.getAreaPsicologiaEducativa());
        e.setEvaluadorPsicologiaEducativa(r.getEvaluadorPsicologiaEducativa());
        e.setProfesionalPsicologiaEducativa(r.getProfesionalPsicologiaEducativa());
        e.setAreaPsicologiaClinica(r.getAreaPsicologiaClinica());
        e.setEvaluadorPsicologiaClinica(r.getEvaluadorPsicologiaClinica());
        e.setProfesionalPsicologiaClinica(r.getProfesionalPsicologiaClinica());
        e.setCoordinadora(
                r.getCoordinadora() == null || r.getCoordinadora().isBlank()
                        ? COORDINADORA_DEFAULT
                        : r.getCoordinadora().trim()
        );
    }

    private InformeDTO toDTO(InformePsicopedagogico i) {
        InformeDTO dto = new InformeDTO();
        dto.setId(i.getId());

        if (i.getPaciente() != null) {
            dto.setPaciente(new PacienteFichaDTO(
                    i.getPaciente().getId(),
                    i.getPaciente().getNombresApellidos(),
                    i.getPaciente().getCedula()
            ));
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
        dto.setReactivosFonoaudiologia(i.getReactivosFonoaudiologia());
        dto.setReactivosTrabajoSocial(i.getReactivosTrabajoSocial());
        dto.setConclusiones(i.getConclusiones());
        dto.setRecomendacionesInstitucion(i.getRecomendacionesInstitucion());
        dto.setRecomendacionesRepresentante(i.getRecomendacionesRepresentante());
        dto.setAreaPsicologiaEducativa(i.getAreaPsicologiaEducativa());
        dto.setEvaluadorPsicologiaEducativa(i.getEvaluadorPsicologiaEducativa());
        dto.setProfesionalPsicologiaEducativa(i.getProfesionalPsicologiaEducativa());
        dto.setAreaPsicologiaClinica(i.getAreaPsicologiaClinica());
        dto.setEvaluadorPsicologiaClinica(i.getEvaluadorPsicologiaClinica());
        dto.setProfesionalPsicologiaClinica(i.getProfesionalPsicologiaClinica());
        dto.setCoordinadora(
                i.getCoordinadora() == null || i.getCoordinadora().isBlank()
                        ? COORDINADORA_DEFAULT
                        : i.getCoordinadora()
        );
        dto.setActivo(i.getActivo());
        dto.setFechaCreacion(i.getFechaCreacion());

        return dto;
    }

    private String safe(String value) {
        return value == null ? "" : value;
    }

    private void agregarReactivoOpcional(List<Map<String, String>> reactivos, String titulo, String contenido) {
        if (safe(contenido).isBlank()) {
            return;
        }

        Map<String, String> seccion = new HashMap<>();
        seccion.put("titulo", titulo);
        seccion.put("contenido", contenido);
        reactivos.add(seccion);
    }

    private String formatearFechaFlexible(String value, DateTimeFormatter fmt) {
        if (value == null || value.isBlank()) {
            return "";
        }

        try {
            LocalDate fecha = LocalDate.parse(value);
            return fecha.format(fmt);
        } catch (Exception ex) {
            return value;
        }
    }
}