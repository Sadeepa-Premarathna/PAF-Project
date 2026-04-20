package com.smartcampus.auth.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    /** Saves file and returns the public URL path (e.g. /uploads/ticket-images/uuid.jpg) */
    String storeTicketImage(MultipartFile file);

    /** Deletes a file by its URL path */
    void deleteByUrl(String imageUrl);
}
