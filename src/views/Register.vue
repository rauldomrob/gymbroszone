<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { supabase } from '../clients/supabase';
import { usandoMovil } from '@/main';
import { useRouter } from 'vue-router';
import Footer from '../components/Footer.vue'

const nombre = ref('');
const apellidos = ref('');
const gymtag = ref('');
const email = ref('');
const password = ref('');
const password2 = ref('');
const fecha_nacimiento = ref('');
const aceptar = ref(false);

const nombreInput = ref(null);
const apellidosInput = ref(null);
const gymtagInput = ref(null);
const emailInput = ref(null);
const passwordInput = ref(null);
const password2Input = ref(null);
const fecha_nacimientoInput = ref(null);

const contraVisible = ref(false);
const contraVisible2 = ref(false);
const mostrarMensaje = ref(false);
const mensajeError = ref('');

const windowWidth = ref(window.innerWidth);
const mostrarPrimeraParte = ref(true);

const router = useRouter();

/*Función para crear la cuenta del usuario con la información ingresada.*/
async function createAccount() {
    const { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
            data: {
                'gymtag': gymtag.value,
                'fechanacimiento': fecha_nacimiento.value,
                'fotoperfil': '/predeterminada.png',
                'nombre': nombre.value,
                'apellidos': apellidos.value
            }
        }
    });
    if (error) {
        return null;
    } else {
        /*Codificamos la URL por seguridad.*/
        const emailEncoded = encodeURIComponent(email.value);
        window.location.href = `/waiting-verification?email=${emailEncoded}`;
    }
}

/*Establecemos 'pantallaGrande' como 'true' si la ventana es al menos de 1140px de ancho.*/
const pantallaGrande = computed(() => {
    return windowWidth.value >= 1140;
});

/*Cambio el valor del ancho de la pantalla cuando cambia de tamaño.*/
const updateWidth = () => {
    windowWidth.value = window.innerWidth;
};

/*Añadimos un addEventListener para el evento 'resize' cuando montamos el componente.*/
onMounted(() => {
    window.addEventListener('resize', updateWidth);
});

/*Eliminamos el addEventListener del evento 'resize' cuando desmontamos el componente.*/
onUnmounted(() => {
    window.removeEventListener('resize', updateWidth);
});

/*Mostramos la segunda parte del formulario.*/
function segundaParte() {
    mostrarPrimeraParte.value = false;
    mostrarMensaje.value = false;
    mensajeError.value = '';
}

/*Mostramos la primera parte del formulario.*/
function primeraParte() {
    mostrarPrimeraParte.value = true;
    mostrarMensaje.value = false;
    mensajeError.value = '';
}

/*Función para mostrar el mensaje de error al usuario.*/
function mensaje(mensaje, Input) {
    mensajeError.value = mensaje;
    mostrarMensaje.value = true;
    Input.value.focus();
}

/*Para que cuando se haga clic en el div que tapa el icono del calendario, se haga focus en el input de la fecha de nacimiento.*/
function triggerDateInput(){
    fecha_nacimientoInput.value.focus();
}

/*Comprobamos el nombre ingresado.*/
function validarNombre() {
    const nombreT = nombre.value.trim();
    if (/^(?!.* {2,})[a-zñáéíóú\s-]{3,14}$/i.test(nombreT)) {
        return true;
    }
    mensaje('El nombre debe contener entre 3 y 14 letras.', nombreInput);
    return false;
}

/*Comprobamos los apellidos ingresados.*/
function validarApellidos() {
    const apellidosT = apellidos.value.trim();
    if (/^(?!.* {2,})[a-zñáéíóú\s-]{3,24}$/i.test(apellidosT)) {
        return true;
    }
    mensaje('Los apellidos deben contener entre 3 y 24 letras.', apellidosInput);
    return false;
}

