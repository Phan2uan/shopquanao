package dev.controller;

import dev.dto.LoginRequest;
import dev.dto.RegisterRequest;
import dev.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // ✅ Sửa: gửi nguyên request object, không phải từng trường
        return ResponseEntity.ok(
                authService.register(request)  // Chỉ cần gửi request
        );
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(
                authService.login(request.getUsername(), request.getPassword())
        );
    }

    @GetMapping("/test")
    public String test() {
        return "API is working";
    }
}