package jp.forestaasama.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Serves local media files during development.
 * In production, files are served from S3 directly.
 */
@Configuration
public class LocalMediaConfig implements WebMvcConfigurer {

    @Value("${media.local-path:./data/local-media}")
    private String localMediaPath;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absolutePath = Paths.get(localMediaPath).toAbsolutePath().toString();
        registry.addResourceHandler("/media/**")
                .addResourceLocations("file:" + absolutePath + "/");
    }
}