/*Comprobamos el GymTag ingresado.*/
async function validarGymtag() {
    const gymtagMin = gymtag.value.toLowerCase();
    gymtag.value = gymtagMin;
    /*Comprobamos que el tamaño del GymTag sea el deseado.*/
    if (gymtagMin.length < 3 || gymtagMin.length > 14) {
        mensaje('Tu GymTag debe tener entre 3 y 14 caracteres.', gymtagInput);
        return false;
    }
    /*Comprobamos que los caracteres ingresados sean válidos.*/
    if (!/^[a-z0-9ñ._]+$/.test(gymtagMin)) {
        mensaje('Tu GymTag solo puede tener letras, números y algunos caracteres especiales.', gymtagInput);
        return false;
    }
    /*Comprobamos si el GymTag está disponible.*/
    try {
        const { data: usuarios, error } = await supabase
            .from('usuarios')
            .select('gymtag')
            .eq('gymtag', gymtagMin);

        if (error) throw error;
        /*El gymtag estará en uso si usuarios contiene algún elemento.*/
        if (usuarios.length > 0) {
            mensaje('El GymTag ingresado ya está en uso.', gymtagInput);
            return false;
        }
        /*GymTag disponible.*/
        return true;
    } catch (error) {
        mensaje('Hubo un error al verificar el GymTag. Por favor, inténtalo de nuevo.', gymtagInput);
        return false;
    }
}

/*Comprobamos si el email ingresado tiene formato de email.*/
async function validarEmail() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
        mensaje('El email ingresado no es válido.', emailInput);
        return false;
    }
    /*Comprobamos si el email está disponible.*/
    try {
        const { data: usuarios, error } = await supabase
            .from('usuarios')
            .select('email')
            .eq('email', email.value);

        if (error) throw error;
        /*El email estará en uso si usuarios contiene algún elemento.*/
        if (usuarios.length > 0) {
            mensaje('El Email ingresado ya está en uso.', emailInput);
            return false;
        }
        /*Email disponible.*/
        return true;
    } catch (error) {
        mensaje('Hubo un error al verificar el Email. Por favor, inténtalo de nuevo.', emailInput);
        return false;
    }
}

/*Comprobamos las contraseñas ingresadas.*/
function validarContras() {
    /*Si las contraseñas son iguales y seguras, la contraseña es válida.*/
    if (password.value === password2.value && /^(?=.*[A-Z])(?=.*\d)[^\s]{8,}$/.test(password.value)){
        return true;
    } else {
        /*Si las contraseñas no son iguales o no son seguras, se avisa al usuario de ello.*/
        if (password.value !== password2.value) {
            mensaje('Las contraseñas no coinciden.', password2Input);
        } else {
            mensaje('La contraseña debe contener al menos 8 caracteres e incluir una mayúscula y un número.', password2Input);
            passwordInput.value.focus();
        }
        return false;
    }
}

/*Comprobamos si el usuario es mayor de 14 años.*/
function validarEdad() {
    var fechaActual = new Date();
    var annoActual = fechaActual.getFullYear();
    const anno = parseInt(fecha_nacimiento.value.split("-")[0], 10);
    if (/^(\d{4})-(\d{2})-(\d{2})$/.test(fecha_nacimiento.value) && (anno >= 1900 && anno <= (annoActual - 14))) {
        return true;
    } else if(anno <= 1900){
        /*Si el usuario no tiene más de 14 años se le avisa que debe tenerlos.*/
        mensaje('La edad ingresada no es válida.', fecha_nacimientoInput);
    }else if(anno >= (annoActual - 14)){
        /*Si el usuario no tiene más de 14 años se le avisa que debe tenerlos.*/
        mensaje('Debes tener más de 14 años.', fecha_nacimientoInput);
    }
    return false;
}

/*Comprobamos que el usuario haya aceptado las políticas y condiciones de GymBros Zone.*/
function validarAceptar() {
    if (aceptar.value) {
        return true;
    } else {
        mensajeError.value = "Para continuar acepta nuestras políticas y condiciones.";
        mostrarMensaje.value = true;
        return false;
    }
}

/*Llamamos a las funciones que validan los inputs en la primera parte del formulario (pantallas pequeñas).*/
async function siguiente() {
    mostrarMensaje.value = false;
    mensajeError.value = '';
    if (validarNombre() && validarApellidos() && await validarGymtag()) {
        segundaParte();
    }
    return;
}

/*Llamamos a las funciones que validan los inputs de todo el formulario (cualquier pantalla.*/
async function creaCuenta() {
    mostrarMensaje.value = false;
    mensajeError.value = '';
    if (validarNombre() && validarApellidos() && await validarGymtag() && await validarEmail() && validarContras() && validarEdad() && validarAceptar()) {
        createAccount();
    } else {
        return;
    }
}

