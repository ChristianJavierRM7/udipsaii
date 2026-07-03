package com.ucacue.udipsai.modules.wisc.repository;

import com.ucacue.udipsai.modules.wisc.model.Evaluacion;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

public class EvaluacionSpecification {

    public static Specification<Evaluacion> buildSearchFilter(String nombre, String fecha) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (nombre != null && !nombre.trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("nombre")),
                        "%" + nombre.trim().toLowerCase() + "%"
                ));
            }

            if (fecha != null && !fecha.trim().isEmpty()) {
                try {
                    // Try to parse the date and filter records for that specific day
                    LocalDate searchDate = LocalDate.parse(fecha.trim(), DateTimeFormatter.ISO_LOCAL_DATE);
                    LocalDateTime startOfDay = searchDate.atStartOfDay();
                    LocalDateTime endOfDay = searchDate.plusDays(1).atStartOfDay();

                    predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("timestamp"), startOfDay));
                    predicates.add(criteriaBuilder.lessThan(root.get("timestamp"), endOfDay));
                } catch (Exception e) {
                    // Si la fecha no tiene formato valido, la ignoramos.
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
