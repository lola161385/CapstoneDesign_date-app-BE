// com/example/date_app/controller/ChatController.java

package com.example.date_app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ChatController {

    @GetMapping("/chat/list")
    public String chatListPage() {
        return "chatList";
    }

    @GetMapping("/chat/room")
    public String chatRoomPage() {
        return "chatRoom";
    }
}
