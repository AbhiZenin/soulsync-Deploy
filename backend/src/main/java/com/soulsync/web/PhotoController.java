package com.soulsync.web;

import com.soulsync.domain.Enums.PhotoVisibility;
import com.soulsync.service.PhotoService;
import com.soulsync.web.dto.ProfileDtos.PhotoDto;

import lombok.RequiredArgsConstructor;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoService service;

    public record ReorderRequest(
            List<UUID> photoIds
    ) {}

    @GetMapping
    List<PhotoDto> mine() {
        return service.mine();
    }

    @GetMapping("/{id}/content")
    ResponseEntity<org.springframework.core.io.Resource> content(
            @PathVariable UUID id
    ) {

        var content =
                service.content(id);

        return ResponseEntity.ok()
                .cacheControl(
                        CacheControl.noStore()
                )
                .contentType(
                        MediaType.parseMediaType(
                                content.contentType()
                        )
                )
                .body(content.resource());
    }

    @PostMapping(
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE
    )
    ResponseEntity<PhotoDto> upload(
            @RequestPart("file")
            MultipartFile file,

            @RequestParam(
                    defaultValue = "PUBLIC"
            )
            PhotoVisibility visibility
    ) throws IOException {

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(
                        service.upload(
                                file,
                                visibility
                        )
                );
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(
            @PathVariable UUID id
    ) throws IOException {

        service.delete(id);

        return ResponseEntity
                .noContent()
                .build();
    }

    @PatchMapping("/{id}/primary")
    List<PhotoDto> primary(
            @PathVariable UUID id
    ) {

        return service.setPrimary(id);
    }

    @PatchMapping("/{id}/visibility")
    PhotoDto visibility(
            @PathVariable UUID id,

            @RequestParam
            PhotoVisibility visibility
    ) {

        return service.visibility(
                id,
                visibility
        );
    }

    @PatchMapping("/reorder")
    List<PhotoDto> reorder(
            @RequestBody
            ReorderRequest request
    ) {

        return service.reorder(
                request.photoIds()
        );
    }
}