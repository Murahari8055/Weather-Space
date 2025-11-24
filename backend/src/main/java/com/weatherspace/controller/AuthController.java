package com.weatherspace.controller;

import com.weatherspace.model.User;
import com.weatherspace.service.UserService;
import com.weatherspace.config.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "https://weatherspace1.netlify.app")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        try {
            User registeredUser = userService.registerUser(user);
            String jwt = jwtUtils.generateTokenWithUserIdAndEmail(registeredUser.getUsername(), registeredUser.getId(), registeredUser.getEmail());
            Map<String, Object> response = new HashMap<>();
            response.put("message", "User registered successfully");
            response.put("token", jwt);
            response.put("user", Map.of(
                "id", registeredUser.getId(),
                "username", registeredUser.getUsername(),
                "email", registeredUser.getEmail()
            ));
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.get("username"),
                    loginRequest.get("password")
                )
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            User user = userService.findByUsername(authentication.getName()).orElseThrow();
            String jwt = jwtUtils.generateTokenWithUserIdAndEmail(authentication.getName(), user.getId(), user.getEmail());
            return ResponseEntity.ok(Map.of(
                "token", jwt,
                "user", Map.of(
                    "id", user.getId(),
                    "username", user.getUsername(),
                    "email", user.getEmail()
                )
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid credentials"));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String username = authentication.getName();
            User user = userService.findByUsername(username).orElseThrow();
            return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Unable to fetch profile"));
        }
    }
}
