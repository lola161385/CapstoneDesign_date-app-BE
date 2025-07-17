// com/example/date_app/service/FirebaseAuthService.java

package com.example.date_app.service;

import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.auth.FirebaseToken;
import com.google.firebase.auth.UserRecord;
import com.google.firebase.database.*;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.List;
import java.util.concurrent.CountDownLatch;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.Storage;
import com.google.firebase.cloud.StorageClient;


@Service
public class FirebaseAuthService {

    public String registerUser(String email, String password) throws FirebaseAuthException {
        UserRecord.CreateRequest request = new UserRecord.CreateRequest()
                .setEmail(email)
                .setPassword(password);
        UserRecord userRecord = FirebaseAuth.getInstance().createUser(request);
        return userRecord.getUid();
    }

    public UserRecord getUserByEmail(String email) throws FirebaseAuthException {
        return FirebaseAuth.getInstance().getUserByEmail(email);
    }

    public FirebaseToken verifyIdToken(String idToken) throws FirebaseAuthException {
        return FirebaseAuth.getInstance().verifyIdToken(idToken);
    }

    public void deleteUserByEmail(String email) throws FirebaseAuthException {
        UserRecord user = getUserByEmail(email);
        FirebaseAuth.getInstance().deleteUser(user.getUid());
    }

    public void updateUserProfile(String email, String name, String birthdate, String gender, String bio, String mbti, List<String> tags, List<String> likeTags)
            throws FirebaseAuthException {
        UserRecord user = FirebaseAuth.getInstance().getUserByEmail(email);
        String uid = user.getUid();

        DatabaseReference ref = FirebaseDatabase.getInstance().getReference("users")
                .child(uid);

        Map<String, Object> updates = new HashMap<>();
        updates.put("name", name);
        updates.put("birthdate", birthdate);
        updates.put("gender", gender);
        updates.put("bio", bio);
        updates.put("personality/mbti", mbti);
        updates.put("personality/tags", tags);
        updates.put("personality/likeTags", likeTags);

        ref.updateChildrenAsync(updates);
    }

    public Map<String, Object> getUserProfile(String email) throws FirebaseAuthException {
        UserRecord user = FirebaseAuth.getInstance().getUserByEmail(email);
        String uid = user.getUid();

        DatabaseReference ref = FirebaseDatabase.getInstance()
                .getReference("users")
                .child(uid);

        CountDownLatch latch = new CountDownLatch(1);
        final Map<String, Object>[] result = new Map[1];

        ref.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                if (snapshot.exists()) {
                    result[0] = (Map<String, Object>) snapshot.getValue();
                } else {
                    result[0] = new HashMap<>();
                }
                latch.countDown();
            }

