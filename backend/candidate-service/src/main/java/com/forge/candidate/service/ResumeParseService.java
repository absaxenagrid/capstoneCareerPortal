package com.forge.candidate.service;

import lombok.extern.slf4j.Slf4j;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.parser.AutoDetectParser;
import org.apache.tika.parser.ParseContext;
import org.apache.tika.sax.BodyContentHandler;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.*;
import java.util.regex.*;

/**
 * Parses a resume file (PDF/DOCX/DOC) using Apache Tika for text extraction,
 * then uses regex heuristics to extract structured candidate data.
 */
@Service
@Slf4j
public class ResumeParseService {

    public Map<String, Object> parse(MultipartFile file) {
        String text = extractText(file);
        log.debug("Extracted {} chars from resume: {}", text.length(), file.getOriginalFilename());
        return extractFields(text);
    }

    // ── Text extraction via Tika ─────────────────────────────────────────────

    private String extractText(MultipartFile file) {
        try (InputStream is = file.getInputStream()) {
            BodyContentHandler handler = new BodyContentHandler(1_000_000); // up to ~1M chars
            Metadata metadata = new Metadata();
            metadata.set(Metadata.CONTENT_TYPE, file.getContentType());
            new AutoDetectParser().parse(is, handler, metadata, new ParseContext());
            return handler.toString();
        } catch (Exception e) {
            log.warn("Tika text extraction failed for {}: {}", file.getOriginalFilename(), e.getMessage());
            return "";
        }
    }

    // ── Field extraction from plain text ────────────────────────────────────

    private Map<String, Object> extractFields(String text) {
        Map<String, Object> result = new LinkedHashMap<>();
        String[] lines = text.split("[\\r\\n]+");

        result.put("fullName",    extractName(text, lines));
        result.put("email",       extractEmail(text));
        result.put("phone",       extractPhone(text));
        result.put("location",    extractLocation(text, lines));
        result.put("linkedin",    extractUrl(text, "linkedin.com"));
        result.put("github",      extractUrl(text, "github.com"));
        result.put("portfolio",   extractUrl(text, "(?!linkedin|github)[a-z0-9-]+\\.(?:com|io|dev|me)"));

        List<Map<String, Object>> education  = extractEducation(text, lines);
        List<Map<String, Object>> experience = extractExperience(text, lines);

        result.put("education",            education);
        result.put("experience",           experience);
        result.put("totalExperience",      estimateTotalExperience(text, experience));
        result.put("totalExperienceYears", estimateTotalExperience(text, experience));

        return result;
    }

    // ── Name ─────────────────────────────────────────────────────────────────
    // Heuristic: first non-empty line that is 2-4 words, all title-cased, no digits

    private String extractName(String text, String[] lines) {
        for (String line : lines) {
            String t = line.trim();
            if (t.isEmpty() || t.length() > 60) continue;
            // Skip lines that look like headers or contact info
            if (t.matches("(?i).*(resume|curriculum|vitae|objective|summary|profile|email|phone|address|linkedin|github).*")) continue;
            if (t.matches(".*[0-9@|/\\\\<>].*")) continue;
            String[] words = t.split("\\s+");
            if (words.length >= 2 && words.length <= 5) {
                boolean allTitleCase = Arrays.stream(words)
                        .allMatch(w -> w.length() > 0 && Character.isUpperCase(w.charAt(0)));
                if (allTitleCase) return t;
            }
        }
        return null;
    }

    // ── Email ─────────────────────────────────────────────────────────────────

    private String extractEmail(String text) {
        Matcher m = Pattern.compile("[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}").matcher(text);
        return m.find() ? m.group().toLowerCase() : null;
    }

    // ── Phone ─────────────────────────────────────────────────────────────────

    private String extractPhone(String text) {
        // Matches: +91 98765 43210, (555) 123-4567, 9876543210, etc.
        Matcher m = Pattern.compile(
            "(?:\\+?\\d{1,3}[\\s\\-.])?(?:\\(?\\d{3}\\)?[\\s\\-.]?)\\d{3}[\\s\\-.]?\\d{4,}"
        ).matcher(text);
        return m.find() ? m.group().trim() : null;
    }

