package com.ucacue.udipsai.modules.informes.service;

import com.ucacue.udipsai.modules.informes.domain.InformePsicopedagogico;
import com.ucacue.udipsai.modules.informes.repository.InformeRepository;
import com.ucacue.udipsai.modules.paciente.domain.Paciente;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.util.Units;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTBorder;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTPageBorders;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.STBorder;
import org.apache.poi.xwpf.model.XWPFHeaderFooterPolicy;
import org.apache.poi.xwpf.usermodel.Document;
import org.apache.poi.xwpf.usermodel.ParagraphAlignment;
import org.apache.poi.xwpf.usermodel.TableRowAlign;
import org.apache.poi.xwpf.usermodel.UnderlinePatterns;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFFooter;
import org.apache.poi.xwpf.usermodel.XWPFHeader;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.apache.poi.xwpf.usermodel.XWPFTable;
import org.apache.poi.xwpf.usermodel.XWPFTableCell;
import org.apache.poi.xwpf.usermodel.XWPFTableRow;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTPageMar;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTSectPr;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigInteger;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
@Slf4j
public class InformeWordService {

    private static final String COORDINADORA_DEFAULT = "Lcda. Gabriela Jara S., Mgtr.";

    @Autowired
    private InformeRepository repository;

    @Autowired
    private ResourceLoader resourceLoader;

    @Transactional(readOnly = true)
    public byte[] generarWord(Integer id) throws Exception {
        log.info("Generando Word informe ID={}", id);

        InformePsicopedagogico informe = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Informe no encontrado: " + id));

        Paciente paciente = informe.getPaciente();

        try (XWPFDocument document = new XWPFDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            configurarPagina(document);
            configurarEncabezadoYPie(document);

            agregarDatosIdentificacion(document, informe, paciente);
            agregarSeccion(document, "2. MOTIVO DE CONSULTA:", informe.getMotivoConsulta());
            agregarSeccion(document, "3. HISTORIA ESCOLAR:", informe.getHistoriaEscolar());
            agregarSeccion(document, "4. PSICOBIOGRAFÍA:", informe.getPsicobiografia());
            agregarSeccion(document, "5. OBSERVACIÓN EN LA CONSULTA:", informe.getObservacionConsulta());

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

                if (!reactivosSeccion.isEmpty()) {
                agregarTituloSeccion(document, "6. REACTIVOS APLICADOS Y RESULTADOS:");

                for (Map<String, String> seccion : reactivosSeccion) {
                    agregarSubtitulo(document, seccion.get("titulo"));
                    agregarTexto(document, seccion.get("contenido"));
                }
                }

            agregarSeccion(document, "7. CONCLUSIONES:", informe.getConclusiones());
            agregarSeccion(document, "8. RECOMENDACIONES PARA LA INSTITUCIÓN EDUCATIVA:", informe.getRecomendacionesInstitucion());
            agregarSeccion(document, "9. RECOMENDACIONES PARA REPRESENTANTE O FAMILIARES:", informe.getRecomendacionesRepresentante());
            agregarProfesionales(document, informe);

            document.write(out);
            return out.toByteArray();
        }
    }

private void configurarPagina(XWPFDocument document) {
    CTSectPr sectPr = document.getDocument().getBody().isSetSectPr()
            ? document.getDocument().getBody().getSectPr()
            : document.getDocument().getBody().addNewSectPr();

    if (!sectPr.isSetPgSz()) {
        sectPr.addNewPgSz();
    }

    // Tamaño A4
    sectPr.getPgSz().setW(BigInteger.valueOf(11906));
    sectPr.getPgSz().setH(BigInteger.valueOf(16838));

    CTPageMar pageMar = sectPr.isSetPgMar()
            ? sectPr.getPgMar()
            : sectPr.addNewPgMar();

    // Márgenes del contenido
    pageMar.setTop(BigInteger.valueOf(900));
    pageMar.setBottom(BigInteger.valueOf(900));
    pageMar.setLeft(BigInteger.valueOf(900));
    pageMar.setRight(BigInteger.valueOf(900));

    // Separación del encabezado y pie
    pageMar.setHeader(BigInteger.valueOf(450));
    pageMar.setFooter(BigInteger.valueOf(450));

    // Borde visible alrededor de toda la hoja
    agregarBordePagina(sectPr);
}
private void agregarBordePagina(CTSectPr sectPr) {
    CTPageBorders borders = sectPr.isSetPgBorders()
            ? sectPr.getPgBorders()
            : sectPr.addNewPgBorders();

    // Arriba y abajo más separados
    configurarBorde(borders.addNewTop(), 32);
    configurarBorde(borders.addNewBottom(), 32);

    // Derecha e izquierda se quedan como estaban
    configurarBorde(borders.addNewLeft(), 18);
    configurarBorde(borders.addNewRight(), 18);
}

private void configurarBorde(CTBorder border, int espacio) {
    border.setVal(STBorder.SINGLE);
    border.setSz(BigInteger.valueOf(8));
    border.setSpace(BigInteger.valueOf(espacio));
    border.setColor("000000");
}

