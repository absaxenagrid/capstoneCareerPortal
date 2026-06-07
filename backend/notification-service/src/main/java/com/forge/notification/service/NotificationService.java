package com.forge.notification.service;

import com.forge.notification.dto.EmailRequest;
import com.forge.notification.dto.NotificationRequest;
import com.forge.notification.dto.NotificationResponse;
import com.forge.notification.entity.Notification;
import com.forge.notification.repository.NotificationRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender         mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    // ── Create in-app notification ────────────────────────────────────────────

    public NotificationResponse create(NotificationRequest request) {
        Notification saved = notificationRepository.save(
            Notification.builder()
                .candidateEmail(request.getCandidateEmail())
                .title(request.getTitle())
                .message(request.getMessage())
                .type(request.getType() != null ? request.getType() : "APPLICATION")
                .referenceId(request.getReferenceId())
                .isRead(false)
                .build()
        );
        log.info("Notification created: id={}, email={}", saved.getNotificationId(), saved.getCandidateEmail());
        return toResponse(saved);
    }

    // ── Send confirmation email + create in-app notification ─────────────────

    public NotificationResponse sendApplicationConfirmation(EmailRequest req) {
        // 1. Send HTML email
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail, "Forge Careers – Talent Acquisition");
            helper.setTo(req.getToEmail());
            helper.setReplyTo(fromEmail);
            helper.setSubject("Application Received: " + req.getJobTitle() + " | Forge Careers");
            helper.setText(buildHtmlEmailBody(req), true);   // true = HTML

            mailSender.send(mimeMessage);
            log.info("Confirmation email sent from={} to={}", fromEmail, req.getToEmail());
        } catch (Exception e) {
            log.error("Email delivery failed for {}: {}", req.getToEmail(), e.getMessage(), e);
        }

        // 2. Always create in-app notification (even if email failed)
        String message = "Your application for " + req.getJobTitle()
                + " has been successfully submitted"
                + (req.getApplicationId() != null ? " (Ref: #" + req.getApplicationId() + ")" : "")
                + ". A confirmation email has been sent to " + req.getToEmail() + ".";

        return create(NotificationRequest.builder()
                .candidateEmail(req.getToEmail())
                .title("Application Submitted – " + req.getJobTitle())
                .message(message)
                .type("APPLICATION")
                .referenceId(req.getApplicationId())
                .build());
    }

    // ── List notifications ────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<NotificationResponse> getByEmail(String email, Pageable pageable) {
        return notificationRepository
                .findByCandidateEmailOrderByCreatedAtDesc(email, pageable)
                .map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public long countUnread(String email) {
        return notificationRepository.countByCandidateEmailAndIsReadFalse(email);
    }

    // ── Mark read ─────────────────────────────────────────────────────────────

    public NotificationResponse markRead(Long id) {
        Notification n = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + id));
        n.setIsRead(true);
        return toResponse(notificationRepository.save(n));
    }

    public int markAllRead(String email) {
        return notificationRepository.markAllReadByEmail(email);
    }

    // ── Professional HTML Email Body ──────────────────────────────────────────

    private String buildHtmlEmailBody(EmailRequest req) {
        String candidateName = req.getCandidateName() != null ? req.getCandidateName() : "Candidate";
        String appId = req.getApplicationId() != null ? "#" + req.getApplicationId() : "N/A";
        String submittedAt = req.getSubmittedAt() != null ? req.getSubmittedAt() : "Just now";

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
              <title>Application Confirmation</title>
            </head>
            <body style="margin:0;padding:0;background-color:#f4f6f9;font-family:'Segoe UI',Arial,sans-serif;">
              <table role="presentation" width="100%%" cellspacing="0" cellpadding="0" style="background:#f4f6f9;padding:40px 0;">
                <tr>
                  <td align="center">
                    <table role="presentation" width="600" cellspacing="0" cellpadding="0"
                           style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

                      <!-- Header -->
                      <tr>
                        <td style="background:linear-gradient(135deg,#1a1a2e 0%%,#16213e 50%%,#0f3460 100%%);padding:36px 40px;text-align:center;">
                          <h1 style="margin:0;color:#e94560;font-size:28px;font-weight:700;letter-spacing:1px;">
                            &#9650; FORGE CAREERS
                          </h1>
                          <p style="margin:6px 0 0;color:#a0aec0;font-size:13px;letter-spacing:2px;text-transform:uppercase;">
                            Talent Acquisition Platform
                          </p>
                        </td>
                      </tr>

                      <!-- Status Banner -->
                      <tr>
                        <td style="background:#e94560;padding:14px 40px;text-align:center;">
                          <p style="margin:0;color:#ffffff;font-size:15px;font-weight:600;letter-spacing:0.5px;">
                            &#10003;&nbsp; Application Successfully Received
                          </p>
                        </td>
                      </tr>

                      <!-- Body -->
                      <tr>
                        <td style="padding:40px 40px 20px;">
                          <p style="margin:0 0 20px;color:#2d3748;font-size:16px;line-height:1.6;">
                            Dear <strong>%s</strong>,
                          </p>
                          <p style="margin:0 0 20px;color:#4a5568;font-size:15px;line-height:1.7;">
                            Thank you for your interest in joining <strong>Grid Dynamics</strong>.
                            We are pleased to confirm that your application has been successfully
                            received and is currently under review by our Talent Acquisition team.
                          </p>
                        </td>
                      </tr>

                      <!-- Application Details Card -->
                      <tr>
                        <td style="padding:0 40px 30px;">
                          <table role="presentation" width="100%%" cellspacing="0" cellpadding="0"
                                 style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:6px;overflow:hidden;">
                            <tr>
                              <td style="background:#1a1a2e;padding:12px 20px;">
                                <p style="margin:0;color:#e94560;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">
                                  Application Details
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:20px;">
                                <table role="presentation" width="100%%" cellspacing="0" cellpadding="8">
                                  <tr>
                                    <td style="color:#718096;font-size:13px;width:140px;vertical-align:top;">Position</td>
                                    <td style="color:#2d3748;font-size:14px;font-weight:600;">%s</td>
                                  </tr>
                                  <tr style="background:#f0f4f8;">
                                    <td style="color:#718096;font-size:13px;vertical-align:top;padding:8px;">Reference ID</td>
                                    <td style="color:#2d3748;font-size:14px;font-weight:600;padding:8px;">%s</td>
                                  </tr>
                                  <tr>
                                    <td style="color:#718096;font-size:13px;vertical-align:top;">Submitted At</td>
                                    <td style="color:#2d3748;font-size:14px;">%s</td>
                                  </tr>
                                  <tr style="background:#f0f4f8;">
                                    <td style="color:#718096;font-size:13px;vertical-align:top;padding:8px;">Status</td>
                                    <td style="padding:8px;">
                                      <span style="background:#c6f6d5;color:#276749;font-size:12px;font-weight:700;
                                                   padding:3px 10px;border-radius:12px;text-transform:uppercase;">
                                        Under Review
                                      </span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- What happens next -->
                      <tr>
                        <td style="padding:0 40px 30px;">
                          <p style="margin:0 0 12px;color:#2d3748;font-size:14px;font-weight:600;">What happens next?</p>
                          <table role="presentation" cellspacing="0" cellpadding="0" width="100%%">
                            <tr>
                              <td style="padding:6px 0;color:#4a5568;font-size:14px;line-height:1.6;">
                                &#8226;&nbsp; Our recruiters will review your profile within <strong>3–5 business days</strong>.
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:6px 0;color:#4a5568;font-size:14px;line-height:1.6;">
                                &#8226;&nbsp; Shortlisted candidates will be contacted for an initial screening call.
                              </td>
                            </tr>
                            <tr>
                              <td style="padding:6px 0;color:#4a5568;font-size:14px;line-height:1.6;">
                                &#8226;&nbsp; You may track your application status anytime on the
                                <a href="http://localhost:3000/past-applications" style="color:#e94560;text-decoration:none;font-weight:600;">
                                  Forge Careers Portal</a>.
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- CTA Button -->
                      <tr>
                        <td style="padding:0 40px 40px;text-align:center;">
                          <a href="http://localhost:3000/past-applications"
                             style="display:inline-block;background:#e94560;color:#ffffff;font-size:14px;
                                    font-weight:700;padding:14px 32px;border-radius:6px;text-decoration:none;
                                    letter-spacing:0.5px;">
                            View My Application &rarr;
                          </a>
                        </td>
                      </tr>

                      <!-- Divider -->
                      <tr>
                        <td style="padding:0 40px;">
                          <hr style="border:none;border-top:1px solid #e2e8f0;margin:0;" />
                        </td>
                      </tr>

                      <!-- Footer -->
                      <tr>
                        <td style="padding:24px 40px;text-align:center;">
                          <p style="margin:0 0 8px;color:#718096;font-size:13px;line-height:1.6;">
                            This email was sent by <strong>Grid Dynamics Talent Acquisition</strong><br/>
                            1875 S Grant St, Suite 110, San Mateo, CA 94402, USA
                          </p>
                          <p style="margin:0;color:#a0aec0;font-size:11px;">
                            Please do not reply directly to this email &mdash; for enquiries, contact
                            <a href="mailto:absaxena@griddynamics.com" style="color:#e94560;text-decoration:none;">
                              absaxena@griddynamics.com
                            </a>
                          </p>
                        </td>
                      </tr>

                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """.formatted(candidateName, req.getJobTitle(), appId, submittedAt);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .notificationId(n.getNotificationId())
                .candidateEmail(n.getCandidateEmail())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType())
                .referenceId(n.getReferenceId())
                .isRead(n.getIsRead())
                .createdAt(n.getCreatedAt())
                .updatedAt(n.getUpdatedAt())
                .build();
    }
}
