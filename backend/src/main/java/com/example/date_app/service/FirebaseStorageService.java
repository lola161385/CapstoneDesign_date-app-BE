package com.example.date_app.service;

import com.google.cloud.storage.*;
import com.google.firebase.FirebaseApp;
import com.google.firebase.cloud.StorageClient;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class FirebaseStorageService {

    public String uploadProfileImage(MultipartFile file, String userId) throws IOException {
        // ✅ FirebaseApp 기반 StorageClient 사용
        Storage storage = StorageClient.getInstance().bucket().getStorage();

        String bucketName = StorageClient.getInstance().bucket().getName();
        String fileName = "profileImages/" + userId + "_" + UUID.randomUUID();

        System.out.println("🔥 업로드 대상 버킷: " + bucketName);

        BlobId blobId = BlobId.of(bucketName, fileName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType())
                .build();

        storage.create(blobInfo, file.getBytes());

        return "https://firebasestorage.googleapis.com/v0/b/" + bucketName + "/o/" +
                fileName.replace("/", "%2F") + "?alt=media";
    }
}
