package com.forge.marketpresence.controller;

import com.forge.marketpresence.dto.request.JobPostingRequest;
import com.forge.marketpresence.entity.JobPosting;
import com.forge.marketpresence.service.JobPostingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/job-postings")
@RequiredArgsConstructor
public class JobPostingController {

    private final JobPostingService service;

    @PostMapping
    public ResponseEntity<JobPosting> create(@RequestBody JobPostingRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(req));
    }

    @GetMapping
    public ResponseEntity<List<JobPosting>> listAll() {
        return ResponseEntity.ok(service.listAll());
    }

    @GetMapping("/published")
    public ResponseEntity<List<JobPosting>> listPublished() {
        return ResponseEntity.ok(service.listPublished());
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<JobPosting> getBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(service.getBySlug(slug));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<JobPosting> publish(@PathVariable Long id) {
        return ResponseEntity.ok(service.publish(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.softDelete(id);
        return ResponseEntity.noContent().build();
    }
}
