package com.itc475.BulletinBoard.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Controller
public class TemplateController {

    @GetMapping("/templates/{templateName}")
    @ResponseBody
    public String getTemplate(@PathVariable String templateName) {
        Resource resource = new ClassPathResource("/templates/" + templateName);
        try {
            return StreamUtils.copyToString(resource.getInputStream(), StandardCharsets.UTF_8);
        } catch (IOException e) {
            throw new RuntimeException("Could not read template", e);
        }
    }
}
