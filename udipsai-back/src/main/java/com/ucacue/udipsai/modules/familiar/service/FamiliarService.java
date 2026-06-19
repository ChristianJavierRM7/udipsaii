package com.ucacue.udipsai.modules.familiar.service;

import com.ucacue.udipsai.modules.familiar.domain.Familiar;
import com.ucacue.udipsai.modules.familiar.domain.FamiliarReferencia;
import com.ucacue.udipsai.modules.familiar.dto.FamiliarDTO;
import com.ucacue.udipsai.modules.familiar.dto.FamiliarRequest;
import com.ucacue.udipsai.modules.familiar.repository.FamiliarRepository;
import com.ucacue.udipsai.modules.familiar.repository.FamiliarReferenciaRepository;
import com.ucacue.udipsai.modules.paciente.domain.Paciente;
import com.ucacue.udipsai.modules.paciente.repository.PacienteRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class FamiliarService {

    @Autowired
    private FamiliarRepository familiarRepository;

    @Autowired
    private FamiliarReferenciaRepository referenciaRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public FamiliarDTO crearFamiliar(Integer pacienteId, FamiliarRequest request) {
        log.info("Creando familiar para paciente ID: {}", pacienteId);

        Paciente paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

        if (request.getCedula() != null) {
            Optional<Familiar> existe = familiarRepository.findByPacienteIdAndCedula(
                    pacienteId, request.getCedula());
            if (existe.isPresent()) {
                throw new RuntimeException("Este familiar ya existe para este paciente");
            }
        }

        Familiar familiar = Familiar.builder()
                .paciente(paciente)
                .relacion(request.getRelacion())
                .nombresApellidos(request.getNombresApellidos())
                .edad(request.getEdad())
                .estadoCivil(request.getEstadoCivil())
                .instruccion(request.getInstruccion())
                .ocupacion(request.getOcupacion())
                .ingresoMensual(request.getIngresoMensual())
                .cedula(request.getCedula())
                .numeroTelefono(request.getNumeroTelefono())
                .correoElectronico(request.getCorreoElectronico())
                .problemasSalud(request.getProblemasSalud() != null ? request.getProblemasSalud() : false)
                .descripProblemasSalud(request.getDescripProblemasSalud())
                .enfermedadCatastrofica(request.getEnfermedadCatastrofica() != null ?
                        request.getEnfermedadCatastrofica() : false)
                .descripEnfermedadCatastrofica(request.getDescripEnfermedadCatastrofica())
                .discapacidad(request.getDiscapacidad() != null ? request.getDiscapacidad() : false)
                .descripDiscapacidad(request.getDescripDiscapacidad())
                .activo(true)
                .build();

        Familiar saved = familiarRepository.save(familiar);
        log.info("Familiar creado con ID: {}", saved.getId());
        return convertirADTO(saved);
    }

    @Transactional(readOnly = true)
    public List<FamiliarDTO> obtenerFamiliaresPorPaciente(Integer pacienteId) {
        return familiarRepository.findByPacienteIdAndActivoTrue(pacienteId)
                .stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Optional<Familiar> obtenerFamiliarPorId(Long id) {
        return familiarRepository.findById(id);
    }

    @Transactional
    public FamiliarDTO actualizarFamiliar(Long familiarId, FamiliarRequest request) {
        log.info("Actualizando familiar ID: {}", familiarId);

        Familiar familiar = familiarRepository.findById(familiarId)
                .orElseThrow(() -> new RuntimeException("Familiar no encontrado"));

        familiar.setRelacion(request.getRelacion());
        familiar.setNombresApellidos(request.getNombresApellidos());
        familiar.setEdad(request.getEdad());
        familiar.setEstadoCivil(request.getEstadoCivil());
        familiar.setInstruccion(request.getInstruccion());
        familiar.setOcupacion(request.getOcupacion());
        familiar.setIngresoMensual(request.getIngresoMensual());
        familiar.setNumeroTelefono(request.getNumeroTelefono());
        familiar.setCorreoElectronico(request.getCorreoElectronico());
        familiar.setCedula(request.getCedula());
        familiar.setProblemasSalud(request.getProblemasSalud());
        familiar.setDescripProblemasSalud(request.getDescripProblemasSalud());
        familiar.setEnfermedadCatastrofica(request.getEnfermedadCatastrofica());
        familiar.setDescripEnfermedadCatastrofica(request.getDescripEnfermedadCatastrofica());
        familiar.setDiscapacidad(request.getDiscapacidad());
        familiar.setDescripDiscapacidad(request.getDescripDiscapacidad());

        Familiar updated = familiarRepository.save(familiar);
        return convertirADTO(updated);
    }

    @Transactional
    public void desactivarFamiliar(Long familiarId) {
        log.info("Desactivando familiar ID: {}", familiarId);
        Familiar familiar = familiarRepository.findById(familiarId)
                .orElseThrow(() -> new RuntimeException("Familiar no encontrado"));
        familiar.setActivo(false);
        familiarRepository.save(familiar);
    }

    @Transactional
    public FamiliarReferencia crearReferencia(Long familiarId, String entidadTipo, Long entidadId,
            Map<String, Object> contexto) {
        log.info("Creando referencia: Familiar {} -> {} ({})", familiarId, entidadTipo, entidadId);

        Familiar familiar = familiarRepository.findById(familiarId)
                .orElseThrow(() -> new RuntimeException("Familiar no encontrado"));

        FamiliarReferencia referencia = FamiliarReferencia.builder()
                .familiar(familiar)
                .entidadTipo(entidadTipo)
                .entidadId(entidadId)
                .contextoDatos(objectMapper.valueToTree(contexto))
                .fechaCreacion(LocalDateTime.now())
                .build();

        return referenciaRepository.save(referencia);
    }

    @Transactional(readOnly = true)
    public List<FamiliarReferencia> obtenerReferencias(String entidadTipo, Long entidadId) {
        return referenciaRepository.findByEntidadTipoAndEntidadId(entidadTipo, entidadId);
    }

    @Transactional(readOnly = true)
    public List<Familiar> obtenerFamiliaresPorEntidad(String entidadTipo, Long entidadId) {
        return referenciaRepository.findByEntidadTipoAndEntidadId(entidadTipo, entidadId)
                .stream()
                .map(FamiliarReferencia::getFamiliar)
                .distinct()
                .collect(Collectors.toList());
    }

    @Transactional
    public void vincularFamiliarAFicha(Long familiarId, Long fichaId) {
        crearReferencia(familiarId, "FICHA", fichaId, Map.of("rol", "familiar_ficha"));
    }

    @Transactional
    public void desvincularFamiliarDeEntidad(Long familiarId, String entidadTipo, Long entidadId) {
        List<FamiliarReferencia> referencias = referenciaRepository.findByEntidadTipoAndEntidadId(entidadTipo, entidadId);
        referencias.stream()
                .filter(ref -> ref.getFamiliar().getId().equals(familiarId))
                .forEach(referenciaRepository::delete);
    }

    @Transactional
    public void vincularFamiliarAInforme(Long familiarId, Long informeId, Boolean esInformante) {
        Map<String, Object> contexto = Map.of(
            "rol", esInformante ? "informante" : "familiar_referido",
            "es_informante", esInformante != null ? esInformante : false
        );
        crearReferencia(familiarId, "INFORME", informeId, contexto);
    }

    @Transactional(readOnly = true)
    public Familiar obtenerInformante(Long informeId) {
        List<FamiliarReferencia> referencias = referenciaRepository
                .findByEntidadTipoAndEntidadId("INFORME", informeId);

        return referencias.stream()
                .filter(ref -> ref.getContextoDatos() != null &&
                        "informante".equals(ref.getContextoDatos().get("rol").asText()))
                .map(FamiliarReferencia::getFamiliar)
                .findFirst()
                .orElse(null);
    }

    protected FamiliarDTO convertirADTO(Familiar familiar) {
        return FamiliarDTO.builder()
                .id(familiar.getId())
                .pacienteId(familiar.getPaciente().getId())
                .relacion(familiar.getRelacion())
                .nombresApellidos(familiar.getNombresApellidos())
                .edad(familiar.getEdad())
                .estadoCivil(familiar.getEstadoCivil())
                .instruccion(familiar.getInstruccion())
                .ocupacion(familiar.getOcupacion())
                .ingresoMensual(familiar.getIngresoMensual())
                .cedula(familiar.getCedula())
                .numeroTelefono(familiar.getNumeroTelefono())
                .correoElectronico(familiar.getCorreoElectronico())
                .problemasSalud(familiar.getProblemasSalud())
                .descripProblemasSalud(familiar.getDescripProblemasSalud())
                .enfermedadCatastrofica(familiar.getEnfermedadCatastrofica())
                .descripEnfermedadCatastrofica(familiar.getDescripEnfermedadCatastrofica())
                .discapacidad(familiar.getDiscapacidad())
                .descripDiscapacidad(familiar.getDescripDiscapacidad())
                .activo(familiar.getActivo())
                .build();
    }
}
