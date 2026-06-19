
package com.ucacue.udipsai.modules.fichasocial.Service;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.ucacue.udipsai.common.report.ExcelGenerator;
import com.ucacue.udipsai.common.report.PdfService;
import com.ucacue.udipsai.modules.fichasocial.dto.FichaSocioeconomicaDTO;
import com.ucacue.udipsai.modules.fichasocial.domain.components.*;

@Service
public class FichaSocioeconomicaReportService {

    @Autowired
    private FichaSocioeconomicaService fichaService;

    @Autowired
    private PdfService pdfService;

    private final SimpleDateFormat dateFormat = new SimpleDateFormat("dd/MM/yyyy");

    public ByteArrayInputStream exportarExcel(Integer pacienteId) throws IOException {
        List<FichaSocioeconomicaDTO> fichas;
        if (pacienteId != null) {
            FichaSocioeconomicaDTO ficha = fichaService.obtenerFichaActivaPorPacienteId(pacienteId);
            fichas = (ficha != null) ? List.of(ficha) : List.of();
        } else {
            fichas = fichaService.listarFichas();
        }

        String[] headers = {
                "ID", "Paciente", "Cédula", "Fecha Elaboración", "Especialista",
                "RIESGOS: Problemas Sociales", "RIESGOS: Vulnerabilidades", "RIESGOS: Migración",
                "VIVIENDA: Tipo", "VIVIENDA: Material", "VIVIENDA: Servicios",
                "SALUD: Lugar Atención", "SALUD: Ayudas Técnicas", "SALUD: Problemas Estudiante",
                "ECONOMÍA: Total Ingresos", "ECONOMÍA: Total Egresos", "ECONOMÍA: Condición",
                "DINÁMICA: Tipo Hogar", "DINÁMICA: Comunicación", "Responsable Registro"
        };

        return ExcelGenerator.generateExcel("Fichas Socioeconómicas", headers, fichas, (row, f) -> {
            int col = 0;
            // DATOS BÁSICOS
            row.createCell(col++).setCellValue(fmt(f.getId()));
            row.createCell(col++).setCellValue(f.getPaciente() != null ? f.getPaciente().getNombresApellidos() : "N/A");
            row.createCell(col++).setCellValue(f.getPaciente() != null ? f.getPaciente().getCedula() : "N/A");
            row.createCell(col++).setCellValue(fmt(f.getFechaElaboracion()));
            row.createCell(col++)
                    .setCellValue(f.getEspecialista() != null ? f.getEspecialista().getNombresApellidos() : "N/A");

            // RIESGOS SOCIALES
            RiesgosSociales rs = f.getRiesgosSociales();
            if (rs != null) {
                row.createCell(col++).setCellValue(fmt(rs.getProblemasSociales()));
                row.createCell(col++).setCellValue(fmt(rs.getVulnerabilidades()));
                row.createCell(col++)
                        .setCellValue(rs.getMigroExterior() != null && rs.getMigroExterior()
                                ? "MIGRANTE (" + rs.getLugarMigracion() + ")"
                                : "NO");
            } else {
                col += 3;
            }

            // VIVIENDA
            ViviendaHabitabilidad vh = f.getVivienda();
            if (vh != null) {
                row.createCell(col++).setCellValue(fmt(vh.getTipoTenencia()));
                row.createCell(col++).setCellValue(fmt(vh.getMaterialParedes()));
                row.createCell(col++).setCellValue(
                        "Agua: " + fmt(vh.getProcedenciaAgua()) + " / Luz: " + fmt(vh.getDetalleElectricidad()));
            } else {
                col += 3;
            }

            // SALUD
            SituacionSalud ss = f.getSalud();
            if (ss != null) {
                row.createCell(col++).setCellValue(fmt(ss.getLugarAtencionMedica()));
                row.createCell(col++).setCellValue(fmt(ss.getAyudasTecnicas()));
                row.createCell(col++).setCellValue(fmt(ss.getSaludEstudiante()));
            } else {
                col += 3;
            }

            // ECONOMÍA
            SituacionEconomica se = f.getSituacionEconomica();
            if (se != null) {
                row.createCell(col++).setCellValue(fmt(se.getTotalIngresos()));
                row.createCell(col++).setCellValue(fmt(se.getTotalEgresos()));
                row.createCell(col++).setCellValue(fmt(se.getCondicionEconomica()));
            } else {
                col += 3;
            }

            // DINÁMICA FAMILIAR
            DinamicaFamiliar df = f.getDinamicaFamiliar();
            if (df != null) {
                row.createCell(col++).setCellValue(fmt(df.getTipoHogar()));
                row.createCell(col++).setCellValue(fmt(df.getComunicacionFamiliar()));
            } else {
                col += 2;
            }

            row.createCell(col++).setCellValue(fmt(f.getResponsable()));
        });
    }

    public byte[] exportarPdf(Integer pacienteId) throws Exception {
        FichaSocioeconomicaDTO ficha = fichaService.obtenerFichaActivaPorPacienteId(pacienteId);

        if (ficha == null) {
            throw new RuntimeException(
                    "No existe ficha socioeconómica activa para el paciente");
        }

        Map<String, Object> data = new HashMap<>();
        data.put("f", ficha);

        return pdfService.generatePdfFromHtml(
                "reportes/fichasocial-detalle",
                data);
    }

    public byte[] exportarPdfPorFichaId(Integer id) throws Exception {
        FichaSocioeconomicaDTO ficha = fichaService.obtenerPorId(id);

        if (ficha == null) {
            throw new RuntimeException(
                    "No existe la ficha socioeconómica solicitada");
        }

        Map<String, Object> data = new HashMap<>();
        data.put("f", ficha);

        return pdfService.generatePdfFromHtml(
                "reportes/fichasocial-detalle",
                data);
    }

    private String fmt(Object value) {
        if (value == null)
            return "N/A";
        if (value instanceof Boolean)
            return (Boolean) value ? "SÍ" : "NO";
        if (value instanceof java.util.Date)
            return dateFormat.format((java.util.Date) value);
        return value.toString();
    }
}