package dev.controller;

import dev.model.CartItem;
import dev.model.User;
import dev.repository.UserRepository;
import dev.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private UserRepository userRepository;

    // Thêm vào giỏ
    @PostMapping("/add")
    public CartItem addToCart(@RequestBody Map<String, Long> request,
                              @RequestHeader(value = "Authorization", required = true) String authHeader) {
        String token = extractToken(authHeader);
        User user = getUserByToken(token);
        Long productId = request.get("productId");
        return cartService.addToCart(user, productId);
    }

    // Xóa khỏi giỏ
    @DeleteMapping("/remove/{cartItemId}")
    public String removeFromCart(@PathVariable Long cartItemId,
                                 @RequestHeader(value = "Authorization", required = true) String authHeader) {
        String token = extractToken(authHeader);
        User user = getUserByToken(token);
        cartService.removeFromCart(cartItemId, user);
        return "Đã xóa khỏi giỏ hàng";
    }

    // Cập nhật số lượng
    @PutMapping("/update/{cartItemId}")
    public CartItem updateQuantity(@PathVariable Long cartItemId,
                                   @RequestBody Map<String, Integer> request,
                                   @RequestHeader(value = "Authorization", required = true) String authHeader) {
        String token = extractToken(authHeader);
        User user = getUserByToken(token);
        int quantity = request.get("quantity");
        return cartService.updateQuantity(cartItemId, user, quantity);
    }

    // Xem giỏ hàng
    @GetMapping
    public List<CartItem> getCart(@RequestHeader(value = "Authorization", required = true) String authHeader) {
        String token = extractToken(authHeader);
        User user = getUserByToken(token);
        return cartService.getCart(user);
    }

    // Thanh toán
    @PostMapping("/checkout")
    public String checkout(@RequestHeader(value = "Authorization", required = true) String authHeader) {
        String token = extractToken(authHeader);
        User user = getUserByToken(token);
        return cartService.checkout(user);
    }

    private User getUserByToken(String token) {
        return userRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private String extractToken(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return authHeader;
    }
}