package com.example.date_app.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class MatchRecommendation {
    private String email;
    private String name;
    private String mbti;
    private int score;
}
