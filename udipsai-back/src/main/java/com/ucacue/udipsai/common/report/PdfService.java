package com.ucacue.udipsai.common.report;

import com.openhtmltopdf.pdfboxout.PdfRendererBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.file.Paths;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class PdfService {

    @Autowired
    private TemplateEngine templateEngine;

    public byte[] generatePdfFromHtml(String templateName, Map<String, Object> data) throws Exception {
        Context context = new Context();

        Map<String, Object> variables = new HashMap<>(data);

        variables.put("logoUcacueBase64", loadImageAsBase64("static/logo-ucacue.png"));
        variables.put("footerUcacueBase64", loadImageAsBase64("static/footer-ucacue.png"));

        context.setVariables(variables);

        String htmlContent = templateEngine.process(templateName, context);

        try (ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            PdfRendererBuilder builder = new PdfRendererBuilder();
            String baseUri = Paths.get(".").toUri().toString();

            builder.withHtmlContent(htmlContent, baseUri);
            builder.toStream(outputStream);
            builder.run();

            return outputStream.toByteArray();
        }
    }

    private String loadImageAsBase64(String classpathLocation) {
        try {
            ClassPathResource resource = new ClassPathResource(classpathLocation);

            if (!resource.exists()) {
                System.out.println("No existe recurso: " + classpathLocation);
                return "";
            }

            try (InputStream inputStream = resource.getInputStream()) {
                byte[] bytes = inputStream.readAllBytes();
                String mimeType = detectMimeType(classpathLocation);
                return "data:" + mimeType + ";base64," + Base64.getEncoder().encodeToString(bytes);
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "";
        }
    }

    private String detectMimeType(String path) {
        String lower = path.toLowerCase();
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
        if (lower.endsWith(".svg")) return "image/svg+xml";
        return "application/octet-stream";
    }
}