/*Redirección para ver las políticas.*/
function verPoliticas() {
    router.push('/policies');
}
</script>
<template>
    <div class="todo_register">
        <div class="register">
            <div class="volver_parte_uno" v-if="!pantallaGrande && !mostrarPrimeraParte">
                <font-awesome-icon :icon="['fas', 'circle-left']" @click="primeraParte" />
            </div>
            <div class="titulo">Registro</div>
            <div class="nombre_y_apellidos" v-if="(mostrarPrimeraParte) || pantallaGrande">
                <div class="nombre">
                    <div class="container">
                        <div class="subcontainer">
                            <input type="text" id="nombre" class="input" required autocomplete="off" v-model="nombre"
                                ref="nombreInput">
                            <label class="label" for="nombre">Nombre</label>
                        </div>
                    </div>
                </div>
                <div class="apellidos">
                    <div class="container">
                        <div class="subcontainer">
                            <input type="text" id="apellidos" class="input" required autocomplete="off"
                                v-model="apellidos" ref="apellidosInput">
                            <label class="label" for="apellidos">Apellidos</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="gymtag" v-if="(mostrarPrimeraParte) || pantallaGrande">
                <div class="container">
                    <div class="subcontainer">
                        <input type="text" id="gymtag" class="input" required autocomplete="off" v-model="gymtag"
                            ref="gymtagInput">
                        <label class="label" for="gymtag">GymTag</label>
                        <div class="tooltip">
                            <font-awesome-icon :icon="['fas', 'circle-info']" class="info contenedor_ojo"/>
                            <div class="tooltiptext">Este será tu nombre de usuario</div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="email" v-if="(!pantallaGrande && !mostrarPrimeraParte) || pantallaGrande">
                <div class="container">
                    <div class="subcontainer">
                        <input type="text" id="email" class="input" required autocomplete="off" v-model="email"
                            ref="emailInput">
                        <label class="label" for="email">Email</label>
                    </div>
                </div>
            </div>
            <div class="password" v-if="(!pantallaGrande && !mostrarPrimeraParte) || pantallaGrande">
                <div class="container">
                    <div class="subcontainer">
                        <input :type="contraVisible ? 'text' : 'password'" id="password" class="input" required
                            autocomplete="off" v-model="password" ref="passwordInput">
                        <label class="label" for="password">Contraseña</label>
                        <div class="contenedor_ojo">
                            <font-awesome-icon :icon="contraVisible ? 'fas fa-eye' : 'fas fa-eye-slash'"
                                :class="contraVisible ? 'ojo  ojo_abierto' : 'ojo'"
                                @click="contraVisible = !contraVisible" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="password2" v-if="(!pantallaGrande && !mostrarPrimeraParte) || pantallaGrande">
                <div class="container">
                    <div class="subcontainer">
                        <input :type="contraVisible2 ? 'text' : 'password'" id="password2" class="input" required
                            autocomplete="off" v-model="password2" ref="password2Input">
                        <label class="label" for="password2">Repetir contraseña</label>
                        <div class="contenedor_ojo">
                            <font-awesome-icon :icon="contraVisible2 ? 'fas fa-eye' : 'fas fa-eye-slash'"
                                :class="contraVisible2 ? 'ojo  ojo_abierto' : 'ojo'"
                                @click="contraVisible2 = !contraVisible2" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="fecha_nacimiento" v-if="(!pantallaGrande && !mostrarPrimeraParte) || pantallaGrande">
                <div class="container">
                    <div class="subcontainer">
                        <input type="date" id="fecha_nacimiento" class="input" required autocomplete="off"
                            v-model="fecha_nacimiento" ref="fecha_nacimientoInput">
                        <label class="label" for="fecha_nacimiento">Fecha de nacimiento</label>
                        <div class="contenedor_calendario" @click="triggerDateInput">
                            <font-awesome-icon v-if="usandoMovil" :icon="['fas', 'calendar']" class="calendario" />
                        </div>
                    </div>
                </div>
            </div>
            <div class="aceptar_politicas" v-if="(!pantallaGrande && !mostrarPrimeraParte) || pantallaGrande">
                <label class="container_checkbox">
                    <input type="checkbox" id="aceptar" v-model="aceptar">
                    <svg viewBox="0 0 64 64" height="1.2em" width="1.2em">
                        <path
                            d="M 0 16 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 16 L 32 48 L 64 16 V 8 A 8 8 90 0 0 56 0 H 8 A 8 8 90 0 0 0 8 V 56 A 8 8 90 0 0 8 64 H 56 A 8 8 90 0 0 64 56 V 16"
                            pathLength="575.0541381835938" class="path"></path>
                    </svg>
                </label>
                <label class="aceptar" for="aceptar" @click=verPoliticas>Aceptar políticas y condiciones de GymBros
                    Zone.</label>
            </div>
            <div class="mensaje" :style="{ visibility: mostrarMensaje ? 'visible' : 'hidden' }">
                <div class="mensaje_texto">
                    {{ mensajeError }}
                </div>
            </div>
            <div class="siguiente" v-if="mostrarPrimeraParte && !pantallaGrande">
                <div class="siguiente_texto"><button class="siguiente_button" @click="siguiente">Siguiente</button>
                </div>
            </div>
            <div class="crear" v-if="!mostrarPrimeraParte || pantallaGrande">
                <div class="crear_texto" @click="creaCuenta"><button>Crear cuenta</button></div>
            </div>
        </div>
        <!-- <button @click="$emit('irALogin')">Volver al Login</button> -->
    </div>
  <Footer class="footer"/>

