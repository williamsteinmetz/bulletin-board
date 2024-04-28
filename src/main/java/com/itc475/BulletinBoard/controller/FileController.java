package com.itc475.BulletinBoard.controller;

import java.sql.Date;
import java.util.List;

import org.mybatis.logging.Logger;
import org.mybatis.logging.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.itc475.BulletinBoard.domain.File;
import com.itc475.BulletinBoard.mapper.FileRepository;

@RestController
public class FileController {

	@Autowired
	FileRepository fileRepo;

	@GetMapping("/selectAll")
	public String getFile(Model model) {

		List<File> files = fileRepo.getAllFiles();
		model.addAttribute("files", files);
		return "";

	}

	@GetMapping("/select")
	public String getFile(Model model, @RequestParam String fileName) {

		File file = fileRepo.getFileByFileName(fileName);
		model.addAttribute("file", file);
		return "";

	}

	@PostMapping("/add")
public ResponseEntity<?> uploadImage(Model model,
        @RequestParam("file") MultipartFile file,
        @RequestParam("fileName") String fileName,
        @RequestParam("fileType") String fileType,
        @RequestParam("fileSize") Long fileSize,
        @RequestParam("width") Integer width,
        @RequestParam("height") Integer height) {
    try {
        byte[] imageData = file.getBytes();
        File newFile = new File(fileName, fileType, fileSize, imageData, width, height);
        newFile.setFileUploadedOn(new Date(System.currentTimeMillis()));
        int result = fileRepo.insertFile(newFile);
        if (result > 0) {
            return ResponseEntity.ok(new ResponseEntity<>("File uploaded successfully", HttpStatus.OK));
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("File upload failed");
        }
    } catch (Exception e) {
        // Log the exception details to help with debugging
		return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body("File upload failed: " + e.getMessage());
    }
}

    @PutMapping("/update")
	public String updateFile(Model model, @RequestParam String oldFileName, @RequestParam String newFileName,
			@RequestParam String fileType, @RequestParam Long fileSize) {

		int result = fileRepo.updateFileByFileName(oldFileName, newFileName, fileType, fileSize);
		if (result > 0) {
			model.addAttribute("message", "File updated successfully");
		} else {
			model.addAttribute("message", "Update failed");
		}
		return "updateStatus";
	}

	@DeleteMapping("/delete")
	public String deleteFile(Model model, @RequestParam String fileName) {

		File file = fileRepo.deleteFileByFileName(fileName);
		model.addAttribute("file", file);
		return "";
	}

}
