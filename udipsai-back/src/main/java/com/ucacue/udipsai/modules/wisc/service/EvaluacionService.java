package com.ucacue.udipsai.modules.wisc.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ucacue.udipsai.modules.wisc.dto.EvaluacionGuardarDTO;
import com.ucacue.udipsai.modules.wisc.dto.EvaluacionResumenDTO;
import com.ucacue.udipsai.modules.wisc.exception.ApiException;
import com.ucacue.udipsai.modules.wisc.exception.ResourceNotFoundException;
import com.ucacue.udipsai.modules.wisc.model.Evaluacion;
import com.ucacue.udipsai.modules.wisc.repository.EvaluacionRepository;
import com.ucacue.udipsai.modules.wisc.repository.EvaluacionSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
public class EvaluacionService {

    private final EvaluacionRepository evaluacionRepository;
    private final ObjectMapper objectMapper;

    public EvaluacionService(EvaluacionRepository evaluacionRepository, ObjectMapper objectMapper) {
        this.evaluacionRepository = evaluacionRepository;
        this.objectMapper = objectMapper;
    }

    public Map<String, Object> guardarEvaluacion(EvaluacionGuardarDTO dto) {
        String id;
        boolean isUpdate = false;
        
        if (dto.getId() != null && !dto.getId().trim().isEmpty()) {
            id = dto.getId();
            isUpdate = true;
        } else if (dto.getDatosRestantes() != null && dto.getDatosRestantes().containsKey("id") && dto.getDatosRestantes().get("id") != null && !dto.getDatosRestantes().get("id").toString().trim().isEmpty()) {
            id = dto.getDatosRestantes().get("id").toString();
            isUpdate = true;
        } else {
            id = dto.getTipo() + "-" + UUID.randomUUID().toString();
        }

        Evaluacion eval;
        if (isUpdate) {
            eval = evaluacionRepository.findById(id).orElse(new Evaluacion());
        } else {
            eval = new Evaluacion();
        }
        
        eval.setId(id);
        eval.setTipo(dto.getTipo());
        eval.setTipoPrueba(dto.getTipoPrueba());
        eval.setTimestamp(LocalDateTime.now());

        if (dto.getPaciente() != null) {
            eval.setNombre(dto.getPaciente().getNombre());
            eval.setExaminador(dto.getPaciente().getExaminador());
            eval.setEdadMeses(dto.getPaciente().getEdadMeses() != null ? dto.getPaciente().getEdadMeses() : 0);
        }

        // Serializamos todos los datos, incluyendo el id y el timestamp actual
        Map<String, Object> evalData = dto.getDatosRestantes();
        evalData.put("tipo", dto.getTipo());
        evalData.put("tipoPrueba", dto.getTipoPrueba());
        evalData.put("paciente", dto.getPaciente());
        evalData.put("id", id);
        evalData.put("timestamp", eval.getTimestamp().toString());

        try {
            eval.setDatosJson(objectMapper.writeValueAsString(evalData));
        } catch (JsonProcessingException e) {
            throw new ApiException("Error al serializar los datos de la evaluación", HttpStatus.INTERNAL_SERVER_ERROR);
        }

        evaluacionRepository.save(eval);

        return Map.of("ok", true, "id", id);
    }

    public Page<EvaluacionResumenDTO> buscarEvaluaciones(String nombre, String fecha, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));
        
        Specification<Evaluacion> spec = EvaluacionSpecification.buildSearchFilter(nombre, fecha);
        Page<Evaluacion> evalsPage = evaluacionRepository.findAll(spec, pageable);

        return evalsPage.map(e -> EvaluacionResumenDTO.builder()
                .id(e.getId())
                .tipo(e.getTipo())
                .tipoPrueba(e.getTipoPrueba())
                .timestamp(e.getTimestamp() != null ? e.getTimestamp().toString() : "")
                .nombre(e.getNombre() != null ? e.getNombre() : "")
                .examinador(e.getExaminador() != null ? e.getExaminador() : "")
                .edadMeses(e.getEdadMeses() != null ? e.getEdadMeses() : 0)
                .build()
        );
    }

    public void eliminarEvaluacion(@org.springframework.lang.NonNull String id) {
        if (!evaluacionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Evaluación", "id", id);
        }
        evaluacionRepository.deleteById(id);
    }

    public Map<String, Object> leerEvaluacion(@org.springframework.lang.NonNull String id) {
        Evaluacion eval = evaluacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Evaluación", "id", id));
                
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> evalData = objectMapper.readValue(eval.getDatosJson(), Map.class);
            return evalData;
        } catch (JsonProcessingException e) {
            throw new ApiException("Error al deserializar los datos de la evaluación", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
