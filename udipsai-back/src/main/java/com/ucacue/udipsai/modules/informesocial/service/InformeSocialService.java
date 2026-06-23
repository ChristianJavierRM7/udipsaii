package com.ucacue.udipsai.modules.informesocial.service;

import com.ucacue.udipsai.infrastructure.storage.StorageService;
import com.ucacue.udipsai.modules.informesocial.domain.InformeSocial;
import com.ucacue.udipsai.modules.informesocial.dto.InformeSocialDTO;
import com.ucacue.udipsai.modules.informesocial.dto.InformeSocialFamiliarDTO;
import com.ucacue.udipsai.modules.informesocial.dto.InformeSocialRequest;
import com.ucacue.udipsai.modules.informesocial.repository.InformeSocialRepository;
import com.ucacue.udipsai.modules.paciente.domain.Paciente;
import com.ucacue.udipsai.modules.paciente.dto.PacienteFichaDTO;
import com.ucacue.udipsai.modules.paciente.repository.PacienteRepository;
import com.ucacue.udipsai.modules.familiar.domain.Familiar;
import com.ucacue.udipsai.modules.familiar.domain.FamiliarReferencia;
import com.ucacue.udipsai.modules.familiar.dto.FamiliarDTO;
import com.ucacue.udipsai.modules.familiar.dto.FamiliarRequest;
import com.ucacue.udipsai.modules.familiar.service.FamiliarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.ucacue.udipsai.modules.fichasocial.domain.FichaSocioeconomica;
import com.ucacue.udipsai.modules.fichasocial.repository.FichaSocioeconomicaRepository;
import com.ucacue.udipsai.modules.especialistas.repository.EspecialistaRepository;
import com.ucacue.udipsai.modules.pasante.repository.PasanteRepository;
import com.ucacue.udipsai.modules.especialistas.domain.Especialista;
import com.ucacue.udipsai.modules.especialistas.dto.EspecialistaDTO;
import com.ucacue.udipsai.modules.pasante.dto.PasanteDTO;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class InformeSocialService {

    @Autowired
    private InformeSocialRepository informeRepository;
    @Autowired
    private PacienteRepository pacienteRepository;
    @Autowired
    private StorageService storageService;
    @Autowired
    private FichaSocioeconomicaRepository fichaRepository;
    @Autowired
    private FamiliarService familiarService;
    @Autowired
    private EspecialistaRepository especialistaRepository;
    @Autowired
    private PasanteRepository pasanteRepository;
    @Autowired
    private com.ucacue.udipsai.modules.asignacion.service.AsignacionSecurityService asignacionSecurity;

    @Transactional
    public InformeSocialDTO crearInforme(InformeSocialRequest request, MultipartFile genograma, MultipartFile ecomapa) {
        Paciente paciente = pacienteRepository.findById(request.getPacienteId())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));

        FichaSocioeconomica ficha = fichaRepository.findFirstByPacienteIdAndActivoOrderByIdDesc(paciente.getId(), true);
        if (ficha == null) {
            throw new RuntimeException("No existe ficha socioeconómica activa. Cree una ficha primero en el módulo de fichas socioeconómicas");
        }


        InformeSocial informe = new InformeSocial();
        informe.setPaciente(paciente);
        informe.setNumFicha(request.getNumFicha());
        informe.setFechaElaboracion(new java.util.Date());
        informe.setActivo(true);

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
                    informe.setPasante(pasante);
                    informe.setEspecialista(null);
                    resolved = true;
                }
            } else if (isEspecialista) {
                Especialista especialista = especialistaRepository.findByCedula(username).orElse(null);
                if (especialista != null) {
                    informe.setEspecialista(especialista);
                    informe.setPasante(null);
                    resolved = true;
                }
            }
        }

        if (!resolved && request.getEspecialistaId() != null) {
            Especialista especialista = especialistaRepository.findById(request.getEspecialistaId()).orElse(null);
            if (especialista != null) {
                informe.setEspecialista(especialista);
                informe.setPasante(null);
            } else {
                com.ucacue.udipsai.modules.pasante.domain.Pasante pasante = pasanteRepository.findById(request.getEspecialistaId()).orElse(null);
                if (pasante != null) {
                    informe.setPasante(pasante);
                    informe.setEspecialista(null);
                }
            }
        }

        informe.setTipoFamilia(request.getTipoFamilia());
        informe.setTipoFamiliaEspecificar(request.getTipoFamiliaEspecificar());

        if (genograma != null && !genograma.isEmpty()) {
            informe.setGenogramaUrl(storageService.store(genograma));
        }
        if (ecomapa != null && !ecomapa.isEmpty()) {
            informe.setEcomapaUrl(storageService.store(ecomapa));
        }

        informe.setDescripcionDinamicaFamiliar(request.getDescripcionDinamicaFamiliar());
        informe.setSituacionEconomica(request.getSituacionEconomica());
        informe.setSituacionHabitabilidad(request.getSituacionHabitabilidad());
        informe.setSituacionLaboral(request.getSituacionLaboral());
        informe.setSituacionEntorno(request.getSituacionEntorno());
        informe.setSituacionEducativoCultural(request.getSituacionEducativoCultural());
        informe.setSituacionSalud(request.getSituacionSalud());
        informe.setSituacionLegal(request.getSituacionLegal());
        informe.setValoracionProfesional(request.getValoracionProfesional());
        informe.setRecomendaciones(request.getRecomendaciones());
        informe.setElaboradoPor(request.getElaboradoPor());

        InformeSocial saved = informeRepository.save(informe);

        if (request.getInformante() != null) {
            procesarInformante(request.getInformante(), paciente.getId(), saved.getId().longValue());
        }

        procesarFamiliares(request.getFamiliares(), ficha);

        return convertirADTO(saved, ficha);
    }

    private void procesarInformante(FamiliarDTO fDto, Integer pacienteId, Long informeId) {
        FamiliarRequest fReq = new FamiliarRequest();

        if (fDto.getId() != null) {
            Familiar existente = familiarService.obtenerFamiliarPorId(fDto.getId().longValue()).orElse(null);
            if (existente != null) {
                fReq.setRelacion(fDto.getRelacion() != null && !fDto.getRelacion().trim().isEmpty() ? fDto.getRelacion() : existente.getRelacion());
                fReq.setNombresApellidos(fDto.getNombresApellidos() != null && !fDto.getNombresApellidos().trim().isEmpty() ? fDto.getNombresApellidos() : existente.getNombresApellidos());
                fReq.setCedula(fDto.getCedula() != null && !fDto.getCedula().trim().isEmpty() ? fDto.getCedula() : existente.getCedula());
                fReq.setNumeroTelefono(fDto.getNumeroTelefono() != null && !fDto.getNumeroTelefono().trim().isEmpty() ? fDto.getNumeroTelefono() : existente.getNumeroTelefono());
                fReq.setCorreoElectronico(fDto.getCorreoElectronico() != null && !fDto.getCorreoElectronico().trim().isEmpty() ? fDto.getCorreoElectronico() : existente.getCorreoElectronico());
                
                fReq.setEdad(fDto.getEdad() != null ? fDto.getEdad() : existente.getEdad());
                fReq.setEstadoCivil(fDto.getEstadoCivil() != null ? fDto.getEstadoCivil() : existente.getEstadoCivil());
                fReq.setInstruccion(fDto.getInstruccion() != null ? fDto.getInstruccion() : existente.getInstruccion());
                fReq.setOcupacion(fDto.getOcupacion() != null ? fDto.getOcupacion() : existente.getOcupacion());
                fReq.setIngresoMensual(fDto.getIngresoMensual() != null ? fDto.getIngresoMensual() : existente.getIngresoMensual());
                
                fReq.setProblemasSalud(existente.getProblemasSalud());
                fReq.setDescripProblemasSalud(existente.getDescripProblemasSalud());
                fReq.setEnfermedadCatastrofica(existente.getEnfermedadCatastrofica());
                fReq.setDescripEnfermedadCatastrofica(existente.getDescripEnfermedadCatastrofica());
                fReq.setDiscapacidad(existente.getDiscapacidad());
                fReq.setDescripDiscapacidad(existente.getDescripDiscapacidad());
            } else {
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
                fReq.setProblemasSalud(fDto.getProblemasSalud() != null ? fDto.getProblemasSalud() : false);
                fReq.setDescripProblemasSalud(fDto.getDescripProblemasSalud());
                fReq.setEnfermedadCatastrofica(fDto.getEnfermedadCatastrofica() != null ? fDto.getEnfermedadCatastrofica() : false);
                fReq.setDescripEnfermedadCatastrofica(fDto.getDescripEnfermedadCatastrofica());
                fReq.setDiscapacidad(fDto.getDiscapacidad() != null ? fDto.getDiscapacidad() : false);
                fReq.setDescripDiscapacidad(fDto.getDescripDiscapacidad());
            }
        } else {
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
            fReq.setProblemasSalud(fDto.getProblemasSalud() != null ? fDto.getProblemasSalud() : false);
            fReq.setDescripProblemasSalud(fDto.getDescripProblemasSalud());
            fReq.setEnfermedadCatastrofica(fDto.getEnfermedadCatastrofica() != null ? fDto.getEnfermedadCatastrofica() : false);
            fReq.setDescripEnfermedadCatastrofica(fDto.getDescripEnfermedadCatastrofica());
            fReq.setDiscapacidad(fDto.getDiscapacidad() != null ? fDto.getDiscapacidad() : false);
            fReq.setDescripDiscapacidad(fDto.getDescripDiscapacidad());
        }

        FamiliarDTO guardado;
        if (fDto.getId() != null) {
            guardado = familiarService.actualizarFamiliar(fDto.getId().longValue(), fReq);
        } else {
            guardado = familiarService.crearFamiliar(pacienteId, fReq);
        }

        // Avoid linking multiple times if it's already an informante for this informe
        Familiar informanteActual = familiarService.obtenerInformante(informeId);
        if (informanteActual == null || !informanteActual.getId().equals(guardado.getId())) {
            familiarService.vincularFamiliarAInforme(guardado.getId(), informeId, true);
        }
    }

    private void procesarFamiliares(List<InformeSocialFamiliarDTO> familiaresDto, FichaSocioeconomica ficha) {
        if (familiaresDto == null || ficha == null) {
            return;
        }

        List<FamiliarReferencia> refs = familiarService.obtenerReferencias("FICHA", ficha.getId().longValue());

        // Desvincular los familiares que ya no están en la lista enviada
        for (FamiliarReferencia ref : refs) {
            boolean sigueExistiendo = familiaresDto.stream()
                    .anyMatch(fDto -> fDto.getId() != null && fDto.getId().equals(ref.getFamiliar().getId().intValue()));
            if (!sigueExistiendo) {
                familiarService.desvincularFamiliarDeEntidad(ref.getFamiliar().getId(), "FICHA", ficha.getId().longValue());
            }
        }

        for (InformeSocialFamiliarDTO fDto : familiaresDto) {
            FamiliarRequest fReq = new FamiliarRequest();

            // Si es un familiar existente, conservar sus campos de salud y socioeconómicos si vienen vacíos
            if (fDto.getId() != null) {
                Familiar existente = familiarService.obtenerFamiliarPorId(fDto.getId().longValue()).orElse(null);
                if (existente != null) {
                    fReq.setRelacion(fDto.getParentesco() != null && !fDto.getParentesco().trim().isEmpty() ? fDto.getParentesco() : existente.getRelacion());
                    fReq.setNombresApellidos(fDto.getNombres() != null && !fDto.getNombres().trim().isEmpty() ? fDto.getNombres() : existente.getNombresApellidos());
                    fReq.setEdad(fDto.getEdad() != null && fDto.getEdad() > 0 ? fDto.getEdad() : existente.getEdad());
                    fReq.setEstadoCivil(fDto.getEstadoCivil() != null && !fDto.getEstadoCivil().trim().isEmpty() ? fDto.getEstadoCivil() : existente.getEstadoCivil());
                    fReq.setInstruccion(fDto.getInstruccion() != null && !fDto.getInstruccion().trim().isEmpty() ? fDto.getInstruccion() : existente.getInstruccion());
                    fReq.setOcupacion(fDto.getOcupacion() != null && !fDto.getOcupacion().trim().isEmpty() ? fDto.getOcupacion() : existente.getOcupacion());
                    fReq.setIngresoMensual(fDto.getIngresos() != null && fDto.getIngresos() > 0.0 ? fDto.getIngresos() : existente.getIngresoMensual());
                    fReq.setCedula(fDto.getCedula() != null && !fDto.getCedula().trim().isEmpty() ? fDto.getCedula() : existente.getCedula());
                    fReq.setNumeroTelefono(fDto.getTelefono() != null && !fDto.getTelefono().trim().isEmpty() ? fDto.getTelefono() : existente.getNumeroTelefono());
                    fReq.setCorreoElectronico(fDto.getCorreo() != null && !fDto.getCorreo().trim().isEmpty() ? fDto.getCorreo() : existente.getCorreoElectronico());
                    
                    fReq.setProblemasSalud(existente.getProblemasSalud());
                    fReq.setDescripProblemasSalud(existente.getDescripProblemasSalud());
                    fReq.setEnfermedadCatastrofica(existente.getEnfermedadCatastrofica());
                    fReq.setDescripEnfermedadCatastrofica(existente.getDescripEnfermedadCatastrofica());
                    fReq.setDiscapacidad(existente.getDiscapacidad());
                    fReq.setDescripDiscapacidad(existente.getDescripDiscapacidad());
                } else {
                    fReq.setRelacion(fDto.getParentesco());
                    fReq.setNombresApellidos(fDto.getNombres());
                    fReq.setEdad(fDto.getEdad());
                    fReq.setEstadoCivil(fDto.getEstadoCivil());
                    fReq.setInstruccion(fDto.getInstruccion());
                    fReq.setOcupacion(fDto.getOcupacion());
                    fReq.setIngresoMensual(fDto.getIngresos());
                    fReq.setCedula(fDto.getCedula());
                    fReq.setNumeroTelefono(fDto.getTelefono());
                    fReq.setCorreoElectronico(fDto.getCorreo());
                    fReq.setProblemasSalud(false);
                    fReq.setEnfermedadCatastrofica(false);
                    fReq.setDiscapacidad(false);
                }
            } else {
                fReq.setRelacion(fDto.getParentesco());
                fReq.setNombresApellidos(fDto.getNombres());
                fReq.setEdad(fDto.getEdad());
                fReq.setEstadoCivil(fDto.getEstadoCivil());
                fReq.setInstruccion(fDto.getInstruccion());
                fReq.setOcupacion(fDto.getOcupacion());
                fReq.setIngresoMensual(fDto.getIngresos());
                fReq.setCedula(fDto.getCedula());
                fReq.setNumeroTelefono(fDto.getTelefono());
                fReq.setCorreoElectronico(fDto.getCorreo());
                fReq.setProblemasSalud(false);
                fReq.setEnfermedadCatastrofica(false);
                fReq.setDiscapacidad(false);
            }

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

    @Transactional(readOnly = true)
    public List<InformeSocialDTO> listarInformes() {
        List<Integer> assignedIds = asignacionSecurity.getPasanteAssignedPatientIds();
        java.util.stream.Stream<InformeSocial> stream = informeRepository.findAll().stream()
                .filter(i -> Boolean.TRUE.equals(i.getActivo()));
        if (assignedIds != null) {
            stream = stream.filter(i -> i.getPaciente() != null && assignedIds.contains(i.getPaciente().getId()));
        }
        return stream.map(i -> {
                    FichaSocioeconomica ficha = fichaRepository.findFirstByPacienteIdAndActivoOrderByIdDesc(i.getPaciente().getId(), true);
                    return convertirADTO(i, ficha);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InformeSocialDTO obtenerPorId(Integer id) {
        InformeSocial informe = informeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Informe social no encontrado"));
        if (!Boolean.TRUE.equals(informe.getActivo())) {
            throw new RuntimeException("El informe social está inactivo");
        }
        FichaSocioeconomica ficha = fichaRepository.findFirstByPacienteIdAndActivoOrderByIdDesc(informe.getPaciente().getId(), true);
        return convertirADTO(informe, ficha);
    }

    @Transactional(readOnly = true)
    public InformeSocialDTO obtenerPorPacienteCedula(String cedula) {
        Paciente paciente = pacienteRepository.findByCedula(cedula).orElse(null);
        if (paciente == null) {
            return null;
        }
        List<InformeSocial> informes = informeRepository.findByPacienteIdAndActivoTrue(paciente.getId());
        InformeSocial informe = !informes.isEmpty() ? informes.get(informes.size() - 1) : null;
        if (informe != null) {
            FichaSocioeconomica ficha = fichaRepository.findFirstByPacienteIdAndActivoOrderByIdDesc(paciente.getId(), true);
            return convertirADTO(informe, ficha);
        }
        return null;
    }

    @Transactional(readOnly = true)
    public InformeSocialDTO obtenerPorPacienteId(Integer pacienteId) {
        List<InformeSocial> informes = informeRepository.findByPacienteIdAndActivoTrue(pacienteId);
        InformeSocial informe = !informes.isEmpty() ? informes.get(informes.size() - 1) : null;
        if (informe != null) {
            FichaSocioeconomica ficha = fichaRepository.findFirstByPacienteIdAndActivoOrderByIdDesc(pacienteId, true);
            return convertirADTO(informe, ficha);
        }
        return null;
    }

    @Transactional(readOnly = true)
    public List<InformeSocialDTO> obtenerHistorialPorPacienteId(Integer pacienteId) {
        List<InformeSocial> informes = informeRepository.findByPacienteIdOrderByFechaElaboracionDesc(pacienteId);
        return informes.stream()
                .filter(i -> Boolean.TRUE.equals(i.getActivo()))
                .map(i -> {
                    FichaSocioeconomica ficha = fichaRepository.findFirstByPacienteIdAndActivoOrderByIdDesc(pacienteId, true);
                    return convertirADTO(i, ficha);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public InformeSocialDTO actualizarInforme(Integer id, InformeSocialRequest request,
            MultipartFile genograma, MultipartFile ecomapa) {
        InformeSocial informe = informeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Informe social no encontrado"));

        if (!Boolean.TRUE.equals(informe.getActivo())) {
            throw new RuntimeException("No se puede editar un informe inactivo");
        }

        FichaSocioeconomica ficha = fichaRepository.findFirstByPacienteIdAndActivoOrderByIdDesc(informe.getPaciente().getId(), true);
        if (ficha == null) {
            throw new RuntimeException("No existe ficha socioeconómica activa para este paciente");
        }

        // Resolve creator/editor as Specialist or Pasante
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
                    informe.setPasante(pasante);
                    informe.setEspecialista(null);
                    resolved = true;
                }
            } else if (isEspecialista) {
                Especialista especialista = especialistaRepository.findByCedula(username).orElse(null);
                if (especialista != null) {
                    informe.setEspecialista(especialista);
                    informe.setPasante(null);
                    resolved = true;
                }
            }
        }

        if (!resolved && request.getEspecialistaId() != null) {
            Especialista especialista = especialistaRepository.findById(request.getEspecialistaId()).orElse(null);
            if (especialista != null) {
                informe.setEspecialista(especialista);
                informe.setPasante(null);
            } else {
                com.ucacue.udipsai.modules.pasante.domain.Pasante pasante = pasanteRepository.findById(request.getEspecialistaId()).orElse(null);
                if (pasante != null) {
                    informe.setPasante(pasante);
                    informe.setEspecialista(null);
                }
            }
        }

        if (genograma != null && !genograma.isEmpty()) {
            informe.setGenogramaUrl(storageService.store(genograma));
        }
        if (ecomapa != null && !ecomapa.isEmpty()) {
            informe.setEcomapaUrl(storageService.store(ecomapa));
        }

        informe.setTipoFamilia(request.getTipoFamilia());
        informe.setTipoFamiliaEspecificar(request.getTipoFamiliaEspecificar());

        informe.setDescripcionDinamicaFamiliar(request.getDescripcionDinamicaFamiliar());
        informe.setSituacionEconomica(request.getSituacionEconomica());
        informe.setSituacionHabitabilidad(request.getSituacionHabitabilidad());
        informe.setSituacionLaboral(request.getSituacionLaboral());
        informe.setSituacionEntorno(request.getSituacionEntorno());
        informe.setSituacionEducativoCultural(request.getSituacionEducativoCultural());
        informe.setSituacionSalud(request.getSituacionSalud());
        informe.setSituacionLegal(request.getSituacionLegal());
        informe.setValoracionProfesional(request.getValoracionProfesional());
        informe.setRecomendaciones(request.getRecomendaciones());
        informe.setElaboradoPor(request.getElaboradoPor());

        InformeSocial saved = informeRepository.save(informe);

        if (request.getInformante() != null) {
            procesarInformante(request.getInformante(), informe.getPaciente().getId(), saved.getId().longValue());
        }

        procesarFamiliares(request.getFamiliares(), ficha);

        return convertirADTO(saved, ficha);
    }

    @Transactional
    public void eliminarInforme(Integer id) {
        informeRepository.findById(id).ifPresent(informe -> {
            informe.setActivo(false);
            informeRepository.save(informe);
        });
    }

    @Transactional
    public InformeSocialDTO actualizarFamiliarEspecifico(Integer informeId, Integer familiarId, InformeSocialFamiliarDTO familiarDTO) {
        InformeSocial informe = informeRepository.findById(informeId)
                .orElseThrow(() -> new RuntimeException("Informe social no encontrado"));

        if (!Boolean.TRUE.equals(informe.getActivo())) {
            throw new RuntimeException("No se puede editar un informe inactivo");
        }

        Familiar familiar = familiarService.obtenerFamiliarPorId(familiarId.longValue())
                .orElseThrow(() -> new RuntimeException("Familiar no encontrado"));

        FamiliarRequest fReq = new FamiliarRequest();
        fReq.setRelacion(familiar.getRelacion());
        fReq.setNombresApellidos(familiar.getNombresApellidos());
        fReq.setEdad(familiar.getEdad());
        fReq.setEstadoCivil(familiar.getEstadoCivil());
        fReq.setInstruccion(familiar.getInstruccion());
        fReq.setOcupacion(familiar.getOcupacion());
        fReq.setIngresoMensual(familiar.getIngresoMensual());
        fReq.setProblemasSalud(familiar.getProblemasSalud());
        fReq.setDescripProblemasSalud(familiar.getDescripProblemasSalud());
        fReq.setEnfermedadCatastrofica(familiar.getEnfermedadCatastrofica());
        fReq.setDescripEnfermedadCatastrofica(familiar.getDescripEnfermedadCatastrofica());
        fReq.setDiscapacidad(familiar.getDiscapacidad());
        fReq.setDescripDiscapacidad(familiar.getDescripDiscapacidad());
        
        fReq.setCedula(familiarDTO.getCedula());
        fReq.setNumeroTelefono(familiarDTO.getTelefono());
        fReq.setCorreoElectronico(familiarDTO.getCorreo());

        familiarService.actualizarFamiliar(familiarId.longValue(), fReq);

        FichaSocioeconomica ficha = fichaRepository.findFirstByPacienteIdAndActivoOrderByIdDesc(informe.getPaciente().getId(), true);
        return convertirADTO(informe, ficha);
    }

    private InformeSocialDTO convertirADTO(InformeSocial entity, FichaSocioeconomica ficha) {
        InformeSocialDTO dto = new InformeSocialDTO();
        dto.setId(entity.getId());
        dto.setNumFicha(entity.getNumFicha());
        dto.setFechaElaboracion(entity.getFechaElaboracion());
        dto.setActivo(entity.getActivo());
        dto.setGenogramaUrl(entity.getGenogramaUrl());
        dto.setEcomapaUrl(entity.getEcomapaUrl());

        dto.setTipoFamilia(entity.getTipoFamilia());
        dto.setTipoFamiliaEspecificar(entity.getTipoFamiliaEspecificar());

        dto.setDescripcionDinamicaFamiliar(entity.getDescripcionDinamicaFamiliar());
        dto.setSituacionEconomica(entity.getSituacionEconomica());
        dto.setSituacionHabitabilidad(entity.getSituacionHabitabilidad());
        dto.setSituacionLaboral(entity.getSituacionLaboral());
        dto.setSituacionEntorno(entity.getSituacionEntorno());
        dto.setSituacionEducativoCultural(entity.getSituacionEducativoCultural());
        dto.setSituacionSalud(entity.getSituacionSalud());
        dto.setSituacionLegal(entity.getSituacionLegal());
        dto.setValoracionProfesional(entity.getValoracionProfesional());
        dto.setRecomendaciones(entity.getRecomendaciones());
        dto.setElaboradoPor(entity.getElaboradoPor());

        if (entity.getEspecialista() != null) {
            EspecialistaDTO espDto = new EspecialistaDTO();
            espDto.setId(entity.getEspecialista().getId());
            espDto.setNombresApellidos(entity.getEspecialista().getNombresApellidos());
            dto.setEspecialista(espDto);
        } else if (entity.getPasante() != null) {
            EspecialistaDTO espDto = new EspecialistaDTO();
            espDto.setId(entity.getPasante().getId());
            espDto.setNombresApellidos(entity.getPasante().getNombresApellidos());
            dto.setEspecialista(espDto);

            PasanteDTO pasDto = new PasanteDTO();
            pasDto.setId(entity.getPasante().getId());
            pasDto.setNombresApellidos(entity.getPasante().getNombresApellidos());
            if (entity.getPasante().getEspecialista() != null) {
                EspecialistaDTO superEsp = new EspecialistaDTO();
                superEsp.setId(entity.getPasante().getEspecialista().getId());
                superEsp.setNombresApellidos(entity.getPasante().getEspecialista().getNombresApellidos());
                pasDto.setEspecialista(superEsp);
            }
            dto.setPasante(pasDto);
        }

        Familiar informante = familiarService.obtenerInformante(entity.getId().longValue());
        if (informante != null) {
            FamiliarDTO fDto = new FamiliarDTO();
            fDto.setId(informante.getId());
            fDto.setPacienteId(informante.getPaciente().getId());
            fDto.setRelacion(informante.getRelacion());
            fDto.setNombresApellidos(informante.getNombresApellidos());
            fDto.setEdad(informante.getEdad());
            fDto.setEstadoCivil(informante.getEstadoCivil());
            fDto.setInstruccion(informante.getInstruccion());
            fDto.setOcupacion(informante.getOcupacion());
            fDto.setIngresoMensual(informante.getIngresoMensual());
            fDto.setCedula(informante.getCedula());
            fDto.setNumeroTelefono(informante.getNumeroTelefono());
            fDto.setCorreoElectronico(informante.getCorreoElectronico());
            fDto.setProblemasSalud(informante.getProblemasSalud());
            fDto.setDescripProblemasSalud(informante.getDescripProblemasSalud());
            fDto.setEnfermedadCatastrofica(informante.getEnfermedadCatastrofica());
            fDto.setDescripEnfermedadCatastrofica(informante.getDescripEnfermedadCatastrofica());
            fDto.setDiscapacidad(informante.getDiscapacidad());
            fDto.setDescripDiscapacidad(informante.getDescripDiscapacidad());
            fDto.setActivo(informante.getActivo());
            dto.setInformante(fDto);
        }

        if (entity.getPaciente() != null) {
            dto.setPaciente(new PacienteFichaDTO(
                    entity.getPaciente().getId(),
                    entity.getPaciente().getNombresApellidos(),
                    entity.getPaciente().getCedula()));
        }

        if (entity.getPaciente() != null && ficha != null) {
            List<Familiar> fichaFamiliares = familiarService.obtenerFamiliaresPorEntidad("FICHA", ficha.getId().longValue());
            if (fichaFamiliares != null) {
                dto.setFamiliares(fichaFamiliares.stream().map(f -> {
                    InformeSocialFamiliarDTO fDto = new InformeSocialFamiliarDTO();
                    fDto.setId(f.getId() != null ? f.getId().intValue() : null);
                    fDto.setNombres(f.getNombresApellidos());
                    fDto.setParentesco(f.getRelacion());
                    fDto.setEstadoCivil(f.getEstadoCivil());
                    fDto.setEdad(f.getEdad());
                    fDto.setIngresos(f.getIngresoMensual());
                    fDto.setInstruccion(f.getInstruccion());
                    fDto.setOcupacion(f.getOcupacion());
                    fDto.setCedula(f.getCedula());
                    fDto.setTelefono(f.getNumeroTelefono());
                    fDto.setCorreo(f.getCorreoElectronico());
                    return fDto;
                }).collect(Collectors.toList()));
            } else {
                dto.setFamiliares(List.of());
            }
        } else {
            dto.setFamiliares(List.of());
        }

        return dto;
    }

    @Transactional(readOnly = true)
    public org.springframework.core.io.Resource cargarGenogramaComoRecurso(Integer pacienteId) {
        List<InformeSocial> informes = informeRepository.findByPacienteIdAndActivoTrue(pacienteId);
        if (!informes.isEmpty()) {
            InformeSocial latest = informes.get(informes.size() - 1);
            if (latest.getGenogramaUrl() != null) {
                return storageService.loadAsResource(latest.getGenogramaUrl());
            }
        }
        return null;
    }

    @Transactional(readOnly = true)
    public org.springframework.core.io.Resource cargarEcomapaComoRecurso(Integer pacienteId) {
        List<InformeSocial> informes = informeRepository.findByPacienteIdAndActivoTrue(pacienteId);
        if (!informes.isEmpty()) {
            InformeSocial latest = informes.get(informes.size() - 1);
            if (latest.getEcomapaUrl() != null) {
                return storageService.loadAsResource(latest.getEcomapaUrl());
            }
        }
        return null;
    }

    @Transactional(readOnly = true)
    public org.springframework.core.io.Resource cargarGenogramaPorInformeIdComoRecurso(Integer id) {
        InformeSocial informe = informeRepository.findById(id).orElse(null);
        if (informe != null && informe.getGenogramaUrl() != null) {
            return storageService.loadAsResource(informe.getGenogramaUrl());
        }
        return null;
    }

    @Transactional(readOnly = true)
    public org.springframework.core.io.Resource cargarEcomapaPorInformeIdComoRecurso(Integer id) {
        InformeSocial informe = informeRepository.findById(id).orElse(null);
        if (informe != null && informe.getEcomapaUrl() != null) {
            return storageService.loadAsResource(informe.getEcomapaUrl());
        }
        return null;
    }

    @Transactional(readOnly = true)
    public String obtenerSiguienteNumeroFicha() {
        long count = informeRepository.count();
        return String.format("INF-%04d", count + 1);
    }
}