package dev.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity // 👈 thay cho @Document
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 👈 auto id
    private Long id;

    private String username;
    private String password;

    private String name;
    private Date birthDate;
    private String gender;

    private String token;
}