const API = "https://dummyjson.com/auth/login"

const seccion_login = document.getElementById("login");
const seccion_dashboard = document.getElementById("dashboard");

const formulario = document.getElementById("login-form");
const error = document.getElementById("login-error");
const boton = document.getElementById("login-btn")
const boton_cerrar = document.getElementById("cerrar-sesion")

const foto = document.getElementById("foto");
const nombre = document.getElementById("nombre");
const correo = document.getElementById("correo");
const edad = document.getElementById("edad");
const telefono = document.getElementById("telefono");
const ciudad = document.getElementById("ciudad");

function mostrarLogin() {
    seccion_login.hidden = false;
    seccion_dashboard.hidden = true;
}

function mostrarDashboard() {
    seccion_login.hidden = true;
    seccion_dashboard.hidden = false;
}

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
        await cargarUsuario();
        console.log(data);
    } catch (err) {
        error.hidden = false;
    }
    finally {
        boton.textContent = "Entrar";
        boton.disabled = false;
    }
}


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


async function cargarUsuario() {
    const token = localStorage.getItem("accessToken");
    try {
        const res = await fetch('https://dummyjson.com/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, // Pass JWT via Authorization header
            },
            credentials: 'include' // Include cookies (e.g., accessToken) in the request
        })
        if (res.status == 401) {
            cerrarSesion();
            return
        }
        if (!res.ok) throw new Error("Error " + res.status);

        const usuario = await res.json();
        console.log(usuario);
        pintarPerfil(usuario);
        mostrarDashboard();


    } catch (error) {
        mostrarLogin();
    }
}

function pintarPerfil(usuario) {
    foto.src = usuario.image;
    foto.alt = `Foto de ${usuario.firstName}`;
    nombre.textContent = `${usuario.firstName} ${usuario.lastName}`;
    correo.textContent = usuario.email;
    edad.textContent = `Edad: ${usuario.age}`;
    telefono.textContent = `Teléfono: ${usuario.phone}`;
    ciudad.textContent = `Ciudad: ${usuario.address.city}`;
}

function cerrarSesion() {
    localStorage.removeItem("accessToken");
    formulario.reset();
    mostrarLogin();
}


formulario.addEventListener("submit", login);
boton_cerrar.addEventListener("click", cerrarSesion);


if (localStorage.getItem("accessToken")) {
    cargarUsuario();
} else {
    mostrarLogin();
}