            @Override
            public void onCancelled(DatabaseError error) {
                result[0] = new HashMap<>();
                latch.countDown();
            }
        });

        try {
            latch.await();
            Map<String, Object> profile = result[0];

            // profileImage 필드가 누락된 경우, 기본 이미지로 설정
            if (!profile.containsKey("profileImage")) {
                profile.put("profileImage", "/images/default-profile.png");
            }

            // 디폴트 키 처리
            if (!profile.containsKey("personality")) {
                profile.put("personality", new HashMap<String, Object>());
            }
            Map<String, Object> personality = (Map<String, Object>) profile.get("personality");

            // personality 내의 필드 처리
            if (!personality.containsKey("likeTags")) {
                personality.put("likeTags", new ArrayList<>());
            }

            return profile;

        } catch (InterruptedException e) {
            throw new RuntimeException("데이터 가져오기 실패", e);
        }
    }


    public void createInitialUserProfile(String email) throws FirebaseAuthException {
        UserRecord user = getUserByEmail(email);
        String uid = user.getUid();

        DatabaseReference ref = FirebaseDatabase.getInstance()
                .getReference("users")
                .child(uid);

        Map<String, Object> profile = new HashMap<>();
        profile.put("email", email);
        profile.put("name", "");
        profile.put("birthdate", "");
        profile.put("bio", "");
        profile.put("gender", "");
        profile.put("personality", Map.of("mbti", "", "tags", List.of()));

        ref.setValueAsync(profile);
    }

    public boolean userProfileExists(String email) throws FirebaseAuthException {
        try {
            UserRecord user = getUserByEmail(email);
            String uid = user.getUid();

            DatabaseReference ref = FirebaseDatabase.getInstance()
                    .getReference("users")
                    .child(uid);

            final boolean[] exists = {false};
            CountDownLatch latch = new CountDownLatch(1);

            ref.addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot snapshot) {
                    exists[0] = snapshot.exists();
                    latch.countDown();
                }

                @Override
                public void onCancelled(DatabaseError error) {
                    latch.countDown();
                }
            });

            latch.await();
            return exists[0];
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("프로필 존재 여부 확인 중 인터럽트 발생", e);
        }
    }

    public List<Map<String, Object>> getAllUserProfiles() {
        try {
            DatabaseReference ref = FirebaseDatabase.getInstance().getReference("users");

            List<Map<String, Object>> resultList = new ArrayList<>();
            CountDownLatch latch = new CountDownLatch(1);

            ref.addListenerForSingleValueEvent(new ValueEventListener() {
                @Override
                public void onDataChange(DataSnapshot snapshot) {
                    for (DataSnapshot child : snapshot.getChildren()) {
                        Object value = child.getValue();
                        if (value instanceof Map) {
                            resultList.add((Map<String, Object>) value);
                        }
                    }
                    latch.countDown();
                }

                @Override
                public void onCancelled(DatabaseError error) {
                    latch.countDown();
                }
            });

            latch.await();
            return resultList;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("전체 프로필 조회 중 인터럽트 발생", e);
        }
    }

    public void updateProfileImageUrl(String email, String imageUrl) throws FirebaseAuthException {
        UserRecord user = getUserByEmail(email);
        String uid = user.getUid();

        DatabaseReference ref = FirebaseDatabase.getInstance()
                .getReference("users")
                .child(uid)
                .child("profileImage");

        ref.setValueAsync(imageUrl);
    }

    public void deleteUserData(String email) throws FirebaseAuthException {
        UserRecord user = getUserByEmail(email);
        String uid = user.getUid();

        DatabaseReference ref = FirebaseDatabase.getInstance()
                .getReference("users")
                .child(uid);
        ref.removeValueAsync(); // DB에서 사용자 프로필 삭제
    }

    public void deleteUserProfileImage(String userId) {
        Storage storage = StorageClient.getInstance().bucket().getStorage();
        String objectName = "profileImages/" + userId;

        BlobId blobId = BlobId.of(StorageClient.getInstance().bucket().getName(), objectName);
        storage.delete(blobId); // Firebase Storage에서 이미지 삭제
    }

    public void deleteAllUserData(String email) throws FirebaseAuthException {
        UserRecord user = getUserByEmail(email);
        String uid = user.getUid();

        deleteUserData(email);                          // Firebase DB 삭제
        deleteUserProfileImage(uid);                    // Firebase Storage 이미지 삭제
        deleteChatRoomsContainingUser(email);           // 채팅 삭제
        deleteChatListEntries(email);                   // 채팅목록 삭제
        FirebaseAuth.getInstance().deleteUser(uid);     // Firebase Auth 계정 삭제
    }

    public void deleteChatRoomsContainingUser(String email) {
        String safeEmail = email.replace(".", "_dot_").replace("@", "_at_");

        DatabaseReference chatsRef = FirebaseDatabase.getInstance().getReference("chats");

        chatsRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot chatRoom : snapshot.getChildren()) {
                    String roomId = chatRoom.getKey();
                    if (roomId != null && roomId.contains(safeEmail)) {
                        chatsRef.child(roomId).removeValueAsync();
                    }
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                System.out.println("채팅 삭제 실패: " + error.getMessage());
            }
        });
    }

    public void deleteChatListEntries(String email) {
        String safeEmail = email.replace(".", "_dot_").replace("@", "_at_");

        DatabaseReference chatListRef = FirebaseDatabase.getInstance().getReference("chat_list");

        // 1. 자신의 chat_list 항목 삭제
        chatListRef.child(safeEmail).removeValueAsync();

        // 2. 다른 사람들의 chat_list에서 이 유저가 포함된 항목 삭제
        chatListRef.addListenerForSingleValueEvent(new ValueEventListener() {
            @Override
            public void onDataChange(DataSnapshot snapshot) {
                for (DataSnapshot userEntry : snapshot.getChildren()) {
                    String otherUser = userEntry.getKey();
                    if (otherUser == null) continue;

                    // /chat_list/otherUser/safeEmail 삭제
                    chatListRef.child(otherUser).child(safeEmail).removeValueAsync();
                }
            }

            @Override
            public void onCancelled(DatabaseError error) {
                System.out.println("chat_list 정리 실패: " + error.getMessage());
            }
        });
    }

}
