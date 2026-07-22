import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// TODO: Reemplaza esto con la configuración de tu proyecto en Firebase Console
const firebaseConfig = {
    apiKey: "AIzaSyAf8X9uXB52Kb6jf8y90MzEBMFahj20dsg",
    authDomain: "kyrox-technology.firebaseapp.com",
    projectId: "kyrox-technology",
    storageBucket: "kyrox-technology.firebasestorage.app",
    messagingSenderId: "234760615906",
    appId: "1:234760615906:web:b8b3477098cdc257892bbb",
    measurementId: "G-WEB1FNM75Y"
  };

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios
const db = getFirestore(app);
const auth = getAuth(app); // Preparado para la futura implementación de usuarios

export { db, auth };








/* ==========================================
   ESTRUCTURAS DE DATOS Y TEMA
========================================== */
let categories = JSON.parse(localStorage.getItem('kyrox_categories')) || [];
let products = JSON.parse(localStorage.getItem('kyrox_products')) || [];
let variations = JSON.parse(localStorage.getItem('kyrox_variations')) || [];
let sales = JSON.parse(localStorage.getItem('kyrox_sales')) || [];

let categories = [];
let products = [];
let variations = [];
let sales = [];

let editingCategoryId = null;
let editingProductId = null;
let editingVariationId = null;



// Listener para Categorías
onSnapshot(collection(db, "categories"), (snapshot) => {
    categories = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderCategories();
    populateDropdowns();
    updateDashboard();
});

// Listener para Productos
onSnapshot(collection(db, "products"), (snapshot) => {
    products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderProducts();
    populateDropdowns();
    updateDashboard();
});

// Listener para Variaciones
onSnapshot(collection(db, "variations"), (snapshot) => {
    variations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderVariations();
    renderProducts();
    updateDashboard();
});

// Listener para Ventas
onSnapshot(collection(db, "sales"), (snapshot) => {
    sales = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderSales();
    updateDashboard();
});

const themeToggleBtn = document.getElementById('btn-theme-toggle');
const currentTheme = localStorage.getItem('kyrox_theme') || 'dark';

if (themeToggleBtn) {
    if (currentTheme === 'light') {
        document.body.classList.add('light-mode');
        themeToggleBtn.innerHTML = '<i class="ph ph-moon"></i> Modo Oscuro';
    }

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        const isLight = document.body.classList.contains('light-mode');
        localStorage.setItem('kyrox_theme', isLight ? 'light' : 'dark');
        themeToggleBtn.innerHTML = isLight ? '<i class="ph ph-moon"></i> Modo Oscuro' : '<i class="ph ph-sun"></i> Modo Claro';
    });
}

/* ==========================================
   NAVEGACIÓN SPA & TOASTS
========================================== */
const navButtons = document.querySelectorAll('.nav-btn');
const modules = document.querySelectorAll('.module');

navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        navButtons.forEach(b => b.classList.remove('active'));
        modules.forEach(m => m.classList.remove('active'));
        
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        const targetModule = document.getElementById(targetId);
        
        if (targetModule) {
            targetModule.classList.add('active');
            updateDashboard();
            populateDropdowns();
        }
    });
});

function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const icon = type === 'success' ? '<i class="ph ph-check-circle"></i>' : '<i class="ph ph-warning-circle"></i>';
    toast.innerHTML = `${icon} <span>${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

/* ==========================================
   MÓDULO: CATEGORÍAS
========================================== */
const formCategory = document.getElementById('form-category');
if (formCategory) {
    formCategory.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('cat-name');
        const name = nameInput ? nameInput.value.trim() : '';
        
        if (!name) return showToast('El nombre no puede estar vacío', 'error');

        if (editingCategoryId) {
            const index = categories.findIndex(c => c.id === editingCategoryId);
            if (index !== -1) categories[index].name = name;
            showToast('Categoría actualizada');
            resetCategoryForm();
        } else {
            categories.push({ id: Date.now().toString(), name });
            showToast('Categoría creada exitosamente');
            formCategory.reset();
        }
        
        saveData(); renderCategories(); populateDropdowns(); updateDashboard();
    });
}

const btnCancelCat = document.getElementById('btn-cancel-cat');
if (btnCancelCat) btnCancelCat.addEventListener('click', resetCategoryForm);

function resetCategoryForm() {
    editingCategoryId = null; 
    if (formCategory) formCategory.reset();
    
    const btnSubmit = document.getElementById('btn-submit-cat');
    if (btnSubmit) btnSubmit.textContent = 'Agregar Categoría';
    if (btnCancelCat) btnCancelCat.classList.add('hidden');
}

function renderCategories(filter = '') {
    const tbody = document.querySelector('#table-categories tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    const filtered = categories.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));
    
    filtered.forEach(cat => {
        tbody.innerHTML += `
            <tr>
                <td>${cat.id.slice(-6)}</td>
                <td>${cat.name}</td>
                <td>
                    <button type="button" class="action-btn edit-btn" onclick="editCategory('${cat.id}')"><i class="ph ph-pencil-simple"></i></button>
                    <button type="button" class="action-btn delete-btn" onclick="deleteCategory('${cat.id}')"><i class="ph ph-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

