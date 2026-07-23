// Estado global sincronizado con Firestore
export const globalState = {
    categorias: [],
    productos: [],
    variaciones: [],
    ventas: [],
    clientes: [],
    usuarios: [],
    configuracion: []
};

export function showToast(message, type = 'success') {
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

export function populateDropdowns() {
    const prodCat = document.getElementById('prod-category');
    if (prodCat) {
        prodCat.innerHTML = '<option value="">Seleccione...</option>';
        globalState.categorias.forEach(c => prodCat.innerHTML += `<option value="${c.id}">${c.name}</option>`);
    }

    const varProd = document.getElementById('var-product');
    if (varProd) {
        varProd.innerHTML = '<option value="">Seleccione...</option>';
        globalState.productos.forEach(p => varProd.innerHTML += `<option value="${p.id}">${p.name}</option>`);
    }

    const saleProd = document.getElementById('sale-product');
    if (saleProd) {
        saleProd.innerHTML = '<option value="">Seleccione producto...</option>';
        globalState.productos.forEach(p => saleProd.innerHTML += `<option value="${p.id}">${p.name}</option>`);
    }
}

export function updateDashboard() {
    const updateEl = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    
    updateEl('stat-categories', globalState.categorias.length);
    updateEl('stat-products', globalState.productos.length);
    updateEl('stat-variations', globalState.variaciones.length);
    updateEl('stat-sales', globalState.ventas.length);
    
    const totalProdStock = globalState.productos.reduce((acc, p) => acc + (p.quantity || 0), 0);
    const totalVarStock = globalState.variaciones.reduce((acc, v) => acc + (v.quantity !== null && v.quantity !== undefined ? v.quantity : 0), 0);
    updateEl('stat-stock', totalProdStock + totalVarStock);

    const totalRevenue = globalState.ventas.reduce((acc, s) => acc + (s.total || 0), 0);
    updateEl('stat-revenue', `$${totalRevenue.toFixed(2)}`);

    checkStockAlerts();
}

function checkStockAlerts() {
    const container = document.getElementById('stock-alerts-container');
    if (!container) return;
    container.innerHTML = '';

    const lowStockProds = globalState.productos.filter(p => p.quantity >= 0 && p.quantity <= 5);
    const varsWithStock = globalState.variaciones.filter(v => v.quantity !== null && v.quantity !== undefined);
    const lowStockVars = varsWithStock.filter(v => v.quantity >= 0 && v.quantity <= 5);

    if (lowStockProds.length === 0 && lowStockVars.length === 0 && globalState.productos.length > 0) {
        container.innerHTML = `<div class="alert-item alert-success"><i class="ph ph-check-circle"></i><span>Inventario en niveles óptimos.</span></div>`;
        return;
    }
    
    if (globalState.productos.length === 0) {
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
        const prodName = globalState.productos.find(p => p.id === v.productId)?.name || 'Desconocido';
        if(v.quantity === 0) {
            container.innerHTML += `<div class="alert-item alert-danger"><i class="ph ph-warning-octagon"></i><span><strong>Variación Agotada!</strong> "${v.name}" (de ${prodName}) tiene 0 unidades.</span></div>`;
        } else {
            container.innerHTML += `<div class="alert-item alert-warning"><i class="ph ph-warning"></i><span><strong>Pocas unidades:</strong> Quedan ${v.quantity} u. de la variación "${v.name}" (de ${prodName}).</span></div>`;
        }
    });
}

// Adaptado para leer desde el estado global sincronizado en lugar de LocalStorage
export function exportCSV() {
    let csvContent = "TIPO;DATOS...\n";
    globalState.categorias.forEach(c => csvContent += `CAT;${c.id};${c.name}\n`);
    globalState.productos.forEach(p => {
        const safeDesc = (p.desc || '').replace(/;/g, ',').replace(/\n/g, ' ');
        csvContent += `PROD;${p.id};${p.categoryId};${p.name};${p.price};${p.quantity};${safeDesc}\n`;
    });
    globalState.variaciones.forEach(v => {
        const safeDesc = (v.desc || '').replace(/;/g, ',').replace(/\n/g, ' ');
        const safeQty = v.quantity !== null && v.quantity !== undefined ? v.quantity : '';
        csvContent += `VAR;${v.id};${v.productId};${v.name};${v.price};${safeDesc};${safeQty}\n`;
    });
    globalState.ventas.forEach(s => csvContent += `SALE;${s.id};${s.prodId};${s.varId || ''};${s.qty};${s.subtotal};${s.iva};${s.total};${s.date}\n`);
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Backup_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click(); document.body.removeChild(link);
}
