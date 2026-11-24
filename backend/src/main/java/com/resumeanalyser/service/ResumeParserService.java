package com.resumeanalyser.service;

import com.resumeanalyser.exception.BadRequestException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class ResumeParserService {

    private static final Logger logger = LoggerFactory.getLogger(ResumeParserService.class);

    public String extractText(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }

        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) {
            originalFilename = "uploaded_file";
        }
        String extension = getFileExtension(originalFilename).toLowerCase();

        try {
            switch (extension) {
                case "pdf":
                    return extractTextFromPdf(file.getBytes());
                case "docx":
                    return extractTextFromDocx(file.getBytes());
                case "txt":
                    return new String(file.getBytes(), StandardCharsets.UTF_8);
                default:
                    // Attempt plain text read as fallback
                    return new String(file.getBytes(), StandardCharsets.UTF_8);
            }
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            logger.error("Failed to parse resume file: {}", originalFilename, e);
            throw new BadRequestException("Could not extract text from file: " + e.getMessage());
        }
    }

    public String extractTextFromPdf(byte[] pdfBytes) {
        try (PDDocument document = Loader.loadPDF(pdfBytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            stripper.setSortByPosition(true);
            String text = stripper.getText(document);
            if (text == null || text.trim().isEmpty()) {
                throw new BadRequestException("PDF document does not contain readable text (it may be a scanned image).");
            }
            return text.trim();
        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Failed to read PDF content: " + e.getMessage());
        }
    }

    public String extractTextFromDocx(byte[] docxBytes) {
        // DOCX is a zip file containing word/document.xml.
        // We read and strip XML tags from word/document.xml safely without heavy dependencies.
        try (InputStream bais = new ByteArrayInputStream(docxBytes);
             ZipInputStream zis = new ZipInputStream(bais)) {

            ZipEntry entry;
            while ((entry = zis.getNextEntry()) != null) {
                if ("word/document.xml".equals(entry.getName())) {
                    byte[] buffer = zis.readAllBytes();
                    String xml = new String(buffer, StandardCharsets.UTF_8);
                    // Replace XML tags and clean up whitespace
                    String text = xml.replaceAll("<w:p.*?>", "\n")
                                     .replaceAll("<[^>]+>", " ")
                                     .replaceAll("&amp;", "&")
                                     .replaceAll("&lt;", "<")
                                     .replaceAll("&gt;", ">")
                                     .replaceAll("&quot;", "\"")
                                     .replaceAll("&apos;", "'")
                                     .replaceAll("\\s+", " ")
                                     .trim();
                    return text;
                }
            }
            throw new BadRequestException("Could not locate word/document.xml inside docx archive.");
        } catch (Exception e) {
            throw new BadRequestException("Failed to read DOCX file: " + e.getMessage());
        }
    }

    public String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        if (dotIndex > 0 && dotIndex < filename.length() - 1) {
            return filename.substring(dotIndex + 1);
        }
        return "";
    }
}
