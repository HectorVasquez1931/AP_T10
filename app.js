const API = "https://dummyjson.com/auth/login"

const formulario = document.getElementById("login-form");


const error = document.getElementById("login-error");
const boton = document.getElementById("login-btn")

async function login(e) {
    e.preventDefault();
    const user = document.getElementById("username").value;
    const pass = document.getElementById("current-password").value;

    //cargando
    boton.textContent = "CARGANDO";
    boton.disabled = true;

    try {
        error.hidden = true;
        const res = await fetch(API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: user,
                password: pass,
                expiresInMins: 30, // optional, defaults to 60
            }),
            credentials: 'include' // Include cookies (e.g., accessToken) in the request
        })
        const data = await res.json();

        if (!res.ok) throw new Error(data.message);

        localStorage.setItem('accessToken', data.accessToken);
        console.log(data);
    } catch (err) {
        error.hidden = false;
    }
    finally {
        boton.textContent = "Entrar";
        boton.disabled = false;
    }
}

formulario.addEventListener("submit", login);



// /* providing accessToken in bearer */
// fetch('https://dummyjson.com/auth/me', {
//   method: 'GET',
//   headers: {
//     'Authorization': 'Bearer /* YOUR_ACCESS_TOKEN_HERE */', // Pass JWT via Authorization header
//   }, 
//   credentials: 'include' // Include cookies (e.g., accessToken) in the request
// })
// .then(res => res.json())
// .then(console.log);