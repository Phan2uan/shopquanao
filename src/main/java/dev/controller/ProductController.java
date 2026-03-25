package dev.controller;

import dev.model.Product;
import dev.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/products")
public class ProductController {

    @Autowired
    private ProductService productService;

    // CREATE
    @PostMapping
    public Product add(@RequestBody Product product) {
        return productService.add(product);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public Product delete(@PathVariable Long id) { // 👈 String → Long
        return productService.delete(id);
    }

    // UPDATE
    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @RequestBody Product product) { // 👈 sửa
        return productService.update(id, product);
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Product getById(@PathVariable Long id) { // 👈 sửa
        return productService.getById(id);
    }

    // GET ALL + FILTER
    @GetMapping
    public List<Product> getAll(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice
    ) {
        return productService.filter(name, minPrice, maxPrice);
    }
}