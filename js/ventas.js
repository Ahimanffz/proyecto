import { addDocument, updateStock } from './database.js';
import { globalState, showToast, populateDropdowns, updateDashboard } from './utils.js';
import { renderProducts } from './productos.js';
import { renderVariations } from './variaciones.js';

export function initVentasModule() {
    const saleProductSelect = document.getElementById('sale-product');
    const saleVarSelect = document.getElementById('sale-variation');
    const saleQtyInput = document.getElementById('sale-qty');

    if (saleProductSelect && saleVarSelect && saleQtyInput) {
        saleProductSelect.addEventListener('change', () => {
            const prodId = saleProductSelect.value;
            saleVarSelect.innerHTML = '<option value="">Seleccionar variación (Opcional)...</option>';
            
            const prodVars = globalState.variaciones.filter(v => v.productId === prodId);
            prodVars.forEach(v => {
                const stockInfo = v.quantity !== null && v.quantity !== undefined ? ` (Stock: ${v.quantity})` : ' (Usa base)';
                saleVarSelect.innerHTML += `<option value="${v.id}">${v.name} (+ $${v.price}) ${stockInfo}</option>`;
            });
            calculateSale();
        });

        [saleProductSelect, saleVarSelect, saleQtyInput].forEach(el => el.addEventListener('input', calculateSale));
    }

    const formSale = document.getElementById('form-sale');
    if (formSale) {
        formSale.addEventListener('submit', async (e) => {
            e.preventDefault();
            const prodId = saleProductSelect.value;
            const varId = saleVarSelect.value;
            const qty = parseInt(saleQtyInput.value);

            const prod = globalState.productos.find(p => p.id === prodId);
            if (!prod) return;
            
            const variation = globalState.variaciones.find(v => v.id === varId);
            const hasIndependentStock = variation && variation.quantity !== null && variation.quantity !== undefined;
            const availableStock = hasIndependentStock ? variation.quantity : prod.quantity;

            if (availableStock < qty) {
                return showToast('Stock insuficiente para realizar esta venta', 'error');
            }

            const btnSubmit = formSale.querySelector('button[type="submit"]');
            btnSubmit.disabled = true;

            const subtotal = (prod.price + (variation ? variation.price : 0)) * qty;
            const iva = subtotal * 0.16;
            
            const saleData = {
                prodId,
                varId,
                qty,
                subtotal,
                iva,
                total: subtotal + iva,
                date: new Date().toLocaleString()
            };

            try {
                // 1. Registrar la venta en la nube
                await addDocument('ventas', saleData);

                // 2. Descontar stock utilizando increment() en la nube de forma atómica
                if (hasIndependentStock) {
                    await updateStock('variaciones', varId, qty);
                } else {
                    await updateStock('productos', prodId, qty);
                }

                showToast('Venta sincronizada e inventario actualizado.');
                formSale.reset(); 
                updateSaleUI(0, 0, 0);
                const preview = document.getElementById('sale-preview-container');
                if (preview) preview.style.display = 'none';

            } catch (error) {
                showToast('Error al procesar la venta en la nube', 'error');
            } finally {
                btnSubmit.disabled = false;
            }
        });
    }
}

function calculateSale() {
    const saleProductSelect = document.getElementById('sale-product');
    const saleVarSelect = document.getElementById('sale-variation');
    const saleQtyInput = document.getElementById('sale-qty');

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
    
    const prod = globalState.productos.find(p => p.id === prodId);
    const variation = globalState.variaciones.find(v => v.id === varId);
    
    if (!prod) return;

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
    const iva = subtotal * 0.16;
    
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

export function renderSales() {
    const tbody = document.querySelector('#table-sales tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    // Ordenar por fecha descendente considerando que no tenemos timestamp exacto sino string locale
    const sortedSales = [...globalState.ventas].reverse(); 
    
    sortedSales.forEach(s => {
        const prod = globalState.productos.find(p => p.id === s.prodId);
        const vr = globalState.variaciones.find(v => v.id === s.varId);
        
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
