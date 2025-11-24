package com.weatherspace.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;
import com.weatherspace.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import java.security.Principal;

@RestController
@RequestMapping("/api/media")
@CrossOrigin(
        origins = {
                "https://weatherspace1.netlify.app",
                "http://localhost:4200"
        },
        allowedHeaders = {"Authorization", "Content-Type"},
        allowCredentials = "true",
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS}
)
public class MediaController {

    private final Path uploadDir = Paths.get("uploads");

    @Autowired
    private UserService userService;

    @GetMapping("/{filename:.+}")
    public ResponseEntity<Resource> getMedia(@PathVariable String filename) {
        try {
            Path filePath = uploadDir.resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = determineContentType(filename);
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping("/upload-profile-picture")
    public ResponseEntity<?> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            Principal principal) {

        if (principal == null) {
            return ResponseEntity.status(401).body("Unauthorized: Login Required");
        }

        try {
            String username = principal.getName();
            Long userId = userService.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found"))
                    .getId();

            String profilePictureUrl = userService.updateProfilePicture(userId, file);

            return ResponseEntity.ok().body(
                    java.util.Collections.singletonMap("url", profilePictureUrl)
            );

        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed: " + e.getMessage());
        }
    }


    private String determineContentType(String filename) {
        String extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
        switch (extension) {
            case "jpg":
            case "jpeg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "gif":
                return "image/gif";
            case "mp4":
                return "video/mp4";
            case "webm":
                return "video/webm";
            default:
                return "application/octet-stream";
        }
    }
}
