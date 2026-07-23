import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Reemplaza esto con los datos de tu proyecto en la consola de Firebase
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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

// Exportar servicios
export const db = getFirestore(app);
export const auth = getAuth(app); // Estructura preparada para Firebase Authentication
