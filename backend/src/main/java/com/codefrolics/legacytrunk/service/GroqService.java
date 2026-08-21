package com.codefrolics.legacytrunk.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroqService {

    private final RestClient groqRestClient;

    @Value("${app.groq.model:groq/compound-mini}")
    private String modelName;

    public String suggestNextWords(String currentText) {
        if (currentText == null || currentText.trim().isEmpty()) {
            return "";
        }

        String prompt = "You are an AI co-pilot helping someone write a memoir. " +
                "Given the following incomplete text, suggest ONLY the next few words (max 10 words) to seamlessly continue the thought. " +
                "Do NOT include the original text. Do NOT add any quotes or introductory remarks. Just the continuation.\n\n" +
                "Text: " + currentText;

        return callGroqApi(prompt).trim();
    }

    public String enhanceDescription(String currentText) {
        if (currentText == null || currentText.trim().isEmpty()) {
            return "";
        }

        String prompt = "You are an expert editor helping polish a family memory. " +
                "Rewrite the following text to fix grammar, improve flow, and make it slightly more evocative and descriptive. " +
                "Keep the same general tone and meaning. Do NOT add any conversational filler (like 'Here is the enhanced version:'). " +
                "Just output the polished text.\n\n" +
                "Original Text: " + currentText;

        return callGroqApi(prompt).trim();
    }

    private String callGroqApi(String prompt) {
        try {
            Map<String, Object> requestBody = Map.of(
                "model", modelName != null && !modelName.isBlank() ? modelName : "groq/compound-mini",
                "messages", List.of(
                    Map.of("role", "user", "content", prompt)
                ),
                "temperature", 0.5,
                "max_tokens", 256
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> response = groqRestClient.post()
                    .uri("/chat/completions")
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);

            if (response != null && response.containsKey("choices")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                if (!choices.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                    String content = (String) message.get("content");
                    return content != null ? content : "";
                }
            }
            return "";
        } catch (Exception e) {
            log.error("Error calling Groq API: {}", e.getMessage());
            return "";
        }
    }
}
