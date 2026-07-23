import { db } from './firebase.js';
import { 
    collection, doc, addDoc, updateDoc, deleteDoc, setDoc, onSnapshot, increment 
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { showToast } from './utils.js';

// Agregar documento con ID automático
export const addDocument = async (colName, data) => {
    try {
        await addDoc(collection(db, colName), data);
        return true;
    } catch (error) {
        console.error(`Error en ${colName}:`, error);
        showToast('Error de sincronización con la nube', 'error');
        return false;
    }
};

// Establecer documento con ID específico (Útil para migraciones o importaciones)
export const setDocument = async (colName, id, data) => {
    try {
        await setDoc(doc(db, colName, id), data);
        return true;
    } catch (error) {
        console.error(`Error seteando en ${colName}:`, error);
        return false;
    }
};

// Actualizar documento existente
export const updateDocument = async (colName, id, data) => {
    try {
        await updateDoc(doc(db, colName, id), data);
        return true;
    } catch (error) {
        console.error(`Error actualizando ${colName}:`, error);
        showToast('Error al actualizar', 'error');
        return false;
    }
};

// Restar o sumar stock usando la función atómica increment de Firebase
export const updateStock = async (colName, id, quantityToDeduct) => {
    try {
        await updateDoc(doc(db, colName, id), {
            quantity: increment(-quantityToDeduct)
        });
        return true;
    } catch (error) {
        console.error(`Error actualizando stock en ${colName}:`, error);
        return false;
    }
};

// Eliminar documento
export const deleteDocument = async (colName, id) => {
    try {
        await deleteDoc(doc(db, colName, id));
        return true;
    } catch (error) {
        console.error(`Error eliminando en ${colName}:`, error);
        showToast('Error al eliminar', 'error');
        return false;
    }
};

// Listener en tiempo real (Reemplaza los getDocs de lectura masiva)
export const listenCollection = (colName, callback) => {
    return onSnapshot(collection(db, colName), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        callback(data);
    }, (error) => {
        console.error(`Error escuchando ${colName}:`, error);
    });
};