    // ── Location ─────────────────────────────────────────────────────────────

    private String extractLocation(String text, String[] lines) {
        // Look for "City, State" or "City, Country" patterns
        Matcher m = Pattern.compile(
            "(?i)(?:location|address|city)[:\\s]+([A-Za-z\\s]+,\\s*[A-Za-z\\s]+)"
        ).matcher(text);
        if (m.find()) return m.group(1).trim();

        // Fallback: look for "Bangalore", "Mumbai", "Delhi", "Chennai", "Hyderabad" etc.
        m = Pattern.compile(
            "\\b(Bangalore|Bengaluru|Mumbai|Delhi|Chennai|Hyderabad|Pune|Kolkata|Noida|Gurugram|Gurgaon|" +
            "New York|San Francisco|London|Singapore|Toronto|Sydney)(?:[,\\s]+[A-Za-z\\s]{2,25})?\\b"
        ).matcher(text);
        if (m.find()) return m.group().trim();

        return null;
    }

    // ── URL extraction ────────────────────────────────────────────────────────

    private String extractUrl(String text, String domainPattern) {
        Matcher m = Pattern.compile(
            "https?://(?:www\\.)?" + domainPattern + "[^\\s\"'<>]*"
        ).matcher(text);
        if (m.find()) return m.group().trim();

        // Without protocol
        m = Pattern.compile("(?:www\\.)?" + domainPattern + "/[^\\s\"'<>]*").matcher(text);
        return m.find() ? "https://" + m.group().trim() : null;
    }

    // ── Education ────────────────────────────────────────────────────────────

    private List<Map<String, Object>> extractEducation(String text, String[] lines) {
        List<Map<String, Object>> result = new ArrayList<>();

        // Find education section boundaries
        int eduStart = findSectionStart(lines, "(?i)(education|academic|qualification)");
        int eduEnd   = findSectionEnd(lines, eduStart, "(?i)(experience|work|project|skill|certification|achievement)");

        if (eduStart < 0) return result;

        String eduSection = String.join("\n", Arrays.copyOfRange(lines,
                Math.min(eduStart + 1, lines.length),
                Math.min(eduEnd > 0 ? eduEnd : lines.length, lines.length)));

        // Match degree patterns
        Pattern degreeP = Pattern.compile(
            "(?i)(b\\.?tech|b\\.?e\\.?|b\\.?sc|m\\.?tech|m\\.?e\\.?|m\\.?sc|mba|phd|ph\\.?d|bachelor|master|diploma|b\\.?com|m\\.?com)[^\\n]*",
            Pattern.CASE_INSENSITIVE
        );
        Matcher m = degreeP.matcher(eduSection);

        while (m.find() && result.size() < 5) {
            String degreeLine = m.group().trim();
            Map<String, Object> edu = new LinkedHashMap<>();
            edu.put("degree", degreeLine.length() > 80 ? degreeLine.substring(0, 80) : degreeLine);

            // Try to find university on same or next line
            int matchEnd = m.end();
            String remaining = eduSection.substring(matchEnd).trim();
            String[] nextLines = remaining.split("\n", 3);
            for (String nl : nextLines) {
                String nt = nl.trim();
                if (nt.length() > 5 && nt.matches(".*(?i)(university|institute|college|school|IIT|NIT|BITS).*")) {
                    edu.put("university", nt.length() > 100 ? nt.substring(0, 100) : nt);
                    break;
                }
            }
            if (!edu.containsKey("university")) edu.put("university", "");

            // Try to find year
            Matcher yearM = Pattern.compile("\\b(19|20)\\d{2}\\b").matcher(degreeLine + " " + remaining.substring(0, Math.min(100, remaining.length())));
            if (yearM.find()) edu.put("graduationYear", Integer.parseInt(yearM.group()));

            result.add(edu);
        }

        // If nothing matched with degree pattern, add a blank placeholder
        if (result.isEmpty()) {
            Map<String, Object> edu = new LinkedHashMap<>();
            edu.put("degree", "");
            edu.put("university", "");
            result.add(edu);
        }

        return result;
    }

    // ── Experience ───────────────────────────────────────────────────────────

