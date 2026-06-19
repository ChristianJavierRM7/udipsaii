package com.ucacue.udipsai.config;

import com.ucacue.udipsai.modules.especialistas.domain.Especialista;
import com.ucacue.udipsai.modules.especialistas.repository.EspecialistaRepository;
import com.ucacue.udipsai.modules.pasante.domain.Pasante;
import com.ucacue.udipsai.modules.pasante.repository.PasanteRepository;
import com.ucacue.udipsai.modules.paciente.domain.Paciente;
import com.ucacue.udipsai.modules.paciente.repository.PacienteRepository;
import com.ucacue.udipsai.modules.asignacion.domain.Asignacion;
import com.ucacue.udipsai.modules.asignacion.repository.AsignacionRepository;
import com.ucacue.udipsai.modules.permisos.Permisos;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private EspecialistaRepository especialistaRepository;

    @Autowired
    private PasanteRepository pasanteRepository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private AsignacionRepository asignacionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        // Grant social permissions to all existing specialists
        especialistaRepository.findAll().forEach(especialista -> {
            Permisos permisos = especialista.getPermisos();
            if (permisos == null) {
                permisos = new Permisos();
                especialista.setPermisos(permisos);
            }
            grantSocialPermisos(permisos);
            especialistaRepository.save(especialista);
        });

        // Grant social permissions to all existing pasantes
        pasanteRepository.findAll().forEach(pasante -> {
            Permisos permisos = pasante.getPermisos();
            if (permisos == null) {
                permisos = new Permisos();
                pasante.setPermisos(permisos);
            }
            grantSocialPermisos(permisos);
            pasanteRepository.save(pasante);
        });

        // Ensure pasante 0106990146 is assigned to all patients for testing convenience
        java.util.Optional<Pasante> testPasante = pasanteRepository.findByCedula("0106990146");
        if (testPasante.isPresent()) {
            pacienteRepository.findAll().forEach(paciente -> {
                boolean exists = asignacionRepository.existsByPasanteIdAndPacienteIdAndActivoTrue(
                        testPasante.get().getId(), paciente.getId());
                if (!exists) {
                    Asignacion asignacion = new Asignacion();
                    asignacion.setPasante(testPasante.get());
                    asignacion.setPaciente(paciente);
                    asignacion.setActivo(true);
                    asignacionRepository.save(asignacion);
                }
            });
            System.out.println("------------------------------------------------");
            System.out.println("ASIGNACIONES DE TEST CREADAS PARA PASANTE 0106990146");
            System.out.println("------------------------------------------------");
        }

        java.util.Optional<Especialista> existingAdmin = especialistaRepository.findByCedula("0101010101");
        if (existingAdmin.isPresent()) {
            Especialista admin = existingAdmin.get();
            Permisos permisos = admin.getPermisos();
            if (permisos == null) {
                permisos = new Permisos();
                admin.setPermisos(permisos);
            }
            grantAllPermisos(permisos);
            especialistaRepository.save(admin);
            System.out.println("------------------------------------------------");
            System.out.println("ADMINISTRADOR EXISTENTE ACTUALIZADO CON PERMISOS");
            System.out.println("Cédula: 0101010101");
            System.out.println("------------------------------------------------");
        } else {
            Permisos adminPermisos = new Permisos();
            grantAllPermisos(adminPermisos);

            Especialista admin = new Especialista();
            admin.setCedula("0101010101");
            admin.setNombresApellidos("Admin");
            admin.setContrasenia(passwordEncoder.encode("admin123"));
            admin.setActivo(true);
            admin.setPermisos(adminPermisos);

            especialistaRepository.save(admin);
            System.out.println("------------------------------------------------");
            System.out.println("ADMINISTRADOR INICIAL CREADO CON PERMISOS");
            System.out.println("Cédula: 0101010101");
            System.out.println("Contraseña: admin123");
            System.out.println("------------------------------------------------");
        }

        // reset sequence
        syncPermisosSequence();
    }

    private void syncPermisosSequence() {
        try {
            jdbcTemplate.execute("SELECT setval('permisos_id_seq', (SELECT COALESCE(MAX(id), 1) FROM permisos))");
            System.out.println("------------------------------------------------");
            System.out.println("Secuencia de permisos reseteada correctamente.");
            System.out.println("------------------------------------------------");
        } catch (Exception e) {
            System.out.println("No se pudo resetear la secuencia de permisos: " + e.getMessage());
        }
    }

    private void grantSocialPermisos(Permisos p) {
        p.setPasantes(true);
        p.setSedes(true);
        p.setPacientes(true);
        p.setInstitucionesEducativas(true);
        p.setSocioEconomica(true);
        p.setSocioEconomicaCrear(true);
        p.setSocioEconomicaEditar(true);
        p.setSocioEconomicaEliminar(true);
        p.setInformeSocial(true);
        p.setInformeSocialCrear(true);
        p.setInformeSocialEditar(true);
        p.setInformeSocialEliminar(true);
        p.setSeguimientoSocial(true);
        p.setSeguimientoSocialCrear(true);
        p.setSeguimientoSocialEditar(true);
        p.setSeguimientoSocialEliminar(true);
    }

    private void grantAllPermisos(Permisos p) {
        p.setPacientes(true);
        p.setPacientesCrear(true);
        p.setPacientesEditar(true);
        p.setPacientesEliminar(true);
        p.setPasantes(true);
        p.setPasantesCrear(true);
        p.setPasantesEditar(true);
        p.setPasantesEliminar(true);
        p.setSedes(true);
        p.setSedesCrear(true);
        p.setSedesEditar(true);
        p.setSedesEliminar(true);
        p.setEspecialistas(true);
        p.setEspecialistasCrear(true);
        p.setEspecialistasEditar(true);
        p.setEspecialistasEliminar(true);
        p.setEspecialidades(true);
        p.setEspecialidadesCrear(true);
        p.setEspecialidadesEditar(true);
        p.setEspecialidadesEliminar(true);
        p.setAsignaciones(true);
        p.setAsignacionesCrear(true);
        p.setAsignacionesEditar(true);
        p.setAsignacionesEliminar(true);
        p.setRecursos(true);
        p.setRecursosCrear(true);
        p.setRecursosEditar(true);
        p.setRecursosEliminar(true);
        p.setInstitucionesEducativas(true);
        p.setInstitucionesEducativasCrear(true);
        p.setInstitucionesEducativasEditar(true);
        p.setInstitucionesEducativasEliminar(true);
        p.setHistoriaClinica(true);
        p.setHistoriaClinicaCrear(true);
        p.setHistoriaClinicaEditar(true);
        p.setHistoriaClinicaEliminar(true);
        p.setFonoAudiologia(true);
        p.setFonoAudiologiaCrear(true);
        p.setFonoAudiologiaEditar(true);
        p.setFonoAudiologiaEliminar(true);
        p.setPsicologiaClinica(true);
        p.setPsicologiaClinicaCrear(true);
        p.setPsicologiaClinicaEditar(true);
        p.setPsicologiaClinicaEliminar(true);
        p.setPsicologiaEducativa(true);
        p.setPsicologiaEducativaCrear(true);
        p.setPsicologiaEducativaEditar(true);
        p.setPsicologiaEducativaEliminar(true);
        p.setInformes(true);
        p.setInformesCrear(true);
        p.setInformesEditar(true);
        p.setInformesEliminar(true);
        p.setCitas(true);
        p.setCitasCrear(true);
        p.setCitasEditar(true);
        p.setCitasEliminar(true);
        grantSocialPermisos(p);
    }
}