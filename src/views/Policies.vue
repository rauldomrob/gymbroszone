<script setup>
/*Imports y declaración de variables.*/
import { disponible } from "../main";
import { userActive } from "../clients/supabase";
import { ref, onMounted, onUnmounted } from "vue";
import Footer from '../components/Footer.vue';

const windowWidth = ref(window.innerWidth);
disponible.value = true;

/*Función para actualizar el ancho de la pantalla cuando se redimensiona.*/
function updateWidth() {
    windowWidth.value = window.innerWidth;
};

/*Cuando se monta la vista, añadimos el evento de escucha del ancho de la pantalla.*/
onMounted(() => {
    window.addEventListener("resize", updateWidth);
});

/*Cuando se desmonta la vista, eliminamos el evento de escucha del ancho de la pantalla.*/
onUnmounted(() => {
    window.removeEventListener('resize', updateWidth);
});

/*Función para añadir una clase u otra en función del tamaño de la pantalla y de si el usuario está logueado o no.*/
function getContainerClasses() {
    let classes = 'todo';
    if (windowWidth.value > 875 && userActive.value) {
        classes += ' todo_margin';
    }
    if (windowWidth.value < 875 && userActive.value) {
        classes += ' subir';
    }
    if (windowWidth.value < 875 && !userActive.value) {
        classes += ' subir_no_logued1';
    }
    if (windowWidth.value < 600 && !userActive.value) {
        classes += ' subir_no_logued2';
    }
    return classes;
};

/*Función para dar un margen u otro al botón en función de si el usuario está logued o no.*/
function getButtonClasses() {
    return userActive.value ? 'todo_boton siUsuario' : 'todo_boton noUsuario';
}
</script>
<template>
    <div :class="getContainerClasses()">
        <div class="container_info">
            <h1><u>Información legal de GymBros Zone</u></h1>
            <p>
                <b>Fecha efectiva: 1 de enero, 2024</b>
            </p>
            <h2>1. Términos de uso</h2>
            <p>El acceso y uso de GymBros Zone implica la aceptación de estos términos y condiciones. No está permitido
                el uso del sitio para actividades ilegales, fraudulentas, o que infrinjan los derechos de
                autor. Cualquier contenido publicado en los foros de GymBros Zone es responsabilidad de
                los usuarios, y GymBros Zone se reserva el derecho de eliminar contenido que considere
                inapropiado o que infrinja estos términos.</p>
            <h2>2. Derechos de autor y propiedad intelectual</h2>
            <p>Todos los contenidos de GymBros Zone, incluyendo textos, gráficos, logos,
                y software son propiedad de GymBros Zone o de sus respectivos autores y están protegidos
                por las leyes de derechos de autor. Se prohíbe cualquier uso que no esté expresamente
                autorizado por GymBros Zone o por los titulares de los derechos.</p>
            <h2>3. Uso de los foros y comunidad</h2>
            <p>Los foros de GymBros Zone son espacios para el intercambio de
                información y experiencias entre aficionados al fitness y la vida saludable. Se espera
                que los usuarios mantengan un ambiente respetuoso y constructivo. No se tolerará el
                acoso, el spam, ni el uso de lenguaje ofensivo.</p>
            <h2>4. Responsabilidades de los usuarios</h2>
            <p>Los usuarios son responsables de mantener la confidencialidad de sus cuentas
                y contraseñas. GymBros Zone no será responsable de los daños causados por el uso
                indebido de cuentas de usuario. Se espera que los usuarios informen inmediatamente sobre
                cualquier uso no autorizado de sus cuentas.</p>
            <h2>5. Limitación de responsabilidad</h2>
            <p>GymBros Zone no asume responsabilidad por los daños que puedan
                derivarse del acceso o uso del sitio, incluyendo pero no limitado a interrupciones del
                servicio, virus informáticos, o fallos en el sistema. Asimismo, GymBros Zone no
                garantiza la exactitud, integridad o utilidad de la información proporcionada en el sitio.</p>
            <h2>6. Cambios en la información legal</h2>
            <p>GymBros
                Zone se reserva el derecho de modificar esta información legal en cualquier momento. Los cambios serán
                publicados en esta página y serán efectivos inmediatamente. Se aconseja a los usuarios
                revisar periódicamente esta sección para estar informados de cualquier cambio.</p>
            <h2>7. Jurisdicción y ley aplicable</h2>
            <p>Los conflictos legales relacionados con
                el uso de GymBros Zone estarán sujetos a las leyes del país sede de GymBros Zone, y
                cualquier disputa será resuelta en los tribunales competentes de dicho país.</p>
            <h2>8. Contacto</h2>
            <p>Para cualquier consulta o inquietud relacionada con esta información
                legal, por favor contacta con nosotros en support@gymbroszone.com.</p>
        </div>
        <div :class="getButtonClasses()"> <button onclick="window.location.href='/'">Volver</button></div>
    </div>
    <Footer v-if="!userActive" class="footer" />
</template>
<style scoped>
.todo_margin {
    padding-left: 60px;
}

.footer {
    position: absolute;
    bottom: 0;
}

.subir {
    margin-top: -15px;
}

.subir_no_logued1 {
    transform: translateY(14px);
}

.subir_no_logued2 {
    transform: translateY(92px);
}

.container_info {
    width: 85%;
    padding: 20px 30px;
    padding-bottom: 40px;
    background-color: #5f7dbdea;
    border-radius: 5px;
    margin: 30px auto;
    margin-top: 140px;
    box-shadow: 0 2px 5px var(--verde-oscuro-degradado);
    border: 3px solid var(--black-privacy-text);
    max-width: 980px;
}

.container_info h1 {
    color: var(--black-privacy-text);
    text-align: center;
    margin-bottom: 20px;
}

.container_info h2 {
    color: var(--black-privacy-text);
    margin-top: 20px;
}

.container_info p,
.container_info li {
    color: var(--black-privacy-text);
    line-height: 1.6;
}

.todo_boton {
    display: flex;
    justify-content: center;
    margin-top: 20px;
    margin-bottom: 40px;
}

.noUsuario {
    margin-bottom: 130px;
}

.todo_boton button {
    font-weight: bold;
    text-decoration: none;
    background-color: #3d5a98;
    color: var(--light-blue-text);
    border: 2px solid var(--black);
    cursor: pointer;
    border-radius: 25px;
    text-align: center;
    font-size: 18px;
    transition: border 0.3s, background-color 0.3s, color 0.3s;
    padding: 10px 30px;
}

.todo_boton button:hover,
.todo_boton button:active {
    border-color: black;
    background-color: var(--dark-blue);
    color: var(--light-blue-text);
}

@media (max-width: 875px) {
    .noUsuario {
        margin-bottom: 144px;
    }
}
@media (max-width: 600px) {
    .noUsuario {
        margin-bottom: 222px;
    }
}
</style>