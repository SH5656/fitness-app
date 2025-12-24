import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "PASTE_YOUR_API_KEY",
  authDomain: "PASTE_YOUR_DOMAIN",
  projectId: "PASTE_PROJECT_ID",
  storageBucket: "PASTE_BUCKET"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth();
const storage = getStorage();

window.signup = ()=>{
  createUserWithEmailAndPassword(auth,email.value,password.value)
  .then(()=>alert("Account created"));
};

window.login = ()=>{
  signInWithEmailAndPassword(auth,email.value,password.value)
  .then(()=>alert("Login success"));
};

window.uploadPhoto = ()=>{
  const file=document.getElementById("photoInput").files[0];
  const r=ref(storage,"profile.jpg");
  uploadBytes(r,file).then(()=>{
    getDownloadURL(r).then(url=>{
      document.getElementById("photo").src=url;
    });
  });
};
