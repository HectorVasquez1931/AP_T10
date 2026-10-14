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

const contador_total = document.getElementById("contador-total");
const contador_completadas = document.getElementById("contador-completadas");
const contador_pendientes = document.getElementById("contador-pendientes");
const contador_porcentaje = document.getElementById("contador-porcentaje");
const select_filtro = document.getElementById("filtro");
const buscador = document.getElementById("buscador");
const lista = document.getElementById("lista");
let tareas = [];


const form_agregar = document.getElementById("form-agregar");
const input_nueva = document.getElementById("nueva-tarea");
let usuario_id = 0;

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
                expiresInMins: 30, 
            }),
            credentials: 'include'
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


async function cargarUsuario() {
    const token = localStorage.getItem("accessToken");
    try {
        const res = await fetch('https://dummyjson.com/auth/me', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`, 
            },
            credentials: 'include'
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
        await cargarTareas(usuario.id);
        usuario_id = usuario.id;

    } catch (error) {
        mostrarLogin();
    }
}

async function cargarTareas(id) {
    try {
        const res = await fetch(`https://dummyjson.com/todos/user/${id}`);
        if (!res.ok) throw new Error("Error " + res.status);

        const data = await res.json();
        tareas = data.todos;
        pintarTareas();
    } catch (err) {
        console.error(err);
        lista.innerHTML = "<li>No se pudieron cargar las tareas.</li>";
    }
}


function pintarTareas() {
    const total = tareas.length;

    const completadas = tareas.reduce((cuenta, tarea) => {
        if (tarea.completed) {
            return cuenta + 1;
        }
        return cuenta;
    }, 0);

    const pendientes = total - completadas;

    let porcentaje = 0;

    if (total > 0) {
        porcentaje = completadas / total * 100;
    }

    contador_total.textContent = total;

    contador_completadas.textContent = completadas;
    contador_pendientes.textContent = pendientes;

    contador_porcentaje.textContent = porcentaje + "%";

    const tipo = select_filtro.value;
    const texto = buscador.value.trim().toLowerCase();

    const visibles = tareas.filter((tarea) => {
        if (tipo === "pendientes") {
            return !tarea.completed;
        }
        if (tipo === "completadas") {
            return tarea.completed;
        }

        return true;
    }).filter((tarea) => {
        return tarea.todo.toLowerCase().includes(texto);
    });

    const items = visibles.map((tarea) => {
        const li = document.createElement("li");

        const casilla = document.createElement("input");
        casilla.type = "checkbox";
        casilla.checked = tarea.completed;
        casilla.addEventListener("change", () => marcarTarea(tarea.id));

        const span = document.createElement("span");
        span.textContent = tarea.todo;

        const boton_eliminar = document.createElement("button");
        boton_eliminar.type = "button";
        boton_eliminar.textContent = "Eliminar";
        boton_eliminar.addEventListener("click", () => eliminarTarea(tarea.id));

        li.append(casilla, span, boton_eliminar);
        if (tarea.completed) {
            li.classList.add("completada");
        }
        return li;
    });

    lista.replaceChildren(...items);
}

async function marcarTarea(id) {

    const tarea = tareas.find((t) => t.id === id);
    const nuevo_estado = !tarea.completed;

    try {

        if (!tarea.local) {
            const res = await fetch(`https://dummyjson.com/todos/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ completed: nuevo_estado }),
            });
            if (!res.ok) throw new Error("Error " + res.status);
        }

        tarea.completed = nuevo_estado;
    } catch (err) {
        console.error(err);
    }

    pintarTareas();
}

async function eliminarTarea(id) {
    const tarea = tareas.find((t) => t.id === id);

    try {
        if (!tarea.local) {
            const res = await fetch(`https://dummyjson.com/todos/${id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Error " + res.status);
        }

        tareas = tareas.filter((t) => t.id !== id);
    } catch (err) {
        console.error(err);
    }

    pintarTareas();
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

async function agregarTarea(e) {
    e.preventDefault();

    const texto_nuevo = input_nueva.value.trim();
    if (texto_nuevo === "") return;  

    try {
        const res = await fetch("https://dummyjson.com/todos/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                todo: texto_nuevo,
                completed: false,
                userId: usuario_id,
            }),
        });

        if (!res.ok) throw new Error("Error " + res.status);

        const nueva = await res.json();

        nueva.local = true;

        tareas.push(nueva);
        input_nueva.value = "";
        pintarTareas();
    } catch (err) {
        console.error(err);
    }
}

function cerrarSesion() {
    localStorage.removeItem("accessToken");
    formulario.reset();
    mostrarLogin();
}


formulario.addEventListener("submit", login);
boton_cerrar.addEventListener("click", cerrarSesion);
select_filtro.addEventListener("change", pintarTareas);
buscador.addEventListener("input", pintarTareas);
form_agregar.addEventListener("submit", agregarTarea);

if (localStorage.getItem("accessToken")) {
    cargarUsuario();
} else {
    mostrarLogin();
}


