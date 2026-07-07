package com.codefrolics.legacytrunk.controller;

import com.codefrolics.legacytrunk.service.GroqService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiController {

    private final GroqService groqService;

    @PostMapping("/suggest")
    public ResponseEntity<Map<String, String>> suggest(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        String suggestion = groqService.suggestNextWords(text);
        return ResponseEntity.ok(Map.of("suggestion", suggestion));
    }

    @PostMapping("/enhance")
    public ResponseEntity<Map<String, String>> enhance(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        String enhanced = groqService.enhanceDescription(text);
        return ResponseEntity.ok(Map.of("enhanced", enhanced));
    }
}
