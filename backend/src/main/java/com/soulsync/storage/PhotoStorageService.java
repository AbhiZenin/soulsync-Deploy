package com.soulsync.storage;

import org.springframework.core.io.Resource;

import java.io.IOException;
import java.util.UUID;

public interface PhotoStorageService {

    String store(
            byte[] data,
            String extension,
            UUID userId
    ) throws IOException;

    Resource load(
            String storageKey,
            String contentType
    ) throws IOException;

    void delete(
            String storageKey
    ) throws IOException;
}