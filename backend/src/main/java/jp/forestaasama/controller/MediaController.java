package jp.forestaasama.controller;

import jp.forestaasama.model.MediaFile;
import jp.forestaasama.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    /**
     * GET /api/media/images - Get all images
     */
    @GetMapping("/images")
    public ResponseEntity<List<MediaFile>> getImages(
            @RequestParam(required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return ResponseEntity.ok(mediaService.getImagesByCategory(category));
        }
        return ResponseEntity.ok(mediaService.getImages());
    }

    /**
     * GET /api/media/videos - Get all videos
     */
    @GetMapping("/videos")
    public ResponseEntity<List<MediaFile>> getVideos() {
        return ResponseEntity.ok(mediaService.getVideos());
    }

    /**
     * GET /api/media/hero - Get hero images
     */
    @GetMapping("/hero")
    public ResponseEntity<List<MediaFile>> getHeroImages() {
        return ResponseEntity.ok(mediaService.getHeroImages());
    }

    /**
     * POST /api/media/upload - Upload files
     */
    @PostMapping("/upload")
    public ResponseEntity<List<MediaFile>> upload(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("category") String category) throws IOException {

        List<MediaFile> uploaded = new ArrayList<>();
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                uploaded.add(mediaService.upload(file, category));
            }
        }
        return ResponseEntity.ok(uploaded);
    }

    /**
     * DELETE /api/media/{id} - Delete a file
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) throws IOException {
        mediaService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PUT /api/media/{id}/hero - Set as hero image
     */
    @PutMapping("/{id}/hero")
    public ResponseEntity<MediaFile> setHero(@PathVariable Long id) {
        return ResponseEntity.ok(mediaService.setHero(id));
    }
}
