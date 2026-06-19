package com.ucacue.udipsai.modules.fichasocial.Service;

import com.ucacue.udipsai.modules.fichasocial.domain.FichaSocioeconomica;
import com.ucacue.udipsai.modules.fichasocial.domain.components.DesgloseEconomico;
import com.ucacue.udipsai.modules.fichasocial.dto.FichaSocioeconomicaDTO;
import com.ucacue.udipsai.modules.fichasocial.dto.FichaSocioeconomicaRequest;
import com.ucacue.udipsai.modules.fichasocial.repository.FichaSocioeconomicaRepository;
import com.ucacue.udipsai.modules.familiar.service.FamiliarService;
import com.ucacue.udipsai.modules.familiar.domain.Familiar;
import com.ucacue.udipsai.modules.familiar.domain.FamiliarReferencia;
import com.ucacue.udipsai.modules.familiar.dto.FamiliarRequest;
import com.ucacue.udipsai.modules.familiar.dto.FamiliarDTO;
import com.ucacue.udipsai.modules.paciente.domain.Paciente;
import com.ucacue.udipsai.modules.paciente.dto.PacienteFichaDTO;
import com.ucacue.udipsai.modules.paciente.repository.PacienteRepository;
import com.ucacue.udipsai.modules.especialistas.domain.Especialista;
import com.ucacue.udipsai.modules.especialistas.dto.EspecialistaDTO;
import com.ucacue.udipsai.modules.especialistas.repository.EspecialistaRepository;
import com.ucacue.udipsai.modules.pasante.repository.PasanteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import lombok.extern.slf4j.Slf4j;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class FichaSocioeconomicaService {

    @Autowired
    private FichaSocioeconomicaRepository fichaRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private EspecialistaRepository especialistaRepository;

    @Autowired
    private FamiliarService familiarService;

    @Autowired
    private PasanteRepository pasanteRepository;

    @Autowired
    private com.ucacue.udipsai.modules.asignacion.service.AsignacionSecurityService asignacionSecurity;

    @Transactional(readOnly = true)
    public List<FichaSocioeconomicaDTO> listarFichas() {
        log.info("Consultando todas las fichas socioeconómicas activas");
        List<Integer> assignedIds = asignacionSecurity.getPasanteAssignedPatientIds();
        java.util.stream.Stream<FichaSocioeconomica> stream = fichaRepository.findAll().stream()
                .filter(FichaSocioeconomica::getActivo);
        if (assignedIds != null) {
            stream = stream.filter(f -> f.getPaciente() != null && assignedIds.contains(f.getPaciente().getId()));
        }
        return stream.map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<FichaSocioeconomicaDTO> obtenerHistorialPorPacienteId(Integer pacienteId) {
        log.info("Consultando historial de fichas socioeconómicas para paciente ID: {}", pacienteId);
        return fichaRepository.findByPacienteIdAndActivoTrue(pacienteId).stream()
                .map(this::convertirADTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FichaSocioeconomicaDTO obtenerFichaActivaPorPacienteId(Integer pacienteId) {
        log.info("Consultando ficha socioeconómica activa para paciente ID: {}", pacienteId);
        FichaSocioeconomica ficha = fichaRepository.findFirstByPacienteIdAndActivoOrderByIdDesc(pacienteId, true);
        return (ficha != null) ? convertirADTO(ficha) : null;
    }

    @Transactional(readOnly = true)
    public FichaSocioeconomicaDTO obtenerPorId(Integer id) {
        log.info("Consultando ficha socioeconómica por ID: {}", id);
        FichaSocioeconomica ficha = fichaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ficha no encontrada"));
        return convertirADTO(ficha);
    }

    @Transactional
    public FichaSocioeconomicaDTO crearFicha(FichaSocioeconomicaRequest request) {
        log.info("Creando ficha socioeconómica para Paciente ID: {}", request.getPacienteId());

        FichaSocioeconomica existing = fichaRepository.findFirstByPacienteIdAndActivoOrderByIdDesc(request.getPacienteId(), true);
        if (existing != null) {
            log.info("Ficha anterior encontrada para paciente ID: {}. Manteniendo activa para historial.", request.getPacienteId());
        }

        FichaSocioeconomica ficha = new FichaSocioeconomica();

        Paciente paciente = pacienteRepository.findById(request.getPacienteId())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

        ficha.setPaciente(paciente);
        ficha.setActivo(true);

        // Resolve creator as Specialist or Pasante
        boolean resolved = false;
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            String username = auth.getName();
            boolean isPasante = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_PASANTE"));
            boolean isEspecialista = auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ESPECIALISTA"));

            if (isPasante) {
                com.ucacue.udipsai.modules.pasante.domain.Pasante pasante = pasanteRepository.findByCedula(username).orElse(null);
                if (pasante != null) {
                    ficha.setPasante(pasante);
                    ficha.setEspecialista(null);
                    resolved = true;
                }
            } else if (isEspecialista) {
                Especialista especialista = especialistaRepository.findByCedula(username).orElse(null);
                if (especialista != null) {
                    ficha.setEspecialista(especialista);
                    ficha.setPasante(null);
                    resolved = true;
                }
            }
        }

        if (!resolved) {
            Especialista especialista = especialistaRepository.findById(request.getEspecialistaId()).orElse(null);
            if (especialista != null) {
                ficha.setEspecialista(especialista);
                ficha.setPasante(null);
            } else {
                com.ucacue.udipsai.modules.pasante.domain.Pasante pasante = pasanteRepository.findById(request.getEspecialistaId()).orElse(null);
                if (pasante != null) {
                    ficha.setPasante(pasante);
                    ficha.setEspecialista(null);
                } else {
                    throw new RuntimeException("Especialista o Pasante no encontrado");
                }
            }
        }

        mapRequestToEntity(request, ficha);

        FichaSocioeconomica saved = fichaRepository.save(ficha);

        procesarFamiliares(request.getFamiliares(), saved);
        calcularIngresosDesglose(saved);

        saved = fichaRepository.save(saved);
        
        log.info("Ficha socioeconómica guardada exitosamente ID: {}", saved.getId());
        return convertirADTO(saved);
    }

    @Transactional
    public FichaSocioeconomicaDTO actualizarFicha(Integer id, FichaSocioeconomicaRequest request) {
        log.info("Actualizando ficha socioeconómica ID: {}", id);
        FichaSocioeconomica ficha = fichaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ficha no encontrada"));

        if (!ficha.getActivo()) {
            throw new RuntimeException("No se puede editar una ficha inactiva");
        }

        mapRequestToEntity(request, ficha);

        FichaSocioeconomica saved = fichaRepository.save(ficha);

        procesarFamiliares(request.getFamiliares(), saved);
        calcularIngresosDesglose(saved);

        saved = fichaRepository.save(saved);

        return convertirADTO(saved);
    }

    private void mapRequestToEntity(FichaSocioeconomicaRequest request, FichaSocioeconomica ficha) {
        ficha.setFechaElaboracion(request.getFechaElaboracion());
        ficha.setRiesgosSociales(request.getRiesgosSociales());
        ficha.setVulnerabilidad(request.getVulnerabilidad());
        ficha.setDinamicaFamiliar(request.getDinamicaFamiliar());
        ficha.setVivienda(request.getVivienda());
        ficha.setSalud(request.getSalud());
        ficha.setDesgloseEconomico(request.getDesgloseEconomico());
        ficha.setSituacionEconomica(request.getSituacionEconomica());
        ficha.setPacienteInstruccion(request.getPacienteInstruccion());
        ficha.setPacienteOcupacion(request.getPacienteOcupacion());
        ficha.setPacienteEmail(request.getPacienteEmail());
        
        if (request.getPacienteNumCarne() == null || request.getPacienteNumCarne().trim().isEmpty()) {
            ficha.setPacienteNumCarne(ficha.getPaciente() != null ? ficha.getPaciente().getCedula() : null);
        } else {
            ficha.setPacienteNumCarne(request.getPacienteNumCarne());
        }

        ficha.setConclusiones(request.getConclusiones());
        ficha.setRecomendaciones(request.getRecomendaciones());
        ficha.setResponsable(request.getResponsable());
    }

    private void procesarFamiliares(List<FamiliarDTO> familiaresDto, FichaSocioeconomica ficha) {
        if (familiaresDto == null) {
            return;
        }

        List<FamiliarReferencia> refs = familiarService.obtenerReferencias("FICHA", ficha.getId().longValue());

        // Desvincular los familiares que ya no están en la lista enviada
        for (FamiliarReferencia ref : refs) {
            boolean sigueExistiendo = familiaresDto.stream()
                    .anyMatch(fDto -> fDto.getId() != null && fDto.getId().equals(ref.getFamiliar().getId()));
            if (!sigueExistiendo) {
                familiarService.desvincularFamiliarDeEntidad(ref.getFamiliar().getId(), "FICHA", ficha.getId().longValue());
            }
        }

        for (FamiliarDTO fDto : familiaresDto) {
            FamiliarRequest fReq = new FamiliarRequest();
            fReq.setRelacion(fDto.getRelacion());
            fReq.setNombresApellidos(fDto.getNombresApellidos());
            fReq.setEdad(fDto.getEdad());
            fReq.setEstadoCivil(fDto.getEstadoCivil());
            fReq.setInstruccion(fDto.getInstruccion());
            fReq.setOcupacion(fDto.getOcupacion());
            fReq.setIngresoMensual(fDto.getIngresoMensual());
            fReq.setCedula(fDto.getCedula());
            fReq.setNumeroTelefono(fDto.getNumeroTelefono());
            fReq.setCorreoElectronico(fDto.getCorreoElectronico());
            fReq.setProblemasSalud(fDto.getProblemasSalud());
            fReq.setDescripProblemasSalud(fDto.getDescripProblemasSalud());
            fReq.setEnfermedadCatastrofica(fDto.getEnfermedadCatastrofica());
            fReq.setDescripEnfermedadCatastrofica(fDto.getDescripEnfermedadCatastrofica());
            fReq.setDiscapacidad(fDto.getDiscapacidad());
            fReq.setDescripDiscapacidad(fDto.getDescripDiscapacidad());

            FamiliarDTO guardado;
            if (fDto.getId() != null) {
                guardado = familiarService.actualizarFamiliar(fDto.getId().longValue(), fReq);
            } else {
                guardado = familiarService.crearFamiliar(ficha.getPaciente().getId(), fReq);
            }

            boolean alreadyLinked = refs.stream()
                    .anyMatch(r -> r.getFamiliar().getId().equals(guardado.getId()));
            
            if (!alreadyLinked) {
                familiarService.vincularFamiliarAFicha(guardado.getId(), ficha.getId().longValue());
            }
        }
    }

    private FichaSocioeconomicaDTO convertirADTO(FichaSocioeconomica ficha) {
        FichaSocioeconomicaDTO dto = new FichaSocioeconomicaDTO();
        dto.setId(ficha.getId());
        dto.setActivo(ficha.getActivo());
        dto.setFechaElaboracion(ficha.getFechaElaboracion());

        if (ficha.getPaciente() != null) {
            Paciente p = ficha.getPaciente();
            PacienteFichaDTO pDto = new PacienteFichaDTO(p.getId(), p.getNombresApellidos(), p.getCedula());
            pDto.setFechaNacimiento(p.getFechaNacimiento());
            pDto.setLugarNacimiento(p.getLugarNacimiento());
            pDto.setDomicilio(p.getDomicilio());
            pDto.setNumeroTelefono(p.getNumeroTelefono());
            pDto.setNumeroCelular(p.getNumeroCelular());
            pDto.setTieneDiscapacidad(p.getTieneDiscapacidad());
            pDto.setTipoDiscapacidad(p.getTipoDiscapacidad());
            pDto.setPorcentajeDiscapacidad(p.getPorcentajeDiscapacidad());
            pDto.setPortadorCarnet(p.getPortadorCarnet());
            pDto.setNivelEducativo(p.getNivelEducativo());
            pDto.setEmail(p.getEmail());
            pDto.setOcupacion(p.getOcupacion());
            dto.setPaciente(pDto);
        }

        if (ficha.getEspecialista() != null) {
            EspecialistaDTO espDto = new EspecialistaDTO();
            espDto.setId(ficha.getEspecialista().getId());
            espDto.setNombresApellidos(ficha.getEspecialista().getNombresApellidos());
            dto.setEspecialista(espDto);
        } else if (ficha.getPasante() != null) {
            EspecialistaDTO espDto = new EspecialistaDTO();
            espDto.setId(ficha.getPasante().getId());
            espDto.setNombresApellidos(ficha.getPasante().getNombresApellidos());
            dto.setEspecialista(espDto);

            com.ucacue.udipsai.modules.pasante.dto.PasanteDTO pasDto = new com.ucacue.udipsai.modules.pasante.dto.PasanteDTO();
            pasDto.setId(ficha.getPasante().getId());
            pasDto.setNombresApellidos(ficha.getPasante().getNombresApellidos());
            if (ficha.getPasante().getEspecialista() != null) {
                EspecialistaDTO superEsp = new EspecialistaDTO();
                superEsp.setId(ficha.getPasante().getEspecialista().getId());
                superEsp.setNombresApellidos(ficha.getPasante().getEspecialista().getNombresApellidos());
                pasDto.setEspecialista(superEsp);
            }
            dto.setPasante(pasDto);
        }
        
        dto.setRiesgosSociales(ficha.getRiesgosSociales());
        dto.setVulnerabilidad(ficha.getVulnerabilidad());
        dto.setDinamicaFamiliar(ficha.getDinamicaFamiliar());
        dto.setVivienda(ficha.getVivienda());
        dto.setSalud(ficha.getSalud());
        dto.setDesgloseEconomico(ficha.getDesgloseEconomico());
        dto.setSituacionEconomica(ficha.getSituacionEconomica());

        dto.setPacienteInstruccion(ficha.getPacienteInstruccion());
        dto.setPacienteOcupacion(ficha.getPacienteOcupacion());
        dto.setPacienteEmail(ficha.getPacienteEmail());
        dto.setPacienteNumCarne(ficha.getPacienteNumCarne());

        dto.setConclusiones(ficha.getConclusiones());
        dto.setRecomendaciones(ficha.getRecomendaciones());
        dto.setResponsable(ficha.getResponsable());

        List<Familiar> familiares = familiarService.obtenerFamiliaresPorEntidad("FICHA", ficha.getId().longValue());
        if (familiares != null) {
            dto.setFamiliares(familiares.stream().map(f -> {
                FamiliarDTO fDto = new FamiliarDTO();
                fDto.setId(f.getId());
                fDto.setPacienteId(f.getPaciente().getId());
                fDto.setRelacion(f.getRelacion());
                fDto.setNombresApellidos(f.getNombresApellidos());
                fDto.setEdad(f.getEdad());
                fDto.setEstadoCivil(f.getEstadoCivil());
                fDto.setInstruccion(f.getInstruccion());
                fDto.setOcupacion(f.getOcupacion());
                fDto.setIngresoMensual(f.getIngresoMensual());
                fDto.setCedula(f.getCedula());
                fDto.setNumeroTelefono(f.getNumeroTelefono());
                fDto.setCorreoElectronico(f.getCorreoElectronico());
                fDto.setProblemasSalud(f.getProblemasSalud());
                fDto.setDescripProblemasSalud(f.getDescripProblemasSalud());
                fDto.setEnfermedadCatastrofica(f.getEnfermedadCatastrofica());
                fDto.setDescripEnfermedadCatastrofica(f.getDescripEnfermedadCatastrofica());
                fDto.setDiscapacidad(f.getDiscapacidad());
                fDto.setDescripDiscapacidad(f.getDescripDiscapacidad());
                fDto.setActivo(f.getActivo());
                return fDto;
            }).collect(Collectors.toList()));
        }

        return dto;
    }

    private void calcularIngresosDesglose(FichaSocioeconomica ficha) {
        if (ficha.getDesgloseEconomico() == null) {
            ficha.setDesgloseEconomico(new DesgloseEconomico());
        }
        double padre = 0.0;
        double madre = 0.0;
        double otrosFamiliares = 0.0;

        List<Familiar> familiares = familiarService.obtenerFamiliaresPorEntidad("FICHA", ficha.getId().longValue());

        if (familiares != null) {
            for (Familiar familiar : familiares) {
                double ingreso = familiar.getIngresoMensual() != null ? familiar.getIngresoMensual() : 0.0;
                String relacion = familiar.getRelacion() != null ? familiar.getRelacion().toLowerCase().trim() : "";
                if (relacion.equals("padre") || relacion.equals("papá") || relacion.equals("papa")) {
                    padre += ingreso;
                } else if (relacion.equals("madre") || relacion.equals("mamá") || relacion.equals("mama")) {
                    madre += ingreso;
                } else {
                    otrosFamiliares += ingreso;
                }
            }
        }

        ficha.getDesgloseEconomico().setIngresoPadre(padre);
        ficha.getDesgloseEconomico().setIngresoMadre(madre);
        ficha.getDesgloseEconomico().setIngresoFamiliares(otrosFamiliares);
        if (ficha.getDesgloseEconomico().getIngresoOtros() == null) {
            ficha.getDesgloseEconomico().setIngresoOtros(0.0);
        }
    }

    @Transactional
    public void desactivarFicha(Integer id) {
        log.info("Desactivando ficha socioeconómica ID: {}", id);
        fichaRepository.findById(id).ifPresent(f -> {
            f.setActivo(false);
            fichaRepository.save(f);
        });
    }
}