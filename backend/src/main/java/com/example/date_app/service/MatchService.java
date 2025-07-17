package com.example.date_app.service;

import com.example.date_app.dto.MatchRecommendation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.cache.annotation.Cacheable;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MatchService {

    private final FirebaseAuthService firebaseAuthService;
    private final MatchScoringService matchScoringService;

    public List<MatchRecommendation> recommendFor(String email) throws Exception {
        Map<String, Object> myProfile = firebaseAuthService.getUserProfile(email);
        List<Map<String, Object>> allProfiles = firebaseAuthService.getAllUserProfiles();

        String myGender = (String) myProfile.getOrDefault("gender", "");
        Map<String, Object> myPersonality = (Map<String, Object>) myProfile.getOrDefault("personality", Map.of());
        String myMbti = (String) myPersonality.getOrDefault("mbti", "");
        List<String> myTags = (List<String>) myPersonality.getOrDefault("tags", List.of());

        return allProfiles.stream()
                .filter(p -> {
                    String name = (String) p.getOrDefault("name", "");
                    Map<String, Object> personality = (Map<String, Object>) p.getOrDefault("personality", Map.of());
                    String mbti = (String) personality.getOrDefault("mbti", "");
                    return name != null && !name.isBlank() && mbti != null && !mbti.isBlank();
                })
                .map(p -> matchScoringService.calculateScore(email, myGender, myMbti, myTags, p))
                .filter(Objects::nonNull)
                .sorted(Comparator.comparingInt(MatchRecommendation::getScore).reversed())
                .collect(Collectors.toList());
    }

}
