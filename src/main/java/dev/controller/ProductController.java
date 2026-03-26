package dev.controller;

import dev.model.Product;
import dev.model.User;
import dev.repository.UserRepository;
import dev.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/products")
@CrossOrigin(origins = "*")
public class ProductController {

    @Autowired
    private ProductService productService;

    @Autowired
    private UserRepository userRepository;

    // CREATE - CHỈ ADMIN
    @PostMapping
    public Product add(@RequestBody Product product,
                       @RequestHeader(value = "Authorization", required = true) String authHeader) {
        String token = extractToken(authHeader);
        if (!isAdmin(token)) {
            throw new RuntimeException("Chỉ Admin mới được thêm sản phẩm!");
        }
        return productService.add(product);
    }

    // DELETE - CHỈ ADMIN
    @DeleteMapping("/{id}")
    public Product delete(@PathVariable Long id,
                          @RequestHeader(value = "Authorization", required = true) String authHeader) {
        String token = extractToken(authHeader);
        if (!isAdmin(token)) {
            throw new RuntimeException("Chỉ Admin mới được xóa sản phẩm!");
        }
        return productService.delete(id);
    }

    // UPDATE - CHỈ ADMIN
    @PutMapping("/{id}")
    public Product update(@PathVariable Long id,
                          @RequestBody Product product,
                          @RequestHeader(value = "Authorization", required = true) String authHeader) {
        String token = extractToken(authHeader);
        if (!isAdmin(token)) {
            throw new RuntimeException("Chỉ Admin mới được sửa sản phẩm!");
        }
        return productService.update(id, product);
    }

    // GET BY ID & GET ALL + FILTER - AI CŨNG ĐƯỢC
    @GetMapping("/{id}")
    public Product getById(@PathVariable Long id) {
        return productService.getById(id);
    }

    @GetMapping
    public List<Product> getAll(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice) {
        if (name != null || minPrice != null || maxPrice != null) {
            return productService.filter(name, minPrice, maxPrice);
        }
        return productService.getAll();
    }

    private boolean isAdmin(String token) {
        if (token == null || token.isEmpty()) {
            return false;
        }
        Optional<User> user = userRepository.findByToken(token);
        return user.isPresent() && "ADMIN".equals(user.get().getRole());
    }

    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return authHeader;
    }
}