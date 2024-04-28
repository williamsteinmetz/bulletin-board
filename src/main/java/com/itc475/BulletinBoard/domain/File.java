package com.itc475.BulletinBoard.domain;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Lob;
import javax.persistence.Column;
import java.sql.Date;

@Entity
public class File {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String fileName;
    private String fileType;
    private Long fileSize; // File size in bytes

    @Column(nullable = true)
    private Integer width; // Image width in pixels

    @Column(nullable = true)
    private Integer height; // Image height in pixels

    private Date fileUploadedOn;

    @Lob
    private byte[] data; // Image data

    // Constructor for image files
    public File(String fileName, String fileType, Long fileSize, byte[] imageData, Integer width, Integer height) {
		this.fileName = fileName;
		this.fileType = fileType;
		this.fileSize = fileSize;
		this.data = imageData;
		this.width = width;
		this.height = height;
		this.fileUploadedOn = new Date(System.currentTimeMillis());
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

    public Date getFileUploadedOn() {
        return fileUploadedOn;
    }

    public void setFileUploadedOn(Date fileUploadedOn) {
        this.fileUploadedOn = fileUploadedOn;
    }

    public byte[] getData() {
        return data;
    }

    public void setData(byte[] data) {
        this.data = data;
    }
}