</template>
<style scoped>
.footer{
    position: absolute;
    bottom: 0;
}
.todo_register {
    width: 100vw;
    height: fit-content;
    background: var(--bg-color);
    display: flex;
    align-items: center;
    flex-direction: column;
    padding-top: 165px;
}

.register {
    width: 75%;
    height: fit-content;
    height: fit-content;
    max-width: 1050px;
    background-color: var(--dark-blue);
    display: flex;
    text-align: center;
    flex-direction: column;
    border: var(--black) 4px solid;
    border-radius: 6px;
    margin-bottom: 160px;
    position: relative;
}

.volver_parte_uno {
    position: absolute;
    top: 20px;
    left: 20px;
    height: 60px;
    width: 60px;
    font-size: 50px;
    text-align: center;
    color: var(--light-blue-text);
    cursor: pointer;
}

.titulo {
    height: 115px;
    color: var(--light-blue-text);
    padding: 25px 0;
    font-size: 60px;
    font-weight: bold;
    font-family: 'Gill Sans', 'Gill Sans MT', Calibri, 'Trebuchet MS', sans-serif;
}

.nombre_y_apellidos {
    width: 100%;
    height: 80px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-top: 30px;
}

.apellidos,
.nombre {
    width: 42.5%;
    display: flex;
    justify-content: center;
}

.gymtag {
    width: 100%;
    padding: 50px 0 25px;
    display: flex;
    justify-content: center;
}

.gymtag .container {
    width: 55%;
}

.tooltip {
    position: relative;
}

.tooltip .tooltiptext {
    visibility: hidden;
    width: 200px;
    background-color: var(--very-dark-blue);
    color: #dfe8f8;
    text-align: center;
    border-radius: 5px;
    padding: 10px;
    position: absolute;
    z-index: 1;
    right: -140px;
    bottom: 48px;
    transform: translateX(0);
    opacity: 0;
    transition: opacity 0.3s;
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.418);
}

.tooltip:hover .tooltiptext {
    visibility: visible;
    opacity: 1;
}

.tooltip .tooltiptext::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 28px;
    border-width: 8px;
    border-style: solid;
    border-color: var(--very-dark-blue) transparent transparent transparent;
}

.info {
    font-size: 28px;
    padding: 0 !important;
    cursor: pointer;
    margin-left: -48px !important;
    margin-top: 7px !important;
    cursor: pointer !important;
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
    top: 9.5px;
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
    cursor: pointer;
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
    border: 2px solid var(--grey-buttons-inputs-border);
}

.email {
    margin-top: 30px;
}

.password,
.password2,
.fecha_nacimiento {
    margin-top: 45px;
}

.aceptar_politicas {
    margin-top: 50px;
}

.email .container .subcontainer,
.password .container .subcontainer,
.password2 .container .subcontainer,
.fecha_nacimiento .container .subcontainer {
    width: 75%;
    min-width: 741.5px;
}

.contenedor_calendario,
.contenedor_ojo {
    width: 30px;
    height: 30px;
    margin-top: 7px;
    background-color: var(--blue-inputs);
    font-size: 30px;
    padding: 7.5px 0;
    margin-left: -35px;
    cursor: pointer;
    position: relative;
}

.calendario,
.ojo {
    color: var(--light-blue-text);
    position: relative;
    top: -7.5px;
    right: 3px;
    cursor: default;
    text-align: center;
}

.contenedor_ojo {
    font-size: 27px;
    margin-left: -38px;
    margin-top: 8.5px;
}

.ojo {
    cursor: pointer;
}

.ojo_abierto {
    transform: translateX(1.505px);
}

