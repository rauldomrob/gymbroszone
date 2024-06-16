<script setup>
import { ref, computed } from 'vue';
import { supabase } from '../clients/supabase';
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import Footer from '../components/Footer.vue';
const email = ref('');

/*Función para enviar el correo.*/
async function recuperarContra() {
    let { data, error } = await supabase.auth.resetPasswordForEmail(email.value, {
        redirectTo: 'https://gymbroszone.com/recovery',
    });
    const emailEncoded = encodeURIComponent(email.value);
    window.location.href = `/waiting-verification?email=${emailEncoded}`;
}

const emailValido = computed(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
});

</script>
<template>
    <div class="todo_password">
        <div class="password">
            <div class="candado">
                <font-awesome-icon class="candado_icono" :icon="['fas', 'lock']" />
            </div>
            <div class="titulo_password">
                <h2>¿Tienes problemas para entrar?</h2>
            </div>
            <div class="texto_recuperar">
                <p>Introduce tu correo electrónico y te enviaremos un enlace para que puedas acceder a tu cuenta y
                    cambiar tu contraseña.</p>
            </div>
            <div class="email">
                <input :class="['input', { 'input-invalido': !emailValido }]" v-model="email"
                    placeholder="Correo electrónico">
                <button class="boton" v-if="emailValido" @click="recuperarContra()">Enviar correo</button>
                <button class="boton deshabilitado" v-else>Enviar correo</button>
            </div>
            <div class="separador">
                <div class="separador1"></div>
                <div class="div_o">O</div>
                <div class="separador1"></div>
            </div>
            <div class="ya_tienes">
                <p>¿No tienes una cuenta?</p>
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
    <Footer class="footer" />
</template>
<style scoped>
.footer {
    position: absolute;
    bottom: 0;
}

.todo_password {
    width: 100vw;
    height: fit-content;
    background: var(--bg-color);
    display: flex;
    align-items: center;
    flex-direction: column;
    padding-top: 165px;
    margin-bottom: 60px;
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
}

.candado {
    color: #eef2faf6;
    margin: 20px 0 0;
    font-size: 70px;
    border: 2px solid #eef2fab4;
    width: 130px;
    height: 130px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
}

.titulo_password {
    margin: 20px 0 30px;
    color: var(--light-blue-text);
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
    margin-bottom: 15px;
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

.deshabilitado {
    cursor: not-allowed;
    background-color: #4e6368;
    color: rgba(0, 0, 0, 0.76);
    border: solid rgba(0, 0, 0, 0.76) 2px;
    border-radius: 2px;
    height: 40px;
    font-size: 18px;
    padding: 0 10px;
    margin-top: 8px;
}

.deshabilitado:hover,
.deshabilitado:active {
    background-color: #4e6368;
    color: rgba(0, 0, 0, 0.76);
    border: solid rgba(0, 0, 0, 0.76) 2px;
}

.ya_tienes {
    width: 100%;
    height: fit-content;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--light-blue-text);
    font-size: 19px;
    margin-top: 30px;
    text-decoration: underline;
}

.crear {
    margin-top: 8px;
    margin-bottom: 35px;
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

.input::placeholder {
    color: var(--light-blue-text);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

::placeholder {
    padding-top: 2px;
    padding-left: 2px;
    font-size: 16px;
}

::-moz-placeholder {
    padding-left: 2px;
    padding-top: 2px;
    font-size: 16px;
}

:-ms-input-placeholder {
    padding-left: 2px;
    padding-top: 2px;
    font-size: 16px;
}

::-ms-input-placeholder {
    padding-left: 2px;
    padding-top: 2px;
    font-size: 16px;
}

.separador {
    width: 85%;
    display: flex;
    align-items: center;
}

.div_o {
    font-size: 20px;
    color: #eef2faf0;
    padding: 0 10px;
}

.separador1 {
    width: 100%;
    height: 1px;
    background-color: #eef2fa6d;
}

@media(max-width: 875px) {
    .todo_password {
        padding-top: 159px;
    }
}

@media(max-width: 600px) {
    .todo_password {
        padding-top: 232px;
    }
}

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
        margin: 20px 40px 30px;
    }
}

@media(max-width: 500px) {
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
        margin-bottom: 15px;
        min-width: 210px;
    }

    .email {
        display: flex;
        flex-direction: column;
        width: 75%;
        align-items: center;
    }

    .crear {
        margin-top: 12px;
        height: 45px;
    }
}
</style>