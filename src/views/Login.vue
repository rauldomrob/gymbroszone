<script setup>
/*Imports y declaración de variables.*/
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { ref } from 'vue';
import { supabase } from '../clients/supabase';
import Footer from '../components/Footer.vue';

const email = ref("");
const password = ref("");
const mensajeError = ref('');
const passwordInput = ref(null);
const emailInput = ref(null);
const contraVisible = ref(false);
const mostrarMensaje = ref(false);

/*Función para iniciar sesión con Twitter.*/
async function loginTwitter() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
    });
    if (error) {
        mensaje('Hubo un error al verificar las credenciales. Por favor, inténtalo de nuevo.', null);
    }
}

/*Función para iniciar sesión con Google.*/
async function loginGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
    });
    if (error) {
        mensaje('Hubo un error al verificar las credenciales. Por favor, inténtalo de nuevo.', null);
    }
}

/*Función para crear una carpeta en la que se almacenarán las imágenes del usuario.*/
async function crearCarpeta(data) {
    /*Ruta carpeta del usuario.*/
    const ruta = `users/${data.user.id.split('').reverse().join('')}/`;
    /*Comprobamos si existe la carpeta con el Id del usuario.*/
    const { data: carpeta, error: errorCarpeta } = await supabase
        .storage
        .from('files')
        .list(ruta);

    /*Si no hay ninguna carpeta, la creamos con un archivo vacío.*/
    if (carpeta.length === 0) {
        const { error: errorSubida } = await supabase.storage
            .from('files')
            .upload(ruta + 'dummy.txt', new Blob(['dummy content']), {
                cacheControl: '3600',
                upsert: false
            });
        /*Aviso de que ha ocurrido un error a la hora de crear la carpeta.*/
        if (errorSubida) {
            mensaje('Hubo un error al iniciar sesión. Por favor, inténtalo de nuevo.', null);
            return false;
        }
        /*Aviso de que ha ocurrido un error a la hora de crear la carpeta.*/
    } else if (errorCarpeta) {
        mensaje('Hubo un error al iniciar sesión. Por favor, inténtalo de nuevo.', null);
        return false;
    }
    /*Redirección al usuario a home.*/
    window.location.href = "/";
}

/*Función de inicio de sesión con correo y contraseña. */
async function login() {
    try {
        /*Comprobación de que el email no esté vacío.*/
        if (email.value === '') {
            mensaje('El email está vacío.', emailInput);
            return false;
        }
        /*Comprobación de que la contraseña no esté vacía.*/
        if (password.value === '') {
            mensaje('La contraseña está vacía.', passwordInput);
            return false;
        }
        /*Comprobamos si el email ingresado ya está en uso*/
        const { data: usuarios, error: errorUsuarios } = await supabase
            .from('usuarios')
            .select('email')
            .eq('email', email.value);
            
        if (errorUsuarios) throw errorUsuarios;
        /*El email estará en uso si usuarios contiene algún elemento.*/
        if (usuarios.length > 0) {
            const { data, error: errorAuth } = await supabase.auth.signInWithPassword({
                email: email.value,
                password: password.value
            });
            /*Avisamos al usuario en caso de haber algún error.*/
            if (errorAuth) {
                mensaje('Tu contraseña no es correcta. Compruébala.', passwordInput);
                return false;
            } else {
                crearCarpeta(data);
            }
            /*Aviso al usuario de que sus credenciales son inválidas.*/
        } else {
            mensaje('Tu contraseña no es correcta. Compruébala.', passwordInput);
            return false;
        }
        /*Aviso al usuario de que hubo un error al verificar sus credenciales.*/
    } catch (error) {
        mensaje('Hubo un error al verificar las credenciales. Por favor, inténtalo de nuevo.', passwordInput);
        return false;
    }
}

