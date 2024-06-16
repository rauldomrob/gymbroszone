<script setup>
/*Imports y declaración de variables. */
import { ref, onMounted, watch } from "vue";
import { useRoute } from 'vue-router';
import { userId, supabase } from "../clients/supabase";

const gymTag = ref("");
const route = useRoute();
const posicionAnt = ref(0);
const mostrar = ref(true);
const fotoPerfil = ref('https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg');

cargarUsuario();

/*Función para cargar y mostrar la foto de perfil del usuario.*/
async function cargarUsuario() {
  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select("*")
    .eq('id', userId.value);
  if(error){
    fotoPerfil.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg';
    return;
  }
  gymTag.value = usuario[0].gymtag;
  fotoPerfil.value = usuario[0].fotoperfil;
  /*Si la ruta de la foto de perfil es la predeterminada, null o empty; mostramos la imagen predeterminada en la previsualización de la foto de perfil.*/
  if (fotoPerfil.value === '/predeterminada.png' || fotoPerfil.value === null || fotoPerfil.value === '') {
    fotoPerfil.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg';
  } else {
    /*De lo contrario mostramos la foto de perfil actual del usuario.*/
    fotoPerfil.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/' + fotoPerfil.value;
  }
}
/*Observamos los cambios en la ruta para actualizar el componente y así cambiar la foto del usuario tras un cambio de esta.*/
watch(() => route.path, (newPath) => {
  mostrar.value = newPath !== '/post' && newPath !== '/account';
}, { immediate: true });

/*Función para mostrar el header en función del scroll, además lo actualizamos para cambiar la foto de perfil*/
function mostrarHeader() {
  const posicionActual = window.scrollY;
  if (posicionActual > 100) {
    mostrar.value = false;
    if (posicionActual < posicionAnt.value) {
      mostrar.value = true;
      watch(() => route.path, (newPath) => {
        mostrar.value = newPath !== '/post' && newPath !== '/account';
      }, { immediate: true });
    }
  } else {
    mostrar.value = true;
    watch(() => route.path, (newPath) => {
      mostrar.value = newPath !== '/post' && newPath !== '/account';
    }, { immediate: true });
  }
  posicionAnt.value = posicionActual;
}
/*Cuando se monta añadimos el evento de escucha del scroll.*/
onMounted(() => {
  window.addEventListener("scroll", mostrarHeader);
});
</script>
<template>
  <transition name="slide-fade" mode="out-in">
    <nav v-if="mostrar">
      <div class="botonesNav">
        <div class="logo_header">
          <RouterLink to="/" class="RouterLink">
            <img src="../assets/img/logo.png" />
          </RouterLink>
        </div>
        <div v-if="gymTag">
          <div class="foto_usuario" v-if="route.path !== '/profile/' + gymTag">
            <RouterLink :to="{ name: 'profile', params: { gymtag: gymTag } }" class="RouterLink">
              <img :src="fotoPerfil" class="imgperfil" />
            </RouterLink>
          </div>
          <div class="account" v-if="route.path === '/profile/' + gymTag" >
            <RouterLink to="/account" id="btn-profile">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path
                  d="M495.9 166.6c3.2 8.7 .5 18.4-6.4 24.6l-43.3 39.4c1.1 8.3 1.7 16.8 1.7 25.4s-.6 17.1-1.7 25.4l43.3 39.4c6.9 6.2 9.6 15.9 6.4 24.6c-4.4 11.9-9.7 23.3-15.8 34.3l-4.7 8.1c-6.6 11-14 21.4-22.1 31.2c-5.9 7.2-15.7 9.6-24.5 6.8l-55.7-17.7c-13.4 10.3-28.2 18.9-44 25.4l-12.5 57.1c-2 9.1-9 16.3-18.2 17.8c-13.8 2.3-28 3.5-42.5 3.5s-28.7-1.2-42.5-3.5c-9.2-1.5-16.2-8.7-18.2-17.8l-12.5-57.1c-15.8-6.5-30.6-15.1-44-25.4L83.1 425.9c-8.8 2.8-18.6 .3-24.5-6.8c-8.1-9.8-15.5-20.2-22.1-31.2l-4.7-8.1c-6.1-11-11.4-22.4-15.8-34.3c-3.2-8.7-.5-18.4 6.4-24.6l43.3-39.4C64.6 273.1 64 264.6 64 256s.6-17.1 1.7-25.4L22.4 191.2c-6.9-6.2-9.6-15.9-6.4-24.6c4.4-11.9 9.7-23.3 15.8-34.3l4.7-8.1c6.6-11 14-21.4 22.1-31.2c5.9-7.2 15.7-9.6 24.5-6.8l55.7 17.7c13.4-10.3 28.2-18.9 44-25.4l12.5-57.1c2-9.1 9-16.3 18.2-17.8C227.3 1.2 241.5 0 256 0s28.7 1.2 42.5 3.5c9.2 1.5 16.2 8.7 18.2 17.8l12.5 57.1c15.8 6.5 30.6 15.1 44 25.4l55.7-17.7c8.8-2.8 18.6-.3 24.5 6.8c8.1 9.8 15.5 20.2 22.1 31.2l4.7 8.1c6.1 11 11.4 22.4 15.8 34.3zM256 336a80 80 0 1 0 0-160 80 80 0 1 0 0 160z" />
              </svg>
            </RouterLink>
          </div>
        </div>
      </div>
    </nav>
  </transition>
</template>
<style scoped>
.slide-fade-enter-active {
  transition: all ease;
  transform: translateY(-60px);
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter,
.slide-fade-leave-to {
  transform: translateY(-60px);
  opacity: 0;
}

nav {
  background-color: var(--dark-blue);
  color: var(--light-blue-text);
  width: 100%;
  height: 60px;
  position: fixed;
  top: 0px;
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: 0.4s;
  z-index: 400;
  box-shadow: 2px 0 10px var(--black), 3px 0 15px var(--black);
}

nav .botonesNav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

}

.logo_header img {
  width: 65px;
  height: 65px;
  border-radius: 50px;
}

div .RouterLink {
  display: flex;
  align-items: center;
  cursor: pointer;
}

nav>div {
  height: fit-content;
  margin: 0 20px;
}

.icon {
  color: var(--light-blue-text);

}

.foto_usuario {
  width: 40px;
  height: 40px;
  border-radius: 50%;
}

.foto_usuario img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 1px solid var(--black);
  object-fit: cover;
}

.account {
  height: 32px;
  width: 32px;
  margin: 5px 4px;
}

.account svg path{
  fill: var(--light-blue-text);
}

.RouterLink{
  height: 100%;
  width: 100%;
}
</style>