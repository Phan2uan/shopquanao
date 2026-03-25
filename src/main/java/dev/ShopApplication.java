package dev;

import dev.model.Product;
import dev.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

import java.util.Date;

@SpringBootApplication
public class ShopApplication {

    public static void main(String[] args) {
        SpringApplication.run(ShopApplication.class, args);
    }

    @Bean
    public CommandLineRunner initData(ProductRepository repository) {
        return args -> {
            // Thêm 10 bản ghi
            for (int i = 1; i <= 10; i++) {
                Product p = new Product();
                p.setName("Áo " + i);
                p.setType("shirt");
                p.setSize("M");
                p.setColor("đen");
                p.setPrice(100000 + i * 10000);
                p.setQuantity(10 + i);
                p.setCreatedAt(new Date());

                repository.save(p);
                System.out.println("✅ Đã thêm: " + p.getName());
            }

            // In ra terminal
            System.out.println("\n===== DANH SÁCH SẢN PHẨM =====");
            repository.findAll().forEach(System.out::println);
        };
    }
}