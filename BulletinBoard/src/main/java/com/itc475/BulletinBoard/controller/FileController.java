package com.itc475.BulletinBoard.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import com.itc475.BulletinBoard.domain.File;
import com.itc475.BulletinBoard.mapper.FileRepository;

@Controller
public class FileController {
	
	@Autowired
	FileRepository fileRepo;
	
	@GetMapping("/listFile")
	public String listFile(Model model) {
		
		List<File> files = fileRepo.findAll();
		model.addAttribute("files", files);
		return "file-list-form";
		
	}

}