    private void configurarEncabezadoYPie(XWPFDocument document) throws Exception {
        CTSectPr sectPr = document.getDocument().getBody().isSetSectPr()
                ? document.getDocument().getBody().getSectPr()
                : document.getDocument().getBody().addNewSectPr();

        XWPFHeaderFooterPolicy policy = new XWPFHeaderFooterPolicy(document, sectPr);

        XWPFHeader header = policy.createHeader(XWPFHeaderFooterPolicy.DEFAULT);
        XWPFTable table = header.createTable(1, 3);
        table.setWidth("100%");
        table.setTableAlignment(TableRowAlign.CENTER);

        XWPFTableRow row = table.getRow(0);
        row.setHeight(900);

        XWPFTableCell logoCell = row.getCell(0);
        limpiarCelda(logoCell);
        XWPFParagraph logoParagraph = logoCell.addParagraph();
        logoParagraph.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun logoRun = logoParagraph.createRun();

        try {
            Resource logo = resourceLoader.getResource("classpath:static/logo-ucacue.png");
            try (InputStream input = logo.getInputStream()) {
                logoRun.addPicture(
                        input,
                        Document.PICTURE_TYPE_PNG,
                        "logo-ucacue.png",
                        Units.toEMU(118),
                        Units.toEMU(45)
                );
            }
        } catch (Exception ex) {
            log.warn("No se pudo insertar logo en Word: {}", ex.getMessage());
            logoRun.setText("Universidad Católica de Cuenca");
            logoRun.setFontSize(9);
        }

        XWPFTableCell titleCell = row.getCell(1);
        limpiarCelda(titleCell);
        XWPFParagraph titleParagraph = titleCell.addParagraph();
        titleParagraph.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun titleRun = titleParagraph.createRun();
        titleRun.setText("INFORME PSICOPEDAGÓGICO");
        titleRun.setBold(true);
        titleRun.setFontFamily("Arial");
        titleRun.setFontSize(11);

        XWPFTableCell metaCell = row.getCell(2);
        limpiarCelda(metaCell);
        XWPFParagraph metaParagraph = metaCell.addParagraph();
        metaParagraph.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun metaRun = metaParagraph.createRun();
        metaRun.setBold(true);
        metaRun.setFontFamily("Arial");
        metaRun.setFontSize(7);
        metaRun.setText("CÓDIGO: F - VS - 65");
        metaRun.addBreak();
        metaRun.setText("VERSION: 01");
        metaRun.addBreak();
        metaRun.setText("FECHA: 2022-12-12");

        XWPFFooter footer = policy.createFooter(XWPFHeaderFooterPolicy.DEFAULT);
        XWPFParagraph footerParagraph = footer.createParagraph();
        footerParagraph.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun footerRun = footerParagraph.createRun();

        try {
            Resource footerImg = resourceLoader.getResource("classpath:static/footer-ucacue.png");
            try (InputStream input = footerImg.getInputStream()) {
                footerRun.addPicture(
                        input,
                        Document.PICTURE_TYPE_PNG,
                        "footer-ucacue.png",
                        Units.toEMU(430),
                        Units.toEMU(34)
                );
            }
        } catch (Exception ex) {
            log.warn("No se pudo insertar pie en Word: {}", ex.getMessage());
            footerRun.setText("www.ucacue.edu.ec");
            footerRun.setBold(true);
            footerRun.setFontSize(8);
        }
    }

