const API_BASE_URL = 'http://localhost:8080';

function getCurrentRole() {
    return localStorage.getItem('role') || 'USER';
}

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// DOM Elements
const showRegisterBtn = document.getElementById('showRegisterBtn');
const showLoginBtn = document.getElementById('showLoginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const registerModal = document.getElementById('registerModal');
const loginModal = document.getElementById('loginModal');
const closeRegisterModal = document.getElementById('closeRegisterModal');
const closeLoginModal = document.getElementById('closeLoginModal');
const submitRegisterBtn = document.getElementById('submitRegisterBtn');
const submitLoginBtn = document.getElementById('submitLoginBtn');

const addProductBtn = document.getElementById('addProductBtn');
const filterBtn = document.getElementById('filterBtn');
const resetFilterBtn = document.getElementById('resetFilterBtn');

// Modal Edit Product
const editModal = document.getElementById('editModal');
const closeEditModal = document.getElementById('closeEditModal');
const submitEditBtn = document.getElementById('submitEditBtn');

const editProductId = document.getElementById('editProductId');
const editProductName = document.getElementById('editProductName');
const editProductType = document.getElementById('editProductType');
const editProductPrice = document.getElementById('editProductPrice');
const editProductQuantity = document.getElementById('editProductQuantity');
const editProductSize = document.getElementById('editProductSize');
const editProductColor = document.getElementById('editProductColor');

// ========== TOAST NOTIFICATION ==========
function showMessage(message, isError = false) {
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 9999;
        `;
        document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    const bgColor = isError ? '#f56565' : '#48bb78';
    const icon = isError ? '❌' : '✅';

    toast.style.cssText = `
        background: ${bgColor};
        color: white;
        padding: 12px 24px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease;
        font-weight: 500;
        min-width: 250px;
        text-align: center;
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    toast.innerHTML = `${icon} ${message}`;

    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Thêm CSS animation cho toast
const toastStyle = document.createElement('style');
toastStyle.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(toastStyle);

// ========== CẬP NHẬT GIAO DIỆN THEO ROLE ==========
function updateUIByRole() {
    const role = getCurrentRole();
    const shopTitle = document.getElementById('shopTitle');
    const addProductForm = document.getElementById('addProductForm');
    const viewCartBtn = document.getElementById('viewCartBtn');

    if (role === 'ADMIN') {
        // ADMIN: Đổi tên shop, HIỂN form thêm sản phẩm
        if (shopTitle) shopTitle.innerHTML = '🏪 Quản lý Cửa hàng';
        if (addProductForm) addProductForm.style.display = 'block';
        if (viewCartBtn) viewCartBtn.style.display = 'none';
    } else {
        // USER hoặc chưa đăng nhập: ẨN form thêm sản phẩm, hiển thị Phan2uanShop
        if (shopTitle) shopTitle.innerHTML = '🛍️ Phan2uanShop';
        if (addProductForm) addProductForm.style.display = 'none';

        const token = localStorage.getItem('token');
        if (token && role === 'USER') {
            if (viewCartBtn) viewCartBtn.style.display = 'inline-block';
        } else {
            if (viewCartBtn) viewCartBtn.style.display = 'none';
        }
    }
}

// Load sản phẩm
async function loadProducts() {
    try {
        const name = document.getElementById('filterName').value;
        const minPrice = document.getElementById('filterMinPrice').value;
        const maxPrice = document.getElementById('filterMaxPrice').value;

        let url = `${API_BASE_URL}/products`;
        const params = [];
        if (name) params.push(`name=${encodeURIComponent(name)}`);
        if (minPrice) params.push(`minPrice=${minPrice}`);
        if (maxPrice) params.push(`maxPrice=${maxPrice}`);
        if (params.length) url += `?${params.join('&')}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const products = await response.json();

        const container = document.getElementById('productsContainer');
        if (!products || products.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px;">📭 Không có sản phẩm nào</p>';
            return;
        }

        const role = getCurrentRole();

        container.innerHTML = products.map(p => {
            let actionButtons = '';
            if (role === 'ADMIN') {
                actionButtons = `
                    <div style="margin-top: 10px; display: flex; gap: 10px;">
                        <button onclick="editProduct(${p.id})" style="flex: 1; padding: 8px; background: #ed8936; color: white; border: none; border-radius: 6px; cursor: pointer;">✏️ Sửa</button>
                        <button onclick="deleteProduct(${p.id})" style="flex: 1; padding: 8px; background: #f56565; color: white; border: none; border-radius: 6px; cursor: pointer;">🗑️ Xóa</button>
                    </div>`;
            } else {
                actionButtons = `
                    <div style="margin-top: 10px;">
                        <button onclick="addToCart(${p.id})" style="width: 100%; padding: 10px; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">🛒 Thêm vào giỏ</button>
                    </div>`;
            }

            return `
                <div class="product-card" style="background: white; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); transition: all 0.3s; position: relative; overflow: hidden;">
                    <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #667eea, #764ba2);"></div>
                    <h3 style="margin: 0 0 10px 0; font-size: 18px; color: #2d3748;">${p.name}</h3>
                    <div style="font-size: 24px; font-weight: bold; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin: 10px 0;">${p.price.toLocaleString()}₫</div>
                    <div style="padding: 8px 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; margin: 10px 0;">
                        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                            <span>📦 Loại:</span>
                            <span>${p.type || 'N/A'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                            <span>📊 Số lượng:</span>
                            <span>${p.quantity}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                            <span>📏 Size:</span>
                            <span>${p.size || 'N/A'}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                            <span>🎨 Màu:</span>
                            <span>${p.color || 'N/A'}</span>
                        </div>
                    </div>
                    ${actionButtons}
                </div>`;
        }).join('');

        // Hiệu ứng hover cho product card
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-5px)';
                card.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
                card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
            });
        });

    } catch (error) {
        console.error('Error:', error);
        const container = document.getElementById('productsContainer');
        container.innerHTML = `<p style="color: red; text-align: center; padding: 40px;">❌ Lỗi tải sản phẩm: ${error.message}</p>`;
        showMessage('Lỗi tải sản phẩm: ' + error.message, true);
    }
}

// Thêm sản phẩm - Chỉ Admin
async function addProduct() {
    const product = {
        name: document.getElementById('productName').value,
        type: document.getElementById('productType').value,
        price: parseFloat(document.getElementById('productPrice').value),
        quantity: parseInt(document.getElementById('productQuantity').value),
        size: document.getElementById('productSize').value,
        color: document.getElementById('productColor').value
    };

    if (!product.name || !product.type || !product.price || !product.quantity) {
        showMessage('Vui lòng điền đầy đủ thông tin', true);
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        showMessage('Bạn cần đăng nhập trước!', true);
        return;
    }

    const addBtn = document.getElementById('addProductBtn');
    const originalText = addBtn.innerHTML;
    addBtn.innerHTML = 'Đang thêm...';
    addBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/products`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(product)
        });

        if (response.ok) {
            showMessage('Thêm sản phẩm thành công!');
            document.getElementById('productName').value = '';
            document.getElementById('productType').value = '';
            document.getElementById('productPrice').value = '';
            document.getElementById('productQuantity').value = '';
            document.getElementById('productSize').value = '';
            document.getElementById('productColor').value = '';
            loadProducts();
        } else {
            const errorText = await response.text();
            showMessage('Lỗi: ' + errorText, true);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Lỗi kết nối khi thêm sản phẩm', true);
    } finally {
        addBtn.innerHTML = originalText;
        addBtn.disabled = false;
    }
}

// Xóa sản phẩm - Chỉ Admin
window.deleteProduct = async (id) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

    const token = localStorage.getItem('token');
    if (!token) {
        showMessage('Bạn cần đăng nhập trước!', true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            showMessage('Xóa sản phẩm thành công!');
            loadProducts();
        } else {
            const errorText = await response.text();
            showMessage('Lỗi: ' + errorText, true);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Lỗi kết nối khi xóa sản phẩm', true);
    }
};

// Sửa sản phẩm - Mở modal edit
window.editProduct = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
        showMessage('Bạn cần đăng nhập trước!', true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`);

        if (!response.ok) {
            showMessage('Không thể tải thông tin sản phẩm', true);
            return;
        }

        const product = await response.json();

        editProductId.value = product.id;
        editProductName.value = product.name || '';
        editProductType.value = product.type || '';
        editProductPrice.value = product.price || '';
        editProductQuantity.value = product.quantity || '';
        editProductSize.value = product.size || '';
        editProductColor.value = product.color || '';

        editModal.style.display = 'block';

    } catch (error) {
        console.error('Error loading product:', error);
        showMessage('Lỗi kết nối hoặc server khi tải sản phẩm', true);
    }
};

// Filter
function filterProducts() {
    loadProducts();
}

function resetFilter() {
    document.getElementById('filterName').value = '';
    document.getElementById('filterMinPrice').value = '';
    document.getElementById('filterMaxPrice').value = '';
    loadProducts();
}

// ========== AUTH ==========
showRegisterBtn.onclick = () => registerModal.style.display = 'block';
showLoginBtn.onclick = () => loginModal.style.display = 'block';

closeRegisterModal.onclick = () => registerModal.style.display = 'none';
closeLoginModal.onclick = () => loginModal.style.display = 'none';

window.onclick = (event) => {
    if (event.target === registerModal) registerModal.style.display = 'none';
    if (event.target === loginModal) loginModal.style.display = 'none';
    if (event.target === editModal) editModal.style.display = 'none';
};

// Đăng ký (CÓ EMAIL VÀ XÁC NHẬN MẬT KHẨU)
submitRegisterBtn.onclick = async () => {
    const username = document.getElementById('regUsername').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    const name = document.getElementById('regName').value;
    const birthDate = document.getElementById('regBirthDate').value;
    const gender = document.getElementById('regGender').value;

    if (!username || !email || !password || !confirmPassword || !name) {
        showMessage('Vui lòng điền đầy đủ thông tin (*)', true);
        return;
    }

    if (password !== confirmPassword) {
        showMessage('Mật khẩu xác nhận không khớp!', true);
        return;
    }

    if (!email.includes('@') || !email.includes('.')) {
        showMessage('Email không hợp lệ!', true);
        return;
    }

    const registerBtn = submitRegisterBtn;
    const originalText = registerBtn.innerHTML;
    registerBtn.innerHTML = 'Đang đăng ký...';
    registerBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, name, birthDate, gender })
        });

        const result = await response.json();

        if (result.status === 'success') {
            showMessage('Đăng ký thành công! Vui lòng đăng nhập');
            registerModal.style.display = 'none';

            document.getElementById('regUsername').value = '';
            document.getElementById('regEmail').value = '';
            document.getElementById('regPassword').value = '';
            document.getElementById('regConfirmPassword').value = '';
            document.getElementById('regName').value = '';
            document.getElementById('regBirthDate').value = '';
            document.getElementById('regGender').value = '';

            loginModal.style.display = 'block';
        } else {
            showMessage(result.message, true);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Lỗi kết nối', true);
    } finally {
        registerBtn.innerHTML = originalText;
        registerBtn.disabled = false;
    }
};

// Đăng nhập
submitLoginBtn.onclick = async () => {
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    if (!username || !password) {
        showMessage('Vui lòng nhập tên đăng nhập và mật khẩu', true);
        return;
    }

    const loginBtn = submitLoginBtn;
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = 'Đang đăng nhập...';
    loginBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (result.status === 'success') {
            showMessage('Đăng nhập thành công!');
            loginModal.style.display = 'none';

            showRegisterBtn.style.display = 'none';
            showLoginBtn.style.display = 'none';
            logoutBtn.style.display = 'inline-block';

            if (result.token) localStorage.setItem('token', result.token);
            localStorage.setItem('username', result.username);
            localStorage.setItem('role', result.role || 'USER');

            // Cập nhật giao diện theo role
            updateUIByRole();

            // Thêm nút giỏ hàng nếu là USER
            if (result.role === 'USER') {
                addCartButton();
            }

            loadProducts();
        } else {
            showMessage(result.message, true);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Lỗi kết nối', true);
    } finally {
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    }
};

// Đăng xuất
logoutBtn.onclick = () => {
    localStorage.removeItem('role');
    localStorage.removeItem('token');
    localStorage.removeItem('username');

    showRegisterBtn.style.display = 'inline-block';
    showLoginBtn.style.display = 'inline-block';
    logoutBtn.style.display = 'none';

    // Reset giao diện về mặc định (USER)
    const shopTitle = document.getElementById('shopTitle');
    const addProductForm = document.getElementById('addProductForm');

    if (shopTitle) shopTitle.innerHTML = '🛍️ Phan2uanShop';
    if (addProductForm) addProductForm.style.display = 'none';

    // Xóa nút giỏ hàng
    const cartBtn = document.getElementById('viewCartBtn');
    if (cartBtn) cartBtn.remove();

    showMessage('Đã đăng xuất');
    loadProducts();
};

// Kiểm tra trạng thái đăng nhập
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    const role = getCurrentRole();
    const addProductForm = document.getElementById('addProductForm');
    const shopTitle = document.getElementById('shopTitle');

    if (token) {
        showRegisterBtn.style.display = 'none';
        showLoginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';

        // Cập nhật giao diện theo role
        updateUIByRole();

        // Thêm nút giỏ hàng nếu là USER
        if (role === 'USER') {
            addCartButton();
        }
    } else {
        // Chưa đăng nhập
        showRegisterBtn.style.display = 'inline-block';
        showLoginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';

        if (shopTitle) shopTitle.innerHTML = '🛍️ Phan2uanShop';
        if (addProductForm) addProductForm.style.display = 'none';

        const cartBtn = document.getElementById('viewCartBtn');
        if (cartBtn) cartBtn.remove();
    }
}

// ========== CART MODAL ==========
const cartModal = document.createElement('div');
cartModal.id = 'cartModal';
cartModal.className = 'modal';
cartModal.innerHTML = `
    <div class="modal-content" style="max-width: 600px;">
        <h2>🛒 Giỏ hàng của bạn</h2>
        <div id="cartItemsContainer"></div>
        <div id="cartTotal" style="font-size: 20px; font-weight: bold; margin-top: 15px; padding-top: 15px; border-top: 2px solid #e0e0e0;"></div>
        <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button id="checkoutBtn" class="btn btn-success" style="flex: 1;">💰 Thanh toán</button>
            <button id="closeCartModal" class="btn" style="flex: 1; background: #ccc;">Đóng</button>
        </div>
    </div>
`;
document.body.appendChild(cartModal);

const closeCartModal = document.getElementById('closeCartModal');
const checkoutBtn = document.getElementById('checkoutBtn');

function openCart() {
    loadCart();
    cartModal.style.display = 'block';
}

if (closeCartModal) {
    closeCartModal.onclick = () => {
        cartModal.style.display = 'none';
    };
}

async function loadCart() {
    const token = localStorage.getItem('token');
    if (!token) {
        showMessage('Vui lòng đăng nhập để xem giỏ hàng', true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart`, {
            headers: getAuthHeaders()
        });

        if (!response.ok) {
            throw new Error('Không thể tải giỏ hàng');
        }

        const cartItems = await response.json();
        const container = document.getElementById('cartItemsContainer');

        if (!cartItems || cartItems.length === 0) {
            container.innerHTML = '<p style="text-align: center; padding: 40px;">🛍️ Giỏ hàng trống</p>';
            document.getElementById('cartTotal').innerHTML = '';
            return;
        }

        let total = 0;
        container.innerHTML = cartItems.map(item => {
            const itemTotal = item.product.price * item.quantity;
            total += itemTotal;
            return `
                <div style="border: 1px solid #e0e0e0; padding: 15px; margin-bottom: 10px; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 2;">
                            <h3 style="margin: 0;">${item.product.name}</h3>
                            <div style="color: #718096; font-size: 14px;">${item.product.price.toLocaleString()}₫</div>
                        </div>
                        <div style="flex: 1; text-align: center;">
                            <button onclick="updateCartItem(${item.id}, ${item.quantity - 1})" style="padding: 5px 10px; background: #f56565; color: white; border: none; border-radius: 5px; cursor: pointer;">-</button>
                            <span style="margin: 0 10px; font-weight: bold;">${item.quantity}</span>
                            <button onclick="updateCartItem(${item.id}, ${item.quantity + 1})" style="padding: 5px 10px; background: #48bb78; color: white; border: none; border-radius: 5px; cursor: pointer;">+</button>
                        </div>
                        <div style="flex: 1; text-align: right;">
                            <div style="font-weight: bold; color: #667eea;">${itemTotal.toLocaleString()}₫</div>
                            <button onclick="removeFromCart(${item.id})" style="margin-top: 5px; padding: 5px 10px; background: #f56565; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">Xóa</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('cartTotal').innerHTML = `Tổng tiền: ${total.toLocaleString()}₫`;

    } catch (error) {
        console.error('Error:', error);
        showMessage('Lỗi tải giỏ hàng: ' + error.message, true);
    }
}

window.updateCartItem = async (cartItemId, newQuantity) => {
    if (newQuantity < 0) return;

    try {
        const response = await fetch(`${API_BASE_URL}/cart/update/${cartItemId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ quantity: newQuantity })
        });

        if (response.ok) {
            loadCart();
        } else {
            const error = await response.text();
            showMessage(error, true);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Lỗi cập nhật giỏ hàng', true);
    }
};

