package jp.forestaasama.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "media_files")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MediaFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String originalName;

    @Column(nullable = false)
    private String storedName;

    @Column(nullable = false)
    private String category;  // hero, gallery, plans, surroundings, videos

    @Column(nullable = false)
    private String fileType;  // image, video

    @Column(nullable = false)
    private String mimeType;

    private Long fileSize;

    @Column(nullable = false)
    private String storageUrl;  // local path or S3 URL

    private String thumbnailUrl;

    private boolean isHero = false;

    private int sortOrder = 0;

    @Column(nullable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
