import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@WebServlet("/LoginServlet")
public class LoginServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        PrintWriter out = response.getWriter();

        String username = request.getParameter("username");
        String password = request.getParameter("password");

        try {
            Class.forName("org.postgresql.Driver");
            Connection connection = DriverManager.getConnection("jdbc:postgresql://your_database_url/your_database_name", "username", "password");

            // Check if the username exists and is unique in the t_user table
            PreparedStatement preparedStatement = connection.prepareStatement("SELECT * FROM t_user WHERE username = ?");
            preparedStatement.setString(1, username);
            ResultSet resultSet = preparedStatement.executeQuery();

            if (resultSet.next()) {
                // Username exists, perform login
                String storedPassword = resultSet.getString("password"); // Replace with the actual column name for the password
                if (password.equals(storedPassword)) {
                    out.println("Login successful");
                } else {
                    out.println("Incorrect password");
                }
            } else {
                // Username doesn't exist, return user list
                out.println("User List:<br>");

                preparedStatement = connection.prepareStatement("SELECT uid, username, age FROM t_user");
                resultSet = preparedStatement.executeQuery();

                while (resultSet.next()) {
                    int uid = resultSet.getInt("uid");
                    String resultUsername = resultSet.getString("username");
                    int age = resultSet.getInt("age");

                    out.println("UID: " + uid + ", Username: " + resultUsername + ", Age: " + age + "<br>");
                }
            }

            connection.close();
        } catch (ClassNotFoundException | SQLException e) {
            e.printStackTrace();
        }
    }
}
