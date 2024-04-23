package com.itc475.BulletinBoard.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SceneController {

    @GetMapping("/")
    public String index() {
        return "../static/index";
    }
}