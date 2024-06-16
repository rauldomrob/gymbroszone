<script setup>
/*Imports y declaración de variables.*/
import Publicacion from "../components/Publicacion.vue";
import { supabase, userActive, userId } from "../clients/supabase";
import { disponible } from "../main";
import { ref, onMounted, onUnmounted } from "vue";

const todasPublicaciones = ref([]);
const fotoTuPerfilMostrar = ref('https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg');

/*Función para mostrar las publicaciones a las que ha dado like el usuario. */
async function mostrarp() {
  try {
    /*Obtenemos las publicaciones a las que el usuario ha dado like.*/
    const { data: likesData, error: likesError } = await supabase
      .from('likes')
      .select('idpublicacion')
      .eq('idusuario', userId.value);
    if (likesError) {
      throw likesError;
    }
    if (likesData.length === 0) {
      todasPublicaciones.value = [];
      return;
    }

    /*Obtenemos los IDs de las publicaciones a las que el usuario ha dado like.*/
    const publicacionesIds = likesData.map(likes => likes.idpublicacion);

    /*Obtenemos las publicaciones a las que se ha dado like.*/
    const { data: publicaciones, error: publicacionesError } = await supabase
      .from('publicaciones')
      .select('*')
      .in('idpublicacion', publicacionesIds);
    if (publicacionesError) {
      throw publicacionesError;
    }
    /*Mostramos las publicaciones más recientes primero.*/
    todasPublicaciones.value = publicaciones.reverse();
  } catch (error) {
  }
}
mostrarp();

/*Cuando se monta la vista añadimos un evento de escucha de ocultar la publicación.*/
onMounted(() => {
  window.addEventListener('ocultar-publicacion', (event) => {
    ocultarPublicacion(event.detail.idPublicacion);
  });
});

/*Cuando se desmonta la vista eliminamos el evento de escucha de ocultar la publicación.*/
onUnmounted(() => {
  window.removeEventListener('ocultar-publicacion', (event) => {
    ocultarPublicacion(event.detail.idPublicacion);
  });
});

/*Función que oculta una publicación cuando esta es eliminada por el usuario.*/
function ocultarPublicacion(idPublicacion) {
  const publicacionElement = document.querySelector(`[data-publicacion-id="${idPublicacion}"]`);
  if (publicacionElement) {
    publicacionElement.style.display = 'none';
  }
  actualizarPublicaciones();
}

/*Función para actualizar la vista de la publicaciones.*/
async function actualizarPublicaciones() {
  await mostrarp();
  if (todasPublicaciones.value.length === 0) {
    if (document.querySelector('.no-publicaciones')) {
      document.querySelector('.no-publicaciones').style.display = 'block';
    }
  } else {
    if (document.querySelector('.no-publicaciones')) {
      document.querySelector('.no-publicaciones').style.display = 'none';
    }
  }
}

/*Función para obtener la foto de perfil del usuario para que esta sea visible en las publicaciones a la hora de comentar.*/
async function obtenerTuFotoPerfil() {
  if (userActive.value == true) {
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select("*")
      .eq('id', userId.value);
    if (error) {
      return;
    }
    fotoTuPerfilMostrar.value = usuario[0].fotoperfil;
    /*Si la ruta de la foto de perfil es la predeterminada, null o empty; mostramos la imagen predeterminada en la previsualización de la foto de perfil.*/
    if (fotoTuPerfilMostrar.value === '/predeterminada.png' || fotoTuPerfilMostrar.value === null || fotoTuPerfilMostrar.value === '') {
      fotoTuPerfilMostrar.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/users/foto-perfil-predeterminada.jpg';
    } else {
      /*De lo contrario mostramos la foto de perfil actual del usuario.*/
      fotoTuPerfilMostrar.value = 'https://subcejpmaueqsiypcyzt.supabase.co/storage/v1/object/public/files/' + fotoTuPerfilMostrar.value;
    }
  }
}
obtenerTuFotoPerfil();
disponible.value = true;
</script>
<template>
  <main>
    <div class="publicaciones">
      <div v-if="todasPublicaciones.length !== 0" class="titulo">
        <h2>Tus likes</h2>
      </div>
      <div v-if="todasPublicaciones.length === 0" class="no-publicaciones">
        <h2>Todavía no has dado like a ninguna publicación.</h2>
      </div>
      <div v-else class="vista">
        <template v-for="publicacion in todasPublicaciones" :key="publicacion.idpublicacion">
          <div :data-publicacion-id="publicacion.idpublicacion">
            <Publicacion :publicacionUnica="publicacion" :ProfileView="false"
              :fotoTuPerfilMostrar="fotoTuPerfilMostrar" />
          </div>
        </template>
      </div>
    </div>
  </main>
</template>
<style scoped>
.no-publicaciones {
  text-align: center;
  margin-top: 90px;
}

.no-publicaciones h2 {
  font-size: 28px;
  color: var(--black);
}

.titulo {
  text-align: center;
  margin-top: 50px;
}

.titulo h2 {
  text-decoration: underline;
  font-size: 40px;
  text-shadow: 0 0 1px #0b1e44e3, 0 0 4px #386cd382;
}

.publicaciones {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-left: 60px;
  margin-bottom: 100px;
  padding-top: 80px;
}

.vista {
  margin-top: 30px;
  width: 80%;
  max-width: 1280px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 1100px) {
  .vista {
    width: 100%;
  }
}

@media (max-width: 875px) {
  main {
    margin-top: 60px;
  }

  .publicaciones {
    margin-left: 0;
    padding-top: 0;
    background-color: #0d285e;
  }

  .vista {
    margin-top: 10px;
    display: flex;
    flex-direction: column;
    width: 80%;
    padding-bottom: 40px;
    min-height: 77.9vh;
  }

  .titulo {
    text-align: center;
    margin-top: 40px;
  }

  .titulo h2 {
    text-decoration: underline;
    font-size: 40px;
    color: var(--light-blue-text);
    text-shadow: 0 0 1px rgba(5, 5, 5, 0.897), 0 0 4px rgba(5, 5, 5, 0.7), 0 0 6px rgba(5, 5, 5, 0.65);
  }

  .publicaciones {
    margin-bottom: 45px;
  }
}

@media (max-width: 660px) {
  .no-publicaciones {
    margin-top: 60px;
  }

  .no-publicaciones h2 {
    font-size: 24px;
    color: var(--black);
    display: block;
    width: 80%;
    margin: auto;
  }
}

@media (max-width: 625px) {
  main {
    margin-top: 35px;
  }

  .publicaciones {
    margin-left: 0;
    padding-top: 30px;
  }

  .vista {
    width: 100%;
    margin: 0px;
    margin-top: 5px;
  }

  .titulo {
    margin-top: 30px;
  }

  .titulo h2 {
    font-size: 32px;
  }
}
</style>