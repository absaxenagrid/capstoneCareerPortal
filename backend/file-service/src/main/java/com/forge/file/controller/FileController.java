package com.forge.file.controller;

import com.forge.file.service.MinioService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class FileController {

    private final MinioService minioService;

    /**
     * POST /api/files/resume/upload/{identifier}
     * identifier can be a candidateId (Long) OR a candidate email string.
     * Accepts multipart/form-data with field name "file".
     */
    @PostMapping("/resume/upload/{identifier}")
    public ResponseEntity<Map<String, String>> uploadResume(
            @PathVariable String identifier,
            @RequestParam("file") MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "No file provided or file is empty"));
        }

        String originalName = file.getOriginalFilename();
        String ext = originalName != null && originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf('.') + 1).toLowerCase()
                : "pdf";

        if (!ext.matches("pdf|doc|docx")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Only PDF, DOC, DOCX files are accepted"));
        }

        String objectKey = minioService.uploadResume(identifier, file);

        return ResponseEntity.ok(Map.of(
                "objectKey",         objectKey,
                "originalFilename",  originalName != null ? originalName : "resume." + ext,
                "message",           "Resume uploaded successfully"
        ));
    }

    @GetMapping("/resume/download")
    public ResponseEntity<InputStreamResource> downloadResume(
            @RequestParam String objectKey,
            @RequestParam(defaultValue = "resume.pdf") String filename) {

        InputStream stream = minioService.downloadFile(objectKey);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .body(new InputStreamResource(stream));
    }

    @GetMapping("/resume/presigned-url")
    public ResponseEntity<Map<String, String>> getPresignedUrl(@RequestParam String objectKey) {
        String url = minioService.generatePresignedUrl(objectKey);
        return ResponseEntity.ok(Map.of("url", url));
    }

    @DeleteMapping("/resume")
    public ResponseEntity<Map<String, String>> deleteResume(@RequestParam String objectKey) {
        minioService.deleteFile(objectKey);
        return ResponseEntity.ok(Map.of("message", "File deleted successfully"));
    }
}
