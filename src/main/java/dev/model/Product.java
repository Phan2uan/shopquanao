package dev.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Entity // 👈 thay cho @Document
@Table(name = "products") // 👈 tên bảng
@Data
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 👈 auto tăng id
    private Long id;

    private String name;
    private String type;
    private double price;
    private int quantity;

    private String size;
    private String color;

    private Date createdAt;
    private Date updatedAt;
    private Date deletedAt;
}