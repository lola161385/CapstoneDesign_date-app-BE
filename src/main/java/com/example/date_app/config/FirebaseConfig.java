// com/example/date_app/config/FirebaseConfig.java

package com.example.date_app.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

import java.io.FileInputStream;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        try {
            InputStream serviceAccount = getClass().getClassLoader().getResourceAsStream("firebase-service-account.json");

            FirebaseOptions options = FirebaseOptions.builder()
                    .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                    .setDatabaseUrl("https://date-app-41a1c-default-rtdb.firebaseio.com")
                    .setStorageBucket("date-app-41a1c.firebasestorage.app")
                    .build();

            if (FirebaseApp.getApps().isEmpty()) {
                FirebaseApp.initializeApp(options);
                System.out.println("✅ Firebase 초기화 완료");

                System.out.println("▶ 현재 FirebaseApp 이름: " + FirebaseApp.getInstance().getName());
                System.out.println("▶ 설정된 Storage 버킷: " + FirebaseApp.getInstance().getOptions().getStorageBucket());

            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
