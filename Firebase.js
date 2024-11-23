
// SDKとは「Software Development Kit」（ソフトウェア開発キット）の略
// Import the functions you need from the SDKs you need(SDKから必要な関数をインポート)
import { initializeApp } from "firebase/app";
import { getFireStore } from "firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyA7kATZAWIf6SrL2pEhk-STMnmK3q3t-rE",
    authDomain: "bookindex-55f18.firebaseapp.com",
    databaseURL: "https://bookindex-55f18-default-rtdb.firebaseio.com",
    projectId: "bookindex-55f18",
    storageBucket: "bookindex-55f18.firebasestorage.app",
    messagingSenderId: "767766531773",
    appId: "1:767766531773:web:abb8494e48e50f70dcb1d4",
    measurementId: "G-8RH7W5Z7JP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Cloud FireStore and get a reference to the service
const db = getFireStore(app);
console.log("Firestore is ready!");

import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";
async function getData() {
    const docRef = doc(db, "cities", "your-document-id");
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        console.log("Document data:", docSnap.data());
    } else {
        console.log("No such document!");
    }
}

getData();
