package com.itc475.BulletinBoard.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import com.itc475.BulletinBoard.domain.File;
import com.itc475.BulletinBoard.mapper.FileRepository;

@Controller
public class FileController {

	@Autowired
	FileRepository fileRepo;

	@GetMapping("/select")
	public String getFile(Model model, @RequestParam String fileName) {

		File file = fileRepo.getFileByFileName(fileName);
		model.addAttribute("file", file);
		return "";

	}

	@PostMapping("/add")
	public String newFile(Model model, @RequestParam String fileName, @RequestParam String filePath,
			@RequestParam String fileType, @RequestParam String fileSize) {

		File file = fileRepo.insertFile(fileName, filePath, fileType, fileSize);
		model.addAttribute("file", file);
		return "";

	}

	@PutMapping("/update")
	public String updateFile(Model model, @RequestParam String oldFileName, @RequestParam String newFileName,
			@RequestParam String filePath,
			@RequestParam String fileType, @RequestParam String fileSize) {

		File file = fileRepo.UpdateFileByFileName(oldFileName, newFileName, filePath, fileType, fileSize);
		model.addAttribute("file", file);
		return "";

	}

	@DeleteMapping("/delete")
	public String deleteFile(Model model, @RequestParam String fileName) {

		File file = fileRepo.deleteFileByFileName(fileName);
		model.addAttribute("file", file);
		return "";
	}

}
