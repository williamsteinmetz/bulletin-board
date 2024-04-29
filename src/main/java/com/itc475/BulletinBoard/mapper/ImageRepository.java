package com.itc475.BulletinBoard.mapper;

import org.apache.ibatis.annotations.*;
import java.util.List;
import com.itc475.BulletinBoard.domain.Image;

@Mapper
public interface ImageRepository {
    @Select("SELECT * FROM bulletin_board_files")
    @Results(id = "FileDataResult", value = {
            @Result(column = "id", property = "id"),
            @Result(column = "file_name", property = "fileName"),
            @Result(column = "file_type", property = "fileType"),
            @Result(column = "file_size", property = "fileSize"),
            @Result(column = "image_data", property = "imageData"),
            @Result(column = "width", property = "width"),
            @Result(column = "height", property = "height"),
            @Result(column = "uploaded_at", property = "uploadedAt")
    })
    List<Image> getAllFiles();

    @Select("SELECT * FROM bulletin_board_files WHERE id = #{id}")
    @Results(id = "fileById", value = {
            @Result(column = "id", property = "id"),
            @Result(column = "file_name", property = "fileName"),
            @Result(column = "file_type", property = "fileType"),
            @Result(column = "file_size", property = "fileSize"),
            @Result(column = "image_data", property = "imageData"),
            @Result(column = "width", property = "width"),
            @Result(column = "height", property = "height"),
            @Result(column = "uploaded_at", property = "uploadedAt")
    })
    Image getFileById(Integer id);

    @Insert("INSERT INTO bulletin_board_files (file_name, file_type, file_size, image_data, width, height) " +
            "VALUES (#{fileName}, #{fileType}, #{fileSize}, #{imageData}, #{width}, #{height})")
    public int insertFile(Image file);

    @Update("UPDATE bulletin_board_files SET file_name = #{image.fileName}, " +
            "file_type = #{image.fileType}, file_size = #{image.fileSize}, " +
            "image_data = #{image.imageData}, width = #{image.width}, height = #{image.height} " +
            "WHERE id = #{id}")
    public int updateFileById(Integer id, Image image);
    
    @Update("UPDATE images SET file_name = #{fileName}, file_type = #{fileType}, file_size = #{fileSize}, image_data = #{imageData}, width = #{width}, height = #{height} WHERE id = #{id}")
    void save(Image image);;

    @Delete("DELETE FROM images WHERE id = #{id}")
    void deleteFileByFileId(Integer id);

}
