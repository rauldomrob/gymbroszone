<script setup>
/*Imports.*/
import { disponible } from '../main'
import { userActive } from "../clients/supabase";
disponible.value = false;
</script>
<template>
    <div :class="['todo_no_encontrado', { logued: userActive }]">
        <div class="no_encontrado">
            <div class="titulo_no_encontrado">
                <h1>Upss... Página no encontrada</h1>
                <img src="../assets/img/mancuerna_rota.png" alt="mancuena_rota">
            </div>
            <div class="volver_no_encontrado">
                <div class="mensaje">
                    Contacta con nosotros si crees que se trata de un error.
                </div>
                <div class="pulsa">
                    <RouterLink to="/" class="RouterLink">
                        <u>Pulsa para volver</u>
                    </RouterLink>
                </div>
                <div class="mancuerna_rota_abajo">
                    <img src="../assets/img/mancuerna_rota.png" alt="mancuena_rota" class="mancuerna_rota">
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
.todo_no_encontrado {
    width: 100%;
    height: 600px;
    margin-top: 80px;
    padding-top: 50px;
    display: flex;
    justify-content: center;
}

.no_encontrado {
    width: 90%;
    height: 250px;
    border: var(--border-bg-color2);
    background-color: var(--bg-color2);
    border-radius: 12px;
}

.titulo_no_encontrado {
    width: 100%;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-left: 20px;
    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
}

.titulo_no_encontrado h1 {
    font-size: 40px;
}

.titulo_no_encontrado>img {
    height: 150%;
    transform: rotate(-10deg) translateY(15px);

}

.volver_no_encontrado {
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

.mancuerna_rota {
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
    .todo_no_encontrado {
        margin-top: 94px;
    }

    .todo_no_encontrado.logued {
        margin-top: 65px;
    }
}

@media (max-width: 627px) {
    .titulo_no_encontrado>img {
        display: none;
    }

    .mancuerna_rota_abajo {
        width: 100%;
        display: flex;
        justify-content: end;
    }

    .mancuerna_rota {
        display: block;
        width: 131.679px;
        position: relative;
        transform: rotate(-10deg);
        top: -45px;
        left: 15px;
    }

    .volver_no_encontrado {
        padding-bottom: 0px;
    }
}

@media (max-width: 600px) {
    .todo_no_encontrado {
        margin-top: 172px;
    }

    .todo_no_encontrado.logued {
        margin-top: 65px;
    }
}

@media (max-width: 410px) {
    .no_encontrado {
        height: 210px;
    }

    .volver_no_encontrado {
        padding-top: 0;
    }

    .titulo_no_encontrado h1 {
        font-size: 30px;
    }

    .mensaje,
    .pulsa a {
        font-size: 18px;
    }

    .mancuerna_rota {
        display: block;
        width: 115px;
        position: relative;
        transform: rotate(-10deg);
        top: -35px;
        left: 15px;
    }

}

@media (max-width: 315px) {
    .titulo_no_encontrado {
        padding-left: 0;
    }

    h1 {
        text-align: center;
    }

    .mensaje {
        text-align: center;
    }

    .pulsa {
        text-align: center;
    }

    .no_encontrado {
        height: 260px;
    }

    .mancuerna_rota_abajo {
        width: 100%;
        display: flex;
        justify-content: center;
    }

    .mancuerna_rota {
        display: block;
        width: 131.679px;
        position: relative;
        transform: rotate(-10deg);
        top: 0;
        left: 0;
    }
}

@media (max-width: 282px) {
    .no_encontrado {
        height: 280px;
    }
}
</style>