package com.soulsync.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@ConditionalOnProperty(
        name = "soulsync.storage.provider",
        havingValue = "cloudinary"
)
public class CloudinaryPhotoStorageService
        implements PhotoStorageService {

    private final Cloudinary cloudinary;

    @Override
    public String store(
            byte[] data,
            String extension,
            UUID userId
    ) throws IOException {

        String publicId =
                "soulsync/profile-photos/"
                + userId
                + "/"
                + UUID.randomUUID();

        try {

            Map<?, ?> result =
                    cloudinary
                            .uploader()
                            .upload(
                                    data,
                                    ObjectUtils.asMap(
                                            "public_id",
                                            publicId,

                                            "resource_type",
                                            "image",

                                            "type",
                                            "authenticated",

                                            "overwrite",
                                            false
                                    )
                            );

            Object returnedPublicId =
                    result.get("public_id");

            if (returnedPublicId == null) {
                throw new IOException(
                        "Cloudinary did not return a public ID"
                );
            }

            return returnedPublicId.toString();

        } catch (IOException e) {

            throw e;

        } catch (Exception e) {

            throw new IOException(
                    "Unable to upload photo to Cloudinary",
                    e
            );
        }
    }

    @Override
    public Resource load(
            String storageKey,
            String contentType
    ) throws IOException {

        String format =
                formatFromContentType(
                        contentType
                );

        long expiresAt =
                Instant.now()
                        .plusSeconds(60)
                        .getEpochSecond();

        try {

            String signedUrl =
                    cloudinary.privateDownload(
                            storageKey,
                            format,
                            ObjectUtils.asMap(
                                    "resource_type",
                                    "image",

                                    "type",
                                    "authenticated",

                                    "expires_at",
                                    expiresAt
                            )
                    );

            return new UrlResource(
                    signedUrl
            );

        } catch (MalformedURLException e) {

            throw new IOException(
                    "Invalid Cloudinary download URL",
                    e
            );

        } catch (Exception e) {

            throw new IOException(
                    "Unable to load photo from Cloudinary",
                    e
            );
        }
    }

    @Override
    public void delete(
            String storageKey
    ) throws IOException {

        try {

            cloudinary
                    .uploader()
                    .destroy(
                            storageKey,
                            ObjectUtils.asMap(
                                    "resource_type",
                                    "image",

                                    "type",
                                    "authenticated",

                                    "invalidate",
                                    true
                            )
                    );

        } catch (Exception e) {

            throw new IOException(
                    "Unable to delete photo from Cloudinary",
                    e
            );
        }
    }

    private static String formatFromContentType(
            String contentType
    ) {

        if (contentType == null) {
            return "jpg";
        }

        return switch (
                contentType.toLowerCase(
                        Locale.ROOT
                )
        ) {

            case "image/png" ->
                    "png";

            case "image/webp" ->
                    "webp";

            default ->
                    "jpg";
        };
    }
}