package dev.service;

import dev.dto.RegisterRequest;
import dev.model.User;
import dev.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.sql.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public Map<String, Object> register(RegisterRequest request) {
        Map<String, Object> response = new HashMap<>();

        // Kiểm tra username đã tồn tại chưa
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            response.put("status", "error");
            response.put("message", "User already exists");
            return response;
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());

        if (request.getBirthDate() != null) {
            user.setBirthDate(Date.valueOf(request.getBirthDate()));
        }

        user.setGender(request.getGender());
        user.setRole("USER");        // ✅ Mặc định USER khi đăng ký
        userRepository.save(user);

        response.put("status", "success");
        response.put("message", "Register success");
        return response;
    }

    public Map<String, Object> login(String username, String password) {
        Map<String, Object> response = new HashMap<>();

        User user = userRepository.findByUsername(username)
                .orElse(null);

        if (user == null) {
            response.put("status", "error");
            response.put("message", "User not found");
            return response;
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            response.put("status", "error");
            response.put("message", "Wrong password");
            return response;
        }

        // Tạo token tạm thời (sau này có thể thay bằng JWT)
        String token = java.util.UUID.randomUUID().toString();
        user.setToken(token);
        userRepository.save(user);

        response.put("status", "success");
        response.put("message", "Login success");
        response.put("token", token);
        response.put("username", user.getUsername());
        response.put("name", user.getName());
        response.put("role", user.getRole());   // ✅ Trả role về frontend

        return response;
    }
}