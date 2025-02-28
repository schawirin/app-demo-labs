package com.example.demo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class SandboxController {

    private static final Logger logger = LoggerFactory.getLogger(SandboxController.class);

    @GetMapping("/trace")
    public String createTrace() {
        RestTemplate restTemplate = new RestTemplate();
        String url = "https://www.google.com";

        try {
            restTemplate.getForEntity(url, String.class);
            return "Trace created";
        } catch (Exception e) {
            return "Failed to create trace";
        }
    }

    @GetMapping("/logs")
    public String createLogs() {
        for (int i = 0; i <= 10; i++) {
            logger.info("Log count: {}", i);
        }
        return "Logs created";
    }
}
