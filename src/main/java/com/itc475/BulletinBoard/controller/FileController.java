package com.itc475.BulletinBoard.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;

import com.itc475.BulletinBoard.domain.File;
import com.itc475.BulletinBoard.mapper.FileRepository;

@Controller
public class FileController {

	@Autowired
	FileRepository fileRepo;

	// @GetMapping("/load")
	// public String listFile(Model model) {

	// File file = fileRepo.getFileByFileName();
	// model.addAttribute("file", file);
	// return "index";

	// }

	@PostMapping("/add")
	public String newPic(Model model) {

		return "add-picture";

	}

}
