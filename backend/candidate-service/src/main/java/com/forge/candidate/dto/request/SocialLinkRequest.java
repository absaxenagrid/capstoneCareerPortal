package com.forge.candidate.dto.request;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SocialLinkRequest {
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private String twitterUrl;
}
