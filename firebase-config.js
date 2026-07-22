// Importar funciones del SDK Modular de Firebase
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