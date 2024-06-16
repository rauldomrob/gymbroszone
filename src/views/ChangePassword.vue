<script setup>
import { ref, nextTick } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { useRouter } from 'vue-router';
import { supabase } from '../clients/supabase';
const password = ref();
const password2 = ref();

const contraVisible = ref(false);
const contraVisible2 = ref(false);

const passwordInput = ref(null);
const password2Input = ref(null);
const mostrarMensaje = ref(false);
const mensajeError = ref('');

const mostrarPregunta = ref(false);
const router = useRouter();

/*Función para cambiar la contraseña.*/
async function cambiarContra() {
    mensajeError.value = '';
    mostrarMensaje.value = false;
    if (validarContras()) {
        mensajeInformativo();
        const { data, error } = await supabase.auth.updateUser({
            password: password.value
        });
    }
}

//Comprobamos las contraseñas ingresadas.
function validarContras() {
    //Si las contraseñas son iguales y seguras, la contraseña es válida.
    if (password.value === password2.value && /^(?=.*[A-Z])(?=.*\d)[^\s]{8,}$/.test(password.value)) {
        return true;
    } else {
        //Si las contraseñas no son iguales o no son seguras, se avisa al usuario de ello.
        if (password.value !== password2.value) {
            mensaje('Las contraseñas no coinciden.', password2Input);
            return false;
        } else {
            passwordInput.value.focus();
            mensaje('La contraseña debe contener al menos 8 caracteres e incluir una mayúscula y un número.', password2Input);
            return false;
        }
    }
}

/*Se muestra el PopUp informativo.*/
function mensajeInformativo() {
    mostrarPregunta.value = true;
    document.body.style.overflow = 'hidden';
    nextTick(() => {
        setTimeout(() => {
            const divPregunta = document.querySelector('.div_pregunta');
            if (divPregunta) {
                divPregunta.classList.remove('shrink');
                divPregunta.classList.add('expand');
            }
        }, 5);
    });
}

/*Función para mostrar el mensaje de error al usuario.*/
function mensaje(mensaje, Input) {
    mensajeError.value = mensaje;
    mostrarMensaje.value = true;
    Input.value.focus();
}

