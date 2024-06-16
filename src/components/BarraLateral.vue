<script setup>
/*Imports y declaración de variables.*/
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { ref, onMounted } from "vue";
import { userId, supabase } from "../clients/supabase";

const gymTag = ref();
const fotoPerfil = ref();

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
  /*Mostramos la foto predeterminada si el usuario no tiene una ruta almacenada.*/
  if (fotoPerfil.value === '/predeterminada.png' || fotoPerfil.value === null || fotoPerfil.value === '') {
    fotoPerfil.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg';
  } else {
    /*De lo contrario mostramos la foto de perfil actual del usuario.*/
    fotoPerfil.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/' + fotoPerfil.value;
  }
}
cargarUsuario();
const posicionAnt = ref(0);
const altura = ref(80);
const windowWidth = ref(window.innerWidth);

const posicionActual = window.scrollY;

/*Función para posicionar la barra lateral.*/
if (windowWidth.value < 601) {
  if (posicionActual > 100) {
    altura.value = 0;

    if (posicionActual < posicionAnt.value) {
      altura.value = 163;
    }
  } else {
    altura.value = 163;
  }
} else if (windowWidth.value < 875) {
  if (posicionActual > 100) {
    altura.value = 0;

    if (posicionActual < posicionAnt.value) {
      altura.value = 94;
    }
  } else {
    altura.value = 94;
  }
} else {
  if (posicionActual > 100) {
    altura.value = 0;

    if (posicionActual < posicionAnt.value) {
      altura.value = 80;
    }
  } else {
    altura.value = 80;
  }
}
posicionAnt.value = posicionActual;

/*Función para reposicionar la barra lateral.*/
function reposicionarBarra() {
  const posicionActual = window.scrollY;
  if (windowWidth.value < 601) {
    if (posicionActual > 100) {
      altura.value = 0;

      if (posicionActual < posicionAnt.value) {
        altura.value = 163;
      }
    } else {
      altura.value = 163;
    }
  } else if (windowWidth.value < 875) {
    if (posicionActual > 100) {
      altura.value = 0;

      if (posicionActual < posicionAnt.value) {
        altura.value = 94;
      }
    } else {
      altura.value = 94;
    }
  } else {
    if (posicionActual > 100) {
      altura.value = 0;

      if (posicionActual < posicionAnt.value) {
        altura.value = 80;
      }
    } else {
      altura.value = 80;
    }
  }
  posicionAnt.value = posicionActual;
}
/*Función para actualizar el ancho de la pantalla.*/
function updateWidth() {
  windowWidth.value = window.innerWidth;
  reposicionarBarra();
}
/*Añadimos el evento de escucha del scroll y de la redimensión.*/
onMounted(() => {
  window.addEventListener("scroll", reposicionarBarra);
  window.addEventListener("resize", updateWidth);
});
</script>
<template>
  <transition name="slide-fade" mode="out-in">
    <nav :style="{ top: altura + 'px' }">
      <div v-if="gymTag">
        <RouterLink :to="{ name: 'profile', params: { gymtag: gymTag } }" class="RouterLink foto_barra">
          <div class="icono"><img :src="fotoPerfil" class="imgperfil" /></div>
          <h2>Perfil</h2>
        </RouterLink>
      </div>
      <div>
        <RouterLink to="/" class="RouterLink">
          <div class="icono"><font-awesome-icon class="icon" :icon="['fas', 'house']" /></div>
          <h2>Home</h2>
        </RouterLink>
      </div>
      <div>
        <RouterLink to="/post" class="RouterLink">
          <div class="icono"><font-awesome-icon class="icon" :icon="['fas', 'circle-plus']" /></div>
          <h2>Publicar</h2>
        </RouterLink>
      </div>
      <div>
        <RouterLink to="/search" class="RouterLink">
          <div class="icono"><font-awesome-icon class="icon" :icon="['fas', 'magnifying-glass']" /></div>
          <h2>Buscar</h2>
        </RouterLink>
      </div>
      <div>
        <RouterLink to="/liked" class="RouterLink">
          <div class="icono"><font-awesome-icon class="icon" :icon="['fas', 'heart']" /></div>
          <h2>Likes</h2>
        </RouterLink>
      </div>
      <div>
        <RouterLink to="/saved" class="RouterLink">
          <div class="icono"><font-awesome-icon class="icon guardado" :icon="['fas', 'bookmark']" /></div>
          <h2>Guardados</h2>
        </RouterLink>
      </div>
    </nav>
  </transition>
</template>
<style scoped>
nav {
  background-color: var(--dark-blue);
  color: var(--light-blue-text);
  width: 60px;
  display: flex;
  flex-direction: column;
  padding: 0 12px;
  height: 101vh;
  position: fixed;
  top: 80px;
  z-index: 100;
  transition: width 0.3s, box-shadow 0.3s;
  overflow: hidden;
}

h2 {
  margin-left: 10px;
  width: 120px;
  transform: translateX(-190px);
  color: var(--dark-blue);
  transition: color 0.5s;
}

nav:hover {
  width: 190px;
  box-shadow: 2px -2px 5px var(--black), 3px -4px 10px var(--black);
}

nav:hover h2 {
  display: inline;
  color: var(--light-blue-text);
  transform: translateX(0px);
}

div .RouterLink {
  display: flex;
  align-items: center;
  margin-top: 25px;
  cursor: pointer;
}

div .RouterLink:hover, div .RouterLink:active{
  text-shadow: 0 0 5px #eef2fa2d, 0 0 10px #eef2fa2d;
}

.RouterLink .icon {
  transition: filter 0.3s, text-shadow 0.3s;
}

.RouterLink:hover .icon, 
.RouterLink:active .icon {
  filter: brightness(2);
}


.icon {
  color: var(--light-blue-text);
  width: 36px;
  height: 36px;
}

.imgperfil{
  border-radius: 50px;
  border: 1px solid var(--black);
  width: 40px;
  height: 40px;
  margin: -2px;
  object-fit: cover;
  transition: border 0.3s;
}

.foto_barra:hover .imgperfil, .foto_barra:active .imgperfil{
  border-color: rgb(109, 109, 109);
}
</style>