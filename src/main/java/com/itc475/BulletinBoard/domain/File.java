package com.itc475.BulletinBoard.domain;

import java.sql.Date;

public class File {
	
	private Integer id;
	private String fileName;
	private String filePath;
	private String fileType;
	private Integer fileSize;
	private Date fileUploadedOn;

	
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
	public String getFilePath() {
		return filePath;
	}
	public void setFilePath(String filePath) {
		this.filePath = filePath;
	}
	public String getFileType() {
		return fileType;
	}
	public void setFileType(String fileType) {
		this.fileType = fileType;
	}
	public Integer getFileSize() {
		return fileSize;
	}
	public void setFileSize(Integer fileSize) {
		this.fileSize = fileSize;
	}
	public Date getFileUploadedOn() {
		return fileUploadedOn;
	}
	public void setFileUploadedOn(Date fileUploadedOn) {
		this.fileUploadedOn = fileUploadedOn;
	}
	
}