/*Función para mostrar los mensajes de aviso al usuario.*/
function mensaje(mensaje, Input) {
    mensajeError.value = mensaje;
    mostrarMensaje.value = true;
    Input.value.focus();
}
</script>
<template>
    <div class="todo_login" @keyup.enter="login">
        <div class="login">
            <div class="titulo">Login</div>
            <div class="gymtag_o_email">
                <div class="container">
                    <div class="subcontainer">
                        <input v-model="email" type="text" name="gymtag_o_email" class="input" required
                            autocomplete="off" ref="emailInput">
                        <label class="label">Email</label>
                    </div>
                </div>
            </div>
            <div class="password">
                <div class="container">
                    <div class="subcontainer">
                        <input v-model="password" :type="contraVisible ? 'text' : 'password'" name="password"
                            class="input" required autocomplete="off" ref="passwordInput">
                        <label class="label">Contraseña</label>
                        <div class="contenedor_ojo">
                            <font-awesome-icon :icon="contraVisible ? 'fas fa-eye' : 'fas fa-eye-slash'" :class="contraVisible ? 'ojo  ojo_abierto' : 'ojo'" @click="contraVisible = !contraVisible" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="mensaje" :style="{ visibility: mostrarMensaje ? 'visible' : 'hidden' }">
                <div class="mensaje_texto">
                    {{ mensajeError }}
                </div>
            </div>
            <div class="iniciar">
                <div class="iniciar_texto"><button @click="login">Iniciar sesión</button></div>
            </div>
            <div class="inicio_sesion">
                <div class="inicio_sesion_contenido">
                    <div class="twitter" @click="loginTwitter"><font-awesome-icon :icon="['fab', 'square-x-twitter']" style="color: #eef2fa;" class="icono_iniciar" /></div>
                    <div class="google" @click="loginGoogle"><font-awesome-icon :icon="['fab', 'google']" class="icono_google icono_iniciar" /></div>
                </div>
            </div>
            <div class="cuenta_existente">
                <RouterLink to="/recoverPassword" class="cuenta_existente_texto">¿Has olvidado la contaseña?</RouterLink>
            </div>
            <div class="crear">
                <div class="crear_texto">
                    <button>
                        <RouterLink to="/register" class="btn-loged" id="btn-register">Crear una nueva cuenta
                        </RouterLink>
                    </button>
                </div>
            </div>
        </div>
    </div>
  <Footer class="footer"/>
</template>
<style scoped>
.footer{
    position: absolute;
    bottom: 0;
}

.todo_login {
    width: 100vw;
    height: fit-content;
    background: var(--bg-color);
    display: flex;
    align-items: center;
    flex-direction: column;
    padding-top: 155px;
}

.login {
    width: 50%;
    height: fit-content;
    max-width: 1050px;
    background-color: var(--dark-blue);
    display: flex;
    text-align: center;
    flex-direction: column;
    border: var(--black) 4px solid;
    border-radius: 6px;
    margin-bottom: 100px;
}

button a {
    color: var(--light-blue-text);
    text-decoration: none;
}

.titulo {
    height: 110px;
    color: var(--light-blue-text);
    padding: 20px 0;
    font-size: 60px;
    font-weight: bold;
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
}

.subcontainer {
    display: flex;
    justify-content: start;
    width: 75%;
}

.container {
    display: flex;
    flex-direction: column;
    gap: 7px;
    position: relative;
    align-items: center;
    color: var(--light-blue-text);
    width: 100%;
}

.container .label {
    font-size: 24px;
    padding-left: 10px;
    position: absolute;
    top: 9px;
    transition: 0.3s;
    pointer-events: none;
}

.input {
    width: 100%;
    height: 45px;
    border: none;
    outline: none;
    padding: 0px 7px;
    border-radius: 2px;
    color: var(--light-blue-text);
    font-size: 18px;
    background-color: var(--blue-inputs);
    box-shadow: 3px 3px 10px rgba(0, 0, 0, 1);
    cursor: text;
}

.input:focus {
    border: 2px solid transparent;
    color: var(--light-blue-text);
}

