const BASE = '__API_BASE_URL__';

let currentToken = null;

// --- Utilidades ---

function show(id, data, isError) {
    const el = document.getElementById(id);
    el.textContent = JSON.stringify(data, null, 2);
    el.className = isError ? 'error' : 'ok';
}

async function request(method, path, body) {
    const headers = { 'Content-Type': 'application/json' };
    if (currentToken) headers['Authorization'] = 'Bearer ' + currentToken;
    const opts = { method, headers };
    if (body !== undefined) opts.body = JSON.stringify(body);
    const res = await fetch(BASE + path, opts);
    return { ok: res.ok, data: await res.json() };
}

// --- JWT Banner ---

function updateTokenBanner(name, token) {
    currentToken = token;
    const banner = document.getElementById('jwt-banner');
    if (token) {
        document.getElementById('jwt-token-display').textContent = token;
        document.getElementById('jwt-user').textContent = name;
        banner.classList.remove('hidden');
    } else {
        banner.classList.add('hidden');
        document.getElementById('jwt-token-display').textContent = '';
        document.getElementById('jwt-user').textContent = '';
    }
}

function copyToken() {
    if (!currentToken) return;
    navigator.clipboard.writeText(currentToken).then(() => alert('Token copiado al portapapeles'));
}

function logout() {
    updateTokenBanner(null, null);
}

// --- API status ping ---

async function ping() {
    try {
        const res = await fetch(BASE + '/product/all');
        const dot = document.getElementById('status-dot');
        if (res.ok || res.status === 401 || res.status === 403) {
            dot.className = 'dot online';
            dot.title = 'API online';
        } else {
            dot.className = 'dot offline';
            dot.title = 'API error ' + res.status;
        }
    } catch {
        document.getElementById('status-dot').title = 'API sin respuesta';
    }
}

// --- Auth ---

async function register() {
    const name     = document.getElementById('reg-name').value.trim();
    const password = document.getElementById('reg-password').value;
    if (!name || !password) return alert('Ingresa nombre y contraseña');
    try {
        const { ok, data } = await request('PUT', '/auth', { name, password });
        show('output-register', data, !ok);
        if (ok && data.token) updateTokenBanner(data.name, data.token);
    } catch (e) {
        show('output-register', { error: e.message }, true);
    }
}

async function login() {
    const name     = document.getElementById('login-name').value.trim();
    const password = document.getElementById('login-password').value;
    if (!name || !password) return alert('Ingresa nombre y contraseña');
    try {
        const { ok, data } = await request('GET', '/auth', { name, password });
        show('output-login', data, !ok);
        if (ok && data.token) updateTokenBanner(data.name, data.token);
    } catch (e) {
        show('output-login', { error: e.message }, true);
    }
}

// --- Productos ---

async function getAllProducts() {
    try {
        const { ok, data } = await request('GET', '/product/all');
        show('output-products', data, !ok);
    } catch (e) {
        show('output-products', { error: e.message }, true);
    }
}

async function getProductById() {
    const id = document.getElementById('input-product-id').value;
    if (!id) return alert('Ingresa un ID de producto');
    try {
        const { ok, data } = await request('GET', '/product', { productId: Number(id) });
        show('output-products', data, !ok);
    } catch (e) {
        show('output-products', { error: e.message }, true);
    }
}

// --- Wishes ---

async function addWish() {
    const userId    = document.getElementById('add-user-id').value;
    const productId = document.getElementById('add-product-id').value;
    if (!userId || !productId) return alert('Ingresa User ID y Product ID');
    try {
        const { ok, data } = await request('POST', '/wish', {
            userId:    Number(userId),
            productId: Number(productId),
        });
        show('output-add-wish', data, !ok);
    } catch (e) {
        show('output-add-wish', { error: e.message }, true);
    }
}

async function listWishes() {
    const userId = document.getElementById('list-user-id').value;
    if (!userId) return alert('Ingresa un User ID');
    try {
        const { ok, data } = await request('GET', '/wish/all', { userId: Number(userId) });
        show('output-list-wish', data, !ok);
    } catch (e) {
        show('output-list-wish', { error: e.message }, true);
    }
}

async function deleteWish() {
    const wishId = document.getElementById('delete-wish-id').value;
    if (!wishId) return alert('Ingresa un Wish ID');
    try {
        const { ok, data } = await request('DELETE', '/wish', { wishId: Number(wishId) });
        show('output-delete-wish', data, !ok);
    } catch (e) {
        show('output-delete-wish', { error: e.message }, true);
    }
}

// --- Init ---
ping();
