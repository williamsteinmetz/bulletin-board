package com.itc475.BulletinBoard.mapper;

import java.util.List;

import org.apache.ibatis.annotations.*;

import com.itc475.BulletinBoard.domain.File;

@Mapper
public interface FileRepository {
	@Select("SELECT * FROM bulletin_board_files")
	@Results(id="FileDataResult", value= {
		@Result(column="id",property="id"),
		@Result(column="name",property="fileName"),
		@Result(column="file_path",property="filePath"),
		@Result(column="file_type",property="fileType"),
		@Result(column="size",property="fileSize"),
		@Result(column="uploaded_at",property="fileUploadedOn")
	})
	public List<File> getAllFiles();
	
	@Select("SELECT * FROM bulletin_board_files WHERE file_name = #{fileName}")
	@ResultMap("FileDataResult")
	public File getFileByFileName(String fileName);
	
	@Insert("INSERT INTO bulletin_board_files (file_name, file_path, file_type, size) "
			+ "VALUES (#{fileName}, #{filePath}, #{fileType}, #{fileSize}")
	@ResultMap("FileDataResult")
	public File insertFile(String fileName, String filePath, String fileType, String fileSize);
	
	@Update("UPDATE bulletin_board_files SET file_name = #{newFileName}, file_path = #{filePath}, "
			+ "file_type = #{fileType}, size = #{fileSize}WHERE file_name =#{oldFileName}")
	@ResultMap("FileDataResult")
	public File UpdateFileByFileName(String oldFileName, String newFileName, String filePath, String fileType, String fileSize);
	
	@Delete("DELETE FROM bulletin_board_files WHERE file_name = #{fileName}")
	@ResultMap("FileDataResult")
	public File deleteFileByFileName(String fileName);
	
}