.container .input:valid~.label,
.container .input:focus~.label,
.fecha_nacimiento .input~.label {
    transition: 0.3s;
    padding-left: 2px;
    transform: translateY(-37px);
}

.container .input:valid,
.container .input:focus {
    border: 2px solid #eef2fa81;
}

.gymtag_o_email {
    margin-top: 20px;
    margin-bottom: 10px;
}

.password {
    margin-top: 30px;
}

.contenedor_ojo {
    width: 30px;
    height: 30px;
    margin-top: 8.5px;
    background-color: var(--blue-inputs);
    font-size: 27px;
    padding: 7.5px 0;
    margin-left: -38px;
    position: relative;
}

.ojo {
    color: var(--light-blue-text);
    position: relative;
    top: -7.5px;
    right: 3px;
    text-align: center;
    cursor: pointer;
}

.ojo_abierto {
    transform: translateX(1.05px);
}

.gymtag_o_email .container .subcontainer,
.password .container .subcontainer {
    width: 75%;
}

.iniciar {
    margin-top: 10px;
    margin-bottom: 20px;
    height: 50px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.iniciar_texto {
    width: 30%;
    height: 100%;
    display: flex;
    justify-content: center;
    text-align: center;
    min-width: 247px;
}

.iniciar_texto button {
    cursor: pointer;
    background-color: var(--blue-buttons);
    width: 100%;
    border: solid var(--black) 2px;
    border-radius: 2px;
    font-size: 20px;
    transition: background-color 0.5s, border 0.5s, color 0.5s;
}

.iniciar_texto button:hover,
.iniciar_texto button:active {
    background-color: var(--blue-inputs);
    color: var(--light-blue-text);
    border-color: #eef2fa81;
}

.inicio_sesion {
    margin-bottom: 15px;
    height: 70px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.inicio_sesion_contenido {
    width: 27%;
    min-width: 220px;
    height: 100%;
    border-radius: 2px;
    display: flex;
    justify-content: space-around;
    text-align: center;
    font-size: 50px;
    text-align: center;
}

.icono_google {
    font-size: 35px;
    background-color: var(--light-blue-text);
    padding: 5px 6px;
    border-radius: 6px;
    color: var(--dark-blue);
}

.icono_iniciar {
    cursor: pointer;
}

.inicio_sesion_contenido>div {
    display: flex;
    justify-content: center;
    align-items: center;
}

.cuenta_existente {
    width: 100%;
    height: fit-content;
    display: flex;
    justify-content: center;
    align-items: center;
}

.cuenta_existente_texto {
    color: var(--light-blue-text);
    font-size: 19px;
}

.crear {
    margin-top: 10px;
    margin-bottom: 40px;
    height: 55px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.crear_texto {
    width: 28%;
    min-width: 275px;
    height: 100%;
    display: flex;
    justify-content: center;
    text-align: center;
}

.crear_texto button {
    padding: 10px;
    cursor: pointer;
    background-color: var(--blue-inputs);
    border: solid var(--black) 2px;
    color: var(--light-blue-text);
    border-radius: 2px;
    font-size: 20px;
    transition: background-color 0.5s, border 0.5s, color 0.5s;
}

.crear_texto button:hover,
.crear_texto button:active {
    border: 2px solid #eef2fa81;
}

.mensaje {
    font-size: 20px;
    height: fit-content;
    visibility: hidden;
    display: flex;
    justify-content: center;
    color: var(--light-blue-text);
    text-align: center;
    margin-top: 30px;
}

.mensaje_texto {
    width: 80%;
}

@media(max-width: 1140px) {
    .login {
        width: 88%;
    }

    .titulo {
        margin-top: 20px;
        font-size: 45px;
        padding: 0;
        height: 90px;
    }

    .gymtag_o_email {
        padding: 0 0 10px;
    }

    .iniciar {
        margin-bottom: 0px;
    }

    .gymtag_o_email .input,
    .password .input {
        height: 55px;
    }

    .container .label {
        font-size: 27px;
        top: 12.5px;
    }

    .container .input:valid~.label,
    .container .input:focus~.label,
    .fecha_nacimiento .input~.label {
        transition: 0.3s;
        padding-left: 2px;
        transform: translateY(-45.5px);
    }

    .subcontainer,
    .iniciar_texto,
    .crear_texto {
        display: flex;
        justify-content: start;
        width: 85%;
    }

    .input {
        font-size: 26px;
    }

    .gymtag_o_email .container,
    .password .container,
    .iniciar_texto button,
    .crear_texto button {
        width: 100%;
    }

    .gymtag_o_email .container .subcontainer,
    .password .container .subcontainer {
        width: 85%;
        min-width: 0;
        padding: 0;
    }

    .iniciar_texto button,
    .crear_texto button {
        height: 55px;
    }

    .iniciar,
    .crear {
        height: 80px;
        padding-top: 10px;
    }

    .crear{
        margin-bottom: 0;
        margin-top: 15px;
    }

    .crear_texto {
        min-width: 0;
    }

    .contenedor_ojo {
        width: 40px;
        height: 40px;
        padding: 14px 0;
        margin-left: -50px;
    }

    .contenedor_ojo {
        font-size: 32px;
        margin-left: -47px;
        padding: 10px 0;
    }

    .mensaje {
        font-size: 20px;
        height: fit-content;
        visibility: hidden;
        display: flex;
        justify-content: center;
        color: var(--light-blue-text);
        text-align: center;
        margin: 30px 0 0;
    }
}

@media(max-width: 875px) {
    .todo_login {
        padding-top: 159px;
    }
}

@media(max-width: 600px) {
    .login{
        margin-bottom: 130px;
    }

    .todo_login {
        padding-top: 232px;
    }

    .titulo {
        font-size: 40px;
        height: 70px;
    }

    .contenedor_calendario,
    .contenedor_ojo {
        width: 30px;
        height: 30px;
        font-size: 30px;
        padding: 9px 0;
        margin-left: -40px;
    }

    .contenedor_ojo {
        font-size: 25px;
    }

    .gymtag_o_email .input,
    .password .input {
        height: 45px;
    }

    .container .label {
        font-size: 25px;
        top: 10px;
    }

    .container .input:valid~.label,
    .container .input:focus~.label {
        transform: translateY(-37.5px);
    }

    .iniciar {
        margin-bottom: 25px;
        height: fit-content;
        height: 55px;
        min-width: 0;
    }

    .iniciar_texto button {
        font-size: 18px;
    }

    .icono_google {
        font-size: 35px;
        background-color: var(--light-blue-text);
        padding: 5px 6px;
        border-radius: 6px;
        color: #0b1e44;
    }

    .inicio_sesion_contenido>div {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .inicio_sesion {
        margin-bottom: 20px;
        margin-top: 10px;
        height: fit-content;
        width: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .inicio_sesion_contenido {
        width: 57%;
        font-size: 50px;
        min-width: 0;
        border-width: 0px;
    }

    .icono_google {
        font-size: 33px;
    }

    .crear {
        margin-bottom: 0;
    }

    .input {
        font-size: 22px;
    }

    .mensaje_texto {
        font-size: 18px;
    }
}

@media(max-width: 378px) {
    .inicio_sesion_contenido {
        width: 70%;
        font-size: 40px;
        min-width: 0;
    }

    .icono_google {
        font-size: 25px;
    }

    .iniciar_texto {
        min-width: 0;
    }

    .crear_texto button {
        height: fit-content
    }
}

@media(max-width: 333px){
    .iniciar,
    .crear {
        height: 80px;
    }

    #btn-register{
        font-size: 17px;
    }
}

@media(max-width: 295px){
    #btn-register{
        font-size: 15px;
    }
}
</style>