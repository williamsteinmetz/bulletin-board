package com.itc475.BulletinBoard.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.*;
import org.apache.ibatis.annotations.Select;

import com.itc475.BulletinBoard.domain.File;

@Mapper
public interface FileRepository {
	@Select("SELECT * FROM bulletin_board_files")
	@Results(id="FileDataResult", value= {
			@Result(column="name",property="fileName"),
			@Result(column="file_path",property="filePath")
	})
	public List<File> findAll();
	
	@Select("SELECT * FROM bulletin_board_files WHERE file_name = #{fileName}")
	@ResultMap("FileDataResult")
	public File getFileByFileName(String fileName);
	
}
