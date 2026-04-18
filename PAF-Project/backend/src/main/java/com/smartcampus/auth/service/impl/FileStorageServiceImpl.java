package com.smartcampus.auth.service.impl;

import com.smartcampus.auth.service.FileStorageService;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png", "image/gif", "image/webp");
    private static final long MAX_SIZE = 5 * 1024 * 1024L; // 5 MB

    @Value("${app.upload.dir:uploads/ticket-images}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(uploadDir));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory: " + uploadDir, e);
        }
    }

    @Override
    public String storeTicketImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Only JPEG, PNG, GIF, and WebP images are allowed");
        }
        if (file.getSize() > MAX_SIZE) {
            throw new IllegalArgumentException("File size must not exceed 5 MB");
        }

        String originalFilename = file.getOriginalFilename();
        String extension = (originalFilename != null && originalFilename.contains("."))
                ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                : ".jpg";
        String storedFilename = UUID.randomUUID() + extension;

        Path targetPath = Paths.get(uploadDir).resolve(storedFilename);
        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
        }

        return "/uploads/ticket-images/" + storedFilename;
    }

    @Override
    public void deleteByUrl(String imageUrl) {
        if (imageUrl == null || imageUrl.isEmpty()) return;
        String filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        Path filePath = Paths.get(uploadDir).resolve(filename);
        try {
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            // log but don't throw
        }
    }
}
