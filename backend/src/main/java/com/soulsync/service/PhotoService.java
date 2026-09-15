package com.soulsync.service;

import com.soulsync.domain.ProfilePhoto;
import com.soulsync.domain.Enums.PhotoModerationStatus;
import com.soulsync.domain.Enums.PhotoVisibility;
import com.soulsync.exception.BadRequestException;
import com.soulsync.exception.ForbiddenException;
import com.soulsync.exception.NotFoundException;
import com.soulsync.repository.ProfilePhotoRepository;
import com.soulsync.security.CurrentUser;
import com.soulsync.storage.PhotoStorageService;
import com.soulsync.web.dto.ProfileDtos.PhotoDto;

import lombok.RequiredArgsConstructor;

import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PhotoService {

    private static final int MAX_PHOTOS = 6;

    private static final long MAX_FILE_SIZE =
            10 * 1024 * 1024L;

    private static final int MIN_WIDTH = 300;
    private static final int MIN_HEIGHT = 300;

    private static final int MAX_WIDTH = 6000;
    private static final int MAX_HEIGHT = 6000;

    private static final long MAX_PIXELS =
            25_000_000L;

    private final ProfilePhotoRepository photos;
    private final CurrentUser current;
    private final ConnectionService connections;
    private final PhotoStorageService storage;

    public record PhotoContent(
            Resource resource,
            String contentType
    ) {
    }


    /*
     * =========================================================
     * UPLOAD
     * =========================================================
     */

    @Transactional(
            rollbackFor = Exception.class
    )
    public PhotoDto upload(
            MultipartFile file,
            PhotoVisibility visibility
    ) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new BadRequestException(
                    "Choose an image"
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException(
                    "Photo must be under 10MB"
            );
        }

        List<ProfilePhoto> existing =
                photos.findByUserIdOrderBySortOrderAsc(
                        current.id()
                );

        if (existing.size() >= MAX_PHOTOS) {
            throw new BadRequestException(
                    "You can upload a maximum of 6 photos"
            );
        }

        String contentType =
                Optional.ofNullable(
                        file.getContentType()
                ).orElse("");

        String extension =
                switch (contentType) {

                    case "image/jpeg" ->
                            "jpg";

                    case "image/png" ->
                            "png";

                    case "image/webp" ->
                            "webp";

                    default ->
                            throw new BadRequestException(
                                    "Only JPEG, PNG and WebP images are allowed"
                            );
                };

        byte[] data =
                file.getBytes();

        if (!signatureMatches(
                data,
                extension
        )) {

            throw new BadRequestException(
                    "File contents do not match the declared image type"
            );
        }

        ImageDimensions dimensions =
                readDimensions(
                        data,
                        extension
                );

        validateDimensions(
                dimensions
        );

        UUID userId =
                current.id();

        String storageKey =
                storage.store(
                        data,
                        extension,
                        userId
                );

        String originalFilename =
                safeFilename(
                        file.getOriginalFilename()
                );

        UUID photoId =
                UUID.randomUUID();

        ProfilePhoto photo =
                ProfilePhoto.builder()
                        .id(photoId)
                        .user(current.entity())
                        .storageKey(storageKey)
                        .url(
                                "/api/v1/photos/"
                                        + photoId
                                        + "/content"
                        )
                        .sortOrder(
                                existing.size()
                        )
                        .primary(
                                existing.isEmpty()
                        )
                        .visibility(
                                visibility == null
                                        ? PhotoVisibility.PUBLIC
                                        : visibility
                        )
                        .originalFilename(
                                originalFilename
                        )
                        .contentType(
                                contentType
                        )
                        .fileSize(
                                file.getSize()
                        )
                        .moderationStatus(
                                PhotoModerationStatus.APPROVED
                        )
                        .build();

        try {

            photo =
                    photos.save(photo);

        } catch (RuntimeException ex) {

            try {

                storage.delete(
                        storageKey
                );

            } catch (IOException cleanupError) {

                ex.addSuppressed(
                        cleanupError
                );
            }

            throw ex;
        }

        return dto(photo);
    }


    /*
     * =========================================================
     * PHOTO CONTENT
     * =========================================================
     */

    @Transactional(
            readOnly = true
    )
    public PhotoContent content(
            UUID id
    ) {

        ProfilePhoto photo =
                photos.findById(id)
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "Photo not found"
                                        )
                        );

        UUID me =
                current.id();

        boolean owner =
                photo.getUser()
                        .getId()
                        .equals(me);

        boolean publicPhoto =
                photo.getVisibility()
                        == PhotoVisibility.PUBLIC;

        boolean connectionPhoto =
                photo.getVisibility()
                        == PhotoVisibility.CONNECTIONS
                        &&
                        connections.connected(
                                me,
                                photo.getUser().getId()
                        );

        boolean allowed =
                owner
                        || publicPhoto
                        || connectionPhoto;

        if (!allowed) {

            throw new ForbiddenException(
                    "Photo is private"
            );
        }

        String contentType =
                photo.getContentType();

        if (contentType == null
                || contentType.isBlank()) {

            contentType =
                    contentTypeFromStorageKey(
                            photo.getStorageKey()
                    );
        }

        Resource resource;

        try {

            resource =
                    storage.load(
                            photo.getStorageKey(),
                            contentType
                    );

        } catch (IOException e) {

            throw new NotFoundException(
                    "Photo file not found"
            );
        }

        return new PhotoContent(
                resource,
                contentType
        );
    }


    /*
     * =========================================================
     * DELETE PHOTO
     * =========================================================
     */

    @Transactional(
            rollbackFor = Exception.class
    )
    public void delete(
            UUID id
    ) throws IOException {

        UUID userId =
                current.id();

        ProfilePhoto photo =
                photos.findByIdAndUserId(
                                id,
                                userId
                        )
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "Photo not found"
                                        )
                        );

        boolean wasPrimary =
                photo.isPrimary();

        /*
         * Delete remote/local asset first.
         *
         * If storage deletion fails, the DB transaction
         * rolls back and the photo record remains intact.
         */
        storage.delete(
                photo.getStorageKey()
        );

        photos.delete(photo);

        photos.flush();

        List<ProfilePhoto> remaining =
                photos.findByUserIdOrderBySortOrderAsc(
                        userId
                );

        /*
         * Repair sort order.
         *
         * Example:
         * 0, 1, 3, 5
         *
         * becomes:
         * 0, 1, 2, 3
         */
        for (
                int i = 0;
                i < remaining.size();
                i++
        ) {

            remaining
                    .get(i)
                    .setSortOrder(i);
        }

        /*
         * If primary photo was deleted,
         * choose the first remaining photo.
         */
        if (wasPrimary
                && !remaining.isEmpty()) {

            remaining.forEach(
                    item ->
                            item.setPrimary(false)
            );

            remaining
                    .get(0)
                    .setPrimary(true);
        }

        photos.saveAll(
                remaining
        );
    }


    /*
     * =========================================================
     * SET PRIMARY
     * =========================================================
     */

    @Transactional
    public List<PhotoDto> setPrimary(
            UUID id
    ) {

        List<ProfilePhoto> mine =
                photos.findByUserIdOrderBySortOrderAsc(
                        current.id()
                );

        boolean exists =
                mine.stream()
                        .anyMatch(
                                photo ->
                                        photo.getId()
                                                .equals(id)
                        );

        if (!exists) {

            throw new NotFoundException(
                    "Photo not found"
            );
        }

        mine.forEach(
                photo ->
                        photo.setPrimary(
                                photo.getId()
                                        .equals(id)
                        )
        );

        photos.saveAll(
                mine
        );

        return mine.stream()
                .map(this::dto)
                .toList();
    }


    /*
     * =========================================================
     * VISIBILITY
     * =========================================================
     */

    @Transactional
    public PhotoDto visibility(
            UUID id,
            PhotoVisibility visibility
    ) {

        if (visibility == null) {

            throw new BadRequestException(
                    "Photo visibility is required"
            );
        }

        ProfilePhoto photo =
                photos.findByIdAndUserId(
                                id,
                                current.id()
                        )
                        .orElseThrow(
                                () ->
                                        new NotFoundException(
                                                "Photo not found"
                                        )
                        );

        photo.setVisibility(
                visibility
        );

        return dto(photo);
    }


    /*
     * =========================================================
     * REORDER PHOTOS
     * =========================================================
     */

    @Transactional
    public List<PhotoDto> reorder(
            List<UUID> orderedIds
    ) {

        if (orderedIds == null) {

            throw new BadRequestException(
                    "Photo order is required"
            );
        }

        List<ProfilePhoto> mine =
                photos.findByUserIdOrderBySortOrderAsc(
                        current.id()
                );

        if (orderedIds.size()
                != mine.size()) {

            throw new BadRequestException(
                    "Photo order must contain all photos"
            );
        }

        Set<UUID> supplied =
                new HashSet<>(
                        orderedIds
                );

        if (supplied.size()
                != orderedIds.size()) {

            throw new BadRequestException(
                    "Photo order contains duplicates"
            );
        }

        Set<UUID> actual =
                new HashSet<>();

        for (ProfilePhoto photo : mine) {

            actual.add(
                    photo.getId()
            );
        }

        if (!actual.equals(
                supplied
        )) {

            throw new BadRequestException(
                    "Photo order contains invalid photos"
            );
        }

        Map<UUID, ProfilePhoto> byId =
                new HashMap<>();

        for (ProfilePhoto photo : mine) {

            byId.put(
                    photo.getId(),
                    photo
            );
        }

        List<ProfilePhoto> reordered =
                new ArrayList<>();

        for (
                int i = 0;
                i < orderedIds.size();
                i++
        ) {

            ProfilePhoto photo =
                    byId.get(
                            orderedIds.get(i)
                    );

            photo.setSortOrder(i);

            reordered.add(
                    photo
            );
        }

        photos.saveAll(
                reordered
        );

        return reordered.stream()
                .map(this::dto)
                .toList();
    }


    /*
     * =========================================================
     * MY PHOTOS
     * =========================================================
     */

    @Transactional(
            readOnly = true
    )
    public List<PhotoDto> mine() {

        return photos
                .findByUserIdOrderBySortOrderAsc(
                        current.id()
                )
                .stream()
                .map(this::dto)
                .toList();
    }


    /*
     * =========================================================
     * DIMENSION VALIDATION
     * =========================================================
     */

    private void validateDimensions(
            ImageDimensions dimensions
    ) {

        if (dimensions.width()
                < MIN_WIDTH
                ||
                dimensions.height()
                        < MIN_HEIGHT) {

            throw new BadRequestException(
                    "Photo must be at least "
                            + MIN_WIDTH
                            + "x"
                            + MIN_HEIGHT
                            + " pixels"
            );
        }

        if (dimensions.width()
                > MAX_WIDTH
                ||
                dimensions.height()
                        > MAX_HEIGHT) {

            throw new BadRequestException(
                    "Photo dimensions are too large"
            );
        }

        long pixels =
                (long)
                        dimensions.width()
                        *
                        dimensions.height();

        if (pixels > MAX_PIXELS) {

            throw new BadRequestException(
                    "Photo contains too many pixels"
            );
        }
    }


    /*
     * =========================================================
     * READ IMAGE DIMENSIONS
     * =========================================================
     */

    private static ImageDimensions readDimensions(
            byte[] data,
            String extension
    ) {

        return switch (extension) {

            case "png" ->
                    pngDimensions(data);

            case "jpg" ->
                    jpegDimensions(data);

            case "webp" ->
                    webpDimensions(data);

            default ->
                    throw new BadRequestException(
                            "Unsupported image format"
                    );
        };
    }


    /*
     * =========================================================
     * PNG DIMENSIONS
     * =========================================================
     */

    private static ImageDimensions pngDimensions(
            byte[] data
    ) {

        if (data.length < 24) {

            throw new BadRequestException(
                    "Invalid PNG image"
            );
        }

        int width =
                readIntBigEndian(
                        data,
                        16
                );

        int height =
                readIntBigEndian(
                        data,
                        20
                );

        if (width <= 0
                || height <= 0) {

            throw new BadRequestException(
                    "Invalid PNG dimensions"
            );
        }

        return new ImageDimensions(
                width,
                height
        );
    }


    /*
     * =========================================================
     * JPEG DIMENSIONS
     * =========================================================
     */

    private static ImageDimensions jpegDimensions(
            byte[] data
    ) {

        int index = 2;

        while (
                index + 8
                        < data.length
        ) {

            if (
                    (data[index] & 0xff)
                            != 0xff
            ) {

                index++;

                continue;
            }

            int marker =
                    data[index + 1]
                            & 0xff;

            index += 2;

            if (
                    marker == 0xd8
                            ||
                            marker == 0xd9
            ) {

                continue;
            }

            if (marker == 0xda) {
                break;
            }

            if (
                    index + 1
                            >= data.length
            ) {

                break;
            }

            int length =
                    (
                            (data[index] & 0xff)
                                    << 8
                    )
                            |
                            (
                                    data[index + 1]
                                            & 0xff
                            );

            if (
                    length < 2
                            ||
                            index + length
                                    > data.length
            ) {

                break;
            }

            if (
                    isSofMarker(marker)
            ) {

                if (
                        index + 6
                                >= data.length
                ) {

                    break;
                }

                int height =
                        (
                                (data[index + 3] & 0xff)
                                        << 8
                        )
                                |
                                (
                                        data[index + 4]
                                                & 0xff
                                );

                int width =
                        (
                                (data[index + 5] & 0xff)
                                        << 8
                        )
                                |
                                (
                                        data[index + 6]
                                                & 0xff
                                );

                if (
                        width > 0
                                &&
                                height > 0
                ) {

                    return new ImageDimensions(
                            width,
                            height
                    );
                }
            }

            index += length;
        }

        throw new BadRequestException(
                "Unable to read JPEG dimensions"
        );
    }


    private static boolean isSofMarker(
            int marker
    ) {

        return marker == 0xc0
                || marker == 0xc1
                || marker == 0xc2
                || marker == 0xc3
                || marker == 0xc5
                || marker == 0xc6
                || marker == 0xc7
                || marker == 0xc9
                || marker == 0xca
                || marker == 0xcb
                || marker == 0xcd
                || marker == 0xce
                || marker == 0xcf;
    }


    /*
     * =========================================================
     * WEBP DIMENSIONS
     * =========================================================
     */

    private static ImageDimensions webpDimensions(
            byte[] data
    ) {

        if (data.length < 30) {

            throw new BadRequestException(
                    "Invalid WebP image"
            );
        }

        String chunk =
                new String(
                        data,
                        12,
                        4,
                        StandardCharsets.US_ASCII
                );

        /*
         * VP8X - extended WebP
         */
        if ("VP8X".equals(chunk)) {

            int width =
                    1
                            +
                            read24LittleEndian(
                                    data,
                                    24
                            );

            int height =
                    1
                            +
                            read24LittleEndian(
                                    data,
                                    27
                            );

            return new ImageDimensions(
                    width,
                    height
            );
        }

        /*
         * VP8L - lossless WebP
         */
        if ("VP8L".equals(chunk)) {

            if (
                    (data[20] & 0xff)
                            != 0x2f
            ) {

                throw new BadRequestException(
                        "Invalid WebP image"
                );
            }

            int width =
                    1
                            +
                            (
                                    (data[21] & 0xff)
                                            |
                                            (
                                                    (data[22] & 0x3f)
                                                            << 8
                                            )
                            );

            int height =
                    1
                            +
                            (
                                    (
                                            (data[22] & 0xc0)
                                                    >> 6
                                    )
                                            |
                                            (
                                                    (data[23] & 0xff)
                                                            << 2
                                            )
                                            |
                                            (
                                                    (data[24] & 0x0f)
                                                            << 10
                                            )
                            );

            return new ImageDimensions(
                    width,
                    height
            );
        }

        /*
         * VP8 - lossy WebP
         */
        if ("VP8 ".equals(chunk)) {

            if (
                    (data[23] & 0xff)
                            != 0x9d
                            ||
                            (data[24] & 0xff)
                                    != 0x01
                            ||
                            (data[25] & 0xff)
                                    != 0x2a
            ) {

                throw new BadRequestException(
                        "Invalid WebP image"
                );
            }

            int width =
                    (
                            (data[26] & 0xff)
                                    |
                                    (
                                            (data[27] & 0xff)
                                                    << 8
                                    )
                    )
                            & 0x3fff;

            int height =
                    (
                            (data[28] & 0xff)
                                    |
                                    (
                                            (data[29] & 0xff)
                                                    << 8
                                    )
                    )
                            & 0x3fff;

            return new ImageDimensions(
                    width,
                    height
            );
        }

        throw new BadRequestException(
                "Unsupported WebP image"
        );
    }


    /*
     * =========================================================
     * FILE SIGNATURE VALIDATION
     * =========================================================
     */

    private static boolean signatureMatches(
            byte[] data,
            String extension
    ) {

        if ("jpg".equals(extension)) {

            return data.length >= 3
                    &&
                    (data[0] & 0xff)
                            == 0xff
                    &&
                    (data[1] & 0xff)
                            == 0xd8
                    &&
                    (data[2] & 0xff)
                            == 0xff;
        }

        if ("png".equals(extension)) {

            return data.length >= 8
                    &&
                    (data[0] & 0xff)
                            == 0x89
                    &&
                    data[1] == 0x50
                    &&
                    data[2] == 0x4e
                    &&
                    data[3] == 0x47
                    &&
                    data[4] == 0x0d
                    &&
                    data[5] == 0x0a
                    &&
                    data[6] == 0x1a
                    &&
                    data[7] == 0x0a;
        }

        if ("webp".equals(extension)) {

            return data.length >= 12
                    &&
                    data[0] == 'R'
                    &&
                    data[1] == 'I'
                    &&
                    data[2] == 'F'
                    &&
                    data[3] == 'F'
                    &&
                    data[8] == 'W'
                    &&
                    data[9] == 'E'
                    &&
                    data[10] == 'B'
                    &&
                    data[11] == 'P';
        }

        return false;
    }


    /*
     * =========================================================
     * BINARY HELPERS
     * =========================================================
     */

    private static int readIntBigEndian(
            byte[] data,
            int offset
    ) {

        return (
                (data[offset] & 0xff)
                        << 24
        )
                |
                (
                        (data[offset + 1] & 0xff)
                                << 16
                )
                |
                (
                        (data[offset + 2] & 0xff)
                                << 8
                )
                |
                (
                        data[offset + 3]
                                & 0xff
                );
    }


    private static int read24LittleEndian(
            byte[] data,
            int offset
    ) {

        return (
                data[offset]
                        & 0xff
        )
                |
                (
                        (data[offset + 1] & 0xff)
                                << 8
                )
                |
                (
                        (data[offset + 2] & 0xff)
                                << 16
                );
    }


    /*
     * =========================================================
     * SAFE ORIGINAL FILE NAME
     * =========================================================
     */

    private static String safeFilename(
            String filename
    ) {

        if (
                filename == null
                        ||
                        filename.isBlank()
        ) {

            return null;
        }

        String clean;

        try {

            clean =
                    Paths.get(filename)
                            .getFileName()
                            .toString();

        } catch (Exception e) {

            clean =
                    filename;
        }

        /*
         * Remove control characters.
         */
        clean =
                clean.replaceAll(
                        "[\\p{Cntrl}]",
                        ""
                );

        /*
         * Prevent oversized metadata.
         */
        if (clean.length() > 255) {

            clean =
                    clean.substring(
                            0,
                            255
                    );
        }

        return clean;
    }


    /*
     * =========================================================
     * LEGACY CONTENT TYPE FALLBACK
     * =========================================================
     */

    private static String contentTypeFromStorageKey(
            String storageKey
    ) {

        if (
                storageKey == null
                        ||
                        storageKey.isBlank()
        ) {

            return "image/jpeg";
        }

        String lower =
                storageKey.toLowerCase(
                        Locale.ROOT
                );

        if (
                lower.endsWith(".png")
        ) {

            return "image/png";
        }

        if (
                lower.endsWith(".webp")
        ) {

            return "image/webp";
        }

        return "image/jpeg";
    }


    /*
     * =========================================================
     * DTO
     * =========================================================
     */

    private PhotoDto dto(
            ProfilePhoto photo
    ) {

        return new PhotoDto(
                photo.getId(),
                photo.getUrl(),
                photo.getSortOrder(),
                photo.isPrimary(),
                photo.getVisibility()
        );
    }


    /*
     * =========================================================
     * INTERNAL VALUE OBJECT
     * =========================================================
     */

    private record ImageDimensions(
            int width,
            int height
    ) {
    }
}