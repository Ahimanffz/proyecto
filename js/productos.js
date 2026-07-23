import { addDocument, updateDocument, deleteDocument } from './database.js';
import { globalState, showToast } from './utils.js';

let editingProductId = null;

export function initProductosModule() {
    const formProduct = document.getElementById('form-product');
    if (formProduct) {
        formProduct.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('prod-name').value.trim();
            const categoryId = document.getElementById('prod-category').value;
            const price = parseFloat(document.getElementById('prod-price').value) || 0;
            const quantity = parseInt(document.getElementById('prod-qty').value) || 0;
            const desc = document.getElementById('prod-desc').value.trim();

            if (price < 0 || quantity < 0) return showToast('Valores no pueden ser negativos', 'error');

            const btnSubmit = document.getElementById('btn-submit-prod');
            btnSubmit.disabled = true;

            const payload = { name, categoryId, price, quantity, desc };

            if (editingProductId) {
                const success = await updateDocument('productos', editingProductId, payload);
                if (success) {
                    showToast('Producto actualizado');
                    resetProductForm();
                }
            } else {
                const success = await addDocument('productos', payload);
                if (success) {
                    showToast('Producto registrado');
                    formProduct.reset();
                }
            }
            btnSubmit.disabled = false;
        });
    }

    const btnCancelProd = document.getElementById('btn-cancel-prod');
    if (btnCancelProd) btnCancelProd.addEventListener('click', resetProductForm);

    const searchProd = document.getElementById('search-prod');
    if (searchProd) searchProd.addEventListener('input', (e) => renderProducts(e.target.value));

    window.editProduct = (id) => {
        const prod = globalState.productos.find(p => p.id === id);
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

    window.deleteProduct = async (id) => {
        if (globalState.variaciones.some(v => v.productId === id) || globalState.ventas.some(s => s.prodId === id)) {
            return showToast('No se puede eliminar: Tiene variaciones o ventas asociadas', 'error');
        }
        const success = await deleteDocument('productos', id);
        if (success) showToast('Producto eliminado');
    };
}

function resetProductForm() {
    editingProductId = null; 
    const formProduct = document.getElementById('form-product');
    if (formProduct) formProduct.reset();
    
    document.getElementById('btn-submit-prod').textContent = 'Agregar Producto';
    document.getElementById('btn-cancel-prod').classList.add('hidden');
}

export function renderProducts(filter = '') {
    const tbody = document.querySelector('#table-products tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    const filtered = globalState.productos.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()));
    
    filtered.forEach(prod => {
        const catName = globalState.categorias.find(c => c.id === prod.categoryId)?.name || 'Desconocida';
        const prodVars = globalState.variaciones.filter(v => v.productId === prod.id);
        
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
