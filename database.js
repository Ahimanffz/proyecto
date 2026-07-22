import { db } from './firebase-config.js';
import { 
    collection, addDoc, doc, updateDoc, deleteDoc, setDoc, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/**
 * Escucha cambios en tiempo real en TODAS las colecciones requeridas.
 * @param {Function} onDataUpdated - Callback que se ejecuta cuando los datos cambian.
 */
export function initRealtimeListeners(onDataUpdated) {
    const collections = [
        'categorias', 'productos', 'variaciones', 'ventas', 
        'clientes', 'usuarios', 'configuracion'
    ];

    collections.forEach(colName => {
        onSnapshot(collection(db, colName), (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Enviar datos actualizados de vuelta a script.js
            onDataUpdated(colName, data);
        }, (error) => {
            console.error(`Error escuchando ${colName}:`, error);
        });
    });
}

// ==========================================
// FUNCIONES CRUD REUTILIZABLES
// ==========================================

export async function addDocument(colName, data) {
    try {
        const docRef = await addDoc(collection(db, colName), data);
        return docRef.id;
    } catch (error) {
        console.error(`Error agregando documento en ${colName}:`, error);
        throw error;
    }
}

// Utilizado especialmente para restaurar copias de seguridad CSV manteniendo IDs
export async function setDocumentWithId(colName, id, data) {
    try {
        await setDoc(doc(db, colName, id), data);
    } catch (error) {
        console.error(`Error estableciendo documento en ${colName}:`, error);
        throw error;
    }
}

export async function updateDocument(colName, id, data) {
    try {
        const docRef = doc(db, colName, id);
        await updateDoc(docRef, data);
    } catch (error) {
        console.error(`Error actualizando documento en ${colName}:`, error);
        throw error;
    }
}

export async function deleteDocument(colName, id) {
    try {
        await deleteDoc(doc(db, colName, id));
    } catch (error) {
        console.error(`Error eliminando documento en ${colName}:`, error);
        throw error;
    }
}