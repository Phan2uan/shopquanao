// Configuration
const API_BASE = ""; // Empty string for same-origin

// --- Section Management ---
const showSection = (id) => {
    // Hide all sections
    document.querySelectorAll('.section').forEach(s => {
        s.classList.remove('active');
    });

    // Update buttons
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active');
        if (b.getAttribute('onclick').includes(`'${id}'`)) {
            b.classList.add('active');
        }
    });

    // Show selected section
    const activeSection = document.getElementById(id);
    activeSection.classList.add('active');

    // Auto-fetch if needed
    if (id === 'products') fetchProducts();
};

const toggleAuth = () => {
    const login = document.getElementById('loginForm');
    const reg = document.getElementById('registerForm');
    const isLogin = login.style.display !== 'none';

    login.style.transition = '0.3s';
    reg.style.transition = '0.3s';

    if (isLogin) {
        login.style.opacity = '0';
        setTimeout(() => {
            login.style.display = 'none';
            reg.style.display = 'block';
            reg.style.opacity = '1';
        }, 300);
    } else {
        reg.style.opacity = '0';
        setTimeout(() => {
            reg.style.display = 'none';
            login.style.display = 'block';
            login.style.opacity = '1';
        }, 300);
    }
};

// --- Notifications ---
const notify = (msg, type = 'success') => {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.style.background = type === 'success' ? 'var(--primary)' : 'var(--error)';
    toast.style.display = 'block';

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            toast.style.display = 'none';
            toast.style.opacity = '1';
        }, 400);
    }, 3000);
};

// --- API Logic ---

const fetchProducts = async () => {
    const name = document.getElementById('nameFilter').value;
    const min = document.getElementById('minPrice').value;
    const max = document.getElementById('maxPrice').value;

    const grid = document.getElementById('productGrid');
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center;"><span class="loader"></span></div>';

    let url = `/products?name=${encodeURIComponent(name)}`;
    if (min) url += `&minPrice=${min}`;
    if (max) url += `&maxPrice=${max}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("Server Error");
        const data = await res.json();
        renderProducts(data);
    } catch (e) {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">⚠️ Không thể kết nối tới server!</p>';
        notify("Lỗi kết nối Server!", "error");
    }
};

const renderProducts = (products) => {
    const grid = document.getElementById('productGrid');
    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">🔍 Không tìm thấy sản phẩm nào.</p>';
        return;
    }

    grid.innerHTML = products.map((p, index) => `
        <div class="card" style="animation-delay: ${index * 0.1}s">
            <h3>${p.name}</h3>
            <span class="type">${p.type} • Size ${p.size} • ${p.color}</span>
            <div class="price">${p.price.toLocaleString()} đ</div>
            <div class="footer">
                <span title="Hàng trong kho">📦 ${p.quantity}</span>
                <button class="btn-action" style="padding: 6px 16px; font-size: 0.85rem">Edit</button>
            </div>
        </div>
    `).join('');
};

const addProduct = async () => {
    const btn = event.target;
    const originalText = btn.innerText;

    const body = {
        name: document.getElementById('pName').value,
        type: document.getElementById('pType').value,
        price: Number(document.getElementById('pPrice').value),
        quantity: Number(document.getElementById('pQty').value)
    };

    if (!body.name || !body.price) {
        notify("Vui lòng điền đủ Tên và Giá!", "error");
        return;
    }

    btn.innerText = "Đang lưu...";
    btn.disabled = true;

    try {
        const res = await fetch('/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        if (res.ok) {
            notify("✅ Đã lưu sản phẩm thành công!");
            // Reset fields
            document.querySelectorAll('#add-product input').forEach(i => i.value = "");
            showSection('products');
        } else {
            throw new Error();
        }
    } catch (e) {
        notify("❌ Thêm thất bại! Vui lòng thử lại.", "error");
    } finally {
        btn.innerText = originalText;
        btn.disabled = false;
    }
};

const login = async () => {
    const user = document.getElementById('loginUser').value;
    const pass = document.getElementById('loginPass').value;

    if (!user || !pass) {
        notify("Nhập đủ Tài khoản & Mật khẩu!", "error");
        return;
    }

    try {
        const res = await fetch('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
        });
        const data = await res.json();
        notify(data.message, data.status === 'success' ? 'success' : 'error');
    } catch (e) {
        notify("Lỗi xác thực!", "error");
    }
};

const register = async () => {
    const user = document.getElementById('regUser').value;
    const pass = document.getElementById('regPass').value;
    const name = document.getElementById('regName').value;

    if (!user || !pass) {
        notify("Vui lòng điền đủ thông tin!", "error");
        return;
    }

    try {
        const res = await fetch('/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass, name: name })
        });
        const data = await res.json();
        notify(data.message, data.status === 'success' ? 'success' : 'error');
        if (data.status === 'success') toggleAuth();
    } catch (e) {
        notify("Lỗi đăng ký!", "error");
    }
};

// --- Initialization ---
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
});
