package com.itc475.BulletinBoard.mapper;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.*;

import com.itc475.BulletinBoard.domain.File;

@Mapper
public interface FileRepository {
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
