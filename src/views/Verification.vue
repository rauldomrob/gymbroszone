<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';

const mensaje = ref('');
const url = ref('');
let timeoutId;

/*Función para redirigir al usuario a los 20 segundos.*/
onMounted(() => {
    timeoutId = setTimeout(() => {
        url.value = "/login";
        redirigir();
    }, 20000);
    const route = useRoute();
    const email = route.query.email ? decodeURIComponent(route.query.email) : '';
    /*Si no hay email redirigimos al usuario a home.*/
    if (!email) {
        window.location.href = '/';
        return;
    }
    /*Si el correo es un gmail,  establecemos la ruta para la redirección a gmail.*/
    if (email.includes('@gmail.com')) {
        mensaje.value = "Ir a Gmail";
        url.value = "https://mail.google.com/mail/u/0/#inbox";
    /*Si el correo es un hotmail u outlook, establecemos la ruta para la redirección a outlook.*/
    } else if (email.includes('@hotmail.com') || email.includes('@outlook.com')) {
        mensaje.value = "Ir a Outlook";
        url.value = "https://outlook.office365.com/mail/";
    } else {
    /*De lo contrario, establecemos la ruta para la redirección a login para iniciar sesión.*/
        mensaje.value = "Ir a Login";
        url.value = "/login";
    }
});

/*Cuando se desmonta la vista, limpiamos el contador de la redirección.*/
onUnmounted(() => {
    clearTimeout(timeoutId); 
});

/*Función para redirigir al usuario a la ruta que previamente hemos establecido.*/
function redirigir() {
    window.location.href = url.value; 
}
</script>
<template>
    <div class="todo_waiting">
        <div class="waiting">
            <div class="titulo_waiting">
                <h1>Revisa tu bandeja de entrada </h1>
                <img src="../assets/img/email.png" alt="email">
            </div>
            <div class="login">
                <div class="mensaje">
                    Tu cuenta está pendiente de verificación
                </div>
                <div class="pulsa">
                    <a href="" target="blank" @click="redirigir">{{ mensaje }}</a>
                </div>
            </div>
            <div class="email_abajo">
                <img src="../assets/img/email.png" alt="email" class="email">
            </div>
        </div>
    </div>
</template>
<style scoped>
.todo_waiting {
    width: 100%;
    height: 600px;
    margin-top: 80px;
    padding-top: 50px;
    display: flex;
    justify-content: center;
}

.waiting {
    width: 90%;
    height: 250px;
    border: var(--border-bg-color2);
    background-color: var(--bg-color2);
    border-radius: 12px;
}

.titulo_waiting {
    width: 100%;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 20px;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
}

.titulo_waiting h1 {
    font-size: 40px;
}

.titulo_waiting>img {
    height: 120%;
    transform: rotate(-10deg) translateY(-10px) translateX(-10px);
    margin-left: 15px;
}

.login {
    height: 120px;
    padding: 20px;
    font-size: 24px;
    display: flex;
    padding-top: 30px;
    flex-direction: column;
    justify-content: space-between;
}

.pulsa {
    animation: vibrar 3s infinite ease-in;
    animation-delay: 0.8s;
    position: relative;
}

.pulsa a {
    font-weight: bold;
    color: black;
}

.pulsa a:hover {
    text-decoration: underline;
}

.email {
    display: none;
}

@keyframes vibrar {
    0% {
        left: 0;
    }

    2% {
        left: -3px
    }

    4% {
        left: 5px
    }

    6% {
        left: -8px
    }

    8% {
        left: 8px
    }

    10% {
        left: -5px
    }

    12% {
        left: 3px
    }

    14% {
        left: 0;
    }
}

@media (max-width: 875px) {
    .todo_waiting {
        margin-top: 94px;
    }
}

@media (max-width: 627px) {
    .titulo_waiting>img {
        display: none;
    }

    .email_abajo {
        width: 100%;
        display: flex;
        justify-content: end;
    }

    .email {
        display: block;
        width: 111.679px;
        position: relative;
        transform: rotate(-10deg);
        top: -70px;
        left: -15px;
    }

    .login {
        padding-bottom: 0px;
    }
}

@media (max-width: 600px) {
    .todo_waiting {
        margin-top: 172px;
    }
}

@media (max-width: 410px) {
    .waiting {
        height: 210px;
    }

    .login {
        padding-top: 0;
        height: 80px;
    }

    .titulo_waiting h1 {
        font-size: 30px;
    }

    .mensaje,
    .pulsa a {
        font-size: 18px;
    }

    .email {
        display: block;
        width: 75px;
        position: relative;
        transform: rotate(-10deg);
        /* top: -35px;
        left: 15px; */
        top: -40px;
    }

}



@media (max-width: 285px) {
    h1 {
        text-align: center;
    }

    .mensaje {
        text-align: center;
    }

    .pulsa {
        text-align: center;
    }

    .waiting {
        height: 280px;
    }

    .login {
        height: 120px;
        justify-content: space-around;
    }

    .email_abajo {
        justify-content: center;
    }

    .email {
        top: -10px;
        left: 0;
    }
}
</style>