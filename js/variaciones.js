import { addDocument, updateDocument, deleteDocument } from './database.js';
import { globalState, showToast } from './utils.js';

let editingVariationId = null;

export function initVariacionesModule() {
    const formVariation = document.getElementById('form-variation');
    if (formVariation) {
        formVariation.addEventListener('submit', async (e) => {
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

            const btnSubmit = document.getElementById('btn-submit-var');
            btnSubmit.disabled = true;

            const payload = { productId, name, price, desc, quantity };

            if (editingVariationId) {
                const success = await updateDocument('variaciones', editingVariationId, payload);
                if (success) {
                    showToast('Variación actualizada');
                    resetVariationForm();
                }
            } else {
                const success = await addDocument('variaciones', payload);
                if (success) {
                    showToast('Variación registrada');
                    formVariation.reset();
                }
            }
            btnSubmit.disabled = false;
        });
    }

    const btnCancelVar = document.getElementById('btn-cancel-var');
    if (btnCancelVar) btnCancelVar.addEventListener('click', resetVariationForm);

    const searchVar = document.getElementById('search-var');
    if (searchVar) searchVar.addEventListener('input', (e) => renderVariations(e.target.value));

    window.editVariation = (id) => {
        const vr = globalState.variaciones.find(v => v.id === id);
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

    window.deleteVariation = async (id) => {
        if (globalState.ventas.some(s => s.varId === id)) {
            return showToast('No se puede eliminar: Se usó en una venta', 'error');
        }
        const success = await deleteDocument('variaciones', id);
        if (success) showToast('Variación eliminada');
    };
}

function resetVariationForm() {
    editingVariationId = null; 
    const formVariation = document.getElementById('form-variation');
    if (formVariation) formVariation.reset();
    
    document.getElementById('btn-submit-var').textContent = 'Agregar Variación';
    document.getElementById('btn-cancel-var').classList.add('hidden');
}

export function renderVariations(filter = '') {
    const tbody = document.querySelector('#table-variations tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    const filtered = globalState.variaciones.filter(v => v.name.toLowerCase().includes(filter.toLowerCase()));
    
    filtered.forEach(vr => {
        const prodName = globalState.productos.find(p => p.id === vr.productId)?.name || 'Desconocido';
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
