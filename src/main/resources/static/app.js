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

// Hiển thị message
function showMessage(message, isError = false) {
    alert(message);
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
            container.innerHTML = '<p>Không có sản phẩm nào</p>';
            return;
        }

        const role = getCurrentRole();

        container.innerHTML = products.map(p => {
            let actionButtons = '';
            if (role === 'ADMIN') {
                actionButtons = `
                    <div style="margin-top: 10px;">
                        <button onclick="editProduct(${p.id})" style="margin-right: 5px; padding: 5px 10px; background: #ed8936; color: white; border: none; border-radius: 5px;">Sửa</button>
                        <button onclick="deleteProduct(${p.id})" style="padding: 5px 10px; background: #f56565; color: white; border: none; border-radius: 5px;">Xóa</button>
                    </div>`;
            } else {
                actionButtons = `
                    <div style="margin-top: 10px;">
                        <button onclick="addToCart(${p.id})" style="padding: 5px 10px; background: #48bb78; color: white; border: none; border-radius: 5px;">🛒 Thêm vào giỏ</button>
                    </div>`;
            }

            return `
                <div class="product-card">
                    <h3>${p.name}</h3>
                    <div style="font-size: 20px; color: #667eea; font-weight: bold;">${p.price.toLocaleString()}₫</div>
                    <div>📦 ${p.type} | 📊 ${p.quantity}</div>
                    <div>📏 ${p.size || 'N/A'} | 🎨 ${p.color || 'N/A'}</div>
                    ${actionButtons}
                </div>`;
        }).join('');
    } catch (error) {
        console.error('Error:', error);
        const container = document.getElementById('productsContainer');
        container.innerHTML = `<p style="color: red;">❌ Lỗi tải sản phẩm: ${error.message}</p>`;
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
            let errorMsg = 'Không thể tải thông tin sản phẩm';
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorMsg;
            } catch (e) {}
            showMessage(errorMsg, true);
            console.error("Response status:", response.status);
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
// Mở modal
showRegisterBtn.onclick = () => registerModal.style.display = 'block';
showLoginBtn.onclick = () => loginModal.style.display = 'block';

// Đóng modal
closeRegisterModal.onclick = () => registerModal.style.display = 'none';
closeLoginModal.onclick = () => loginModal.style.display = 'none';

// Click ra ngoài đóng modal
window.onclick = (event) => {
    if (event.target === registerModal) registerModal.style.display = 'none';
    if (event.target === loginModal) loginModal.style.display = 'none';
    if (event.target === editModal) editModal.style.display = 'none';
};

