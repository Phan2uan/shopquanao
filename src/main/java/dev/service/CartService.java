package dev.service;

import dev.model.CartItem;
import dev.model.Product;
import dev.model.User;
import dev.repository.CartItemRepository;
import dev.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Date;
import java.util.List;

@Service
public class CartService {

    @Autowired
    private CartItemRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    public CartItem addToCart(User user, Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại"));

        // Kiểm tra sản phẩm đã xóa chưa
        if (product.getDeletedAt() != null) {
            throw new RuntimeException("Sản phẩm đã bị xóa");
        }

        // Kiểm tra sản phẩm đã có trong giỏ chưa
        CartItem existingItem = cartRepository.findByUserAndProduct(user, product).orElse(null);

        if (existingItem != null) {
            // Nếu đã có thì tăng số lượng
            existingItem.setQuantity(existingItem.getQuantity() + 1);
            return cartRepository.save(existingItem);
        } else {
            // Nếu chưa có thì tạo mới
            CartItem cartItem = new CartItem();
            cartItem.setUser(user);
            cartItem.setProduct(product);
            cartItem.setQuantity(1);
            cartItem.setAddedAt(new Date());
            return cartRepository.save(cartItem);
        }
    }

    public void removeFromCart(Long cartItemId, User user) {
        CartItem cartItem = cartRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm trong giỏ"));

        // Kiểm tra cart item có thuộc user này không
        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa sản phẩm này");
        }

        cartRepository.delete(cartItem);
    }

    public CartItem updateQuantity(Long cartItemId, User user, int quantity) {
        if (quantity <= 0) {
            removeFromCart(cartItemId, user);
            return null;
        }

        CartItem cartItem = cartRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm trong giỏ"));

        if (!cartItem.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền sửa sản phẩm này");
        }

        cartItem.setQuantity(quantity);
        return cartRepository.save(cartItem);
    }

    public List<CartItem> getCart(User user) {
        return cartRepository.findByUser(user);
    }

    @Transactional
    public String checkout(User user) {
        List<CartItem> cartItems = cartRepository.findByUser(user);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Giỏ hàng trống!");
        }

        double total = 0;
        StringBuilder orderSummary = new StringBuilder("Đơn hàng của bạn:\n");

        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            int quantity = item.getQuantity();
            double itemTotal = product.getPrice() * quantity;
            total += itemTotal;

            // Kiểm tra số lượng trong kho
            if (product.getQuantity() < quantity) {
                throw new RuntimeException("Sản phẩm " + product.getName() + " chỉ còn " + product.getQuantity() + " sản phẩm!");
            }

            orderSummary.append(String.format("- %s x %d = %.0fđ\n",
                    product.getName(), quantity, itemTotal));
        }

        // Trừ số lượng trong kho
        for (CartItem item : cartItems) {
            Product product = item.getProduct();
            product.setQuantity(product.getQuantity() - item.getQuantity());
            productRepository.save(product);
        }

        // Xóa giỏ hàng
        cartRepository.deleteByUser(user);

        orderSummary.append(String.format("\nTổng tiền: %.0fđ\n", total));
        orderSummary.append("✅ Thanh toán thành công! Cảm ơn bạn đã mua hàng!");

        return orderSummary.toString();
    }
}