//package dev.dto;
//
//public class LoginRequest {
//
//    private String username;
//    private String password;
//
//    // ✅ getter
//    public String getUsername() {
//        return username;
//    }
//
//    public String getPassword() {
//        return password;
//    }
//
//    // ✅ setter
//    public void setUsername(String username) {
//        this.username = username;
//    }
//
//    public void setPassword(String password) {
//        this.password = password;
//    }
//}

//cách 2
package dev.dto;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}