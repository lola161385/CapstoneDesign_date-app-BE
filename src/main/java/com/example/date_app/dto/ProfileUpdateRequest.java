// ProfileUpdateRequest.java
package com.example.date_app.dto;

import lombok.Data;

import java.util.List;

@Data
public class ProfileUpdateRequest {
    private String name;
    private String birthdate;
    private String bio;
    private String gender;
    private String mbti;
    private List<String> tags;
    private List<String> likeTags;
    private String profileImageUrl;

    public boolean isValid() {
        return tags != null && tags.size() <= 5 && (likeTags == null || likeTags.size() <= 5);
    }
}