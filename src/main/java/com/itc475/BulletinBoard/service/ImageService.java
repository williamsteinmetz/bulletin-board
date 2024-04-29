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
    
    public void updateImage(Image image) {
    imageRepository.save(image);
    }

    public void deleteImagesByIds(List<Integer> imageIds) {
        imageRepository.deleteImagesByIds(imageIds);
    }
}