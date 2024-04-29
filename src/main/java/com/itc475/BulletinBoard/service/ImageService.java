package com.itc475.BulletinBoard.service;

import java.sql.Timestamp;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.itc475.BulletinBoard.domain.Image;
import com.itc475.BulletinBoard.mapper.ImageRepository;

@Service
public class ImageService {
    @Autowired
    private ImageRepository imageRepository;

    public List<Image> getAllImages() {
        return imageRepository.getAllFiles();
    }

    public Image getFileById(Integer id) {
        return imageRepository.getFileById(id);
    }

    public ResponseEntity<?> insertFile(Image image) {
        imageRepository.insertFile(image);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    public Image updateFileById(Integer id, Image updatedImage) {
        Image image = imageRepository.getFileById(id);
        if (image != null) {
            image.setFileName(updatedImage.getFileName());
            image.setFileType(updatedImage.getFileType());
            image.setFileSize(updatedImage.getFileSize());
            image.setImageData(updatedImage.getImageData());
            image.setWidth(updatedImage.getWidth());
            image.setHeight(updatedImage.getHeight());
            imageRepository.save(image);
            return image;
        }
        return null; // or throw an exception if preferred
    }
    
    public ResponseEntity<?> deleteFileByFileId(Integer id) {
        Image image = imageRepository.getFileById(id);
        if (image != null) {
            imageRepository.deleteFileByFileId(id);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}