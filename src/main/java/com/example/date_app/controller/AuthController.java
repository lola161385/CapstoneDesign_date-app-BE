// com/example/date_app/controller/AuthController.java
package com.example.date_app.controller;

import com.example.date_app.service.FirebaseAuthService;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import com.example.date_app.util.JwtUtil;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Controller
@RequiredArgsConstructor
public class AuthController {

    private final FirebaseAuthService firebaseAuthService;
    private final JwtUtil jwtUtil;

    @GetMapping("/login")
    public String loginForm() {
        return "login";
    }

    @PostMapping(value = "/api/login", consumes = "application/json", produces = "application/json")
    @ResponseBody
    public ResponseEntity<Map<String, String>> loginWithToken(@RequestBody Map<String, String> body, HttpSession session) {
        System.out.println("🔥 로그인 요청 도착");

        String idToken = body.get("idToken");
        System.out.println("📦 전달받은 idToken: " + idToken);

        try {
            FirebaseToken decodedToken = firebaseAuthService.verifyIdToken(idToken);
            String email = decodedToken.getEmail();

            boolean isNewUser = false;
            if (!firebaseAuthService.userProfileExists(email)) {
                firebaseAuthService.createInitialUserProfile(email);
                isNewUser = true;
                System.out.println("🌱 기본 프로필 자동 생성 완료");
            }

            String jwt = jwtUtil.generateToken(email);

            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(
                            email,
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                    );
            SecurityContextHolder.getContext().setAuthentication(auth);

            return ResponseEntity.ok(Map.of(
                    "token", jwt,
                    "newUser", String.valueOf(isNewUser)
            ));
        } catch (FirebaseAuthException e) {
            System.out.println("❌ Firebase 인증 실패: " + e.getMessage());
            return ResponseEntity.status(401).body(Map.of("error", "Firebase 인증 실패: " + e.getMessage()));
        }
    }

    @GetMapping("/api/home")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> apiHome() {
        String userEmail = getCurrentUserEmail();
        if (userEmail == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        try {
            Map<String, Object> profile = firebaseAuthService.getUserProfile(userEmail);
            return ResponseEntity.ok(Map.of(
                    "userEmail", userEmail,
                    "profile", profile
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", "Profile fetch failed"));
        }
    }

    @GetMapping("/logout")
    public String logout(HttpSession session) {
        session.invalidate();
        return "redirect:/login";
    }

    @GetMapping("/register")
    public String registerForm() {
        return "register";
    }

    @PostMapping("/register")
    public String registerSubmit(@RequestParam String email,
                                 @RequestParam String password,
                                 Model model) {
        try {
            firebaseAuthService.registerUser(email, password);
            firebaseAuthService.createInitialUserProfile(email);
            return "redirect:/login";
        } catch (FirebaseAuthException e) {
            model.addAttribute("message", "회원가입 실패: " + e.getMessage());
            return "register";
        }
    }

    @PostMapping("/delete-account")
    public String deleteAccount(Model model) {
        String userEmail = getCurrentUserEmail();
        if (userEmail == null) {
            return "redirect:/login";
        }

        try {
            firebaseAuthService.deleteAllUserData(userEmail);
            return "redirect:/login";
        } catch (FirebaseAuthException e) {
            model.addAttribute("message", "회원탈퇴 실패: " + e.getMessage());
            return "profile";
        }
    }

    private String getCurrentUserEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return (auth != null) ? (String) auth.getPrincipal() : null;
    }
}