window.editCategory = (id) => {
    const cat = categories.find(c => c.id === id);
    if (cat) {
        editingCategoryId = cat.id; 
        document.getElementById('cat-name').value = cat.name;
        document.getElementById('btn-submit-cat').textContent = 'Actualizar Categoría';
        document.getElementById('btn-cancel-cat').classList.remove('hidden');
    }
};

window.deleteCategory = (id) => {
    if (products.some(p => p.categoryId === id)) return showToast('No se puede eliminar: Hay productos en esta categoría', 'error');
    categories = categories.filter(c => c.id !== id);
    saveData(); renderCategories(); populateDropdowns(); updateDashboard(); showToast('Categoría eliminada');
};

const searchCat = document.getElementById('search-cat');
if (searchCat) searchCat.addEventListener('input', (e) => renderCategories(e.target.value));

/* ==========================================
   MÓDULO: PRODUCTOS
========================================== */
const formProduct = document.getElementById('form-product');
if (formProduct) {
    formProduct.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('prod-name').value.trim();
        const categoryId = document.getElementById('prod-category').value;
        const price = parseFloat(document.getElementById('prod-price').value) || 0;
        const quantity = parseInt(document.getElementById('prod-qty').value) || 0;
        const desc = document.getElementById('prod-desc').value.trim();

        if (price < 0 || quantity < 0) return showToast('Valores no pueden ser negativos', 'error');

        if (editingProductId) {
            const index = products.findIndex(p => p.id === editingProductId);
            if (index !== -1) products[index] = { ...products[index], name, categoryId, price, quantity, desc };
            showToast('Producto actualizado');
            resetProductForm();
        } else {
            products.push({ id: Date.now().toString(), categoryId, name, price, quantity, desc });
            showToast('Producto registrado');
            formProduct.reset();
        }
        saveData(); renderProducts(); populateDropdowns(); updateDashboard();
    });
}

const btnCancelProd = document.getElementById('btn-cancel-prod');
if (btnCancelProd) btnCancelProd.addEventListener('click', resetProductForm);

function resetProductForm() {
    editingProductId = null; 
    if (formProduct) formProduct.reset();
    
    const btnSubmit = document.getElementById('btn-submit-prod');
    if (btnSubmit) btnSubmit.textContent = 'Agregar Producto';
    if (btnCancelProd) btnCancelProd.classList.add('hidden');
}

