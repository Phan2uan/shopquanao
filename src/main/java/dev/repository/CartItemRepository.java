package dev.repository;

import dev.model.CartItem;
import dev.model.User;
import dev.model.Product;  // ✅ THÊM DÒNG NÀY
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
    List<CartItem> findByUser(User user);
    Optional<CartItem> findByUserAndProduct(User user, Product product);
    void deleteByUser(User user);
}