.crear,
.siguiente {
    margin-top: 35px;
    margin-bottom: 40px;
    height: 45px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.crear_texto,
.siguiente_texto {
    width: 20%;
    height: 100%;
    display: flex;
    justify-content: center;
    text-align: center;
}

.crear_texto button,
.siguiente_texto button {
    cursor: pointer;
    background-color: var(--blue-buttons);
    width: 100%;
    border: solid var(--black) 2px;
    border-radius: 2px;
    font-size: 20px;
    transition: background-color 0.5s, border 0.5s, color 0.5s;
}

.siguiente {
    margin-top: 30px;
}

.crear_texto button:hover,
.crear_texto button:active,
.siguiente_texto button:hover,
.siguiente_texto button:active {
    background-color: var(--very-dark-blue);
    color: var(--light-blue-text);
    border: 2px solid var(--grey-buttons-inputs-border);
}

.aceptar_politicas {
    color: var(--light-blue-text);
    font-size: 19px;
    display: flex;
    justify-content: center;
    align-items: center;
}

.aceptar {
    margin-left: 20px;
    margin-bottom: 3px;
    cursor: pointer;
    text-decoration: underline;
    transition: text-shadow 0.3s;

}

.aceptar:hover,
.aceptar:active {
    text-shadow: 0 0 5px #eef2fa66;
}

.container_checkbox {
    cursor: pointer;
}

.container_checkbox input {
    display: none;
}

.container_checkbox svg {
    overflow: visible;
}

.path {
    fill: none;
    stroke: var(--light-blue-text);
    stroke-width: 8;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: stroke-dasharray 0.5s ease, stroke-dashoffset 0.5s ease;
    stroke-dasharray: 241 9999999;
    stroke-dashoffset: 0;
}

.container_checkbox input:checked~svg .path {
    stroke-dasharray: 70.5096664428711 9999999;
    stroke-dashoffset: -262.2723388671875;
    stroke: rgb(0, 173, 0);
}

.mensaje {
    font-size: 20px;
    min-height: 22px;
    height: fit-content;
    visibility: hidden;
    display: flex;
    justify-content: center;
    color: var(--light-blue-text);
    text-align: center;
    margin-top: 30px;
    width: 100%;
}

.mensaje_texto {
    width: 80%;
}

@media(max-width: 1254px) {
    .nombre_y_apellidos .container {
        min-width: 405px;
    }

    .nombre_y_apellidos .apellidos .container {
        align-items: center;
    }
}

@media(max-width: 1139px) {
    .register {
        width: 88%;
    }

    .titulo {
        margin-top: 20px;
        font-size: 52px;
    }

    .nombre_y_apellidos {
        flex-direction: column;
        padding: 0;
        justify-content: space-around;
        height: 200px;
    }

    .nombre_y_apellidos .container {
        align-items: center;
    }

    .nombre_y_apellidos .nombre,
    .nombre_y_apellidos .apellidos {
        width: 100%;
    }

    .nombre_y_apellidos .nombre .input,
    .nombre_y_apellidos .apellidos .input,
    .gymtag .input,
    .email .input,
    .password input,
    .password2 input,
    .fecha_nacimiento input {
        height: 50px;
        max-width: 800px;
    }

    .container .label {
        font-size: 25px;
        top: 12px;
    }

    .container .input:valid~.label,
    .container .input:focus~.label,
    .fecha_nacimiento .input~.label {
        transition: 0.3s;
        padding-left: 2px;
        transform: translateY(-42.5px);
    }

    .subcontainer {
        display: flex;
        justify-content: start;
        width: 85%;
        max-width: 750px;
    }

    .input {
        font-size: 24px;
    }

    .siguiente,
    .crear {
        display: flex;
        margin-bottom: 40px;
    }

    .siguiente_texto,
    .crear_texto {
        width: 85%;
    }

    .gymtag {
        padding: 0;
        padding-top: 25px;
        margin-bottom: 30px;
    }

    .tooltip .tooltiptext {
        right: -10px;
        bottom: -60px;
    }

    .tooltip .tooltiptext::after {
        top: -29%;
        left: 158px;
        border-color: transparent transparent var(--very-dark-blue) transparent;
    }

    .gymtag .container,
    .email .container,
    .password .container,
    .password2 .container,
    .fecha_nacimiento .container {
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .email .container .subcontainer,
    .password .container .subcontainer,
    .password2 .container .subcontainer,
    .fecha_nacimiento .container .subcontainer {
        width: 85%;
        min-width: 0;
        padding: 0;
        display: flex;
    }

    .info {
        font-size: 42px;
        padding: 0 !important;
        padding-top: 4px !important;
        margin-left: -48px !important;
        cursor: pointer;
    }

    .siguiente button,
    .crear button {
        max-width: 750px;
        height: 55px;
    }

    .contenedor_calendario,
    .contenedor_ojo {
        width: 32px;
        height: 32px;
        font-size: 37px;
        padding: 14px 0;
        margin-top: 5px;
    }

    .contenedor_ojo {
        font-size: 28px;
        margin-left: -40px;
        padding: 12px 0;
    }

    .contenedor_calendario {
        width: 30px;
        height: 30px;
        margin-top: 7px;
        background-color: var(--blue-inputs);
        font-size: 30px;
        padding: 7.5px 0;
        margin-left: -35px;
    }

    .calendario {
        color: var(--light-blue-text);
        position: relative;
        top: -7.5px;
        right: 3px;
        cursor: default;
        text-align: center;
    }

    .mensaje {
        margin-top: 10px;
    }
}

@media(max-width: 875px) {
    .todo_register {
        padding-top: 174px;
    }
}

@media(max-width: 600px) {
    .titulo {
        margin-top: 0;
        padding: 20px 0;
        height: 80px;
        font-size: 40px;

    }

    .todo_register {
        padding-top: 227px;
    }

    .nombre_y_apellidos .nombre .input,
    .nombre_y_apellidos .apellidos .input,
    .gymtag .input,
    .email .input,
    .password input,
    .password2 input,
    .fecha_nacimiento input,
    .siguiente button {
        height: 40px;
        font-size: 20px;
    }

    .container .label {
        font-size: 22px;
        top: 8px;
    }

    .siguiente,
    .crear {
        margin-bottom: 25px;
    }

    .gymtag {
        margin-bottom: 20px;
    }

    .tooltip .tooltiptext::after {
        left: 162px;
    }

    .info {
        padding: 0 !important;
        margin-left: -40px !important;
        margin-top: 6px !important;
        cursor: pointer !important;
        width: 28px !important;
        height: 28px !important;
    }

    .contenedor_calendario,
    .contenedor_ojo {
        width: 32px;
        height: 32px;
        font-size: 30px;
        padding: 10px 0;
        margin-left: -35px;
        font-size: 25px;
    }

    .contenedor_calendario {
        height: 30px;
    }

    .contenedor_calendario {
        padding: 8px 0;
    }

    .volver_parte_uno {
        top: 10px;
        left: 10px;
        height: 40px;
        width: 40px;
        font-size: 40px;
    }

    .contenedor_calendario {
        pointer-events: none;
    }

    .calendario {
        cursor: pointer;
    }

    .aceptar {
        width: 60%;
        margin-left: 15px;
    }

    .container .input:valid~.label,
    .container .input:focus~.label,
    .fecha_nacimiento .input~.label {
        transition: 0.3s;
        padding-left: 2px;
        transform: translateY(-37.5px);
    }

    .nombre_y_apellidos {
        height: 200px;
    }

    .mensaje_texto {
        font-size: 18px;
    }

    .mensaje {
        margin-top: 10px;
    }

    .aceptar_politicas {
        margin-top: 30px;
    }
}

@media(max-width: 455px) {
    .titulo {
        font-size: 30px;
        margin-top: 20px;
        height: 70px;
    }

    .nombre_y_apellidos .container {
        min-width: 0;
    }

    .nombre_y_apellidos {
        flex-direction: column;
        padding: 0;
        justify-content: space-around;
    }

    /* .info {
        font-size: 36px;
        padding: 12px 0;
        margin-left: -47px;
        cursor: pointer;
    } */

    .mensaje {
        height: fit-content;
        visibility: hidden;
        display: flex;
        justify-content: center;
        margin: 20px 0 0;
        align-items: center;
    }

    .mensaje_texto {
        font-size: 16px;
    }

    .siguiente {
        margin-top: 10px;
    }

    .gymtag {
        margin-bottom: 10px;
    }

    .volver_parte_uno {
        font-size: 33px;
        top: 10px;
        left: 8px;
        ;
    }
}

@media(max-width: 330px) {

    .email .input~.label,
    .password .input~.label,
    .password2 .input~.label {
        transition: 0.3s;
        padding-left: 2px;
        transform: translateY(-42.5px);
    }
}
</style>