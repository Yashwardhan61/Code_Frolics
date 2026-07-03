package com.codefrolics.legacytrunk.service;

import com.codefrolics.legacytrunk.model.PasswordResetToken;
import com.codefrolics.legacytrunk.repository.PasswordResetTokenRepository;
import com.codefrolics.legacytrunk.repository.UserRepository;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.UserRecord;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender javaMailSender;
    private final UserRepository userRepository;
    private final PasswordResetTokenRepository tokenRepository;

    @Value("${spring.mail.username:}")
    private String fromEmail;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

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
            String fullUrl = frontendUrl + actionUrl;
            
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

    @Transactional
    public void sendPasswordResetEmail(String email) {
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("No account found with this email address."));

        PasswordResetToken resetToken = PasswordResetToken.create(email);
        tokenRepository.save(resetToken);

        String resetLink = frontendUrl + "/reset-password?token=" + resetToken.getToken();
        String displayName = user.getDisplayName() != null ? user.getDisplayName() : "there";
        String htmlContent = buildResetEmailHtml(displayName, resetLink);

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(email);
            helper.setSubject("Reset Your Password — Legacy Trunk");
            helper.setText(htmlContent, true);
            javaMailSender.send(message);
            log.info("Password reset email sent to: {}", email);
        } catch (MessagingException e) {
            log.error("Failed to send password reset email to: {}", email, e);
            throw new RuntimeException("Failed to send password reset email. Please try again later.");
        }
    }

    @Transactional
    public String validateResetToken(String token) {
        PasswordResetToken resetToken = tokenRepository.findByTokenAndUsedFalse(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset link."));

        if (resetToken.isExpired()) {
            throw new RuntimeException("This reset link has expired. Please request a new one.");
        }

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);

        return resetToken.getEmail();
    }

    @Transactional(readOnly = true)
    public String checkResetToken(String token) {
        PasswordResetToken resetToken = tokenRepository.findByTokenAndUsedFalse(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset link."));

        if (resetToken.isExpired()) {
            throw new RuntimeException("This reset link has expired. Please request a new one.");
        }

        return resetToken.getEmail();
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = tokenRepository.findByTokenAndUsedFalse(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired reset link."));

        if (resetToken.isExpired()) {
            throw new RuntimeException("This reset link has expired. Please request a new one.");
        }

        String email = resetToken.getEmail();
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));

        if (FirebaseApp.getApps().isEmpty()) {
            log.warn("Firebase Admin SDK not initialized! Skipping actual Firebase password update for local dev/mock mode.");
        } else {
            try {
                UserRecord.UpdateRequest request = new UserRecord.UpdateRequest(user.getFirebaseUid())
                        .setPassword(newPassword);
                FirebaseAuth.getInstance().updateUser(request);
                log.info("Password updated successfully in Firebase for user: {}", email);
            } catch (FirebaseAuthException e) {
                log.error("Failed to update password in Firebase for user {}", email, e);
                throw new RuntimeException("Failed to update password in Firebase: " + e.getMessage());
            }
        }

        resetToken.setUsed(true);
        tokenRepository.save(resetToken);
    }

    private String buildResetEmailHtml(String name, String resetLink) {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin:0;padding:0;background-color:#f5f0eb;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
                <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f5f0eb;padding:40px 20px;">
                    <tr>
                        <td align="center">
                            <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
                                <!-- Header -->
                                <tr>
                                    <td style="background:linear-gradient(135deg,#92400e,#b45309,#d97706);padding:32px 40px;text-align:center;">
                                        <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:0.5px;">
                                            🪵 Legacy Trunk
                                        </h1>
                                        <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">
                                            Yaado ka Baksa
                                        </p>
                                    </td>
                                </tr>
                                <!-- Body -->
                                <tr>
                                    <td style="padding:36px 40px;">
                                        <h2 style="margin:0 0 16px;color:#1f2937;font-size:20px;font-weight:600;">
                                            Password Reset Request
                                        </h2>
                                        <p style="margin:0 0 20px;color:#4b5563;font-size:15px;line-height:1.6;">
                                            Hi %s,
                                        </p>
                                        <p style="margin:0 0 28px;color:#4b5563;font-size:15px;line-height:1.6;">
                                            We received a request to reset the password for your Legacy Trunk account.
                                            Click the button below to proceed with resetting your password.
                                        </p>
                                        <!-- Button -->
                                        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td align="center">
                                                    <a href="%s"
                                                       style="display:inline-block;background:linear-gradient(135deg,#b45309,#d97706);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:600;letter-spacing:0.3px;box-shadow:0 2px 8px rgba(180,83,9,0.3);">
                                                        Reset My Password
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>
                                        <p style="margin:28px 0 0;color:#9ca3af;font-size:13px;line-height:1.5;">
                                            This link will expire in <strong>30 minutes</strong>. If you didn't request
                                            a password reset, you can safely ignore this email.
                                        </p>
                                    </td>
                                </tr>
                                <!-- Footer -->
                                <tr>
                                    <td style="background-color:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;">
                                        <p style="margin:0;color:#9ca3af;font-size:12px;text-align:center;line-height:1.5;">
                                            &copy; Legacy Trunk — Preserving family stories, one memory at a time.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
            </html>
            """.formatted(name, resetLink);
    }
}
