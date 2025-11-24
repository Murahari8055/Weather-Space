package com.weatherspace.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

@Service
public class WeatherService {

    @Value("${openweather.api.key}")
    private String apiKey;

    private final String baseUrl = "https://api.openweathermap.org/data/2.5/weather?q=%s&units=metric&appid=%s";
    private final String latLngUrl = "https://api.openweathermap.org/data/2.5/weather?lat=%s&lon=%s&units=metric&appid=%s";

    public String getWeatherByCity(String city) {
        RestTemplate restTemplate = new RestTemplate();
        String url = String.format(baseUrl, city, apiKey);
        return restTemplate.getForObject(url, String.class);
    }

    public String getWeatherByLatLng(double lat, double lng) {
        RestTemplate restTemplate = new RestTemplate();
        String url = String.format(latLngUrl, lat, lng, apiKey);
        return restTemplate.getForObject(url, String.class);
    }
}
