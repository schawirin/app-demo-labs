package com.example.demo;

import io.opentelemetry.api.OpenTelemetry;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class SandboxController {

    private static final Logger logger = LoggerFactory.getLogger(SandboxController.class);
    private final Tracer tracer;

    @Autowired
    public SandboxController(OpenTelemetry openTelemetry) {
        this.tracer = openTelemetry.getTracer("SandboxController");
    }

    @GetMapping("/trace")
    public String createTrace() {
        Span span = tracer.spanBuilder("createTrace").startSpan();
        try {
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://www.google.com";
            restTemplate.getForEntity(url, String.class);
            return "Trace created";
        } catch (Exception e) {
            span.recordException(e);
            return "Failed to create trace";
        } finally {
            span.end();
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