    private List<Map<String, Object>> extractExperience(String text, String[] lines) {
        List<Map<String, Object>> result = new ArrayList<>();

        int expStart = findSectionStart(lines, "(?i)(experience|employment|work history|career)");
        int expEnd   = findSectionEnd(lines, expStart, "(?i)(education|project|skill|certification|achievement|award)");

        if (expStart < 0) return result;

        String expSection = String.join("\n", Arrays.copyOfRange(lines,
                Math.min(expStart + 1, lines.length),
                Math.min(expEnd > 0 ? expEnd : lines.length, lines.length)));

        // Company name heuristic: lines with year ranges like "2020 - 2023" or "Jan 2021 - Present"
        Pattern dateRange = Pattern.compile(
            "(?i)((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\\s*(?:19|20)\\d{2})" +
            "\\s*[-–—to]+\\s*((?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\\s*(?:(?:19|20)\\d{2}|present|current|now))",
            Pattern.CASE_INSENSITIVE
        );

        String[] expLines = expSection.split("\n");
        for (int i = 0; i < expLines.length && result.size() < 6; i++) {
            Matcher dm = dateRange.matcher(expLines[i]);
            if (dm.find()) {
                Map<String, Object> exp = new LinkedHashMap<>();
                exp.put("startDate", dm.group(1).trim());
                String endRaw = dm.group(2).trim();
                boolean isCurrent = endRaw.matches("(?i)present|current|now");
                exp.put("endDate",  isCurrent ? "" : endRaw);
                exp.put("current",  isCurrent);

                // Title and company usually on the lines around the date line
                String title   = i > 0 ? expLines[i - 1].trim() : "";
                String company = "";
                for (int j = Math.max(0, i - 3); j < i; j++) {
                    String l = expLines[j].trim();
                    if (l.length() > 2 && !l.matches(".*(?:19|20)\\d{2}.*")) {
                        if (title.isEmpty()) title = l;
                        else company = l;
                    }
                }
                // Description: next few lines
                StringBuilder desc = new StringBuilder();
                for (int j = i + 1; j < Math.min(i + 6, expLines.length); j++) {
                    String l = expLines[j].trim();
                    if (!l.isEmpty() && !dateRange.matcher(l).find()) desc.append(l).append(" ");
                    else break;
                }
                exp.put("title",       title.length() > 100 ? title.substring(0, 100) : title);
                exp.put("company",     company.length() > 100 ? company.substring(0, 100) : company);
                exp.put("description", desc.toString().trim());
                result.add(exp);
            }
        }

        // Fallback: add blank if nothing found
        if (result.isEmpty()) {
            Map<String, Object> exp = new LinkedHashMap<>();
            exp.put("company", ""); exp.put("title", "");
            exp.put("startDate", ""); exp.put("endDate", "");
            exp.put("current", false); exp.put("description", "");
            result.add(exp);
        }

        return result;
    }

    // ── Total experience ─────────────────────────────────────────────────────

    private double estimateTotalExperience(String text, List<Map<String, Object>> experience) {
        // Try explicit pattern first: "X years of experience"
        Matcher m = Pattern.compile(
            "(?i)(\\d+(?:\\.\\d+)?)\\s*(?:\\+\\s*)?years?(?:\\s+of)?\\s+(?:total\\s+)?experience"
        ).matcher(text);
        if (m.find()) {
            try { return Double.parseDouble(m.group(1)); } catch (NumberFormatException ignored) {}
        }
        // Estimate from number of experience entries
        return Math.max(0, experience.size() * 1.5);
    }

    // ── Section helpers ───────────────────────────────────────────────────────

    private int findSectionStart(String[] lines, String headingPattern) {
        for (int i = 0; i < lines.length; i++) {
            if (lines[i].trim().matches(headingPattern + ".*") && lines[i].trim().length() < 40) return i;
        }
        return -1;
    }

    private int findSectionEnd(String[] lines, int start, String nextSectionPattern) {
        if (start < 0) return -1;
        for (int i = start + 1; i < lines.length; i++) {
            if (lines[i].trim().matches(nextSectionPattern + ".*") && lines[i].trim().length() < 40) return i;
        }
        return -1;
    }
}
