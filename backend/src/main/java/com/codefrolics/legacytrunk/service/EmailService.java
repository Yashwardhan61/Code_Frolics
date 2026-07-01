package com.codefrolics.legacytrunk.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender javaMailSender;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Async
    public void sendNotificationEmail(String toEmail, String subject, String messageContent, String actionUrl) {
        if (fromEmail == null || fromEmail.trim().isEmpty()) {
            log.warn("Email service is not configured. Skipping email notification to {}", toEmail);
            return;
        }

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("The Legacy Trunk: " + subject);

            String htmlContent = buildHtmlContent(subject, messageContent, actionUrl);
            helper.setText(htmlContent, true);

            javaMailSender.send(message);
            log.info("Successfully sent notification email to {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send notification email to {}", toEmail, e);
        }
    }

    private String buildHtmlContent(String subject, String messageContent, String actionUrl) {
        StringBuilder html = new StringBuilder();
        html.append("<html>")
            .append("<body style='font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px; color: #333;'>")
            .append("<div style='max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);'>")
            .append("<h2 style='color: #8b5a2b; border-bottom: 2px solid #f0e6d2; padding-bottom: 10px;'>").append(subject).append("</h2>")
            .append("<p style='font-size: 16px; line-height: 1.6; margin-top: 20px;'>").append(messageContent).append("</p>");

        if (actionUrl != null && !actionUrl.trim().isEmpty()) {
            // Assume the frontend is running on localhost:5173 for dev, or a real domain in prod.
            // Ideally this would come from a config property.
            String baseUrl = "http://localhost:5173"; 
            String fullUrl = baseUrl + actionUrl;
            
            html.append("<div style='margin-top: 30px; text-align: center;'>")
                .append("<a href='").append(fullUrl).append("' style='background-color: #d2691e; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;'>")
                .append("View in App")
                .append("</a>")
                .append("</div>");
        }

        html.append("<p style='font-size: 12px; color: #999; margin-top: 40px; text-align: center;'>")
            .append("This is an automated message from The Legacy Trunk. Please do not reply.")
            .append("</p>")
            .append("</div>")
            .append("</body>")
            .append("</html>");

        return html.toString();
    }
}
