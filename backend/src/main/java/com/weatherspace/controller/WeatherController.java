package com.weatherspace.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.weatherspace.service.WeatherService;
import org.springframework.http.ResponseEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import java.util.HashMap;

@CrossOrigin(origins = "https://weatherspace1.netlify.app")
@RestController
@RequestMapping("/api/weather")
public class WeatherController {

    private static final Logger logger = LoggerFactory.getLogger(WeatherController.class);

    @Autowired
    private WeatherService weatherService;

    @GetMapping
    public ResponseEntity<String> getWeather(@RequestParam String city) {
        return ResponseEntity.ok(weatherService.getWeatherByCity(city));
    }

    @GetMapping("/latlng")
    public ResponseEntity<String> getWeatherByLatLng(@RequestParam double lat, @RequestParam double lng) {
        return ResponseEntity.ok(weatherService.getWeatherByLatLng(lat, lng));
    }

    @GetMapping("/welcome")
    public ResponseEntity<Map<String, String>> getWelcome(HttpServletRequest request) {
        logger.info("Request received: {} {}", request.getMethod(), request.getRequestURI());
        Map<String, String> response = new HashMap<>();
        response.put("message", "Welcome to Weather Space!");
        return ResponseEntity.ok(response);
    }

}
