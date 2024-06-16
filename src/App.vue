<script setup>
/*Importamos los componentes.*/
import Header from './components/Header.vue'
import HeaderMobile from './components/HeaderMobile.vue'

import NavLateral from './components/BarraLateral.vue'
import NavInferior from './components/BarraInferior.vue'
import './assets/index.css'
import { supabase, userActive, logOut } from './clients/supabase'
import { usandoMovil, disponible, state } from './main'

import { ref, onMounted } from "vue";

/*Declaración de variables.*/
disponible.value = true;
const windowWidth = ref(window.innerWidth);

/*Función para obtener el nuevo ancho de la pantalla si se redimensiona.*/
function updateWidth() {
  windowWidth.value = window.innerWidth;
}

/*Añadimos un evento de escucha para comprobar si se redimensiona la pantalla.*/
onMounted(() => {
  window.addEventListener("resize", updateWidth);
});

/*Cuando se monta el componente, llamamos a las funciones.*/
onMounted(async () => {
  if (userActive.value) {
    const { data: { user }, error } = await supabase.auth.getUser();
    /*Cerramos la sesión del usuario en caso de error para que se repita el proceso.*/
    if (error) {
      return false;
    }
    if (user) {
      await revisarCarpeta(user);
      await revisarGymtag(user);
      await revisarEstadisticas(user);
    }
  }
});

/*Función para encriptar el Id del usuario.*/
async function hashUserId(userId) {
  const encoder = new TextEncoder();
  const data = encoder.encode(userId);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/*Función para revisar si el usuario tiene una carpeta en el storage.*/
async function revisarCarpeta(user) {
  /*Construcción de la ruta de la carpeta propia del usuario.*/
  const ruta = `users/${await hashUserId(user.id)}/`;
  /*Comprobamos si existe una carpeta con el nombre de la ruta.*/
  const { data: carpeta, error: errorCarpeta } = await supabase
    .storage
    .from('files')
    .list(ruta);
  /*Cerramos la sesión del usuario en caso de error para que se repita el proceso.*/
  if (errorCarpeta) {
    logOut();
    return false;
  }
  /*Si no hay ninguna carpeta con el nombre especificado, la longitud será 0.*/
  if (carpeta.length === 0) {
    /*Creamos la carpeta con un archivo vacío.*/
    const { error: errorSubida } = await supabase.storage
      .from('files')
      .upload(ruta + 'dummy.txt', new Blob(['dummy content']), {
        cacheControl: '3600',
        upsert: false
      });
    /*Cerramos la sesión del usuario en caso de error para que se repita el proceso.*/
    if (errorSubida) {
      logOut();
      return false;
    }
  }
}

/*Función para revisar si el usuario tiene un gymtag.*/
async function revisarGymtag(user) {
  /*Comprobamos si el usuario que se ha logueado tiene gymtag.*/
  const { data: usuario, error } = await supabase
    .from('usuarios')
    .select('gymtag')
    .eq('id', user.id);
  /*Cerramos la sesión del usuario en caso de error para que se repita el proceso.*/
  if (error) {
    logOut();
    return false;
  }

  /*Si no tiene gymtag le asignamos uno nuevo aleatorio.*/
  if (usuario && usuario[0].gymtag === null) {
    let nuevoGymtag;
    let existeGymtag;

    /*Puede ser que el gymtag aleatorio se repita, por lo que debemos comprobar si esto ocurre.*/
    do {
      nuevoGymtag = `usuario${Math.floor(Math.random() * 10000000)}`;

      const { data: revisionGymtag, error: gymtagError } = await supabase
        .from('usuarios')
        .select('gymtag')
        .eq('gymtag', nuevoGymtag);

      /*Cerramos la sesión del usuario en caso de error para que se repita el proceso.*/
      if (gymtagError) {
        logOut();
        return false;
      }

      /*Si el tamaño es 1, habrá un usuario con el gymtag generado aleatoriamente.*/
      existeGymtag = revisionGymtag.length > 0;
    } while (existeGymtag);

    /*Tras encontrar un gymtag no usado, lo guardamos.*/
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ gymtag: nuevoGymtag })
      .eq('id', user.id);
    /*Cerramos la sesión del usuario en caso de error para que se repita el proceso.*/
    if (updateError) {
      logOut();
      return false;
    }
  }
}

/*Función para revisar si el usuario tiene sus estadísticas guardadas.*/
async function revisarEstadisticas(user) {
  /*Comprobamos si el usuario que se ha logueado tiene estadísticas.*/
  const { data: estadisticas, error } = await supabase
    .from('estadisticas')
    .select('*')
    .eq('idusuario', user.id);
  /*Cerramos la sesión del usuario en caso de error para que se repita el proceso.*/
  if (error) {
    logOut();
    return false;
  }
  /*Comprobamos si están guardadas las estadísticas del usuario.*/
  if (estadisticas.length < 1) {
    const { error: insertError } = await supabase
    .from('estadisticas')
    .insert([{ idusuario: user.id, esprivado: true}]);
  /*Cerramos la sesión del usuario en caso de error para que se repita el proceso.*/
    if(insertError){
      logOut();
      return false;
    }
  }
}
</script>
<template>
  <Header v-if="((!usandoMovil && (windowWidth > 875)) || !userActive)" :key="state.headerKey" />
  <HeaderMobile v-if="userActive && (windowWidth <= 875)" :key="state.headerKey"/>
  <RouterView />
  <NavLateral v-if="userActive && !usandoMovil && disponible && (windowWidth > 875)" :key="state.headerKey" />
  <NavInferior v-if="userActive && disponible && (windowWidth <= 875)" />
</template>
<style>
* {
  padding: 0;
  margin: 0;
  box-sizing: border-box;
}

body {
  background-color: var(--bg-color);
}
</style>