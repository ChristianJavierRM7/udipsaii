package com.ucacue.udipsai.modules.informesocial.service;

import com.ucacue.udipsai.common.report.ExcelGenerator;
import com.ucacue.udipsai.common.report.PdfService;
import com.ucacue.udipsai.modules.informesocial.dto.InformeSocialDTO;
import com.ucacue.udipsai.modules.paciente.domain.Paciente;
import com.ucacue.udipsai.modules.paciente.repository.PacienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class InformeSocialReportService {

        @Autowired
        private InformeSocialService informeService;

        @Autowired
        private PdfService pdfService;

        @Autowired
        private PacienteRepository pacienteRepository;

        @Autowired
        private com.ucacue.udipsai.infrastructure.storage.StorageService storageService;

        private final SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");

        /**
         * EXPORTAR EXCEL
         */
        public ByteArrayInputStream exportarExcel(Integer pacienteId)
                        throws IOException {

                List<InformeSocialDTO> informes;

                if (pacienteId != null) {
                        InformeSocialDTO informe = informeService.obtenerPorPacienteId(pacienteId);

                        informes = (informe != null)
                                        ? List.of(informe)
                                        : List.of();
                } else {
                        informes = informeService.listarInformes();
                }

                String[] headers = {
                                "ID",
                                "Número Ficha",
                                "Paciente",
                                "Cédula",
                                "Fecha Elaboración",
                                "Dinámica Familiar",
                                "Situación Económica",
                                "Situación Habitabilidad",
                                "Situación Laboral",
                                "Situación Entorno",
                                "Situación Educativo Cultural",
                                "Situación Salud",
                                "Situación Legal",
                                "Valoración Profesional",
                                "Recomendaciones",
                                "Elaborado Por",
                                "Familiares"
                };

                return ExcelGenerator.generateExcel(
                                "Informes Sociales",
                                headers,
                                informes,
                                (row, i) -> {

                                        int col = 0;

                                        row.createCell(col++)
                                                        .setCellValue(fmt(i.getId()));

                                        row.createCell(col++)
                                                        .setCellValue(fmt(i.getNumFicha()));

                                        row.createCell(col++)
                                                        .setCellValue(
                                                                        i.getPaciente() != null
                                                                                        ? i.getPaciente()
                                                                                                        .getNombresApellidos()
                                                                                        : "N/A");

                                        row.createCell(col++)
                                                        .setCellValue(
                                                                        i.getPaciente() != null
                                                                                        ? i.getPaciente()
                                                                                                        .getCedula()
                                                                                        : "N/A");

                                        row.createCell(col++)
                                                        .setCellValue(
                                                                        fmt(i.getFechaElaboracion()));

                                        row.createCell(col++)
                                                        .setCellValue(
                                                                        fmt(i.getDescripcionDinamicaFamiliar()));

                                        row.createCell(col++)
                                                        .setCellValue(
                                                                        fmt(i.getSituacionEconomica()));

                                        row.createCell(col++)
                                                        .setCellValue(
                                                                        fmt(i.getSituacionHabitabilidad()));

                                        row.createCell(col++)
                                                        .setCellValue(
                                                                        fmt(i.getSituacionLaboral()));

                                        row.createCell(col++)
                                                        .setCellValue(
                                                                        fmt(i.getSituacionEntorno()));

                                        row.createCell(col++)
                                                        .setCellValue(
                                                                        fmt(i.getSituacionEducativoCultural()));

                                        row.createCell(col++)
                                                        .setCellValue(
                                                                        fmt(i.getSituacionSalud()));

                                        row.createCell(col++)
                                                        .setCellValue(
                                                                        fmt(i.getSituacionLegal()));

                                        row.createCell(col++)
                                                        .setCellValue(
                                                                        fmt(i.getValoracionProfesional()));

                                        row.createCell(col++)
                                                        .setCellValue(
                                                                        fmt(i.getRecomendaciones()));

                                        row.createCell(col++)
                                                        .setCellValue(
                                                                        fmt(i.getElaboradoPor()));

                                        // Familiares concatenados
                                        if (i.getFamiliares() != null &&
                                                        !i.getFamiliares().isEmpty()) {

                                                String familiares = i.getFamiliares()
                                                                .stream()
                                                                .map(f -> f.getNombres()
                                                                                + " ("
                                                                                + f.getParentesco()
                                                                                + ")")
                                                                .reduce(
                                                                                (a, b) -> a + ", " + b)
                                                                .orElse("N/A");

                                                row.createCell(col++)
                                                                .setCellValue(familiares);

                                        } else {
                                                row.createCell(col++)
                                                                .setCellValue("N/A");
                                        }
                                });
        }

        @Transactional(readOnly = true)
        public byte[] exportarPdf(Integer pacienteId)
                        throws Exception {

                InformeSocialDTO informe = informeService.obtenerPorPacienteId(pacienteId);

                if (informe == null) {
                        throw new RuntimeException(
                                        "No existe informe social para este paciente");
                }

                Map<String, Object> data = new HashMap<>();
                data.put("i", informe);

                Paciente paciente = pacienteRepository.findById(pacienteId)
                                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
                data.put("p", paciente);

                if (informe.getGenogramaUrl() != null && !informe.getGenogramaUrl().trim().isEmpty()) {
                        try {
                                java.nio.file.Path path = storageService.load(informe.getGenogramaUrl());
                                if (java.nio.file.Files.exists(path)) {
                                        if (informe.getGenogramaUrl().toLowerCase().endsWith(".pdf")) {
                                                data.put("genogramaIsPdf", true);
                                        } else {
                                                byte[] bytes = java.nio.file.Files.readAllBytes(path);
                                                String contentType = java.nio.file.Files.probeContentType(path);
                                                if (contentType == null) {
                                                        contentType = "image/png";
                                                }
                                                String base64 = java.util.Base64.getEncoder().encodeToString(bytes);
                                                data.put("genogramaUri", "data:" + contentType + ";base64," + base64);
                                        }
                                }
                        } catch (Exception e) {
                                e.printStackTrace();
                        }
                }

                if (informe.getEcomapaUrl() != null && !informe.getEcomapaUrl().trim().isEmpty()) {
                        try {
                                java.nio.file.Path path = storageService.load(informe.getEcomapaUrl());
                                if (java.nio.file.Files.exists(path)) {
                                        if (informe.getEcomapaUrl().toLowerCase().endsWith(".pdf")) {
                                                data.put("ecomapaIsPdf", true);
                                        } else {
                                                byte[] bytes = java.nio.file.Files.readAllBytes(path);
                                                String contentType = java.nio.file.Files.probeContentType(path);
                                                if (contentType == null) {
                                                        contentType = "image/png";
                                                }
                                                String base64 = java.util.Base64.getEncoder().encodeToString(bytes);
                                                data.put("ecomapaUri", "data:" + contentType + ";base64," + base64);
                                        }
                                }
                        } catch (Exception e) {
                                e.printStackTrace();
                        }
                }

                return pdfService.generatePdfFromHtml(
                                "reportes/informesocial-detalle",
                                data);
        }

        @Transactional(readOnly = true)
        public byte[] exportarPdfPorInformeId(Integer id)
                        throws Exception {

                InformeSocialDTO informe = informeService.obtenerPorId(id);

                if (informe == null) {
                        throw new RuntimeException(
                                        "No existe informe social con ID: " + id);
                }

                Map<String, Object> data = new HashMap<>();
                data.put("i", informe);

                Paciente paciente = pacienteRepository.findById(informe.getPaciente().getId())
                                .orElseThrow(() -> new RuntimeException("Paciente no encontrado"));
                data.put("p", paciente);

                if (informe.getGenogramaUrl() != null && !informe.getGenogramaUrl().trim().isEmpty()) {
                        try {
                                java.nio.file.Path path = storageService.load(informe.getGenogramaUrl());
                                if (java.nio.file.Files.exists(path)) {
                                        if (informe.getGenogramaUrl().toLowerCase().endsWith(".pdf")) {
                                                data.put("genogramaIsPdf", true);
                                        } else {
                                                byte[] bytes = java.nio.file.Files.readAllBytes(path);
                                                String contentType = java.nio.file.Files.probeContentType(path);
                                                if (contentType == null) {
                                                        contentType = "image/png";
                                                }
                                                String base64 = java.util.Base64.getEncoder().encodeToString(bytes);
                                                data.put("genogramaUri", "data:" + contentType + ";base64," + base64);
                                        }
                                }
                        } catch (Exception e) {
                                e.printStackTrace();
                        }
                }

                if (informe.getEcomapaUrl() != null && !informe.getEcomapaUrl().trim().isEmpty()) {
                        try {
                                java.nio.file.Path path = storageService.load(informe.getEcomapaUrl());
                                if (java.nio.file.Files.exists(path)) {
                                        if (informe.getEcomapaUrl().toLowerCase().endsWith(".pdf")) {
                                                data.put("ecomapaIsPdf", true);
                                        } else {
                                                byte[] bytes = java.nio.file.Files.readAllBytes(path);
                                                String contentType = java.nio.file.Files.probeContentType(path);
                                                if (contentType == null) {
                                                        contentType = "image/png";
                                                }
                                                String base64 = java.util.Base64.getEncoder().encodeToString(bytes);
                                                data.put("ecomapaUri", "data:" + contentType + ";base64," + base64);
                                        }
                                }
                        } catch (Exception e) {
                                e.printStackTrace();
                        }
                }

                return pdfService.generatePdfFromHtml(
                                "reportes/informesocial-detalle",
                                data);
        }

        private String fmt(Object value) {
                if (value == null) {
                        return "N/A";
                }

                if (value instanceof java.util.Date) {
                        return dateFormat.format(
                                        (java.util.Date) value);
                }

                return value.toString();
        }
}