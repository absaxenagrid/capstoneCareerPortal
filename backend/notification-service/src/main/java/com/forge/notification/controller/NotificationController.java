package com.forge.notification.controller;

import com.forge.notification.dto.EmailRequest;
import com.forge.notification.dto.NotificationRequest;
import com.forge.notification.dto.NotificationResponse;
import com.forge.notification.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * GET /api/notifications?email=...&page=0&size=20
     * List notifications for a candidate.
     */
    @GetMapping
    public ResponseEntity<Page<NotificationResponse>> getNotifications(
            @RequestParam String email,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(notificationService.getByEmail(
                email, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    /**
     * GET /api/notifications/unread-count?email=...
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(@RequestParam String email) {
        return ResponseEntity.ok(Map.of("count", notificationService.countUnread(email)));
    }

    /**
     * POST /api/notifications
     * Create a standalone in-app notification.
     */
    @PostMapping
    public ResponseEntity<NotificationResponse> create(
            @Valid @RequestBody NotificationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(notificationService.create(request));
    }

    /**
     * POST /api/notifications/send-confirmation
     * Send application confirmation email AND create in-app notification.
     */
    @PostMapping("/send-confirmation")
    public ResponseEntity<NotificationResponse> sendConfirmation(
            @Valid @RequestBody EmailRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(notificationService.sendApplicationConfirmation(request));
    }

    /**
     * PATCH /api/notifications/{id}/read
     */
    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markRead(id));
    }

    /**
     * PATCH /api/notifications/read-all?email=...
     */
    @PatchMapping("/read-all")
    public ResponseEntity<Map<String, Integer>> markAllRead(@RequestParam String email) {
        int updated = notificationService.markAllRead(email);
        return ResponseEntity.ok(Map.of("updated", updated));
    }
}
