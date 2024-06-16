<script setup>
/*Imports y declaración de variables.*/
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { userActive, userId, supabase } from "../clients/supabase";

const fotoPerfil = ref();
const gymTag = ref();
const route = useRoute();
const posicionAnt = ref(0);
const mostrar = ref(true);

const mostrarLetras = ref(true);
const windowWidth = ref(window.innerWidth);

/*Función para mostrar el header o no cuando se hace scroll.*/
function mostrarHeader() {
  const posicionActual = window.scrollY;

  if (posicionActual > 100) {
    mostrar.value = false;
    if (posicionActual < posicionAnt.value) {
      mostrar.value = true;
    }
  } else {
    mostrar.value = true;
  }
  posicionAnt.value = posicionActual;
}

/*Función para ocultar o mostrar las letras del header.*/
if (windowWidth.value < 601) {
  mostrarLetras.value = false;
} else {
  mostrarLetras.value = true;
}

/*Función para actualizar el ancho de la pantalla cuando hay una redimensión y para ocultar las letras o no del header.*/
function updateWidth() {
  windowWidth.value = window.innerWidth;
  if (windowWidth.value < 601) {
    mostrarLetras.value = false;
  } else {
    mostrarLetras.value = true;
  }
}

/*Añadimos los eventos de escucha del scroll y de la redimensión de la pantalla.*/
onMounted(() => {
  window.addEventListener("scroll", mostrarHeader);
  window.addEventListener("resize", updateWidth);
});

/*Si hay un usuario activo cargamos su información.*/
if (userActive.value) {
  cargarUsuario();
}

/*Función para mostrar la foto de perfil del usuario y cargar su gymtag*/
async function cargarUsuario() {
  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select("*")
    .eq('id', userId.value);
  /*En caso de error se mostrará la foto de perfil predeterminada.*/
  if(error){
    fotoPerfil.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg';
    return;
  }
  /*Guardamos la información del usuario.*/
  gymTag.value = usuario[0].gymtag;
  fotoPerfil.value = usuario[0].fotoperfil;

  /*Mostramos la foto de perfil del usuario.*/
  if (fotoPerfil.value === '/predeterminada.png' || fotoPerfil.value === null || fotoPerfil.value === '') {
    fotoPerfil.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg';
  } else {
    /*De lo contrario mostramos la foto de perfil actual del usuario.*/
    fotoPerfil.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/' + fotoPerfil.value;
  }
}
</script>
<template>
  <header v-if="mostrar">
    <div class="home">
      <div class="logo_header">
        <div class="fondo_logo">
          <RouterLink to="/" class="RouterLink">
            <img src="../assets/img/logo.png" />
          </RouterLink>
        </div>
      </div>
      <div v-if="mostrarLetras" class="titulo_main_header">
        <RouterLink to="/" class="RouterLink">
          <h1>GymBros Zone</h1>
        </RouterLink>
      </div>
    </div>
    <div v-if="userActive" id="loged">
      <div v-if="route.path !== '/account'" class="account">
        <RouterLink to="/account" id="btn-profile">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path
              d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" />
          </svg>
        </RouterLink>
      </div>
      <div v-if="gymTag">
        <div class="foto_usuario" v-if="route.path === '/account'">
          <RouterLink :to="{ name: 'profile', params: { gymtag: gymTag } }" class="RouterLink">
            <img :src="fotoPerfil" class="imgperfil" />
          </RouterLink>
        </div>
      </div>
    </div>
    <div v-if="!userActive" id="no-loged">
      <RouterLink to="/login" class="btn-no-loged boton_header" id="btn-login">Login</RouterLink>
      <RouterLink to="/register" class="btn-no-loged boton_header" id="btn-register">Registro</RouterLink>
    </div>
  </header>
</template>

<style scoped>
header {
  background-color: var(--dark-blue);
  min-height: 80px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: fixed;
  z-index: 400;
  box-shadow: 2px 0 15px var(--black), 3px 0 20px var(--black);
}

.home {
  display: flex;
  align-items: center;
}

.fondo_logo {
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.815);
  width: 65px;
  height: 65px;
  position: relative;
}

.logo_header img {
  position: absolute;
  width: 69px;
  height: 69px;
  top: -1px;
  left: -2px;
  border-radius: 50px;
  margin-right: 5%;
}

h1 {
  color: var(--light-blue-text);
  background-color: var(--blue-inputs);
  padding: 5px 30px;
  border-radius: 25px;
  width: fit-content;
  font-family: "Permanent Marker", cursive;
  font-weight: 400;
  font-style: normal;
}

.boton_header {
  font-weight: bold;
  text-decoration: none;
  background-color: #3d5a98;
  color: var(--light-blue-text);
  border: 2px solid var(--black);
  cursor: pointer;
  border-radius: 25px;
  text-align: center;
  transition: border 0.5s;
}

.boton_header:hover,
.boton_header:active {
  border-color: #eef2fa81;
}

.account {
  height: 35px;
  width: 35px;
  margin: 5px 8px;
}

.account svg path {
  fill: var(--light-blue-text);
}

.btn-no-loged {
  display: flex;
  justify-content: center;
  padding: 5px 7px;
  width: 90px;
}

#no-loged {
  display: flex;
  justify-content: space-between;
}

#btn-login {
  margin-right: 10px;
}

.titulo_main_header {
  width: 100%;
  margin-left: 30px;
}

.foto_usuario {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 7px;
}

.foto_usuario img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1px solid var(--black);
  object-fit: cover;
  transition: border 0.3s;
}

.foto_usuario:hover img, .foto_usuario:active img{
  border-color: rgb(109, 109, 109);
}

@media (max-width: 875px) {
  header {
    min-height: 94px;
  }

  #loged {
    margin: 20px;
  }

  #no-loged {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin: 5px;
  }

  #btn-login {
    margin-right: 0;
  }

  .btn-no-loged {
    margin: 5px 0;
  }
}

@media (max-width: 600px) {
  header {
    flex-direction: column;
  }

  .logo_header {
    margin-top: 10px;
    margin-bottom: 5px;
  }

  .logo_header img {
    margin: 0;
    width: 99px;
    height: 99px;
  }

  .fondo_logo {
    width: 95px;
    height: 95px;
  }

  #no-loged {
    flex-direction: row;
  }

  .btn-no-loged {
    margin: 10px;
  }
}
</style>