
package com.weatherspace.service;

import com.weatherspace.model.User;
import com.weatherspace.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.core.sync.RequestBody;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.s3.enabled:true}")
    private boolean s3Enabled;

    public User registerUser(User user) {
        if (userRepository.existsByUsername(user.getUsername()) || userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Username or email already exists");
        }
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public String updateProfilePicture(Long userId, MultipartFile file) throws IOException {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found"));
        String keyPrefix = "profile-pictures/";
        String key = keyPrefix + System.currentTimeMillis() + "_" + file.getOriginalFilename();

        if (s3Enabled) {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .contentType(file.getContentType())
                    .acl("public-read")
                    .build();
            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));
        } else {
            // For local dev fallback
            Path uploadPath = Paths.get("uploads", key);
            Files.createDirectories(uploadPath.getParent());
            Files.write(uploadPath, file.getBytes());
        }
        String profilePictureUrl = s3Enabled ? "https://" + bucketName + ".s3.amazonaws.com/" + key : "http://localhost:8080/api/media/" + key;
        user.setProfilePictureUrl(profilePictureUrl);
        userRepository.save(user);
        return profilePictureUrl;
    }
}
