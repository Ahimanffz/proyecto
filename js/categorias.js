import { addDocument, updateDocument, deleteDocument } from './database.js';
import { globalState, showToast } from './utils.js';

let editingCategoryId = null;

export function initCategoriasModule() {
    const formCategory = document.getElementById('form-category');
    if (formCategory) {
        formCategory.addEventListener('submit', async (e) => {
            e.preventDefault();
            const nameInput = document.getElementById('cat-name');
            const name = nameInput ? nameInput.value.trim() : '';
            
            if (!name) return showToast('El nombre no puede estar vacío', 'error');

            const btnSubmit = document.getElementById('btn-submit-cat');
            btnSubmit.disabled = true; // Prevenir múltiples envíos

            if (editingCategoryId) {
                const success = await updateDocument('categorias', editingCategoryId, { name });
                if (success) {
                    showToast('Categoría actualizada');
                    resetCategoryForm();
                }
            } else {
                const success = await addDocument('categorias', { name });
                if (success) {
                    showToast('Categoría creada exitosamente');
                    formCategory.reset();
                }
            }
            btnSubmit.disabled = false;
        });
    }

    const btnCancelCat = document.getElementById('btn-cancel-cat');
    if (btnCancelCat) btnCancelCat.addEventListener('click', resetCategoryForm);

    const searchCat = document.getElementById('search-cat');
    if (searchCat) searchCat.addEventListener('input', (e) => renderCategories(e.target.value));

    // Exponer funciones al entorno global para los botones HTML (onclick)
    window.editCategory = (id) => {
        const cat = globalState.categorias.find(c => c.id === id);
        if (cat) {
            editingCategoryId = cat.id; 
            document.getElementById('cat-name').value = cat.name;
            document.getElementById('btn-submit-cat').textContent = 'Actualizar Categoría';
            document.getElementById('btn-cancel-cat').classList.remove('hidden');
        }
    };

    window.deleteCategory = async (id) => {
        if (globalState.productos.some(p => p.categoryId === id)) {
            return showToast('No se puede eliminar: Hay productos en esta categoría', 'error');
        }
        const success = await deleteDocument('categorias', id);
        if (success) showToast('Categoría eliminada');
    };
}

function resetCategoryForm() {
    editingCategoryId = null; 
    const formCategory = document.getElementById('form-category');
    if (formCategory) formCategory.reset();
    
    const btnSubmit = document.getElementById('btn-submit-cat');
    if (btnSubmit) btnSubmit.textContent = 'Agregar Categoría';
    const btnCancelCat = document.getElementById('btn-cancel-cat');
    if (btnCancelCat) btnCancelCat.classList.add('hidden');
}

export function renderCategories(filter = '') {
    const tbody = document.querySelector('#table-categories tbody');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    const filtered = globalState.categorias.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));
    
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
