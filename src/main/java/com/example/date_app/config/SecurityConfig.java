// com/example/date_app/config/SecurityConfig.java

package com.example.date_app.config;

import com.example.date_app.security.FirebaseAuthenticationFilter;
import com.example.date_app.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import com.example.date_app.util.JwtUtil;

@Configuration
public class SecurityConfig {

    private final JwtUtil jwtUtil;

    public SecurityConfig(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // 개발용 임시 허용 (React 전환 시 수정 예정)
                        .requestMatchers("/login", "/register",
                                "/css/**", "/js/**", "/images/**",
                                "/api/login", "/home", "/profile", "/profile/edit", "/match", "/chat/**").permitAll()
                        // React 전환 시 수정 예정: .requestMatchers("/api/login", "/api/register", "/api/public/**").permitAll()
                        .anyRequest().authenticated()
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.sendRedirect("/login");
                        })
                )
                .addFilterBefore(new JwtAuthenticationFilter(jwtUtil), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
