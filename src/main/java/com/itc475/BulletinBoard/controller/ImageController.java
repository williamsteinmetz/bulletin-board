package com.itc475.BulletinBoard.controller;

import java.sql.Timestamp;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.itc475.BulletinBoard.domain.Image;
import com.itc475.BulletinBoard.service.ImageService;

@Controller
public class ImageController {

	@Autowired
	private ImageService imageService;

	@GetMapping("/selectAll")
	public String getAllImages(Model model) {
		List<Image> images = imageService.getAllImages();
		model.addAttribute("files", images);
		return "list-images";
	}

	@GetMapping("/image/{id}")
	public ResponseEntity<byte[]> getImageById(@PathVariable Integer id) {
		Image image = imageService.getFileById(id);
		if (image != null && image.getImageData() != null) {
			return ResponseEntity.ok()
					.contentType(MediaType.parseMediaType(image.getFileType()))
					.body(image.getImageData());
		} else {
			return ResponseEntity.notFound().build();
		}
	}

	@PostMapping("/add")
	public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file,
			@RequestParam("fileName") String fileName,
			@RequestParam("width") Integer width,
			@RequestParam("height") Integer height) {
		try {
			String fileType = file.getContentType();
			long fileSize = file.getSize();
			byte[] imageData = file.getBytes();
			Image newImage = new Image(fileName, fileType, fileSize, imageData, width, height);
			newImage.setUploadedAt(new Timestamp(System.currentTimeMillis()));
			return imageService.insertFile(newImage);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body("File upload failed: " + e.getMessage());
		}
	}

	@GetMapping("/image/{id}/info")
	public ResponseEntity<Image> getImageInfo(@PathVariable Integer id) {
		Image image = imageService.getFileById(id);
		if (image != null) {
			return ResponseEntity.ok(image);
		} else {
			return ResponseEntity.notFound().build();
		}
	}

	@PutMapping("/image/{id}/update")
	public ResponseEntity<Image> updateImageInfo(@PathVariable Integer id, @RequestBody Image updatedImage) {
		try {
			// Retrieve the existing image from the database
			Image existingImage = imageService.getFileById(id);

			if (existingImage == null) {
				return ResponseEntity.notFound().build();
			}
			// Update the image properties with the new values
			existingImage.setFileName(updatedImage.getFileName());
			existingImage.setFileType(updatedImage.getFileType());
			existingImage.setFileSize(updatedImage.getFileSize());
			existingImage.setWidth(updatedImage.getWidth());
			existingImage.setHeight(updatedImage.getHeight());

			// Update the image in the database
			Image updatedImageResult = imageService.updateFileById(id, existingImage);

			return ResponseEntity.ok(updatedImageResult);
		} catch (Exception e) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
					.body(null);
		}
	}

	@DeleteMapping("/delete")
	public ResponseEntity<?> deleteFile(@RequestParam Integer id) {
		return imageService.deleteFileByFileId(id);
	}

	@GetMapping("/getIframeContent")
	public String getIframeContent(@RequestParam(required = false) String type, Model model) {
		String viewName;
		switch (type) {
			case "add":
				viewName = "add-picture"; // Ensure this is a full HTML page suitable for iframe
				break;
			case "list-images":
				List<Image> images = imageService.getAllImages();
				model.addAttribute("images", images);
				viewName = "list-images";
				break;
			case "delete":
				viewName = "uploadError"; // Ensure this is a full HTML page suitable for iframe
				break;
			default:
				viewName = "uploadError"; // Default case to handle unknown types
		}
		model.addAttribute("iframeUrl", "/url-to-view/" + viewName); // Assuming you have a URL mapping for views
		return viewName; // This should be a Thymeleaf template that contains the iframe
	}
}