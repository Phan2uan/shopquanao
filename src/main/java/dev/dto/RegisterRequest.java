package dev.dto;

import lombok.Data;
import java.time.LocalDate;  // ✅ Thêm import

@Data
public class RegisterRequest {
    private String username;
    private String password;
    private String name;           // ✅ Thêm
    private LocalDate birthDate;   // ✅ Thêm
    private String gender;         // ✅ Thêm
}