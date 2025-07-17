package com.example.date_app.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class FaviconController {
    @RequestMapping("favicon.ico")
    @ResponseBody
    void returnNoFavicon() {}
}
