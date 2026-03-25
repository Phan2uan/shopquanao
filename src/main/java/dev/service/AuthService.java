package dev.service;

import dev.dto.RegisterRequest;  // ✅ Thêm import
import dev.model.User;
import dev.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Date;  // ✅ Thêm import cho Date
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    // ✅ Sửa method này
    public Object register(RegisterRequest request) {

        // Kiểm tra username đã tồn tại chưa
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            return Map.of(
                    "status", "error",
                    "message", "User already exists"
            );
        }

        User user = new User();

        // ✅ Set đầy đủ các trường
        user.setUsername(request.getUsername());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());

        // Chuyển đổi LocalDate sang Date
        if (request.getBirthDate() != null) {
            user.setBirthDate(Date.valueOf(request.getBirthDate()));
        }

        user.setGender(request.getGender());

        userRepository.save(user);

        return Map.of(
                "status", "success",
                "message", "Register success"
        );
    }

    public Object login(String username, String password) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            return Map.of(
                    "status", "error",
                    "message", "Wrong password"
            );
        }

        return Map.of(
                "status", "success",
                "message", "Login success"
        );
    }
}