// Đăng ký
submitRegisterBtn.onclick = async () => {
    const userData = {
        username: document.getElementById('regUsername').value,
        password: document.getElementById('regPassword').value,
        name: document.getElementById('regName').value,
        birthDate: document.getElementById('regBirthDate').value,
        gender: document.getElementById('regGender').value
    };

    if (!userData.username || !userData.password || !userData.name) {
        showMessage('Vui lòng điền đầy đủ thông tin (*)', true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (result.status === 'success') {
            showMessage('Đăng ký thành công! Vui lòng đăng nhập');
            registerModal.style.display = 'none';
            document.getElementById('regUsername').value = '';
            document.getElementById('regPassword').value = '';
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
            loadProducts();
        } else {
            showMessage(result.message, true);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Lỗi kết nối', true);
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
    showMessage('Đã đăng xuất');
    loadProducts();
};

// Kiểm tra trạng thái đăng nhập
function checkAuthStatus() {
    const token = localStorage.getItem('token');
    if (token) {
        showRegisterBtn.style.display = 'none';
        showLoginBtn.style.display = 'none';
        logoutBtn.style.display = 'inline-block';
    } else {
        showRegisterBtn.style.display = 'inline-block';
        showLoginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
    }
}

// ========== CART ==========
window.addToCart = (id) => {
    showMessage('✅ Sản phẩm đã được thêm vào giỏ hàng (Giai đoạn 3 sẽ hoàn thiện đầy đủ)');
};

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
    }
};

// Đóng modal edit
closeEditModal.onclick = () => {
    editModal.style.display = 'none';
};

// Event listeners
if (addProductBtn) addProductBtn.addEventListener('click', addProduct);
if (filterBtn) filterBtn.addEventListener('click', filterProducts);
if (resetFilterBtn) resetFilterBtn.addEventListener('click', resetFilter);
// Thêm vào cuối file app.js, trước dòng // Khởi tạo

// ========== CART FUNCTIONS ==========
// Hiển thị giỏ hàng modal
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

// Mở giỏ hàng
function openCart() {
    loadCart();
    cartModal.style.display = 'block';
}

// Đóng giỏ hàng
if (closeCartModal) {
    closeCartModal.onclick = () => {
        cartModal.style.display = 'none';
    };
}

// Load giỏ hàng
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
            container.innerHTML = '<p style="text-align: center;">🛍️ Giỏ hàng trống</p>';
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
                            <button onclick="updateCartItem(${item.id}, ${item.quantity - 1})" style="padding: 5px 10px; background: #f56565; color: white; border: none; border-radius: 5px;">-</button>
                            <span style="margin: 0 10px; font-weight: bold;">${item.quantity}</span>
                            <button onclick="updateCartItem(${item.id}, ${item.quantity + 1})" style="padding: 5px 10px; background: #48bb78; color: white; border: none; border-radius: 5px;">+</button>
                        </div>
                        <div style="flex: 1; text-align: right;">
                            <div style="font-weight: bold; color: #667eea;">${itemTotal.toLocaleString()}₫</div>
                            <button onclick="removeFromCart(${item.id})" style="margin-top: 5px; padding: 5px 10px; background: #f56565; color: white; border: none; border-radius: 5px; font-size: 12px;">Xóa</button>
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

// Cập nhật số lượng trong giỏ
window.updateCartItem = async (cartItemId, newQuantity) => {
    if (newQuantity < 0) return;

    const token = localStorage.getItem('token');
    if (!token) {
        showMessage('Vui lòng đăng nhập', true);
        return;
    }

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

// Xóa khỏi giỏ hàng
window.removeFromCart = async (cartItemId) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này khỏi giỏ?')) return;

    const token = localStorage.getItem('token');
    if (!token) {
        showMessage('Vui lòng đăng nhập', true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart/remove/${cartItemId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            showMessage('Đã xóa khỏi giỏ hàng');
            loadCart();
            loadProducts(); // Reload để cập nhật nút giỏ
        } else {
            const error = await response.text();
            showMessage(error, true);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Lỗi xóa sản phẩm', true);
    }
};

// Thanh toán
if (checkoutBtn) {
    checkoutBtn.onclick = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            showMessage('Vui lòng đăng nhập', true);
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/cart/checkout`, {
                method: 'POST',
                headers: getAuthHeaders()
            });

            if (response.ok) {
                const message = await response.text();
                showMessage(message);
                cartModal.style.display = 'none';
                loadProducts(); // Reload sản phẩm để cập nhật số lượng
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

// Sửa lại hàm addToCart trong app.js
window.addToCart = async (id) => {
    const token = localStorage.getItem('token');
    if (!token) {
        showMessage('Vui lòng đăng nhập trước khi thêm vào giỏ!', true);
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/cart/add`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ productId: id })
        });

        if (response.ok) {
            showMessage('✅ Đã thêm vào giỏ hàng!');
        } else {
            const error = await response.text();
            showMessage('Lỗi: ' + error, true);
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('Lỗi kết nối khi thêm vào giỏ', true);
    }
};

// Thêm nút xem giỏ hàng vào header
function addCartButton() {
    const headerDiv = document.querySelector('.header div');
    if (headerDiv && !document.getElementById('viewCartBtn')) {
        const viewCartBtn = document.createElement('button');
        viewCartBtn.id = 'viewCartBtn';
        viewCartBtn.className = 'btn btn-primary';
        viewCartBtn.innerHTML = '🛒 Giỏ hàng';
        viewCartBtn.style.marginLeft = '10px';
        viewCartBtn.onclick = openCart;
        headerDiv.appendChild(viewCartBtn);
    }
}

// Cập nhật checkAuthStatus để thêm nút giỏ hàng
const originalCheckAuthStatus = checkAuthStatus;
checkAuthStatus = function() {
    originalCheckAuthStatus();
    const token = localStorage.getItem('token');
    const role = getCurrentRole();
    if (token && role !== 'ADMIN') {
        addCartButton();
    } else if (token && role === 'ADMIN') {
        // Admin không hiện nút giỏ hàng
        const cartBtn = document.getElementById('viewCartBtn');
        if (cartBtn) cartBtn.remove();
    } else {
        const cartBtn = document.getElementById('viewCartBtn');
        if (cartBtn) cartBtn.remove();
    }
};

// Khởi tạo
checkAuthStatus();
loadProducts();