window.removeFromCart = async (cartItemId) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/cart/remove/${cartItemId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            showMessage('Đã xóa khỏi giỏ hàng');
            loadCart();
            loadProducts();
        } else {
            const error = await response.text();
            showMessage(error, true);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Lỗi xóa sản phẩm', true);
    }
};

if (checkoutBtn) {
    checkoutBtn.onclick = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/checkout`, {
                method: 'POST',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const message = await response.text();
                showMessage(message);
                cartModal.style.display = 'none';
                loadProducts();
            } else {
                const error = await response.text();
                showMessage(error, true);
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Lỗi thanh toán', true);
        }
    };
}

// Thêm vào giỏ
window.addToCart = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
        showMessage('Vui lòng đăng nhập trước khi thêm vào giỏ!', true);
        return;
    }

    const buttons = document.querySelectorAll(`button[onclick="addToCart(${id})"]`);
    const btn = buttons[0];
    const originalText = btn.innerHTML;
    btn.innerHTML = '🔄 Đang thêm...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ productId: id })
        });

        if (response.ok) {
            showMessage('✅ Đã thêm vào giỏ hàng!');

            const cartBtn = document.getElementById('viewCartBtn');
            if (cartBtn) {
                cartBtn.style.transform = 'scale(1.1)';
                setTimeout(() => {
                    cartBtn.style.transform = 'scale(1)';
                }, 200);
            }
        } else {
            const error = await response.text();
            showMessage('❌ ' + error, true);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('❌ Lỗi kết nối', true);
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
};

// Thêm nút xem giỏ hàng vào header (CHỈ USER)
function addCartButton() {
    const headerDiv = document.querySelector('.header div');
    const role = getCurrentRole();
    const existingBtn = document.getElementById('viewCartBtn');

    if (headerDiv && !existingBtn && role === 'USER') {
        const viewCartBtn = document.createElement('button');
        viewCartBtn.id = 'viewCartBtn';
        viewCartBtn.className = 'btn btn-primary';
        viewCartBtn.innerHTML = '🛒 Giỏ hàng';
        viewCartBtn.style.marginLeft = '10px';
        viewCartBtn.style.transition = 'transform 0.2s';
        viewCartBtn.onclick = openCart;
        headerDiv.appendChild(viewCartBtn);
    }
}

// ========== EDIT PRODUCT SUBMIT ==========
submitEditBtn.onclick = async () => {
    const id = editProductId.value;
    const updatedProduct = {
        name: editProductName.value,
        type: editProductType.value,
        price: parseFloat(editProductPrice.value),
        quantity: parseInt(editProductQuantity.value),
        size: editProductSize.value,
        color: editProductColor.value
    };

    if (!updatedProduct.name || !updatedProduct.price || !updatedProduct.quantity) {
        showMessage('Vui lòng điền đầy đủ thông tin bắt buộc', true);
        return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
        showMessage('Bạn cần đăng nhập trước!', true);
        return;
    }

    const editBtn = submitEditBtn;
    const originalText = editBtn.innerHTML;
    editBtn.innerHTML = 'Đang cập nhật...';
    editBtn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updatedProduct)
        });

        if (response.ok) {
            showMessage('Cập nhật sản phẩm thành công!');
            editModal.style.display = 'none';
            loadProducts();
        } else {
            const errorText = await response.text();
            showMessage('Lỗi: ' + (errorText || 'Không thể cập nhật'), true);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Lỗi kết nối khi cập nhật', true);
    } finally {
        editBtn.innerHTML = originalText;
        editBtn.disabled = false;
    }
};

closeEditModal.onclick = () => {
    editModal.style.display = 'none';
};

// Event listeners
if (addProductBtn) addProductBtn.addEventListener('click', addProduct);
if (filterBtn) filterBtn.addEventListener('click', filterProducts);
if (resetFilterBtn) resetFilterBtn.addEventListener('click', resetFilter);

// Khởi tạo
checkAuthStatus();
loadProducts();