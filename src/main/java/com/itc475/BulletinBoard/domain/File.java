package com.itc475.BulletinBoard.domain;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.Column;
import javax.persistence.Table;
import java.sql.Timestamp;

@Entity
@Table(name = "bulletin_board_files")
public class File {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_type", length = 50)
    private String fileType;

    @Column(name = "file_size")
    private Long fileSize; // File size in bytes

    @Lob
    @Column(name = "image_data")
    private byte[] imageData; // Image data

    @Column(name = "width")
    private Integer width; // Image width in pixels

    @Column(name = "height")
    private Integer height; // Image height in pixels

    @Column(name = "uploaded_at", insertable = false, updatable = false)
    private Timestamp uploadedAt; // Timestamp of file upload

    // No-argument constructor
    public File() {
    }

    // Constructor for image files
    public File(String fileName, String fileType, Long fileSize, byte[] imageData, Integer width, Integer height) {
        this.fileName = fileName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.imageData = imageData;
        this.width = width;
        this.height = height;
    }

    // Getters and setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public byte[] getImageData() {
        return imageData;
    }

    public void setImageData(byte[] imageData) {
        this.imageData = imageData;
    }

    public Integer getWidth() {
        return width;
    }

    public void setWidth(Integer width) {
        this.width = width;
    }

    public Integer getHeight() {
        return height;
    }

    public void setHeight(Integer height) {
        this.height = height;
    }

    public Timestamp getUploadedAt() {
        return uploadedAt;
    }

    public void setUploadedAt(Timestamp uploadedAt) {
        this.uploadedAt = uploadedAt;
    }
}