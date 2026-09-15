package com.soulsync.storage;

import com.soulsync.exception.BadRequestException;
import com.soulsync.exception.NotFoundException;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
@ConditionalOnProperty(
        name = "soulsync.storage.provider",
        havingValue = "local",
        matchIfMissing = true
)
public class LocalPhotoStorageService
        implements PhotoStorageService {

    @Value("${soulsync.uploads-dir}")
    private String uploadsDir;

    @Override
    public String store(
            byte[] data,
            String extension,
            UUID userId
    ) throws IOException {

        Path directory =
                Path.of(uploadsDir)
                        .toAbsolutePath()
                        .normalize();

        Files.createDirectories(directory);

        String storageKey =
                UUID.randomUUID()
                        + "."
                        + extension;

        Path target =
                directory
                        .resolve(storageKey)
                        .normalize();

        if (!target.startsWith(directory)) {
            throw new BadRequestException(
                    "Invalid file path"
            );
        }

        Files.write(
                target,
                data,
                StandardOpenOption.CREATE_NEW
        );

        return storageKey;
    }

    @Override
    public Resource load(
            String storageKey,
            String contentType
    ) {

        Path directory =
                Path.of(uploadsDir)
                        .toAbsolutePath()
                        .normalize();

        Path file =
                directory
                        .resolve(storageKey)
                        .normalize();

        if (!file.startsWith(directory)) {
            throw new BadRequestException(
                    "Invalid file path"
            );
        }

        if (!Files.exists(file)) {
            throw new NotFoundException(
                    "Photo file not found"
            );
        }

        return new FileSystemResource(file);
    }

    @Override
    public void delete(
            String storageKey
    ) throws IOException {

        Path directory =
                Path.of(uploadsDir)
                        .toAbsolutePath()
                        .normalize();

        Path file =
                directory
                        .resolve(storageKey)
                        .normalize();

        if (!file.startsWith(directory)) {
            throw new BadRequestException(
                    "Invalid file path"
            );
        }

        Files.deleteIfExists(file);
    }
}