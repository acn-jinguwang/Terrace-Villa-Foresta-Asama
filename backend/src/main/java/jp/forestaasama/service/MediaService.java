package jp.forestaasama.service;

import jp.forestaasama.model.MediaFile;
import jp.forestaasama.repository.MediaFileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MediaService {

    private final MediaFileRepository repository;
    private final StorageService storageService;

    public List<MediaFile> getImages() {
        return repository.findByFileTypeOrderBySortOrderAscUploadedAtDesc("image");
    }

    public List<MediaFile> getImagesByCategory(String category) {
        return repository.findByCategoryAndFileTypeOrderBySortOrderAsc(category, "image");
    }

    public List<MediaFile> getVideos() {
        return repository.findByFileTypeOrderBySortOrderAscUploadedAtDesc("video");
    }

    public List<MediaFile> getHeroImages() {
        return repository.findByIsHeroTrueOrderBySortOrderAsc();
    }

    public MediaFile upload(MultipartFile file, String category) throws IOException {
        String storageUrl = storageService.upload(file, category);
        String fileType = file.getContentType() != null && file.getContentType().startsWith("video")
                ? "video" : "image";

        MediaFile mediaFile = new MediaFile();
        mediaFile.setOriginalName(file.getOriginalFilename());
        mediaFile.setStoredName(UUID.randomUUID().toString());
        mediaFile.setCategory(category);
        mediaFile.setFileType(fileType);
        mediaFile.setMimeType(file.getContentType());
        mediaFile.setFileSize(file.getSize());
        mediaFile.setStorageUrl(storageUrl);
        mediaFile.setUploadedAt(LocalDateTime.now());

        return repository.save(mediaFile);
    }

    public void delete(Long id) throws IOException {
        MediaFile file = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found: " + id));
        storageService.delete(file.getStorageUrl());
        repository.deleteById(id);
    }

    public MediaFile setHero(Long id) {
        // Reset all hero images in same category
        repository.findByIsHeroTrueOrderBySortOrderAsc().forEach(f -> {
            if (f.getCategory().equals("hero")) {
                f.setHero(false);
                repository.save(f);
            }
        });

        MediaFile file = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("File not found: " + id));
        file.setHero(true);
        return repository.save(file);
    }
}
