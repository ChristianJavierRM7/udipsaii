package com.ucacue.udipsai.modules.FichaSeguimientoSocial.Services;

import com.ucacue.udipsai.common.report.PdfService;
import com.ucacue.udipsai.modules.FichaSeguimientoSocial.domain.SeguimientoSocialFicha;
import com.ucacue.udipsai.modules.FichaSeguimientoSocial.dto.SeguimientoSocialFichaDTO;
import com.ucacue.udipsai.modules.FichaSeguimientoSocial.dto.SeguimientoSocialFichaRequest;
import com.ucacue.udipsai.modules.FichaSeguimientoSocial.repository.SeguimientoSocialFichaRepository;
import com.ucacue.udipsai.modules.paciente.domain.Paciente;
import com.ucacue.udipsai.modules.paciente.repository.PacienteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SeguimientoSocialFichaService {

    private final SeguimientoSocialFichaRepository seguimientoRepository;
    private final PacienteRepository pacienteRepository;
    private final PdfService pdfService;
    private final com.ucacue.udipsai.modules.asignacion.service.AsignacionSecurityService asignacionSecurity;

    
    // (Este no lleva readOnly porque sí modifica la base de datos)
    @Transactional
    public SeguimientoSocialFichaDTO crearSeguimiento(SeguimientoSocialFichaRequest request) {
        // Buscamos que el paciente exista
        Paciente paciente = pacienteRepository.findById(request.getPacienteId())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado con ID: " + request.getPacienteId()));

        SeguimientoSocialFicha seguimiento = new SeguimientoSocialFicha();
        seguimiento.setPaciente(paciente);
     
        seguimiento.setAreaAcompanamiento(request.getAreaAcompanamiento());
        seguimiento.setNumeroSeguimiento(request.getNumeroSeguimiento());
        seguimiento.setFecha(request.getFecha());
   
        seguimiento.setNombreVisitador(request.getNombreVisitador());
        seguimiento.setApellidoVisitador(request.getApellidoVisitador());
        seguimiento.setDireccionVisita(request.getDireccionVisita());
        
        // Contenido técnico
        seguimiento.setObjetivo(request.getObjetivo());
        seguimiento.setParticipantes(request.getParticipantes());
        seguimiento.setActividades(request.getActividades());
        seguimiento.setObservaciones(request.getObservaciones());
       
        seguimiento.setLugarFirma(request.getLugarFirma());
        seguimiento.setNombreRepresentante(request.getNombreRepresentante());
        seguimiento.setRolEscuela(request.getRolEscuela());
        seguimiento.setNombrePersonalEscuela(request.getNombrePersonalEscuela());
        seguimiento.setEspecificarOtro(request.getEspecificarOtro());

        seguimiento.setActivo(true);

        seguimiento = seguimientoRepository.save(seguimiento);
        return mapToDTO(seguimiento);
    }

    // 2. Listar absolutamente todos los seguimientos (NUEVO) 
    @Transactional(readOnly = true)
    public List<SeguimientoSocialFichaDTO> listarTodos() {
        List<Integer> assignedIds = asignacionSecurity.getPasanteAssignedPatientIds();
        java.util.stream.Stream<SeguimientoSocialFicha> stream = seguimientoRepository.findByActivoTrue()
                .stream();
        if (assignedIds != null) {
            stream = stream.filter(s -> s.getPaciente() != null && assignedIds.contains(s.getPaciente().getId()));
        }
        return stream.map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // 3. Listar seguimientos por paciente 
    @Transactional(readOnly = true)
    public List<SeguimientoSocialFichaDTO> listarPorPaciente(Integer pacienteId) {
        return seguimientoRepository.findByPacienteIdAndActivoTrue(pacienteId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    //  4. Obtener seguimiento por ID 
    @Transactional(readOnly = true)
    public SeguimientoSocialFichaDTO obtenerPorId(Integer id) {
        SeguimientoSocialFicha entity = seguimientoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Seguimiento no encontrado"));
        return mapToDTO(entity);
    }

    // --- Función auxiliar: Convertir Entidad a DTO ---
    private SeguimientoSocialFichaDTO mapToDTO(SeguimientoSocialFicha entity) {
        SeguimientoSocialFichaDTO dto = new SeguimientoSocialFichaDTO();
        dto.setId(entity.getId());
        dto.setPacienteId(entity.getPaciente().getId());
        dto.setPacienteNombre(entity.getPaciente().getNombresApellidos());
        dto.setPacienteCedula(entity.getPaciente().getCedula());
        
        dto.setAreaAcompanamiento(entity.getAreaAcompanamiento());
        dto.setNumeroSeguimiento(entity.getNumeroSeguimiento());
        dto.setFecha(entity.getFecha());
        
        // Campos de Visitador y Ubicación
        dto.setNombreVisitador(entity.getNombreVisitador());
        dto.setApellidoVisitador(entity.getApellidoVisitador());
        dto.setDireccionVisita(entity.getDireccionVisita());
        
        // Contenido técnico
        dto.setObjetivo(entity.getObjetivo());
        dto.setParticipantes(entity.getParticipantes());
        dto.setActividades(entity.getActividades());
        dto.setObservaciones(entity.getObservaciones());
        
        // Campos de Firma 
        dto.setLugarFirma(entity.getLugarFirma());
        dto.setNombreRepresentante(entity.getNombreRepresentante());
        dto.setRolEscuela(entity.getRolEscuela());
        dto.setNombrePersonalEscuela(entity.getNombrePersonalEscuela());
        dto.setEspecificarOtro(entity.getEspecificarOtro());
        
        dto.setActivo(entity.getActivo());
        
        return dto;
    }
    @Transactional
    public SeguimientoSocialFichaDTO actualizar(Integer id, SeguimientoSocialFichaRequest request) {
        SeguimientoSocialFicha seguimiento = seguimientoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Seguimiento no encontrado con ID: " + id));

       
        seguimiento.setAreaAcompanamiento(request.getAreaAcompanamiento());
        seguimiento.setFecha(request.getFecha());
        seguimiento.setNombreVisitador(request.getNombreVisitador());
        seguimiento.setApellidoVisitador(request.getApellidoVisitador());
        seguimiento.setDireccionVisita(request.getDireccionVisita());
        seguimiento.setObjetivo(request.getObjetivo());
        seguimiento.setParticipantes(request.getParticipantes());
        seguimiento.setActividades(request.getActividades());
        seguimiento.setObservaciones(request.getObservaciones());
        seguimiento.setLugarFirma(request.getLugarFirma());
        seguimiento.setNombreRepresentante(request.getNombreRepresentante());
        seguimiento.setRolEscuela(request.getRolEscuela());
        seguimiento.setNombrePersonalEscuela(request.getNombrePersonalEscuela());
        seguimiento.setEspecificarOtro(request.getEspecificarOtro());

        seguimiento = seguimientoRepository.save(seguimiento);
        return mapToDTO(seguimiento);
    }

    @Transactional
    public void eliminar(Integer id) {
        SeguimientoSocialFicha seguimiento = seguimientoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Seguimiento no encontrado con ID: " + id));
        seguimiento.setActivo(false);
        seguimientoRepository.save(seguimiento);
    }
    @Transactional(readOnly = true)
    public byte[] exportarPdf(Integer id) throws Exception {
        // Usamos JOIN FETCH para cargar el Paciente en la misma sesión
        // y evitar LazyInitializationException al llamar mapToDTO
        SeguimientoSocialFicha ficha = seguimientoRepository.findByIdWithPaciente(id)
                .orElseThrow(() -> new RuntimeException("Seguimiento no encontrado con ID: " + id));

        SeguimientoSocialFichaDTO fichaDTO = mapToDTO(ficha);

        Map<String, Object> variables = new HashMap<>();
        variables.put("f", fichaDTO);

        return pdfService.generatePdfFromHtml("reportes/seguimiento_social_detalle", variables);
    }

    @Transactional(readOnly = true)
    public java.io.ByteArrayInputStream exportarExcel(Integer pacienteId) throws java.io.IOException {
        List<SeguimientoSocialFichaDTO> fichas;
        if (pacienteId != null) {
            fichas = listarPorPaciente(pacienteId);
        } else {
            fichas = listarTodos();
        }

        String[] headers = {
                "ID", "Paciente", "Cédula", "Fecha", "Área de Acompañamiento",
                "N° Seguimiento", "Nombre Visitador", "Apellido Visitador",
                "Dirección Visita", "Objetivo", "Participantes", "Actividades",
                "Observaciones", "Estado"
        };

        return com.ucacue.udipsai.common.report.ExcelGenerator.generateExcel("Seguimientos Sociales", headers, fichas, (row, f) -> {
            int col = 0;
            row.createCell(col++).setCellValue(f.getId() != null ? f.getId().toString() : "N/A");
            row.createCell(col++).setCellValue(f.getPacienteNombre() != null ? f.getPacienteNombre() : "N/A");
            row.createCell(col++).setCellValue(f.getPacienteCedula() != null ? f.getPacienteCedula() : "N/A");
            row.createCell(col++).setCellValue(f.getFecha() != null ? f.getFecha().toString() : "N/A");
            row.createCell(col++).setCellValue(f.getAreaAcompanamiento() != null ? f.getAreaAcompanamiento() : "N/A");
            row.createCell(col++).setCellValue(String.valueOf(f.getNumeroSeguimiento() != null ? f.getNumeroSeguimiento() : "N/A"));
            row.createCell(col++).setCellValue(f.getNombreVisitador() != null ? f.getNombreVisitador() : "N/A");
            row.createCell(col++).setCellValue(f.getApellidoVisitador() != null ? f.getApellidoVisitador() : "N/A");
            row.createCell(col++).setCellValue(f.getDireccionVisita() != null ? f.getDireccionVisita() : "N/A");
            row.createCell(col++).setCellValue(f.getObjetivo() != null ? f.getObjetivo() : "N/A");
            row.createCell(col++).setCellValue(f.getParticipantes() != null ? f.getParticipantes() : "N/A");
            row.createCell(col++).setCellValue(f.getActividades() != null ? f.getActividades() : "N/A");
            row.createCell(col++).setCellValue(f.getObservaciones() != null ? f.getObservaciones() : "N/A");
            row.createCell(col++).setCellValue(f.getActivo() != null && f.getActivo() ? "Activo" : "Inactivo");
        });
    }

   
}