function renderProducts(filter = '') {
    const tbody = document.querySelector('#table-products tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    const filtered = products.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
    
    filtered.forEach(prod => {
        const catName = categories.find(c => c.id === prod.categoryId)?.name || 'Desconocida';
        const prodVars = variations.filter(v => v.productId === prod.id);
        
        const varTags = prodVars.length > 0 
            ? prodVars.map(v => `<span class="badge-tag">${v.name}</span>`).join('') 
            : '<small style="color:var(--text-muted)">Sin variaciones</small>';

        tbody.innerHTML += `
            <tr>
                <td>${prod.id.slice(-6)}</td>
                <td><strong>${prod.name}</strong><br><small style="color:var(--text-muted)">${prod.desc}</small></td>
                <td><span class="glass badge-glass">${catName}</span></td>
                <td>${varTags}</td>
                <td>$${prod.price.toFixed(2)}</td>
                <td><strong>${prod.quantity} u.</strong></td>
                <td>
                    <button type="button" class="action-btn edit-btn" onclick="editProduct('${prod.id}')"><i class="ph ph-pencil-simple"></i></button>
                    <button type="button" class="action-btn delete-btn" onclick="deleteProduct('${prod.id}')"><i class="ph ph-trash"></i></button>
                </td>
            </tr>
        `;

        prodVars.forEach(vr => {
            const stockDisplay = vr.quantity !== null && vr.quantity !== undefined 
                ? `<strong>${vr.quantity} u.</strong>` 
                : `<small style="color:var(--text-muted);">Usa stock base</small>`;

            tbody.innerHTML += `
                <tr class="variation-row">
                    <td style="text-align: right; color: var(--text-muted);">↳ ${vr.id.slice(-6)}</td>
                    <td colspan="3">
                        <span class="badge-variation">Variación</span> <strong>${vr.name}</strong>
                        ${vr.desc ? `<br><small style="color:var(--text-muted)">${vr.desc}</small>` : ''}
                    </td>
                    <td style="color: var(--primary-color);">+$${vr.price.toFixed(2)}</td>
                    <td>${stockDisplay}</td>
                    <td></td>
                </tr>
            `;
        });
    });
}

window.editProduct = (id) => {
    const prod = products.find(p => p.id === id);
    if (prod) {
        editingProductId = prod.id;
        document.getElementById('prod-name').value = prod.name; 
        document.getElementById('prod-category').value = prod.categoryId;
        document.getElementById('prod-price').value = prod.price; 
        document.getElementById('prod-qty').value = prod.quantity;
        document.getElementById('prod-desc').value = prod.desc; 
        document.getElementById('btn-submit-prod').textContent = 'Actualizar Producto';
        document.getElementById('btn-cancel-prod').classList.remove('hidden');
    }
};

window.deleteProduct = (id) => {
    if (variations.some(v => v.productId === id) || sales.some(s => s.productId === id)) return showToast('No se puede eliminar: Tiene variaciones o ventas asociadas', 'error');
    products = products.filter(p => p.id !== id);
    saveData(); renderProducts(); populateDropdowns(); updateDashboard(); showToast('Producto eliminado');
};

const searchProd = document.getElementById('search-prod');
if (searchProd) searchProd.addEventListener('input', (e) => renderProducts(e.target.value));

/* ==========================================
   MÓDULO: VARIACIONES (STOCK OPCIONAL)
========================================== */
const formVariation = document.getElementById('form-variation');
if (formVariation) {
    formVariation.addEventListener('submit', (e) => {
        e.preventDefault();
        const productId = document.getElementById('var-product').value;
        const name = document.getElementById('var-name').value.trim();
        const price = parseFloat(document.getElementById('var-price').value) || 0;
        const desc = document.getElementById('var-desc').value.trim(); 
        
        const qtyRaw = document.getElementById('var-qty').value.trim();
        const quantity = qtyRaw === '' ? null : parseInt(qtyRaw);

        if (!productId) return showToast('Debe seleccionar un producto', 'error');
        if (price < 0) return showToast('El precio extra no puede ser negativo', 'error');
        if (quantity !== null && quantity < 0) return showToast('El stock no puede ser negativo', 'error');

        if (editingVariationId) {
            const index = variations.findIndex(v => v.id === editingVariationId);
            if (index !== -1) variations[index] = { ...variations[index], productId, name, price, desc, quantity };
            showToast('Variación actualizada');
            resetVariationForm();
        } else {
            variations.push({ id: Date.now().toString(), productId, name, price, desc, quantity });
            showToast('Variación registrada');
            formVariation.reset();
        }
        
        saveData(); renderVariations(); renderProducts(); updateDashboard();
    });
}

const btnCancelVar = document.getElementById('btn-cancel-var');
if (btnCancelVar) btnCancelVar.addEventListener('click', resetVariationForm);

function resetVariationForm() {
    editingVariationId = null; 
    if (formVariation) formVariation.reset();
    
    const btnSubmit = document.getElementById('btn-submit-var');
    if (btnSubmit) btnSubmit.textContent = 'Agregar Variación';
    if (btnCancelVar) btnCancelVar.classList.add('hidden');
}

function renderVariations(filter = '') {
    const tbody = document.querySelector('#table-variations tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    const filtered = variations.filter(v => v.name.toLowerCase().includes(filter.toLowerCase()));
    
    filtered.forEach(vr => {
        const prodName = products.find(p => p.id === vr.productId)?.name || 'Desconocido';
        const stockDisplay = vr.quantity !== null && vr.quantity !== undefined 
            ? `${vr.quantity} u.` 
            : `<small style="color:var(--text-muted)">Usa base</small>`;

        tbody.innerHTML += `
            <tr>
                <td>${vr.id.slice(-6)}</td>
                <td>${prodName} <br><small style="color:var(--text-muted)">${vr.desc || ''}</small></td>
                <td>${vr.name}</td>
                <td>+$${vr.price.toFixed(2)}</td>
                <td>${stockDisplay}</td>
                <td>
                    <button type="button" class="action-btn edit-btn" onclick="editVariation('${vr.id}')"><i class="ph ph-pencil-simple"></i></button>
                    <button type="button" class="action-btn delete-btn" onclick="deleteVariation('${vr.id}')"><i class="ph ph-trash"></i></button>
                </td>
            </tr>
        `;
    });
}

window.editVariation = (id) => {
    const vr = variations.find(v => v.id === id);
    if (vr) {
        editingVariationId = vr.id;
        document.getElementById('var-product').value = vr.productId; 
        document.getElementById('var-name').value = vr.name;
        document.getElementById('var-price').value = vr.price; 
        document.getElementById('var-desc').value = vr.desc || '';
        document.getElementById('var-qty').value = vr.quantity !== null && vr.quantity !== undefined ? vr.quantity : '';
        
        document.getElementById('btn-submit-var').textContent = 'Actualizar Variación';
        document.getElementById('btn-cancel-var').classList.remove('hidden');
    }
};

window.deleteVariation = (id) => {
    if (sales.some(s => s.variationId === id)) return showToast('No se puede eliminar: Se usó en una venta', 'error');
    variations = variations.filter(v => v.id !== id);
    saveData(); renderVariations(); renderProducts(); updateDashboard(); showToast('Variación eliminada');
};

const searchVar = document.getElementById('search-var');
if (searchVar) searchVar.addEventListener('input', (e) => renderVariations(e.target.value));

/* ==========================================
   MÓDULO: VENTAS 
========================================== */
const saleProductSelect = document.getElementById('sale-product');
const saleVarSelect = document.getElementById('sale-variation');
const saleQtyInput = document.getElementById('sale-qty');

if (saleProductSelect && saleVarSelect && saleQtyInput) {
    saleProductSelect.addEventListener('change', () => {
        const prodId = saleProductSelect.value;
        saleVarSelect.innerHTML = '<option value="">Seleccionar variación (Opcional)...</option>';
        
        const prodVars = variations.filter(v => v.productId === prodId);
        prodVars.forEach(v => {
            const stockInfo = v.quantity !== null && v.quantity !== undefined ? ` (Stock propio: ${v.quantity})` : ' (Usa stock base)';
            saleVarSelect.innerHTML += `<option value="${v.id}">${v.name} (+ $${v.price}) ${stockInfo}</option>`;
        });
        calculateSale();
    });

    [saleProductSelect, saleVarSelect, saleQtyInput].forEach(el => el.addEventListener('input', calculateSale));
}

function calculateSale() {
    const prodId = saleProductSelect?.value;
    const varId = saleVarSelect?.value;
    const qty = parseInt(saleQtyInput?.value) || 0;
    
    const previewContainer = document.getElementById('sale-preview-container');
    const previewText = document.getElementById('sale-desc-preview');
    
    if (!prodId || qty < 1) {
        if (previewContainer) previewContainer.style.display = 'none';
        updateSaleUI(0, 0, 0); 
        return;
    }
    
    const prod = products.find(p => p.id === prodId);
    const variation = variations.find(v => v.id === varId);
    
    if (!prod) return; // Salvaguardia

    let descHtml = `<strong><i class="ph ph-package"></i> Producto:</strong> ${prod.desc}`;
    let availableStock = prod.quantity;
    let usingVarStock = false;

    if (variation) {
        if (variation.desc) descHtml += `<br><strong style="color:var(--primary-color);"><i class="ph ph-git-merge"></i> Variación:</strong> ${variation.desc}`;
        
        if (variation.quantity !== null && variation.quantity !== undefined) {
            availableStock = variation.quantity;
            usingVarStock = true;
        }
    }
    
    const stockColor = availableStock >= qty ? '#10ac84' : 'var(--danger)';
    descHtml += `<br><small style="color: ${stockColor}; font-weight: bold; margin-top: 8px; display: block;">
        Stock Disponible ${usingVarStock ? '(Independiente de Variación)' : '(Producto Base)'}: ${availableStock} unidades
    </small>`;
    
    if (previewText && previewContainer) {
        previewText.innerHTML = descHtml;
        previewContainer.style.display = 'block';
    }
    
    const basePrice = prod.price;
    const extraPrice = variation ? variation.price : 0;
    const subtotal = (basePrice + extraPrice) * qty;
    const iva = subtotal * 0.16; // Tasa de IVA modificable
    
    updateSaleUI(subtotal, iva, subtotal + iva);
}

function updateSaleUI(subtotal, iva, total) {
    const subEl = document.getElementById('sale-subtotal');
    const ivaEl = document.getElementById('sale-iva');
    const totEl = document.getElementById('sale-total');
    
    if (subEl) subEl.textContent = `$${subtotal.toFixed(2)}`;
    if (ivaEl) ivaEl.textContent = `$${iva.toFixed(2)}`;
    if (totEl) totEl.textContent = `$${total.toFixed(2)}`;
}

const formSale = document.getElementById('form-sale');
if (formSale) {
    formSale.addEventListener('submit', (e) => {
        e.preventDefault();
        const prodId = saleProductSelect.value;
        const varId = saleVarSelect.value;
        const qty = parseInt(saleQtyInput.value);

        const prodIndex = products.findIndex(p => p.id === prodId);
        if (prodIndex === -1) return;
        
        const varIndex = variations.findIndex(v => v.id === varId);
        const variation = varIndex !== -1 ? variations[varIndex] : null;

        const hasIndependentStock = variation && variation.quantity !== null && variation.quantity !== undefined;
        const availableStock = hasIndependentStock ? variation.quantity : products[prodIndex].quantity;

        if (availableStock < qty) {
            return showToast('Stock insuficiente para realizar esta venta', 'error');
        }

        if (hasIndependentStock) {
            variations[varIndex].quantity -= qty;
        } else {
            products[prodIndex].quantity -= qty;
        }

        const subtotal = (products[prodIndex].price + (variation ? variation.price : 0)) * qty;
        const iva = subtotal * 0.16;
        
        sales.push({ id: Date.now().toString(), prodId, varId, qty, subtotal, iva, total: subtotal + iva, date: new Date().toLocaleString() });

        saveData();
        showToast('Venta registrada. Inventario actualizado exitosamente.');
        formSale.reset(); 
        updateSaleUI(0, 0, 0);
        
        const preview = document.getElementById('sale-preview-container');
        if (preview) preview.style.display = 'none';

        renderSales(); renderProducts(); renderVariations(); populateDropdowns(); updateDashboard();
    });
}

function renderSales() {
    const tbody = document.querySelector('#table-sales tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    const sortedSales = [...sales].reverse();
    
    sortedSales.forEach(s => {
        const prod = products.find(p => p.id === s.prodId);
        const vr = variations.find(v => v.id === s.varId);
        
        const detailHtml = `
            <strong>${prod ? prod.name : 'Desc.'}</strong> ${vr ? `<span style="color:var(--primary-color)">(${vr.name})</span>` : ''} <br>
            <small style="color: var(--text-muted)">
                ${prod ? prod.desc : ''} ${vr && vr.desc ? ' | ' + vr.desc : ''}
            </small>
        `;
        
        tbody.innerHTML += `
            <tr>
                <td><small>${s.date}</small> <br> #${s.id.slice(-5)}</td>
                <td>${detailHtml}</td>
                <td>${s.qty}</td>
                <td>$${s.subtotal.toFixed(2)}</td>
                <td>$${s.iva.toFixed(2)}</td>
                <td style="color: var(--primary-color); font-weight:bold;">$${s.total.toFixed(2)}</td>
            </tr>
        `;
    });
}

/* ==========================================
   UTILIDADES & DASHBOARD
========================================== */
function populateDropdowns() {
    const prodCat = document.getElementById('prod-category');
    if (prodCat) {
        prodCat.innerHTML = '<option value="">Seleccione...</option>';
        categories.forEach(c => prodCat.innerHTML += `<option value="${c.id}">${c.name}</option>`);
    }

    const varProd = document.getElementById('var-product');
    if (varProd) {
        varProd.innerHTML = '<option value="">Seleccione...</option>';
        products.forEach(p => varProd.innerHTML += `<option value="${p.id}">${p.name}</option>`);
    }

    const saleProd = document.getElementById('sale-product');
    if (saleProd) {
        saleProd.innerHTML = '<option value="">Seleccione producto...</option>';
        products.forEach(p => saleProd.innerHTML += `<option value="${p.id}">${p.name}</option>`);
    }
}

function updateDashboard() {
    const updateEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    
    updateEl('stat-categories', categories.length);
    updateEl('stat-products', products.length);
    updateEl('stat-variations', variations.length);
    updateEl('stat-sales', sales.length);
    
    const totalProdStock = products.reduce((acc, p) => acc + p.quantity, 0);
    const totalVarStock = variations.reduce((acc, v) => acc + (v.quantity !== null && v.quantity !== undefined ? v.quantity : 0), 0);
    updateEl('stat-stock', totalProdStock + totalVarStock);

    const totalRevenue = sales.reduce((acc, s) => acc + s.total, 0);
    updateEl('stat-revenue', `$${totalRevenue.toFixed(2)}`);

    checkStockAlerts();
}

function checkStockAlerts() {
    const container = document.getElementById('stock-alerts-container');
    if (!container) return;
    container.innerHTML = '';

    const lowStockProds = products.filter(p => p.quantity >= 0 && p.quantity <= 5);
    const varsWithStock = variations.filter(v => v.quantity !== null && v.quantity !== undefined);
    const lowStockVars = varsWithStock.filter(v => v.quantity >= 0 && v.quantity <= 5);

    if (lowStockProds.length === 0 && lowStockVars.length === 0 && products.length > 0) {
        container.innerHTML = `<div class="alert-item alert-success"><i class="ph ph-check-circle"></i><span>Inventario en niveles óptimos.</span></div>`;
        return;
    }
    
    if (products.length === 0) {
         container.innerHTML = `<div class="alert-item" style="color: var(--text-muted); background: rgba(255,255,255,0.05);"><i class="ph ph-info"></i><span>Aún no tienes productos registrados.</span></div>`;
        return;
    }

    lowStockProds.forEach(p => {
        if(p.quantity === 0) {
            container.innerHTML += `<div class="alert-item alert-danger"><i class="ph ph-warning-octagon"></i><span><strong>¡Agotado!</strong> El producto base "${p.name}" tiene 0 unidades.</span></div>`;
        } else {
            container.innerHTML += `<div class="alert-item alert-warning"><i class="ph ph-warning"></i><span><strong>Pocas unidades:</strong> Quedan ${p.quantity} u. del producto "${p.name}".</span></div>`;
        }
    });

    lowStockVars.forEach(v => {
        const prodName = products.find(p => p.id === v.productId)?.name || 'Desconocido';
        if(v.quantity === 0) {
            container.innerHTML += `<div class="alert-item alert-danger"><i class="ph ph-warning-octagon"></i><span><strong>Variación Agotada!</strong> "${v.name}" (de ${prodName}) tiene 0 unidades.</span></div>`;
        } else {
            container.innerHTML += `<div class="alert-item alert-warning"><i class="ph ph-warning"></i><span><strong>Pocas unidades:</strong> Quedan ${v.quantity} u. de la variación "${v.name}" (de ${prodName}).</span></div>`;
        }
    });
}

/* ==========================================
   EXPORTAR / IMPORTAR (CSV ADAPTADO)
========================================== */
function exportCSV() {
    let csvContent = "TIPO;DATOS...\n";
    categories.forEach(c => csvContent += `CAT;${c.id};${c.name}\n`);
    products.forEach(p => {
        const safeDesc = p.desc.replace(/;/g, ',').replace(/\n/g, ' ');
        csvContent += `PROD;${p.id};${p.categoryId};${p.name};${p.price};${p.quantity};${safeDesc}\n`;
    });
    variations.forEach(v => {
        const safeDesc = (v.desc || '').replace(/;/g, ',').replace(/\n/g, ' ');
        const safeQty = v.quantity !== null && v.quantity !== undefined ? v.quantity : '';
        csvContent += `VAR;${v.id};${v.productId};${v.name};${v.price};${safeDesc};${safeQty}\n`;
    });
    sales.forEach(s => csvContent += `SALE;${s.id};${s.prodId};${s.varId || ''};${s.qty};${s.subtotal};${s.iva};${s.total};${s.date}\n`);
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Kyrox_Backup_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click(); document.body.removeChild(link);
}

const btnExport = document.getElementById('btn-export');
if (btnExport) btnExport.addEventListener('click', () => {
    exportCSV(); showToast('Respaldo CSV exportado con éxito');
});

const btnImport = document.getElementById('btn-import');
if (btnImport) btnImport.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const text = event.target.result;
        const lines = text.split('\n');

        categories = []; products = []; variations = []; sales = [];

        lines.forEach(line => {
            const data = line.trim().split(';');
            if (data.length < 2) return;

            const type = data[0];
            if (type === 'CAT') categories.push({ id: data[1], name: data[2] });
            else if (type === 'PROD') products.push({ id: data[1], categoryId: data[2], name: data[3], price: parseFloat(data[4]), quantity: parseInt(data[5]), desc: data[6] });
            else if (type === 'VAR') {
                const q = data[6] === '' || data[6] === undefined ? null : parseInt(data[6]);
                variations.push({ id: data[1], productId: data[2], name: data[3], price: parseFloat(data[4]), desc: data[5] || '', quantity: q });
            }
            else if (type === 'SALE') sales.push({ id: data[1], prodId: data[2], varId: data[3], qty: parseInt(data[4]), subtotal: parseFloat(data[5]), iva: parseFloat(data[6]), total: parseFloat(data[7]), date: data[8] });
        });

        saveData(); renderCategories(); renderProducts(); renderVariations(); renderSales(); populateDropdowns(); updateDashboard();
        showToast('Respaldo restaurado exactamente igual', 'success'); e.target.value = '';
    };
    reader.readAsText(file);
});

