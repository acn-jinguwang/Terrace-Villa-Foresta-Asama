package jp.forestaasama.repository;

import jp.forestaasama.model.MediaFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaFileRepository extends JpaRepository<MediaFile, Long> {
    List<MediaFile> findByCategoryOrderBySortOrderAscUploadedAtDesc(String category);
    List<MediaFile> findByFileTypeOrderBySortOrderAscUploadedAtDesc(String fileType);
    List<MediaFile> findByCategoryAndFileTypeOrderBySortOrderAsc(String category, String fileType);
    List<MediaFile> findByIsHeroTrueOrderBySortOrderAsc();
}
