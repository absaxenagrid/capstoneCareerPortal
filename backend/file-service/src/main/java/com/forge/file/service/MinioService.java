package com.forge.file.service;

import io.minio.*;
import io.minio.http.Method;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class MinioService {

    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    /**
     * Ensure the bucket exists when the service starts.
     * Logs a warning if MinIO is not reachable (e.g. during local dev without Docker).
     */
    @PostConstruct
    public void initBucket() {
        try {
            boolean exists = minioClient.bucketExists(
                    BucketExistsArgs.builder().bucket(bucketName).build());
            if (!exists) {
                minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucketName).build());
                log.info("Created MinIO bucket: {}", bucketName);
            } else {
                log.info("MinIO bucket '{}' already exists", bucketName);
            }
        } catch (Exception e) {
            log.warn("Could not initialise MinIO bucket (is MinIO running?): {}", e.getMessage());
        }
    }

    /**
     * Upload a resume file.
     * Object key format: candidate-resumes/{identifier}/{uuid}.{ext}
     * identifier is the candidateId or candidate email slug.
     *
     * @return the object key stored in MinIO (use this as resumeFilePath)
     */
    public String uploadResume(String identifier, MultipartFile file) {
        try {
            String ext       = getExtension(file.getOriginalFilename());
            String safeId    = identifier.replaceAll("[^a-zA-Z0-9._-]", "_"); // sanitise email @ and +
            String objectKey = "candidate-resumes/" + safeId + "/" + UUID.randomUUID() + "." + ext;

            String contentType = file.getContentType();
            if (contentType == null || contentType.isBlank()) {
                contentType = switch (ext) {
                    case "pdf"  -> "application/pdf";
                    case "doc"  -> "application/msword";
                    case "docx" -> "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                    default     -> "application/octet-stream";
                };
            }

            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(bucketName)
                    .object(objectKey)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(contentType)
                    .build()
            );

            log.info("Uploaded resume to MinIO: identifier={}, key={}, size={} bytes",
                    identifier, objectKey, file.getSize());
            return objectKey;

        } catch (Exception e) {
            log.error("MinIO upload failed for identifier={}: {}", identifier, e.getMessage(), e);
            throw new RuntimeException("Failed to upload resume to storage: " + e.getMessage(), e);
        }
    }

    public InputStream downloadFile(String objectKey) {
        try {
            return minioClient.getObject(
                    GetObjectArgs.builder().bucket(bucketName).object(objectKey).build());
        } catch (Exception e) {
            log.error("MinIO download failed for key={}: {}", objectKey, e.getMessage());
            throw new RuntimeException("Failed to download file: " + e.getMessage(), e);
        }
    }

    public String generatePresignedUrl(String objectKey) {
        try {
            return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(bucketName)
                    .object(objectKey)
                    .expiry(1, TimeUnit.HOURS)
                    .build()
            );
        } catch (Exception e) {
            log.error("Presigned URL failed for key={}: {}", objectKey, e.getMessage());
            throw new RuntimeException("Failed to generate download URL: " + e.getMessage(), e);
        }
    }

    public void deleteFile(String objectKey) {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder().bucket(bucketName).object(objectKey).build());
            log.info("Deleted from MinIO: {}", objectKey);
        } catch (Exception e) {
            log.error("MinIO delete failed for key={}: {}", objectKey, e.getMessage());
            throw new RuntimeException("Failed to delete file: " + e.getMessage(), e);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || filename.isEmpty()) return "pdf";
        int idx = filename.lastIndexOf('.');
        return idx > 0 ? filename.substring(idx + 1).toLowerCase() : "pdf";
    }
}
