package dev.service;

import dev.model.Product;
import dev.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;

@Service
public class ProductService {

    @Autowired
    private ProductRepository repository;

    public Product add(Product product) {
        product.setCreatedAt(new Date()); // 👈 thêm dòng này
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

        return repository.save(product); // 👈 trả về product
    }

    public Product update(Long id, Product newProduct) {
        Product old = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));

        old.setName(newProduct.getName());
        old.setType(newProduct.getType());
        old.setPrice(newProduct.getPrice());
        old.setQuantity(newProduct.getQuantity());
        old.setSize(newProduct.getSize());     // 👈 thêm
        old.setColor(newProduct.getColor());   // 👈 thêm

        old.setUpdatedAt(new Date()); // 👈 QUAN TRỌNG

        return repository.save(old);
    }

    public List<Product> filter(String name, Double min, Double max) {
        List<Product> list = repository.findAll();
// 👇 thêm đoạn này NGAY SAU findAll()
        list = list.stream()
                .filter(p -> p.getDeletedAt() == null)
                .toList();

        if (name != null) {
            list = list.stream()
                    .filter(p -> p.getName().toLowerCase().contains(name.toLowerCase()))
                    .toList();
        }

        if (min != null && max != null) {
            list = list.stream()
                    .filter(p -> p.getPrice() >= min && p.getPrice() <= max)
                    .toList();
        }

        return list;
    }
}