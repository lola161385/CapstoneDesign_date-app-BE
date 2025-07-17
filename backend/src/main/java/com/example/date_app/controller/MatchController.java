package com.example.date_app.controller;

import com.example.date_app.dto.MatchRecommendation;
import com.example.date_app.service.FirebaseAuthService;
import com.example.date_app.service.MatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.stereotype.Controller;

import java.util.*;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/match")
public class MatchController {

    private final FirebaseAuthService firebaseAuthService;
    private final MatchService matchService;

    @Controller
    public class MatchPageController {

        @GetMapping("/match")
        public String showMatchPage() {
            return "match"; // templates/match.html 렌더링
        }
    }

    @GetMapping("/recommendations")
    public List<MatchRecommendation> recommendMatches() throws Exception {
        String myEmail = getCurrentUserEmail();
        if (myEmail == null || myEmail.equals("anonymousUser")) {
            throw new RuntimeException("❌ 인증되지 않은 사용자입니다.");
        }

        return matchService.recommendFor(myEmail);
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null) ? (String) auth.getPrincipal() : null;
    }
}
