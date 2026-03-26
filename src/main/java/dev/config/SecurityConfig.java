package dev.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Configuration
public class SecurityConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configure(http)) // ✅ Nên thêm
                .authorizeHttpRequests(auth -> auth
                        // Cho phép truy cập static resources
                        .requestMatchers("/", "/index.html", "/style.css", "/app.js", "/static/**").permitAll()
                        // Cho phép auth API
                        .requestMatchers("/auth/**").permitAll()
                        // Cho phép products API (tạm thời)
                        .requestMatchers("/products/**").permitAll()
                        .anyRequest().permitAll()
                );

        return http.build();
    }
}