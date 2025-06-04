package com.example.date_app.service;

import com.example.date_app.dto.MatchRecommendation;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

import static java.util.Map.entry;

@Service
public class MatchScoringService {

    private static final Map<String, Map<String, Integer>> mbtiCompatibility = Map.ofEntries(
            entry("INFP", Map.ofEntries(
                    entry("INFP", 4), entry("ENFP", 4), entry("INFJ", 4), entry("ENFJ", 5),
                    entry("INTJ", 4), entry("ENTJ", 5), entry("INTP", 4), entry("ENTP", 4),
                    entry("ISFP", 1), entry("ESFP", 1), entry("ISTP", 1), entry("ESTP", 1),
                    entry("ISFJ", 1), entry("ESFJ", 1), entry("ISTJ", 1), entry("ESTJ", 1)
            )),
            entry("ENFP", Map.ofEntries(
                    entry("INFP", 4), entry("ENFP", 4), entry("INFJ", 5), entry("ENFJ", 4),
                    entry("INTJ", 5), entry("ENTJ", 4), entry("INTP", 4), entry("ENTP", 4),
                    entry("ISFP", 1), entry("ESFP", 1), entry("ISTP", 1), entry("ESTP", 1),
                    entry("ISFJ", 1), entry("ESFJ", 1), entry("ISTJ", 1), entry("ESTJ", 1)
            )),
            entry("INFJ", Map.ofEntries(
                    entry("INFP", 4), entry("ENFP", 5), entry("INFJ", 4), entry("ENFJ", 4),
                    entry("INTJ", 4), entry("ENTJ", 4), entry("INTP", 4), entry("ENTP", 5),
                    entry("ISFP", 1), entry("ESFP", 1), entry("ISTP", 1), entry("ESTP", 1),
                    entry("ISFJ", 1), entry("ESFJ", 1), entry("ISTJ", 1), entry("ESTJ", 1)
            )),
            entry("ENFJ", Map.ofEntries(
                    entry("INFP", 5), entry("ENFP", 4), entry("INFJ", 4), entry("ENFJ", 4),
                    entry("INTJ", 4), entry("ENTJ", 4), entry("INTP", 4), entry("ENTP", 4),
                    entry("ISFP", 5), entry("ESFP", 1), entry("ISTP", 1), entry("ESTP", 1),
                    entry("ISFJ", 1), entry("ESFJ", 1), entry("ISTJ", 1), entry("ESTJ", 1)
            )),
            entry("INTJ", Map.ofEntries(
                    entry("INFP", 4), entry("ENFP", 5), entry("INFJ", 4), entry("ENFJ", 4),
                    entry("INTJ", 4), entry("ENTJ", 4), entry("INTP", 4), entry("ENTP", 5),
                    entry("ISFP", 3), entry("ESFP", 3), entry("ISTP", 3), entry("ESTP", 3),
                    entry("ISFJ", 2), entry("ESFJ", 2), entry("ISTJ", 2), entry("ESTJ", 2)
            )),
            entry("ENTJ", Map.ofEntries(
                    entry("INFP", 5), entry("ENFP", 4), entry("INFJ", 4), entry("ENFJ", 4),
                    entry("INTJ", 4), entry("ENTJ", 4), entry("INTP", 5), entry("ENTP", 4),
                    entry("ISFP", 3), entry("ESFP", 3), entry("ISTP", 3), entry("ESTP", 3),
                    entry("ISFJ", 3), entry("ESFJ", 3), entry("ISTJ", 3), entry("ESTJ", 3)
            )),
            entry("INTP", Map.ofEntries(
                    entry("INFP", 4), entry("ENFP", 4), entry("INFJ", 4), entry("ENFJ", 4),
                    entry("INTJ", 4), entry("ENTJ", 5), entry("INTP", 4), entry("ENTP", 4),
                    entry("ISFP", 3), entry("ESFP", 3), entry("ISTP", 3), entry("ESTP", 3),
                    entry("ISFJ", 2), entry("ESFJ", 2), entry("ISTJ", 2), entry("ESTJ", 5)
            )),
            entry("ENTP", Map.ofEntries(
                    entry("INFP", 4), entry("ENFP", 4), entry("INFJ", 5), entry("ENFJ", 4),
                    entry("INTJ", 5), entry("ENTJ", 4), entry("INTP", 4), entry("ENTP", 4),
                    entry("ISFP", 3), entry("ESFP", 3), entry("ISTP", 3), entry("ESTP", 3),
                    entry("ISFJ", 2), entry("ESFJ", 2), entry("ISTJ", 2), entry("ESTJ", 2)
            )),
            entry("ISFP", Map.ofEntries(
                    entry("INFP", 1), entry("ENFP", 1), entry("INFJ", 1), entry("ENFJ", 5),
                    entry("INTJ", 3), entry("ENTJ", 3), entry("INTP", 3), entry("ENTP", 3),
                    entry("ISFP", 2), entry("ESFP", 2), entry("ISTP", 2), entry("ESTP", 2),
                    entry("ISFJ", 3), entry("ESFJ", 5), entry("ISTJ", 3), entry("ESTJ", 5)
            )),
            entry("ESFP", Map.ofEntries(
                    entry("INFP", 1), entry("ENFP", 1), entry("INFJ", 1), entry("ENFJ", 5),
                    entry("INTJ", 3), entry("ENTJ", 3), entry("INTP", 3), entry("ENTP", 3),
                    entry("ISFP", 2), entry("ESFP", 2), entry("ISTP", 2), entry("ESTP", 2),
                    entry("ISFJ", 5), entry("ESFJ", 3), entry("ISTJ", 5), entry("ESTJ", 3)
            )),
            entry("ISTP", Map.ofEntries(
                    entry("INFP", 1), entry("ENFP", 1), entry("INFJ", 1), entry("ENFJ", 1),
                    entry("INTJ", 3), entry("ENTJ", 3), entry("INTP", 3), entry("ENTP", 3),
                    entry("ISFP", 2), entry("ESFP", 2), entry("ISTP", 2), entry("ESTP", 2),
                    entry("ISFJ", 3), entry("ESFJ", 5), entry("ISTJ", 3), entry("ESTJ", 5)
            )),
            entry("ESTP", Map.ofEntries(
                    entry("INFP", 1), entry("ENFP", 1), entry("INFJ", 1), entry("ENFJ", 1),
                    entry("INTJ", 3), entry("ENTJ", 3), entry("INTP", 3), entry("ENTP", 3),
                    entry("ISFP", 2), entry("ESFP", 2), entry("ISTP", 2), entry("ESTP", 2),
                    entry("ISFJ", 5), entry("ESFJ", 3), entry("ISTJ", 5), entry("ESTJ", 3)
            )),
            entry("ISFJ", Map.ofEntries(
                    entry("INFP", 1), entry("ENFP", 1), entry("INFJ", 1), entry("ENFJ", 1),
                    entry("INTJ", 2), entry("ENTJ", 3), entry("INTP", 2), entry("ENTP", 2),
                    entry("ISFP", 3), entry("ESFP", 5), entry("ISTP", 3), entry("ESTP", 5),
                    entry("ISFJ", 4), entry("ESFJ", 4), entry("ISTJ", 4), entry("ESTJ", 4)
            )),
            entry("ESFJ", Map.ofEntries(
                    entry("INFP", 1), entry("ENFP", 1), entry("INFJ", 1), entry("ENFJ", 1),
                    entry("INTJ", 2), entry("ENTJ", 3), entry("INTP", 2), entry("ENTP", 2),
                    entry("ISFP", 5), entry("ESFP", 3), entry("ISTP", 5), entry("ESTP", 3),
                    entry("ISFJ", 4), entry("ESFJ", 4), entry("ISTJ", 4), entry("ESTJ", 4)
            )),
            entry("ISTJ", Map.ofEntries(
                    entry("INFP", 1), entry("ENFP", 1), entry("INFJ", 1), entry("ENFJ", 1),
                    entry("INTJ", 2), entry("ENTJ", 3), entry("INTP", 2), entry("ENTP", 2),
                    entry("ISFP", 3), entry("ESFP", 5), entry("ISTP", 3), entry("ESTP", 5),
                    entry("ISFJ", 4), entry("ESFJ", 4), entry("ISTJ", 4), entry("ESTJ", 4)
            )),
            entry("ESTJ", Map.ofEntries(
                    entry("INFP", 1), entry("ENFP", 1), entry("INFJ", 1), entry("ENFJ", 1),
                    entry("INTJ", 2), entry("ENTJ", 3), entry("INTP", 5), entry("ENTP", 2),
                    entry("ISFP", 5), entry("ESFP", 3), entry("ISTP", 5), entry("ESTP", 3),
                    entry("ISFJ", 4), entry("ESFJ", 4), entry("ISTJ", 4), entry("ESTJ", 4)
            ))
    );

    public MatchRecommendation calculateScore(
            String myEmail,
            String myGender,
            String myMbti,
            List<String> myTags,
            Map<String, Object> targetProfile
    ) {
        if (Objects.equals(myEmail, targetProfile.get("email"))) return null;
        if (Objects.equals(myGender, targetProfile.get("gender"))) return null;

        Map<String, Object> theirPersonality = (Map<String, Object>) targetProfile.getOrDefault("personality", Map.of());
        String theirMbti = (String) theirPersonality.getOrDefault("mbti", "");
        List<String> theirTags = (List<String>) theirPersonality.getOrDefault("tags", List.of());

        int score = 0;

        if (mbtiCompatibility.containsKey(myMbti)) {
            score += mbtiCompatibility.get(myMbti).getOrDefault(theirMbti, 0);
        }

        List<String> commonTags = myTags.stream()
                .filter(theirTags::contains)
                .collect(Collectors.toList());
        score += commonTags.size();

        return new MatchRecommendation(
                (String) targetProfile.get("email"),
                (String) targetProfile.getOrDefault("name", "익명"),
                theirMbti,
                commonTags,
                score
        );
    }
}