const resetModal = document.getElementById('reset-modal');
const btnReset = document.getElementById('btn-reset-system');
const btnCancelRst = document.getElementById('btn-cancel-reset');
const btnConfRst = document.getElementById('btn-confirm-reset');

if (btnReset && resetModal) btnReset.addEventListener('click', () => resetModal.classList.remove('hidden'));
if (btnCancelRst && resetModal) btnCancelRst.addEventListener('click', () => resetModal.classList.add('hidden'));

if (btnConfRst) btnConfRst.addEventListener('click', () => {
    exportCSV();
    categories = []; products = []; variations = []; sales = [];
    localStorage.clear(); 
    
    renderCategories(); renderProducts(); renderVariations(); renderSales(); populateDropdowns(); updateDashboard();
    if (resetModal) resetModal.classList.add('hidden');
    showToast('Sistema reiniciado. Se guardó tu copia de seguridad.', 'success');
});

// Inicialización general
renderCategories(); renderProducts(); renderVariations(); renderSales(); populateDropdowns(); updateDashboard();

/* ==========================================
   INSTALACIÓN PWA (APP NATIVA)
========================================== */
let deferredPrompt;
const installBtn = document.getElementById('btn-install-app');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.classList.remove('hidden');
});

if (installBtn) {
    installBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(outcome === 'accepted' ? 'El usuario aceptó la instalación' : 'El usuario rechazó la instalación');
            deferredPrompt = null;
            installBtn.classList.add('hidden');
        }
    });
}

window.addEventListener('appinstalled', () => {
    if (installBtn) installBtn.classList.add('hidden');
    deferredPrompt = null;
    showToast('¡Aplicación instalada con éxito!', 'success');
});

/* ==========================================
   LÓGICA DEL MENÚ DESPLEGABLE EN MÓVIL
========================================== */
document.addEventListener('DOMContentLoaded', () => {
    const btnMenuToggle = document.getElementById('btn-menu-toggle');
    const sidebarMenu = document.getElementById('sidebar-menu');

    if (btnMenuToggle && sidebarMenu) {
        btnMenuToggle.addEventListener('click', () => {
            sidebarMenu.classList.toggle('active');
            const icon = btnMenuToggle.querySelector('i');
            if (icon) {
                icon.className = sidebarMenu.classList.contains('active') ? 'ph ph-x' : 'ph ph-list';
            }
        });

        const navBtns = sidebarMenu.querySelectorAll('.nav-btn, .backup-actions button, .backup-actions label');
        navBtns.forEach(button => {
            button.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    sidebarMenu.classList.remove('active');
                    const icon = btnMenuToggle.querySelector('i');
                    if (icon) icon.className = 'ph ph-list';
                }
            });
        });
    }
});