    private void agregarDatosIdentificacion(XWPFDocument document, InformePsicopedagogico informe, Paciente paciente) {
        agregarTituloSeccion(document, "1. DATOS DE IDENTIFICACIÓN:");

        XWPFTable table = document.createTable(1, 2);
        table.setWidth("100%");
        table.setInsideHBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");
        table.setInsideVBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");
        table.setBottomBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");
        table.setTopBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");
        table.setLeftBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");
        table.setRightBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");

        String institucion = "";
        try {
            institucion = paciente != null && paciente.getInstitucionEducativa() != null
                    ? safe(paciente.getInstitucionEducativa().getNombre())
                    : "";
        } catch (Exception ex) {
            log.warn("No se pudo cargar institución en Word: {}", ex.getMessage());
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd 'de' MMMM 'de' yyyy", new Locale("es", "EC"));

        agregarFila(table, "NOMBRES Y APELLIDOS:", paciente != null ? safe(paciente.getNombresApellidos()) : "", true);
        agregarFila(table, "FECHA DE NACIMIENTO:", paciente != null && paciente.getFechaNacimiento() != null ? paciente.getFechaNacimiento().format(fmt) : "", false);
        agregarFila(table, "EDAD:", paciente != null && paciente.getFechaNacimiento() != null ? paciente.getEdad() + " años" : "", false);
        agregarFila(table, "REPRESENTANTE:", safe(informe.getRepresentante()), false);
        agregarFila(table, "PARENTESCO:", safe(informe.getParentesco()), false);
        agregarFila(table, "TELÉFONO DE CONTACTO:", paciente != null ? safe(paciente.getNumeroCelular() != null ? paciente.getNumeroCelular() : paciente.getNumeroTelefono()) : "", false);
        agregarFila(table, "INSTITUCIÓN EDUCATIVA:", institucion, false);
        agregarFila(table, "NIVEL EDUCATIVO:", paciente != null ? safe(paciente.getNivelEducativo()) : "", false);
        agregarFila(table, "AÑO QUE CURSA:", paciente != null ? safe(paciente.getAnioEducacion()) : "", false);
        agregarFila(table, "FECHA DE EVALUACIÓN:", formatearFechaFlexible(informe.getFechasEvaluacion(), fmt), false);
        agregarFila(table, "FECHA DE ELABORACIÓN DE INFORME:", informe.getFechaElaboracionInforme() != null ? informe.getFechaElaboracionInforme().format(fmt) : "", false);
        agregarFila(table, "FECHA DE LECTURA DEL INFORME:", informe.getFechaLecturaInforme() != null ? informe.getFechaLecturaInforme().format(fmt) : "", false);
        agregarFila(table, "Nº DE FICHA:", safe(informe.getNumeroFicha()), false);
    }

    private void agregarFila(XWPFTable table, String etiqueta, String valor, boolean primeraFila) {
        XWPFTableRow row = primeraFila ? table.getRow(0) : table.createRow();

        XWPFTableCell labelCell = row.getCell(0);
        XWPFTableCell valueCell = row.getCell(1);

        limpiarCelda(labelCell);
        limpiarCelda(valueCell);

        XWPFParagraph labelParagraph = labelCell.addParagraph();
        XWPFRun labelRun = labelParagraph.createRun();
        labelRun.setText(etiqueta);
        labelRun.setBold(true);
        labelRun.setFontFamily("Times New Roman");
        labelRun.setFontSize(10);

        XWPFParagraph valueParagraph = valueCell.addParagraph();
        XWPFRun valueRun = valueParagraph.createRun();
        valueRun.setText(safe(valor));
        valueRun.setFontFamily("Times New Roman");
        valueRun.setFontSize(10);
    }

    private void agregarSeccion(XWPFDocument document, String titulo, String contenido) {
        agregarTituloSeccion(document, titulo);
        agregarTexto(document, contenido);
    }

    private void agregarSeccionOpcional(XWPFDocument document, String titulo, String contenido) {
        if (safe(contenido).isBlank()) {
            return;
        }

        agregarSeccion(document, titulo, contenido);
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

    private void agregarTituloSeccion(XWPFDocument document, String titulo) {
        XWPFParagraph paragraph = document.createParagraph();
        paragraph.setSpacingBefore(130);
        paragraph.setSpacingAfter(45);
        paragraph.setKeepNext(true);

        XWPFRun run = paragraph.createRun();
        run.setText(titulo);
        run.setBold(true);
        run.setUnderline(UnderlinePatterns.SINGLE);
        run.setFontFamily("Times New Roman");
        run.setFontSize(10);
    }

    private void agregarSubtitulo(XWPFDocument document, String subtitulo) {
        XWPFParagraph paragraph = document.createParagraph();
        paragraph.setIndentationLeft(360);
        paragraph.setSpacingBefore(90);
        paragraph.setSpacingAfter(30);
        paragraph.setKeepNext(true);

        XWPFRun run = paragraph.createRun();
        run.setText(safe(subtitulo));
        run.setBold(true);
        run.setFontFamily("Times New Roman");
        run.setFontSize(10);
    }

    private void agregarTexto(XWPFDocument document, String contenido) {
        String texto = safe(contenido).trim();

        if (texto.isBlank()) {
            XWPFParagraph empty = document.createParagraph();
            empty.setIndentationLeft(360);
            empty.setSpacingAfter(40);
            return;
        }

        String[] lineas = texto.split("\\R");

        for (String linea : lineas) {
            XWPFParagraph paragraph = document.createParagraph();
            paragraph.setAlignment(ParagraphAlignment.BOTH);
            paragraph.setIndentationLeft(360);
            paragraph.setSpacingAfter(30);

            XWPFRun run = paragraph.createRun();
            run.setText(linea);
            run.setFontFamily("Times New Roman");
            run.setFontSize(10);
        }
    }

    private void agregarProfesionales(XWPFDocument document, InformePsicopedagogico informe) {
        agregarTituloSeccion(document, "10. PROFESIONALES RESPONSABLES:");

        XWPFTable table = document.createTable(1, 2);
        table.setWidth("100%");
        table.setInsideHBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");
        table.setInsideVBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");
        table.setBottomBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");
        table.setTopBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");
        table.setLeftBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");
        table.setRightBorder(XWPFTable.XWPFBorderType.NONE, 0, 0, "FFFFFF");

        agregarFila(table, "ÁREA:", safe(informe.getAreaPsicologiaEducativa()).isBlank() ? "Psicología Educativa" : informe.getAreaPsicologiaEducativa(), true);
        agregarFila(table, "EVALUADO POR:", safe(informe.getEvaluadorPsicologiaEducativa()), false);
        agregarFila(table, "PROFESIONAL RESPONSABLE:", safe(informe.getProfesionalPsicologiaEducativa()), false);
        agregarFila(table, "ÁREA:", safe(informe.getAreaPsicologiaClinica()).isBlank() ? "Psicología Clínica" : informe.getAreaPsicologiaClinica(), false);
        agregarFila(table, "EVALUADO POR:", safe(informe.getEvaluadorPsicologiaClinica()), false);
        agregarFila(table, "PROFESIONAL RESPONSABLE:", safe(informe.getProfesionalPsicologiaClinica()), false);

        XWPFParagraph espacio = document.createParagraph();
        espacio.setSpacingBefore(480);

        XWPFParagraph coordinadora = document.createParagraph();
        coordinadora.setAlignment(ParagraphAlignment.CENTER);

        XWPFRun nombre = coordinadora.createRun();
        nombre.setText(safe(informe.getCoordinadora()).isBlank() ? COORDINADORA_DEFAULT : informe.getCoordinadora());
        nombre.setFontFamily("Times New Roman");
        nombre.setFontSize(10);

        XWPFParagraph cargo = document.createParagraph();
        cargo.setAlignment(ParagraphAlignment.CENTER);

        XWPFRun cargoRun = cargo.createRun();
        cargoRun.setText("COORDINADORA DE LA UDIPSAI");
        cargoRun.setBold(true);
        cargoRun.setFontFamily("Times New Roman");
        cargoRun.setFontSize(10);

        agregarLineaFirma(document, "Fecha de entrega: ……………………………………………………………………………………");
        agregarLineaFirma(document, "Nombre y Firma del representante: ………………………………………………………………");
        agregarLineaFirma(document, "CI:………………………………");
    }

    private void agregarLineaFirma(XWPFDocument document, String texto) {
        XWPFParagraph paragraph = document.createParagraph();
        paragraph.setSpacingBefore(160);
        XWPFRun run = paragraph.createRun();
        run.setText(texto);
        run.setFontFamily("Times New Roman");
        run.setFontSize(10);
    }

    private void limpiarCelda(XWPFTableCell cell) {
        while (cell.getParagraphs().size() > 0) {
            cell.removeParagraph(0);
        }
        cell.setVerticalAlignment(XWPFTableCell.XWPFVertAlign.CENTER);
    }

    private String safe(String value) {
        return value == null ? "" : value;
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
