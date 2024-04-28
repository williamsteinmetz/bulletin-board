package com.itc475.BulletinBoard.mapper;

import org.apache.ibatis.annotations.*;
import java.util.List;
import com.itc475.BulletinBoard.domain.File;

@Mapper
public interface FileRepository {
	@Select("SELECT * FROM bulletin_board_files")
	@Results(id = "FileDataResult", value = {
			@Result(column = "id", property = "id"),
			@Result(column = "name", property = "fileName"),
			@Result(column = "file_type", property = "fileType"),
			@Result(column = "size", property = "fileSize"),
			@Result(column = "uploaded_at", property = "fileUploadedOn")
	})
	public List<File> getAllFiles();

	@Select("SELECT * FROM bulletin_board_files WHERE file_name = #{fileName}")
	@ResultMap("FileDataResult")
	public File getFileByFileName(String fileName);

	@Insert("INSERT INTO bulletin_board_files (file_name, file_type, file_size, image_data, width, height) " +
			"VALUES (#{fileName}, #{fileType}, #{fileSize}, #{imageData}, #{width}, #{height})")
	public int insertFile(File file);

	@Update("UPDATE bulletin_board_files SET file_name = #{newFileName}, "
			+ "file_type = #{fileType}, size = #{fileSize} WHERE file_name = #{oldFileName}")
	public int updateFileByFileName(String oldFileName, String newFileName, String fileType, Long fileSize);

	@Delete("DELETE FROM bulletin_board_files WHERE file_name = #{fileName}")
	@ResultMap("FileDataResult")
	public File deleteFileByFileName(String fileName);

}
