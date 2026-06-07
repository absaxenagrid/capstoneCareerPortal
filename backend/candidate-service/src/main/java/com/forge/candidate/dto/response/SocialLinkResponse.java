package com.forge.candidate.dto.response;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SocialLinkResponse {
    private Long socialLinkId;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private String twitterUrl;
}