/*El usuario cancela la eliminación del comentario o publicación.*/
function cancelar() {
    const divPregunta = document.querySelector('.div_pregunta');
    if (divPregunta) {
        divPregunta.classList.remove('expand');
        divPregunta.classList.add('shrink');
        setTimeout(() => {
            mostrarPregunta.value = false;
            setTimeout(() => {
                router.push('/');
            }, 250);
        }, 250);
    }
}
</script>
<template>
    <div class="todo_password">
        <div v-if="mostrarPregunta" class="todo_mostrar_pregunta" @click="cancelar">
            <div class="div_pregunta div_pregunta_inicio" @click.stop>
                <div class="pregunta">Tu contraseña ha sido actualizada exitosamente.</div>
                <div class="botones_pregunta">
                    <button @click="cancelar">Aceptar</button>
                </div>
            </div>
        </div>
        <div class="password">
            <div class="titulo_password">
                <h2>Cambia tu contraseña</h2>
            </div>
            <div class="email">
                <div class="subtitulo_password">
                    <h2>Ingresa tu nueva contraseña</h2>
                </div>
                <input class="input" v-model="password" :type="contraVisible ? 'text' : 'password'" ref="passwordInput">
                <div class="contenedor_ojo">
                    <font-awesome-icon :icon="contraVisible ? 'fas fa-eye' : 'fas fa-eye-slash'"
                        :class="contraVisible ? 'ojo  ojo_abierto' : 'ojo'" @click="contraVisible = !contraVisible" />
                </div>
                <div class="contenedor_ojo pequeno">
                    <font-awesome-icon :icon="contraVisible ? 'fas fa-eye' : 'fas fa-eye-slash'"
                        :class="contraVisible ? 'ojo  ojo_abierto' : 'ojo'" @click="contraVisible = !contraVisible" />
                </div>
                <div class="subtitulo_password">
                    <h2>Confirma tu nueva contraseña</h2>
                </div>
                <input class="input" v-model="password2" :type="contraVisible2 ? 'text' : 'password'"
                    ref="password2Input">
                <div class="contenedor_ojo">
                    <font-awesome-icon :icon="contraVisible2 ? 'fas fa-eye' : 'fas fa-eye-slash'"
                        :class="contraVisible ? 'ojo  ojo_abierto' : 'ojo'" @click="contraVisible2 = !contraVisible2" />
                </div>
                <div class="contenedor_ojo pequeno">
                    <font-awesome-icon :icon="contraVisible2 ? 'fas fa-eye' : 'fas fa-eye-slash'"
                        :class="contraVisible ? 'ojo  ojo_abierto' : 'ojo'" @click="contraVisible2 = !contraVisible2" />
                </div>
                <button class="boton" @click="cambiarContra()">Cambiar contraseña</button>
                <div class="mensaje" :style="{ display: mostrarMensaje ? 'flex' : 'none' }">
                    <div class="mensaje_texto">
                        {{ mensajeError }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.div_pregunta {
    color: var(--light-blue-text);
    background-color: var(--dark-blue);
    padding: 25px 30px;
    border-radius: 5px;
    border: var(--black) 2px solid;
    letter-spacing: 0.5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    height: 120px;
    cursor: default;
    margin-left: 60px;
    transition: transform 0.2s ease-in-out, opacity 0.2s ease-in-out;
}

.div_pregunta_inicio {
    transform: scale(0);
    opacity: 0;
}

.div_pregunta.shrink {
    transform: scale(0);
    opacity: 0;
}

.div_pregunta.expand {
    transform: scale(1);
    opacity: 1;
}

.botones_pregunta {
    width: 100%;
    display: flex;
    justify-content: space-around;
}

.botones_pregunta button {
    font-weight: bold;
    text-decoration: none;
    background-color: #3d5a98;
    color: var(--light-blue-text);
    border: 2px solid var(--black);
    cursor: pointer;
    border-radius: 25px;
    text-align: center;
    transition: border 0.5s;
    padding: 5px 10px;
}

.botones_pregunta button:hover,
.botones_pregunta button:active {
    border-color: #eef2fa81;
}

.todo_password {
    width: 100vw;
    height: fit-content;
    background: var(--bg-color);
    display: flex;
    align-items: center;
    flex-direction: column;
    padding-top: 220px;
}

.password {
    width: 50%;
    height: fit-content;
    max-width: 670px;
    background-color: var(--dark-blue);
    display: flex;
    align-items: center;
    text-align: center;
    flex-direction: column;
    border: var(--black) 3px solid;
    border-radius: 6px;
    margin-bottom: 88px;
    min-width: 450px;
    margin-left: 60px;
}

.contenedor_ojo {
    position: relative;
    color: var(--light-blue-text);
    font-size: 22px;
    top: -30px;
    right: -143px;
    cursor: pointer;
}

.pequeno {
    display: none;
}

.titulo_password {
    margin: 20px 0 10px;
    color: var(--light-blue-text);
    font-size: 26px;
}

.subtitulo_password {
    margin: 15px 0 5px;
    color: var(--light-blue-text);
    font-size: 14px;
    min-width: 320px;
    text-align: left;
}

.subtitulo_password h2 {
    font-weight: 500;
}


.texto_recuperar {
    width: 70%;
    font-size: 18px;
    color: #eef2fae2;
    margin: 0 0 30px;
}

.email {
    display: flex;
    flex-direction: column;
    width: 50%;
    align-items: center;
    width: 332px;
    position: relative;
}

.input {
    width: 100%;
    height: 35px;
    border: 2px solid #eef2fa81;
    outline: none;
    padding: 0px 7px;
    border-radius: 2px;
    color: var(--light-blue-text);
    font-size: 18px;
    background-color: var(--blue-inputs);
    box-shadow: 3px 3px 10px rgba(0, 0, 0, 1);
    cursor: text;
    margin-bottom: 0;
    min-width: 320px;
}


.input:focus {
    border: 2px solid transparent;
    color: var(--light-blue-text);
}

.input:focus {
    border: 2px solid #eef2fa81;
}

.input-invalido {
    border: 2px solid transparent;
}

.input-invalido:focus {
    border: 2px solid #eef2fa81;
}

button a {
    color: var(--light-blue-text);
    text-decoration: none;
}

.boton {
    cursor: pointer;
    background-color: var(--blue-buttons);
    border: solid var(--black) 2px;
    border-radius: 2px;
    font-size: 18px;
    transition: background-color 0.5s, border 0.5s, color 0.5s;
    height: 40px;
    padding: 0 10px;
    width: 210px;
    margin: 30px 0;
    margin-top: 8px;
}

.boton:hover,
.boton:active {
    background-color: var(--very-dark-blue);
    color: var(--light-blue-text);
    border: 2px solid var(--grey-buttons-inputs-border);
}

.mensaje {
    font-size: 20px;
    min-height: 22px;
    height: fit-content;
    display: flex;
    justify-content: center;
    color: var(--light-blue-text);
    text-align: center;
    margin-bottom: 30px;
    width: 100%;
}

@media(max-width: 875px) {
    .password {
        margin-left: 0;
    }
}

@media(max-width: 600px) {}

@media(max-width: 550px) {
    .password {
        width: 80%;
        height: fit-content;
        max-width: 670px;
        background-color: var(--dark-blue);
        display: flex;
        align-items: center;
        text-align: center;
        flex-direction: column;
        border: var(--black) 3px solid;
        border-radius: 6px;
        margin-bottom: 88px;
        min-width: 0;
    }

    .titulo_password {
        margin: 20px 40px 10px;
    }
}

@media(max-width: 500px) {
    .contenedor_ojo {
        display: none;
    }

    .pequeno {
        top: -28px;
        right: 0;
        display: flex;
        width: 100%;
        margin-bottom: 15px;
    }

    .pequeno .fa-eye-slash,
    .pequeno .fa-eye {
        position: absolute;
        right: 8px;
    }

    .input {
        width: 100%;
        height: 35px;
        padding: 0px 7px;
        font-size: 18px;
        min-width: 210px;
    }

    .titulo_password {
        font-size: 22px;
    }

    .subtitulo_password {
        position: relative;
        left: 0;
        min-width: 210px;
        width: 100%;
        font-size: 12px;
    }

    .email {
        width: 75%;
    }

    .boton {
        margin-top: 20px;
    }

    .mensaje_texto {
        font-size: 16px;
    }

    .email {
        width: 85%;
    }
}

@media(max-width: 380px) {
    .password {
        width: 90%;
    }
}
</style>