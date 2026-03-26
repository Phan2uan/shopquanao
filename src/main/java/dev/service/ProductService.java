package dev.service;

import dev.model.Product;
import dev.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository repository;

    public Product add(Product product) {
        product.setCreatedAt(new Date());
        return repository.save(product);
    }

    public Product getById(Long id) {
        Product product = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        if (product.getDeletedAt() != null) {
            throw new RuntimeException("Product has been deleted");
        }

        return product;
    }

    public Product delete(Long id) {
        Product product = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        product.setDeletedAt(new Date());
        return repository.save(product);
    }

    public Product update(Long id, Product newProduct) {
        Product old = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        old.setName(newProduct.getName());
        old.setType(newProduct.getType());
        old.setPrice(newProduct.getPrice());
        old.setQuantity(newProduct.getQuantity());
        old.setSize(newProduct.getSize());
        old.setColor(newProduct.getColor());
        old.setUpdatedAt(new Date());

        return repository.save(old);
    }

    public List<Product> filter(String name, Double min, Double max) {
        List<Product> list = repository.findAll();

        // Lọc bỏ sản phẩm đã xóa
        list = list.stream()
                .filter(p -> p.getDeletedAt() == null)
                .collect(Collectors.toList());

        // Lọc theo tên (contains, không phân biệt hoa thường)
        if (name != null && !name.trim().isEmpty()) {
            list = list.stream()
                    .filter(p -> p.getName() != null &&
                            p.getName().toLowerCase().contains(name.toLowerCase()))
                    .collect(Collectors.toList());
        }

        // Lọc theo giá
        if (min != null) {
            list = list.stream()
                    .filter(p -> p.getPrice() >= min)
                    .collect(Collectors.toList());
        }

        if (max != null) {
            list = list.stream()
                    .filter(p -> p.getPrice() <= max)
                    .collect(Collectors.toList());
        }

        return list;
    }

    public List<Product> getAll() {
        return repository.findAll().stream()
                .filter(p -> p.getDeletedAt() == null)
                .collect(Collectors.toList());
    }
    // Thêm phương thức này vào ProductService.java
    public boolean checkStock(Long productId, int quantity) {
        try {
            Product product = getById(productId);
            return product.getQuantity() >= quantity;
        } catch (Exception e) {
            return false;
        }
    }
}
